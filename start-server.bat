@echo off
chcp 65001 >nul
title Kilonaut Server [RUNNING]
color 0A
cls

cd /d "%~dp0"

echo ======================================================================
echo    *       .     *   .    K I L O N A U T   .     *       .      *
echo  .   *     JUNIOR ASTRONAUT ACADEMY - LOCAL MISSION SERVER *   .
echo ======================================================================
echo.

set "NODE_EXE="

if exist "%AppData%\Antigravity\bin\node.cmd" (
    set "NODE_EXE=%AppData%\Antigravity\bin\node.cmd"
    goto :found_node
)
if exist "%AppData%\Antigravity\bin\agy-node.cmd" (
    set "NODE_EXE=%AppData%\Antigravity\bin\agy-node.cmd"
    goto :found_node
)
if exist "C:\Program Files\nodejs\node.exe" (
    set "NODE_EXE=C:\Program Files\nodejs\node.exe"
    goto :found_node
)
if exist "%ProgramFiles%\nodejs\node.exe" (
    set "NODE_EXE=%ProgramFiles%\nodejs\node.exe"
    goto :found_node
)
if exist "%ProgramFiles(x86)%\nodejs\node.exe" (
    set "NODE_EXE=%ProgramFiles(x86)%\nodejs\node.exe"
    goto :found_node
)
if exist "%LocalAppData%\Programs\node\node.exe" (
    set "NODE_EXE=%LocalAppData%\Programs\node\node.exe"
    goto :found_node
)

where node >nul 2>&1
if %errorlevel% equ 0 (
    set "NODE_EXE=node"
    goto :found_node
)

color 0C
echo [ERROR] Node.js was not detected on your system.
echo Please download and install Node.js from https://nodejs.org/
echo After installing Node.js, run this file again.
echo.
pause
exit /b 1

:found_node
echo [*] Detected Node.js: "%NODE_EXE%"
echo [*] Starting Mission Control Server...
echo [*] Server Address: http://127.0.0.1:3000
echo.
echo ======================================================================
echo  [SERVER ACTIVE] KEEP THIS WINDOW OPEN WHILE YOU PLAY!
echo.
echo  To open the game in your browser, double-click: open-website.bat
echo  To stop the server, press Ctrl+C in this window.
echo ======================================================================
echo.

"%NODE_EXE%" server.js

if %errorlevel% neq 0 (
    echo.
    echo [Server exited with an error. See above for details.]
    pause
)
