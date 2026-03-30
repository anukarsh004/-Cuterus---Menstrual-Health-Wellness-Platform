#!/bin/bash

# Start Both Cuterus Frontend and Backend
# This script opens both in separate terminal windows (macOS/Linux)

echo ""
echo "╔════════════════════════════════════════════════════╗"
echo "║   CUTERUS FULL STARTUP - FRONTEND + BACKEND       ║"
echo "╚════════════════════════════════════════════════════╝"
echo ""
echo "Starting Cuterus application..."
echo ""
echo "Frontend: http://localhost:5173"
echo "Backend:  http://localhost:5000"
echo ""
echo "Two new terminal windows will open:"
echo "- Terminal 1: Frontend (keep open)"
echo "- Terminal 2: Backend (keep open)"
echo ""

# Get the directory where this script is
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

echo "✅ Starting Backend on Port 5000..."

# macOS: Use open with -a Terminal
if [[ "$OSTYPE" == "darwin"* ]]; then
    open -a Terminal "$SCRIPT_DIR/START_BACKEND.sh"
# Linux: Use gnome-terminal, xterm, or other available terminal
elif command -v gnome-terminal &> /dev/null; then
    gnome-terminal -- bash "$SCRIPT_DIR/START_BACKEND.sh"
elif command -v xterm &> /dev/null; then
    xterm -e bash "$SCRIPT_DIR/START_BACKEND.sh" &
fi

# Wait for backend to start
sleep 3

echo "✅ Starting Frontend on Port 5173..."

# macOS: Use open with -a Terminal
if [[ "$OSTYPE" == "darwin"* ]]; then
    open -a Terminal "$SCRIPT_DIR/START_FRONTEND.sh"
# Linux: Use gnome-terminal, xterm, or other available terminal
elif command -v gnome-terminal &> /dev/null; then
    gnome-terminal -- bash "$SCRIPT_DIR/START_FRONTEND.sh"
elif command -v xterm &> /dev/null; then
    xterm -e bash "$SCRIPT_DIR/START_FRONTEND.sh" &
fi

echo ""
echo "✅ Both servers are starting!"
echo ""
echo "Open your browser: http://localhost:5173"
echo ""
echo "Keep both windows open while using the app."
echo "Press Ctrl+C in each terminal to stop."
echo ""
