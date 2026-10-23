@echo off
title APAAR-Pramaan Unified Stack (AICTE Portal + Student Portal + ML Engine)
echo ======================================================================
echo    APAAR-Pramaan: AICTE Portal + Student Dashboard Unified Platform
echo    FastAPI Backend (Port 8000) + Vite Frontend (Port 5173)
echo    Smart India Hackathon (SIH Problem Statement 26263)
echo ======================================================================

echo [1/2] Starting FastAPI Backend & ML Engine on port 8000...
start "AICTE Backend & ML Engine (Port 8000)" cmd /k "cd /d %~dp0aicte-portal\backend && .venv\Scripts\python.exe run.py"

timeout /t 3 /nobreak >nul

echo [2/2] Starting Unified Frontend on port 5173...
start "APAAR Frontend (Port 5173)" cmd /k "cd /d %~dp0 && npm run dev"

echo.
echo ======================================================================
echo  All services launched successfully!
echo.
echo  - Unified Login & Role Switcher: http://localhost:5173/login
echo  - Student Dashboard (Latest):    http://localhost:5173/student
echo  - AICTE Officer Portal:          http://localhost:5173/officer
echo  - Institution Portal:            http://localhost:5173/institution
echo  - Public QR Verification:        http://localhost:5173/verify?token=DEMO
echo  - FastAPI Swagger Docs:          http://localhost:8000/docs
echo  - Backend Health Check:          http://localhost:8000/health
echo ======================================================================
pause
