@echo off
title QA-Agent Frontend (Vite React on Port 5176)
color 0A

echo ========================================================
echo        QA-Agent - AI QA Studio Frontend
echo ========================================================
echo.

cd /d "%~dp0frontend"

if not exist "node_modules" (
    echo [*] Installing frontend dependencies...
    call npm install
)

echo [*] Starting Vite Dev Server on http://localhost:5176...
echo.

call npm run dev

pause
