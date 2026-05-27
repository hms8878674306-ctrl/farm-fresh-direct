@echo off
title KrishiDirect - Automated Startup
color 0A
cls

echo =======================================================
echo.
echo    * * *   K R I S H I   D I R E C T   * * *
echo.
echo     [ Direct From Farm to Table with Gemini AI ]
echo.
echo =======================================================
echo.

:: Step 1: Check Node.js installation
echo [1/4] Checking Node.js installation...
node -v >nul 2>&1
if %errorlevel% neq 0 (
    color 0C
    echo.
    echo [ERROR] Node.js is not installed or not in PATH!
    echo Please install Node.js from https://nodejs.org/ before running KrishiDirect.
    echo.
    pause
    exit /b 1
)
echo [OK] Node.js is installed.
echo.

:: Step 2: Check node_modules folder
echo [2/4] Verifying dependencies...
if not exist "node_modules\" (
    echo.
    echo [INFO] node_modules folder not found. Installing dependencies...
    echo This might take a few moments. Please wait...
    echo.
    call npm install
    if %errorlevel% neq 0 (
        color 0C
        echo [ERROR] Dependency installation failed!
        pause
        exit /b 1
    )
) else (
    echo [OK] Dependencies are already installed.
)
echo.

:: Step 3: Check .env configurations
echo [3/4] Checking environment configurations...
if not exist ".env" (
    color 0E
    echo [WARNING] .env file not found!
    echo Creating a default .env file...
    (
        echo SUPABASE_PUBLISHABLE_KEY=""
        echo SUPABASE_URL=""
        echo VITE_SUPABASE_PROJECT_ID=""
        echo VITE_SUPABASE_PUBLISHABLE_KEY=""
        echo VITE_SUPABASE_URL=""
        echo VITE_GEMINI_API_KEY=""
    ) > .env
    echo Default .env created. Please add your credentials.
) else (
    echo [OK] Environment configuration file .env verified.
)
echo.

:: Step 4: Start local server and open browser
echo [4/4] Launching KrishiDirect Development Server...
echo.
echo =======================================================================
echo  KrishiDirect is starting! 
echo  A new terminal window will open to run the Vite Dev Server.
echo  The app will automatically open in your browser shortly at:
echo  http://localhost:8080
echo =======================================================================
echo.

:: Launch the server in a separate styled cmd window
start "KrishiDirect Dev Server" cmd /k "color 0E && echo Starting Vite Dev Server... && npm run dev"

:: Wait 4 seconds for the server to bind the port
timeout /t 4 /nobreak >nul

:: Open browser
start "" "http://localhost:8080"

echo [SUCCESS] Dev Server successfully launched in background!
echo Press any key to close this launcher console (the server will keep running).
pause >nul
exit /b 0
