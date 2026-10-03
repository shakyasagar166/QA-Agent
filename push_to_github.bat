@echo off
echo ========================================================
echo Pushing QA-Agent to GitHub (origin: main)
echo ========================================================
git push -u origin main
echo.
if %ERRORLEVEL% EQU 0 (
    echo [SUCCESS] Pushed to GitHub successfully!
) else (
    echo [NOTE] If repository does not exist yet:
    echo 1. Go to https://github.com/new
    echo 2. Repository name: QA-Agent
    echo 3. Click "Create repository" (leave README unchecked)
    echo 4. Run this script again or run: git push -u origin main
)
pause
