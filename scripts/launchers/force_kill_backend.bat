@echo off
echo Forcefully killing all Python processes on port 7000...

REM Method 1: Kill by port using PowerShell
powershell -Command "Get-NetTCPConnection -LocalPort 7000 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }"

REM Wait a moment
timeout /t 2 /nobreak >nul

REM Method 2: Kill all python.exe processes (nuclear option)
echo Killing all python.exe processes...
taskkill /F /IM python.exe >nul 2>&1

REM Wait for processes to terminate
timeout /t 3 /nobreak >nul

REM Verify
echo.
echo Checking port 7000 status...
netstat -ano | findstr :7000 | findstr LISTENING

if errorlevel 1 (
    echo SUCCESS: Port 7000 is now free!
    echo.
    echo You can now run start_backend.bat
) else (
    echo WARNING: Some processes still on port 7000
    echo Please close any Python terminals manually
)

pause
