from flask import Flask, request, jsonify
from flask_cors import CORS
import os, requests, time
from dotenv import load_dotenv

app = Flask(__name__)
CORS(app)
load_dotenv()

# ------------------- ENV CONFIG ------------------- #
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
GEMINI_MODEL = os.environ.get("GEMINI_MODEL", "gemini-1.5-flash")
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY", "")  # optional fallback
PORT = int(os.environ.get("PORT", "5001"))

# ------------------- Gemini Call ------------------- #
def call_gemini(query: str, history=None) -> str:
    if not GEMINI_API_KEY:
        return "❌ Gemini API key not configured."

    url = f"https://generativelanguage.googleapis.com/v1/models/{GEMINI_MODEL}:generateContent?key={GEMINI_API_KEY}"
    
    # Build conversation history for context
    contents = []
    
    # Add system message to instruct the model to remember user information
    system_prompt = """You are a personalized assistant that MUST remember all user information shared in the conversation.
IMPORTANT: 
1. When the user mentions their name, remember it and use it in your responses
2. NEVER say "I don't have access to your personal information" or "I am an AI language model"
3. If asked about previously mentioned information like the user's name, ALWAYS recall it from the conversation history
4. Act as if you are having a continuous conversation with the user
5. You MUST respond as if you know the user personally based on the conversation history"""
    
    # For Gemini, we need to add this as a user message at the beginning since it doesn't support system messages the same way
    contents.append({"role": "user", "parts": [{"text": system_prompt}]})
    contents.append({"role": "assistant", "parts": [{"text": "I understand. I'll remember all user information and never give generic AI responses."}]})
    
    # Add message history if provided
    if history and isinstance(history, list):
        for msg in history:
            if isinstance(msg, dict) and 'role' in msg and 'content' in msg:
                contents.append({
                    "role": msg["role"],
                    "parts": [{"text": msg["content"]}]
                })
    
    # Add the current query
    contents.append({"role": "user", "parts": [{"text": query}]})
    
    payload = {"contents": contents}

    for attempt in range(3):  # retry up to 3 times
        try:
            res = requests.post(url, json=payload, timeout=60)
            if res.status_code == 200:
                data = res.json()
                candidates = data.get("candidates", [])
                if candidates:
                    parts = candidates[0].get("content", {}).get("parts", [])
                    if parts and "text" in parts[0]:
                        return parts[0]["text"]
                return "(⚠️ Gemini returned no text)"
            elif res.status_code == 503:
                print(f"⚠️ Gemini overloaded. Retry {attempt+1}/3...")
                time.sleep(2 * (attempt + 1))  # exponential backoff
                continue
            else:
                return f"❌ Gemini API error {res.status_code}: {res.text}"
        except Exception as e:
            return f"❌ Error contacting Gemini API: {str(e)}"

    return None  # if all retries fail

# ------------------- OpenAI Fallback ------------------- #
def call_openai(query: str, history=None) -> str:
    if not OPENAI_API_KEY:
        return "⚠️ Gemini failed and no OpenAI API key is set for fallback."

    try:
        url = "https://api.openai.com/v1/chat/completions"
        headers = {"Authorization": f"Bearer {OPENAI_API_KEY}"}
        
        # Build messages array with history
        system_prompt = """You are a personalized assistant that MUST remember all user information shared in the conversation.
IMPORTANT: 
1. When the user mentions their name, remember it and use it in your responses
2. NEVER say "I don't have access to your personal information" or "I am an AI language model"
3. If asked about previously mentioned information like the user's name, ALWAYS recall it from the conversation history
4. Act as if you are having a continuous conversation with the user
5. You MUST respond as if you know the user personally based on the conversation history"""
        
        messages = [{"role": "system", "content": system_prompt}]
        
        # Add message history if provided
        if history and isinstance(history, list):
            for msg in history:
                if isinstance(msg, dict) and 'role' in msg and 'content' in msg:
                    messages.append({
                        "role": msg["role"],
                        "content": msg["content"]
                    })
        
        # Add the current query
        messages.append({"role": "user", "content": query})
        
        payload = {
            "model": "gpt-4o-mini",
            "messages": messages,
            "max_tokens": 500
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
@app.route("/ask", methods=["POST"])
def ask():
    data = request.get_json(silent=True) or {}
    query = str(data.get("query", "")).strip()
    history = data.get("history", [])
    
    if not query:
        return jsonify({"error": "Invalid request. 'query' field is required."}), 400

    # Try Gemini first with conversation history
    answer = call_gemini(query, history)

    # If Gemini failed completely, fallback to OpenAI
    if answer is None or answer.startswith("❌"):
        print("⚠️ Falling back to OpenAI...")
        answer = call_openai(query, history)

    return jsonify({
        "answer": answer,
        "meta": {"model_used": "Gemini" if not answer.startswith("⚠️") and not answer.startswith("❌") else "OpenAI"}
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
    print(f"🚀 Starting server on http://localhost:{PORT}")
    app.run(debug=True, port=PORT, host="0.0.0.0")
