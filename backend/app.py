from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import requests
import time
from dotenv import load_dotenv

# ------------------- Flask Setup ------------------- #
app = Flask(__name__)
CORS(app)
load_dotenv()

# ------------------- ENV CONFIG ------------------- #
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
GEMINI_MODEL = os.environ.get("GEMINI_MODEL", "gemini-2.0-pro")
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY", "")
PORT = int(os.environ.get("PORT", "5001"))

# ------------------- System Instruction ------------------- #
SYSTEM_INSTRUCTION = """
You are a highly professional, expert, and friendly AI coding and general assistant named CodeMind AI. 
Your primary goal is to deliver accurate technical information, particularly for React, Flask, and JavaScript development, 
and structure every response for maximum clarity and readability.

### 1. Core Identity and Style
* **Identity:** You are CodeMind AI.
* **Tone:** Expert, precise, approachable, and highly focused on technical accuracy.
* **Style:** Use clear, professional language. Use Markdown formatting liberally.

### 2. Output Formatting
1. Use headings like ## and ### for sections.
2. Bold important terms, filenames, and function names.
3. Use numbered/bulleted lists for clarity.
4. Keep paragraphs short and concise.

### 3. Code Handling
* Always wrap code blocks with language tags (e.g. ```python```).
* Explain what the code does briefly.
* Ensure syntax correctness and runtime safety.

### 4. Context Management
* Analyze the previous two conversation turns for context.
* Reference earlier content when appropriate.

### 5. Bug Avoidance
* Never hallucinate APIs or functions.
* Ensure all code examples are executable.

### 6. Conclusion
* End each answer with a useful follow-up question suggestion.
""".strip()

# ------------------- Gemini Call ------------------- #
def call_gemini(query: str, history=None) -> str:
    if not GEMINI_API_KEY:
        return "❌ Gemini API key not configured."

    url = f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent?key={GEMINI_API_KEY}"

    # Build chat history structure
    contents = []
    if history and isinstance(history, list):
        for msg in history:
            if isinstance(msg, dict) and "role" in msg and "content" in msg:
                role = "model" if msg["role"] == "assistant" else msg["role"]
                contents.append({
                    "role": role,
                    "parts": [{"text": msg["content"]}]
                })

    contents.append({
        "role": "user",
        "parts": [{"text": query}]
    })

    # ✅ Proper system_instruction format
    payload = {
        "contents": contents,
        "system_instruction": {
            "parts": [{"text": SYSTEM_INSTRUCTION}]
        }
    }

    # Retry logic
    for attempt in range(3):
        try:
            res = requests.post(url, json=payload, timeout=60)
            print(f"DEBUG: Gemini status code: {res.status_code}")

            if res.status_code == 200:
                data = res.json()
                candidates = data.get("candidates", [])
                if candidates:
                    parts = candidates[0].get("content", {}).get("parts", [])
                    if parts and "text" in parts[0]:
                        return parts[0]["text"]

                if data.get("promptFeedback", {}).get("blockReason"):
                    return f"(⚠️ Gemini blocked the prompt: {data['promptFeedback']['blockReason']})"

                return "(⚠️ Gemini returned no text and no obvious error)"

            elif res.status_code in [400, 401, 403]:
                error_msg = f"❌ Gemini Auth/Key Error {res.status_code}. Response: {res.text}"
                print(error_msg)
                return error_msg

            elif res.status_code == 503:
                print(f"⚠️ Gemini overloaded. Retry {attempt + 1}/3...")
                time.sleep(2 * (attempt + 1))
                continue

            else:
                error_msg = f"❌ Gemini API error {res.status_code}: {res.text}"
                print(error_msg)
                return error_msg

        except Exception as e:
            error_msg = f"❌ Error contacting Gemini API: {str(e)}"
            print(error_msg)
            return error_msg

    return None


# ------------------- OpenAI Fallback ------------------- #
def call_openai(query: str, history=None) -> str:
    if not OPENAI_API_KEY:
        return "⚠️ Gemini failed and no OpenAI API key is set for fallback."

    try:
        url = "https://api.openai.com/v1/chat/completions"
        headers = {"Authorization": f"Bearer {OPENAI_API_KEY}"}

        messages = [{"role": "system", "content": SYSTEM_INSTRUCTION}]
        if history and isinstance(history, list):
            for msg in history:
                if isinstance(msg, dict) and "role" in msg and "content" in msg:
                    messages.append({
                        "role": msg["role"],
                        "content": msg["content"]
                    })
        messages.append({"role": "user", "content": query})

        payload = {
            "model": "gpt-4o-mini",
            "messages": messages,
            "max_tokens": 1024
        }

        res = requests.post(url, headers=headers, json=payload, timeout=60)
        if res.status_code == 200:
            data = res.json()
            return data["choices"][0]["message"]["content"]
        else:
            return f"❌ OpenAI API error {res.status_code}: {res.text}"
    except Exception as e:
        return f"❌ Error contacting OpenAI API: {str(e)}"


# ------------------- Main Endpoint ------------------- #
@app.route("/api/ask", methods=["POST"])
def ask():
    data = request.get_json(silent=True) or {}
    query = str(data.get("query", "")).strip()
    history = data.get("history", [])

    if not query:
        return jsonify({"error": "Invalid request. 'query' field is required."}), 400

    answer = call_gemini(query, history)

    if answer is None or answer.startswith("❌"):
        print("⚠️ Falling back to OpenAI...")
        answer = call_openai(query, history)
        model_used = "OpenAI (Fallback)"
    else:
        model_used = "Gemini"

    return jsonify({
        "answer": answer,
        "meta": {"model_used": model_used}
    })


# ------------------- List Models ------------------- #
@app.route("/models", methods=["GET"])
def list_models():
    if not GEMINI_API_KEY:
        return jsonify({"error": "❌ GEMINI_API_KEY not set"}), 400

    url = f"https://generativelanguage.googleapis.com/v1/models?key={GEMINI_API_KEY}"
    r = requests.get(url, timeout=10)
    return jsonify(r.json()), r.status_code


# ------------------- Run Server ------------------- #
if __name__ == "__main__":
    if not GEMINI_API_KEY:
        print("\n=======================================================")
        print("‼️ CRITICAL: GEMINI_API_KEY not loaded from .env file!")
        print("=======================================================\n")

    print(f"🚀 Starting server on http://localhost:{PORT}")
    app.run(debug=True, port=PORT, host="localhost")
