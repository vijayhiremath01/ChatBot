# ChatBot Backend

This is the backend service for the ChatBot project. It provides a simple API for querying a knowledge base of Q&A pairs.

## Setup Instructions

### Prerequisites
- Python 3.6 or higher

### Environment Setup

1. Create a `.env` file in the backend directory (copy from `.env.example`):
```bash
cp .env.example .env
```

2. Edit the `.env` file and add your API keys:
```
GEMINI_API_KEY=your_actual_gemini_api_key
GEMINI_MODEL=gemini-1.5-flash
OPENAI_API_KEY=your_actual_openai_api_key
PORT=5001
```

### Installation

1. Install the required dependencies:
```bash
pip install flask flask-cors python-dotenv
```

2. Run the application:
```bash
python app.py
```

The server will start on port 5000 (http://localhost:5000).

## API Documentation

### POST /ask
Query the knowledge base with a user message.

**Request Format:**
```json
{
  "query": "your question here"
}
```

**Response Format:**
- If a match is found:
```json
{
  "answer": "The answer from the knowledge base"
}
```
- If no match is found:
```json
{
  "answer": "Sorry, I don't know that yet."
}
```

## Knowledge Base

The `knowledge_base.json` file contains Q&A pairs organized by categories:
- Greetings & small talk
- Health & wellness
- Mental wellness & motivation
- Study & coding concepts
- College & career guidance
- Fun & random facts

You can extend the knowledge base by adding more Q&A pairs to the JSON file.