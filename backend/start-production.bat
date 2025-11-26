@echo off
echo =======================================
echo  Hackathon Portal - Production Server
echo =======================================
echo.

REM Check if .env file exists
if not exist .env (
    echo [ERROR] .env file not found!
    echo Please create .env file from .env.example
    echo.
    pause
    exit /b 1
)

echo [INFO] Starting server in production mode...
echo.

REM Set production environment
set NODE_ENV=production

REM Start the server
node server.js

REM Keep window open if server crashes
if errorlevel 1 (
    echo.
    echo [ERROR] Server failed to start!
    pause
)
