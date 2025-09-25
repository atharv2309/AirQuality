#!/bin/bash

# AQI Dashboard Development Server Startup Script

echo "🌬️ Starting AQI Dashboard Development Environment..."

# Function to cleanup background processes on exit
cleanup() {
    echo "🛑 Shutting down development servers..."
    pkill -f "uvicorn main:app"
    pkill -f "next dev"
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup EXIT INT TERM

# Start the FastAPI backend
echo "🚀 Starting FastAPI backend server..."
cd api
source venv/bin/activate && python3 -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload &
API_PID=$!

# Wait a moment for API to start
sleep 3

# Start the Next.js frontend
echo "🎯 Starting Next.js frontend server..."
cd ../web
npm run dev &
WEB_PID=$!

echo "✅ Development environment is ready!"
echo "📊 Frontend: http://localhost:3000"
echo "🔌 API: http://localhost:8000"
echo "📖 API Docs: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop all servers..."

# Wait for background processes
wait $API_PID $WEB_PID