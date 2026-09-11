@echo off
title FakeJobDetect Launcher
echo ===================================================
echo Starting Fake Job Detection Backend on port 5000...
echo ===================================================
start "Fake Job Detection - Backend" cmd /k "cd /d "%~dp0backend" && node src/server.js"

ping 127.0.0.1 -n 3 >nul

echo ===================================================
echo Starting Fake Job Detection Frontend on port 3000...
echo ===================================================
start "Fake Job Detection - Frontend" cmd /k "cd /d "%~dp0" && node node_modules\vite\bin\vite.js --port 3000 --host"

echo ===================================================
echo Both servers started!
echo Frontend: http://localhost:3000
echo Backend:  http://localhost:5000/api
echo ===================================================
