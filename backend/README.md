# ChatBot Backend

This is the backend service for the ChatBot project. It provides a simple API for querying a knowledge base of Q&A pairs.

## Setup Instructions

### Prerequisites
- Python 3.6 or higher

### Installation

1. Install the required dependencies:
```bash
pip install flask flask-cors
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