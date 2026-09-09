@echo off
REM Double-click this file to start the Pixel Graphics site on this computer.

cd /d "%~dp0server"

where node >nul 2>nul
if errorlevel 1 (
  echo.
  echo Node.js is not installed.
  echo Install it from https://nodejs.org  ^(pick the "LTS" button^), then
  echo double-click this file again.
  echo.
  pause
  exit /b 1
)

if not exist node_modules (
  echo Setting up for the first time. This takes a minute...
  call npm install --no-audit --no-fund
)

echo.
echo Starting Pixel Graphics...
echo.
echo   Website:     http://localhost:3000
echo   Admin panel: http://localhost:3000/admin.html
echo.
echo Keep this window open while you use the site. Close it to stop.
echo.

start "" http://localhost:3000
node server.js
pause
