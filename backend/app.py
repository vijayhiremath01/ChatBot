from flask import Flask, request, jsonify
from flask_cors import CORS
from rapidfuzz import fuzz
import json, re, os
from typing import Dict, Any, List, Tuple, Optional

app = Flask(__name__)
CORS(app)

KB_PATH = os.path.join(os.path.dirname(__file__), "knowledge_base.json")

def load_kb(path: str) -> Dict[str, Any]:
    try:
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        print("Warning: knowledge_base.json not found. Starting with empty knowledge base.")
        return {}
    except json.JSONDecodeError:
        print("Error: knowledge_base.json is not valid JSON. Starting with empty knowledge base.")
        return {}

knowledge_base: Dict[str, Any] = load_kb(KB_PATH)

# ------- Small-talk intents -------
INTENTS = [
    (re.compile(r"(^|\b)(hi|hello|hey|yo)\b", re.I), "Hey! Ask any C++ topic and I’ll fetch it from the knowledge base."),
    (re.compile(r"\bgood (morning|afternoon|evening)\b", re.I), "Hello! What C++ concept is needed?"),
    (re.compile(r"\b(thanks|thank you|appreciate)\b", re.I), "Anytime! Want another C++ topic?"),
]

def check_intents(text: str) -> Optional[str]:
    for pat, resp in INTENTS:
        if pat.search(text):
            return resp
    return None

# ------- Fuzzy KB search -------
def normalize(text: str) -> str:
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

def enrich(text: str) -> str:
    t = text
    for k, v in SYNONYMS.items():
        if k in t:
            t += " " + v
    return normalize(t)

def flatten_kb(kb: Dict[str, Any]) -> List[Tuple[str, str]]:
    rows: List[Tuple[str, str]] = []
    for k, v in kb.items():
        if isinstance(v, dict):
            for kk, vv in v.items():
                # key text + section to help matching
                rows.append((f"{k} :: {kk}", str(vv)))
        else:
            rows.append((k, str(v)))
    return rows

FLAT_KB = flatten_kb(knowledge_base)

def fuzzy_search(query: str) -> Tuple[Optional[str], float, Optional[str]]:
    if not FLAT_KB:
        return None, 0.0, None
    q = enrich(query)
    best_row = None
    best_score = -1.0
    for key, ans in FLAT_KB:
        text = normalize(key + " " + ans[:500])  # partial answer helps match
        score = max(
            fuzz.token_set_ratio(q, text),
            fuzz.partial_ratio(q, text),
        )
        # light bonus for term overlap
        overlap = len(set(q.split()) & set(text.split()))
        score += min(8, overlap)
        if score > best_score:
            best_row = (key, ans)
            best_score = score
    if best_row:
        return best_row[1], float(best_score), best_row[0]
    return None, 0.0, None

@app.route("/ask", methods=["POST"])
def ask():
    data = request.get_json(silent=True) or {}
    query = str(data.get("query", "")).strip()
    if not query:
        return jsonify({"error": "Invalid request. 'query' field is required."}), 400

    # 1) small‑talk first
    intent_resp = check_intents(query)
    if intent_resp:
        return jsonify({"answer": intent_resp, "meta": {"type": "intent"}})

    # 2) fuzzy knowledge lookup
    answer, score, key = fuzzy_search(query)
    if answer and score >= 72:  # threshold can be tuned
        return jsonify({
            "answer": answer,
            "meta": {"type": "kb", "match_key": key, "score": round(score, 1)}
        })

    return jsonify({
        "answer": "Sorry, not found in the knowledge base. Try rephrasing or ask a different C++ topic.",
        "meta": {"type": "fallback"}
    })

if __name__ == "__main__":
    port = int(os.environ.get("PORT", "5000"))
    app.run(debug=True, port=port, host="0.0.0.0")
