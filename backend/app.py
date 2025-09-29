from flask import Flask, request, jsonify
from flask_cors import CORS
from rapidfuzz import fuzz
import json, re, os
import requests
from dotenv import load_dotenv

app = Flask(__name__)
CORS(app)
load_dotenv()  # loads GEMINI_API_KEY, GEMINI_MODEL, PORT from .env

KB_PATH = os.path.join(os.path.dirname(__file__), "knowledge_base.json")

# ------------------- Load Knowledge Base ------------------- #
def load_kb(path: str):
    try:
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    except:
        return {}

knowledge_base = load_kb(KB_PATH)

# ------------------- Small Talk Intents ------------------- #
INTENTS = [
    (re.compile(r"(^|\b)(hi|hello|hey|yo)\b", re.I), "Hey! Ask any C++ topic and I’ll fetch it from the knowledge base."),
    (re.compile(r"\bgood (morning|afternoon|evening)\b", re.I), "Hello! What C++ concept is needed?"),
    (re.compile(r"\b(thanks|thank you|appreciate)\b", re.I), "Anytime! Want another C++ topic?"),
]

def check_intents(text):
    for pat, resp in INTENTS:
        if pat.search(text):
            return resp
    return None

# ------------------- Fuzzy KB Search ------------------- #
def normalize(text):
    text = text.lower()
    text = re.sub(r"[^a-z0-9+# ]+", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text

SYNONYMS = {
    "io": "input output file",
    "i/o": "input output file",
    "exception": "try catch throw error",
    "overloading": "operator overload",
    "reference": "references alias ampersand",
    "dynamic": "heap new delete",
}

def enrich(text):
    t = text
    for k, v in SYNONYMS.items():
        if k in t:
            t += " " + v
    return normalize(t)

def flatten_kb(kb):
    rows = []
    for k, v in kb.items():
        if isinstance(v, dict):
            for kk, vv in v.items():
                rows.append((f"{k} :: {kk}", str(vv)))
        else:
            rows.append((k, str(v)))
    return rows

FLAT_KB = flatten_kb(knowledge_base)

def fuzzy_search(query):
    if not FLAT_KB:
        return None, 0.0, None
    q = enrich(query)
    best_row = None
    best_score = -1.0
    for key, ans in FLAT_KB:
        text = normalize(key + " " + ans[:500])
        score = max(fuzz.token_set_ratio(q, text), fuzz.partial_ratio(q, text))
        overlap = len(set(q.split()) & set(text.split()))
        score += min(8, overlap)
        if score > best_score:
            best_row = (key, ans)
            best_score = score
    if best_row:
        return best_row[1], float(best_score), best_row[0]
    return None, 0.0, None

# ------------------- Gemini API ------------------- #
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
GEMINI_MODEL = os.environ.get("GEMINI_MODEL", "gemini-2.5-flash")
GEMINI_API_VERSION = os.environ.get("GEMINI_API_VERSION", "v1")

def call_gemini(query: str) -> str:
    if not GEMINI_API_KEY:
        return "Gemini API key not configured. Set GEMINI_API_KEY in environment."

    model = os.environ.get("GEMINI_MODEL", GEMINI_MODEL)
    version = os.environ.get("GEMINI_API_VERSION", GEMINI_API_VERSION)

    def generate(model_name: str):
        url = (
            f"https://generativelanguage.googleapis.com/{version}/models/"
            f"{model_name}:generateContent?key={GEMINI_API_KEY}"
        )
        payload = {"contents": [{"role": "user", "parts": [{"text": query}]}]}
        return requests.post(url, json=payload, timeout=20)

    try:
        res = generate(model)

        # If model not found for this API version, try '-latest' suffix once
        if res.status_code == 404 and not model.endswith("-latest"):
            alt_model = f"{model}-latest"
            res = generate(alt_model)

        if res.status_code == 200:
            data = res.json()
            text = (
                data.get("candidates", [{}])[0]
                .get("content", {})
                .get("parts", [{}])[0]
                .get("text", "")
            )
            return text or "(empty response)"

        if res.status_code == 404:
            # Fetch available models to guide the user
            list_url = (
                f"https://generativelanguage.googleapis.com/{version}/models?key={GEMINI_API_KEY}"
            )
            lm = requests.get(list_url, timeout=10)
            available = []
            if lm.status_code == 200:
                items = lm.json().get("models", [])
                available = [m.get("name", "") for m in items][:8]
            return (
                f"Gemini API error: 404 - model '{model}' not found for {version}. "
                f"Available: {', '.join(available) if available else 'unknown'}"
            )

        return f"Gemini API error: {res.status_code} - {res.text}"
    except Exception as e:
        return f"Error contacting Gemini API: {str(e)}"

@app.route("/models", methods=["GET"])
def list_models():
    if not GEMINI_API_KEY:
        return jsonify({"error": "GEMINI_API_KEY not set"}), 400
    version = os.environ.get("GEMINI_API_VERSION", GEMINI_API_VERSION)
    url = f"https://generativelanguage.googleapis.com/{version}/models?key={GEMINI_API_KEY}"
    r = requests.get(url, timeout=10)
    return jsonify(r.json()), r.status_code

# ------------------- Optional: Strip Markdown ------------------- #
def strip_markdown(md_text):
    text = re.sub(r"#.*\n", "", md_text)
    text = re.sub(r"(\*\*|__|\*|_)", "", text)
    text = re.sub(r"\$.*?\$", "", text)
    text = re.sub(r"\[([^\]]+)\]\([^\)]+\)", r"\1", text)
    return text.strip()

# ------------------- API Endpoint ------------------- #
@app.route("/ask", methods=["POST"])
def ask():
    data = request.get_json(silent=True) or {}
    query = str(data.get("query", "")).strip()
    if not query:
        return jsonify({"error": "Invalid request. 'query' field is required."}), 400

    # 1) small talk
    intent_resp = check_intents(query)
    if intent_resp:
        return jsonify({"answer": intent_resp, "meta": {"type": "intent"}})

    # 2) fuzzy KB search
    answer, score, key = fuzzy_search(query)
    if answer and score >= 72:
        return jsonify({
            "answer": answer,
            "meta": {"type": "kb", "match_key": key, "score": round(score, 1)}
        })

    # 3) Gemini fallback
    gemini_answer = call_gemini(query)
    # Optionally strip Markdown for plain text
    # gemini_answer = strip_markdown(gemini_answer)
    return jsonify({
        "answer": gemini_answer,
        "meta": {"type": "gemini_fallback"}
    })

if __name__ == "__main__":
    port = int(os.environ.get("PORT", "5001"))
    print(f"Starting server on port {port}...")
    app.run(debug=True, port=port, host="0.0.0.0")
