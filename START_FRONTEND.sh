#!/bin/bash

# Start Cuterus Frontend Development Server
# This script starts the frontend on port 5173

echo ""
echo "╔════════════════════════════════════════╗"
echo "║     CUTERUS FRONTEND STARTUP SCRIPT    ║"
echo "╚════════════════════════════════════════╝"
echo ""
echo "Starting frontend development server..."
echo "Port: 5173"
echo "URL: http://localhost:5173"
echo ""
echo "Note: Keep this window open while developing"
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Start the frontend
npm run dev
