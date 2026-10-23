@echo off
title AICTE Officer Portal - FastAPI Backend & ML Engine
cd /d %~dp0backend
echo Starting AICTE Backend on http://localhost:8000 ...
.venv\Scripts\python.exe run.py
pause
