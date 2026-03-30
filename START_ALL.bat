@echo off
REM Start Both Cuterus Frontend and Backend
REM This opens both in separate windows

echo.
echo ╔════════════════════════════════════════════════════╗
echo ║   CUTERUS FULL STARTUP - FRONTEND + BACKEND       ║
echo ╚════════════════════════════════════════════════════╝
echo.
echo Starting Cuterus application...
echo.
echo Frontend: http://localhost:5173
echo Backend:  http://localhost:5000
echo.
echo Two new windows will open:
echo - Window 1: Frontend (keep open)
echo - Window 2: Backend (keep open)
echo.
echo Press any key to continue...
pause >nul

echo.
echo ✅ Starting Backend on Port 5000...
start "Cuterus Backend" cmd /k "cd backend && npm start"

REM Wait for backend to start
timeout /t 3 /nobreak

echo.
echo ✅ Starting Frontend on Port 5173...
start "Cuterus Frontend" cmd /k "npm run dev"

echo.
echo ✅ Both servers are starting!
echo.
echo Open your browser: http://localhost:5173
echo.
echo Keep both windows open while using the app.
echo Press Ctrl+C in each window to stop.
echo.
pause
