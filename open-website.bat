@echo off
chcp 65001 >nul
title Open Kilonaut Website
color 0B
cls

echo ======================================================================
echo    *       .     *   .    K I L O N A U T   .     *       .      *
echo  .   *     OPENING KILONAUT IN YOUR DEFAULT WEB BROWSER    *   .
echo ======================================================================
echo.
echo [*] Opening http://127.0.0.1:3000 in your browser...
echo [*] (Make sure 'start-server.bat' is running in another window!)
echo.

start "" "http://127.0.0.1:3000"

exit /b 0
