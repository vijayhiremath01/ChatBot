from rapidfuzz import fuzz, process
from typing import Dict, Any, List
import re

def flatten_kb(kb: Dict[str, Any]) -> List[Dict[str, Any]]:
    rows = []
    for k, v in kb.items():
        if isinstance(v, dict):
            for kk, vv in v.items():
                rows.append({"key": f"{k}::{kk}", "text": f"{k} {kk} {vv}", "answer": vv})
        else:
            rows.append({"key": k, "text": f"{k} {v}", "answer": v})
    return rows

def kb_search(query: str, kb: Dict[str, Any], recent_context: str = "") -> Dict[str, Any] | None:
    rows = flatten_kb(kb)
    q = normalize_query(query, recent_context)
    candidates = []
    for row in rows:
        score = max(
            fuzz.token_set_ratio(q, row["text"]),
            fuzz.partial_ratio(q, row["text"]),
        )
        # light boost for exact term overlap
        overlap = len(set(q.split()) & set(row["text"].lower().split()))
        score += min(8, overlap)
        candidates.append((row, score))
    if not candidates:
        return None
    best = max(candidates, key=lambda x: x[1])
    return {"key": best[0]["key"], "answer": best[0]["answer"], "score": best[1]}

def normalize_query(q: str, ctx: str) -> str:
    base = (q + " " + ctx).lower()
    base = re.sub(r"[^a-z0-9+# ]+", " ", base)
    synonyms = {
        "io": "input output file",
        "exception": "try catch error",
        "overloading": "operator overload",
        "reference": "references alias",
        "dynamic": "heap new delete",
    }
    for k, v in synonyms.items():
        if k in base:
            base += " " + v
    return re.sub(r"\s+", " ", base).strip()
