@echo off
cd /d "%~dp0"
title FBH Materialplaner - Starten
echo ===================================================
echo   FBH Materialplaner - Anwendung wird gestartet
echo ===================================================
echo.

:: 1. Prufen, ob Python vorhanden ist (fuer lokalen Webserver)
where python >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [Info] Der Webserver ist jetzt AKTIV!
    echo.
    echo Öffnen Sie Ihren Browser unter: http://localhost:8000/index.html
    echo (Hinweis: Dieses schwarze Fenster während der Nutzung geöffnet lassen!)
    echo ===================================================
    echo.
    start "" "http://localhost:8000/index.html" 2>nul
    python -m http.server 8000
    goto :end
)

:: 2. Prufen, ob Node/npx vorhanden ist
where npx >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [Info] Der Webserver ist jetzt AKTIV!
    echo.
    echo Öffnen Sie Ihren Browser unter: http://localhost:3000/index.html
    echo (Hinweis: Dieses schwarze Fenster während der Nutzung geöffnet lassen!)
    echo ===================================================
    echo.
    start "" "http://localhost:3000/index.html" 2>nul
    npx -y serve "%~dp0" -p 3000
    goto :end
)


:: 3. Fallback: Datei direkt im Standardbrowser oeffnen
echo [Info] Oeffne index.html direkt im Browser...
start "" "%~dp0index.html"

:end
