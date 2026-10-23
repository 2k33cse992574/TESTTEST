@echo off
title AICTE Officer Portal - Frontend
cd /d %~dp0frontend
echo Starting AICTE Frontend on http://localhost:5173 ...
npm run dev
pause
