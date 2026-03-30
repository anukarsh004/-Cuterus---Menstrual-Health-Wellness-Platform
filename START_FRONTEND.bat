@echo off
REM Start Cuterus Frontend Development Server
REM This file starts the frontend on port 5173

echo.
echo ╔════════════════════════════════════════╗
echo ║     CUTERUS FRONTEND STARTUP SCRIPT    ║
echo ╚════════════════════════════════════════╝
echo.
echo Starting frontend development server...
echo Port: 5173
echo URL: http://localhost:5173
echo.
echo Note: Keep this window open while developing
echo.

REM Check if node_modules exists
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
)

REM Start the frontend
npm run dev

pause
