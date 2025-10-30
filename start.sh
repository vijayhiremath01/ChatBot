#!/bin/bash

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
