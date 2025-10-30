#!/bin/bash

# Kill any existing processes on port 5001
lsof -ti:5001 | xargs kill -9 2>/dev/null || true

# Start backend in background
cd backend
python app.py &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 3

# Start frontend
cd frontend
npm run dev

# If frontend exits, kill backend too
kill $BACKEND_PID
