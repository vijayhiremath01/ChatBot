# znozx AI Chatbot

## Overview
An intelligent AI chatbot application powered by Google's Gemini AI with OpenAI fallback support. The application features a modern React frontend with chat history management and a Python Flask backend that handles AI model interactions.

**Current State:** Fully configured and running in Replit environment
- Frontend: React + Vite (Port 5000)
- Backend: Flask API (Port 5001)
- AI Provider: Google Gemini (with OpenAI fallback)

## Recent Changes (October 30, 2025)
- ✅ Configured for Replit environment
- ✅ Updated Vite to run on port 5000 with host 0.0.0.0
- ✅ Modified backend to use localhost on port 5001
- ✅ Updated frontend to dynamically connect to local backend
- ✅ Set up combined startup script for both services
- ✅ Integrated Gemini API key through Replit Secrets
- ✅ Created .gitignore for Python and Node.js

## Project Architecture

### Frontend (`/frontend`)
- **Framework:** React 19 with Vite 7
- **Styling:** Tailwind CSS 4 + Custom CSS
- **Key Features:**
  - Chat history with localStorage persistence
  - Message bubbles with user/AI differentiation
  - Sidebar chat management
  - Markdown support in responses
  - Code syntax highlighting
  - Loading states with animated dots

### Backend (`/backend`)
- **Framework:** Flask 2.3.3
- **AI Integration:** Google Gemini API with OpenAI fallback
- **Key Features:**
  - Conversation history tracking
  - Retry logic with exponential backoff
  - Error handling and fallback mechanisms
  - CORS enabled for frontend communication

### API Endpoints
- `POST /ask` - Send a query to the AI (includes conversation history)
- `GET /models` - List available Gemini models

## Environment Setup

### Required Secrets
- `GEMINI_API_KEY` - Google Gemini API key (Required)
- `OPENAI_API_KEY` - OpenAI API key (Optional fallback)

### Optional Environment Variables
- `GEMINI_MODEL` - Default: "gemini-1.5-flash"
- `PORT` - Backend port, Default: 5001

## How to Run
The application starts automatically via the configured workflow:
```bash
bash start.sh
```

This script:
1. Starts the Flask backend on localhost:5001
2. Starts the Vite frontend on 0.0.0.0:5000
3. Both services run concurrently

## Tech Stack
**Frontend:**
- React 19
- Vite 7
- Tailwind CSS 4
- Framer Motion (animations)
- React Markdown (message formatting)
- Lucide React (icons)

**Backend:**
- Python 3.11
- Flask 2.3.3
- Flask-CORS
- python-dotenv
- requests
- gunicorn (production)

## User Preferences
- No specific preferences documented yet
