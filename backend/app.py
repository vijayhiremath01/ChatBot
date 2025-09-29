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

SYSTEM_PROMPT = """
You are a helpful AI assistant. When answering, follow this structure:

1. Provide a **short summary** (1-2 sentences) at the beginning.
2. Include **3-5 key points** as a bullet list.
3. Provide a **concise example** if applicable.
4. Use Markdown formatting with headings, bold, and bullet points.
5. Keep answers clear, concise, and readable.
"""

def call_gemini(query: str) -> str:
    if not GEMINI_API_KEY:
        return "Gemini API key not configured. Set GEMINI_API_KEY in environment."

    model = os.environ.get("GEMINI_MODEL", GEMINI_MODEL)
    version = os.environ.get("GEMINI_API_VERSION", GEMINI_API_VERSION)

    payload = {
        "prompt": f"{SYSTEM_PROMPT}\nUser: {query}\nAssistant:",
        "temperature": 0.7,
        "candidate_count": 1,
        "top_p": 0.95,
        "top_k": 40
    }

    url = f"https://generativelanguage.googleapis.com/{version}/models/{model}:generateText?key={GEMINI_API_KEY}"

    try:
        res = requests.post(url, json=payload, timeout=20)
        if res.status_code == 200:
            data = res.json()
            text = (
                data.get("candidates", [{}])[0]
                .get("content", "")
            )
            return text or "(empty response)"
        return f"Gemini API error: {res.status_code} - {res.text}"
    except Exception as e:
        return f"Error contacting Gemini API: {str(e)}"

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
    return jsonify({
        "answer": gemini_answer,
        "meta": {"type": "gemini_fallback"}
    })

if __name__ == "__main__":
    port = int(os.environ.get("PORT", "5001"))
    print(f"Starting server on port {port}...")
    app.run(debug=True, port=port, host="0.0.0.0")
