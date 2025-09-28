import re

def normalize(s: str) -> str:
    return re.sub(r"\s+", " ", s.lower().strip())

def detect_intent(text: str, intents: dict) -> dict:
    t = normalize(text)
    for name, spec in intents.items():
        for pat in spec.get("patterns", []):
            if re.search(pat, t):
                return {"name": name, "response": spec.get("response", "")}
    return {"name": "none", "response": ""}
