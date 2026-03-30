@echo off
REM Start Cuterus Backend Server
REM This file starts the backend on port 5000

echo.
echo ╔════════════════════════════════════════╗
echo ║     CUTERUS BACKEND STARTUP SCRIPT     ║
echo ╚════════════════════════════════════════╝
echo.
echo Starting backend server...
echo Port: 5000
echo API: http://localhost:5000
echo.

cd backend

REM Check if node_modules exists
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
)

REM Start the backend
npm start

pause
