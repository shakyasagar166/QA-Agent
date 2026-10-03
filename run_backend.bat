@echo off
title QA-Agent Backend (FastAPI on Port 8003)
color 0B

echo ========================================================
echo        QA-Agent - Autonomous AI QA Backend Service
echo ========================================================
echo.

cd /d "%~dp0backend"

if not exist ".env" (
    if exist ".env.example" (
        echo [*] Creating .env from .env.example...
        copy .env.example .env >nul
    )
)

echo [*] Starting FastAPI Server on http://localhost:8003...
echo [*] Swagger UI: http://localhost:8003/docs
echo [*] ReDoc:      http://localhost:8003/redoc
echo.

python -m uvicorn app.main:app --host 0.0.0.0 --port 8003 --reload

pause
