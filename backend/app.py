from flask import Flask, request, jsonify  # pyright: ignore[reportMissingImports]
from flask_cors import CORS  # pyright: ignore[reportMissingModuleSource]
import json
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Load knowledge base
knowledge_base = {}
try:
    with open('knowledge_base.json', 'r') as file:
        knowledge_base = json.load(file)
except FileNotFoundError:
    print("Warning: knowledge_base.json not found. Starting with empty knowledge base.")
except json.JSONDecodeError:
    print("Error: knowledge_base.json is not valid JSON. Starting with empty knowledge base.")

@app.route('/ask', methods=['POST'])
def ask():
    data = request.get_json()
    
    if not data or 'query' not in data:
        return jsonify({"error": "Invalid request. 'query' field is required."}), 400
    
    query = data['query'].lower()
    
    # Search for the query in the knowledge base
    for category in knowledge_base:
        for key, value in knowledge_base[category].items():
            if query in key.lower() or key.lower() in query:
                return jsonify({"answer": value})
    
    # If no match found
    return jsonify({"answer": "Sorry, I don't know that yet."})

if __name__ == '__main__':
    app.run(debug=True, port=5000) 