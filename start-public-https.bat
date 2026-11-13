@echo off
chcp 65001 >nul
title Kilonaut - Public HTTPS Cloud Server
color 0B
cls

echo ======================================================================
echo    *       .     *   .    K I L O N A U T   .     *       .      *
echo  .   *   PUBLIC HTTPS CLOUD SERVER (ACCESSIBLE TO EVERYONE) *   .
echo ======================================================================
echo.

cd /d "%~dp0"

:: Start local server in background if not running
curl -s http://127.0.0.1:3000 >nul 2>&1
if %errorlevel% neq 0 (
    echo [*] Starting local Kilonaut node server...
    start /b "" "%AppData%\Antigravity\bin\node.cmd" server.js
    timeout /t 2 >nul
)

echo [*] Starting Cloudflare HTTPS Tunnel...
echo [*] Generating public secure HTTPS URL...
echo.

if exist "C:\Users\vtolb\.gemini\antigravity\cloudflared.exe" (
    "C:\Users\vtolb\.gemini\antigravity\cloudflared.exe" tunnel --url http://127.0.0.1:3000
) else (
    echo [ERROR] cloudflared.exe not found.
    pause
)
