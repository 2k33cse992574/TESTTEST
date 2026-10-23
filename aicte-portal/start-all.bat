@echo off
title AICTE Officer Portal - APAAR-Pramaan (SIH 26263)
echo ========================================================
echo Starting AICTE Officer Portal (Backend + ML + Frontend)
echo ========================================================

start "AICTE Backend (Port 8000)" cmd /k "%~dp0start-backend.bat"
timeout /t 3 /nobreak >nul
start "AICTE Frontend (Port 5173)" cmd /k "%~dp0start-frontend.bat"

echo.
echo AICTE Backend: http://localhost:8000 (Swagger docs at http://localhost:8000/docs)
echo AICTE Portal UI: http://localhost:5173/officer
echo ========================================================
pause
