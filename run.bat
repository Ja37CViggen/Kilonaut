@echo off
chcp 65001 >nul
title Kilonaut - Space Mission Control Academy
color 0B
cls

echo ======================================================================
echo    *       .     *   .    K I L O N A U T   .     *       .      *
echo  .   *     JUNIOR ASTRONAUT ACADEMY - MISSION CONTROL      *   .
echo ======================================================================
echo.

cd /d "%~dp0"

:: Check for Node.js
set NODE_EXE=node
if exist "%AppData%\Antigravity\bin\node.cmd" (
  set "NODE_EXE=%AppData%\Antigravity\bin\node.cmd"
) else if exist "%AppData%\Antigravity\bin\agy-node.cmd" (
  set "NODE_EXE=%AppData%\Antigravity\bin\agy-node.cmd"
) else (
  where node >nul 2>&1
  if %errorlevel% neq 0 (
    if exist "C:\Program Files\nodejs\node.exe" (
      set "NODE_EXE=C:\Program Files\nodejs\node.exe"
    ) else if exist "%LocalAppData%\Programs\node\node.exe" (
      set "NODE_EXE=%LocalAppData%\Programs\node\node.exe"
    ) else (
      color 0C
      echo [ERROR] Node.js was not found on your system!
      echo Please install Node.js from https://nodejs.org/ to run Kilonaut.
      echo.
      pause
      exit /b 1
    )
  )
)

echo [*] Starting Kilonaut Mission Control Server...
echo [*] Local URL: http://127.0.0.1:3000
echo.
echo [*] Opening in your default web browser...

:: Open browser automatically
start "" "http://127.0.0.1:3000"

echo.
echo ======================================================================
echo  Server is ACTIVE and RUNNING!
echo  Press Ctrl+C at any time in this window to stop the server.
echo ======================================================================
echo.

"%NODE_EXE%" server.js
if %errorlevel% neq 0 (
  pause
)
