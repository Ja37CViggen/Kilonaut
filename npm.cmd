@echo off
if "%1"=="start" (
    call "%~dp0start-server.bat"
) else (
    echo.
    echo ==========================================================
    echo  [OK] Zero external npm packages required!
    echo  All NASA Academy science engines, audio synthesizers,
    echo  simulations, and AI comms are already 100%% built-in.
    echo.
    echo  To start Mission Control, simply run:
    echo    start-server.bat
    echo  or:
    echo    .\run.ps1
    echo ==========================================================
    echo.
)
