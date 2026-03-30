#!/bin/bash

# Start Cuterus Backend Server
# This script starts the backend on port 5000

echo ""
echo "╔════════════════════════════════════════╗"
echo "║     CUTERUS BACKEND STARTUP SCRIPT     ║"
echo "╚════════════════════════════════════════╝"
echo ""
echo "Starting backend server..."
echo "Port: 5000"
echo "API: http://localhost:5000"
echo ""

cd backend

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Start the backend
npm start
