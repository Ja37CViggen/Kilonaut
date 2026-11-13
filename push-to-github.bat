@echo off
chcp 65001 >nul
title Push Kilonaut to GitHub (Permanent 24/7 Website)
color 0B
cls

echo ======================================================================
echo    *       .     *   .    K I L O N A U T   .     *       .      *
echo  .   *    AUTOMATIC PERMANENT DEPLOYMENT TO GITHUB PAGES   *   .
echo ======================================================================
echo.

cd /d "%~dp0"

set "GIT_EXE=C:\Program Files\Microsoft Visual Studio\18\Community\Common7\IDE\CommonExtensions\Microsoft\TeamFoundation\Team Explorer\Git\cmd\git.exe"

if not exist "%GIT_EXE%" (
    where git >nul 2>&1
    if %errorlevel% equ 0 (
        set "GIT_EXE=git"
    ) else (
        color 0C
        echo [ERROR] Git was not found!
        pause
        exit /b 1
    )
)

echo [*] Target Repository: https://github.com/Ja37CViggen/Kilonaut
echo [*] Staging all files including root index.html, assets, and GitHub Action...
"%GIT_EXE%" add -A
"%GIT_EXE%" commit -m "Configure Kilonaut for automated GitHub Pages 24/7 hosting" >nul 2>&1

echo.
echo [*] Uploading to GitHub... (A browser or GitHub window may prompt you to sign in)
echo.

"%GIT_EXE%" push -u origin main --force

if %errorlevel% equ 0 (
    echo.
    echo ======================================================================
    echo  [SUCCESS] All files uploaded to GitHub successfully!
    echo ======================================================================
    echo.
    echo GitHub Actions will now automatically publish your website.
    echo In ~1 to 2 minutes, your website will be permanently LIVE at:
    echo.
    echo    https://ja37cviggen.github.io/Kilonaut/
    echo.
    echo It will stay online 24/7 forever, even when your PC is turned off!
    echo ======================================================================
) else (
    echo.
    color 0C
    echo [ERROR] Push failed. If a GitHub login window opened, please complete it and try again.
)

echo.
pause
