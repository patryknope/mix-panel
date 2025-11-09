@echo off
echo =========================================
echo Get5 Panel Setup Script
echo =========================================
echo.

REM Check if node is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo X Node.js is not installed. Please install Node.js 18+ first.
    pause
    exit /b 1
)

echo √ Node.js detected
node -v
echo.

REM Check if .env.local exists
if not exist .env.local (
    echo Creating .env.local from .env.example...
    copy .env.example .env.local >nul
    echo √ .env.local created
    echo.
    echo IMPORTANT: Edit .env.local with your configuration:
    echo    1. Add your MySQL password
    echo    2. Generate NEXTAUTH_SECRET
    echo    3. Add your Steam API key from https://steamcommunity.com/dev/apikey
    echo    4. Update URLs when deploying to production
    echo.
) else (
    echo √ .env.local already exists
    echo.
)

REM Install dependencies
echo Installing dependencies...
call npm install
echo √ Dependencies installed
echo.

REM Generate Prisma client
echo Generating Prisma client...
call npm run db:generate
echo √ Prisma client generated
echo.

echo =========================================
echo Setup Complete!
echo =========================================
echo.
echo Next steps:
echo 1. Edit .env.local with your configuration
echo 2. Run 'npm run db:push' to create database tables
echo 3. Run 'npm run dev' to start development server
echo 4. Visit http://localhost:3000
echo.
echo For deployment to Vercel:
echo 1. Push to GitHub
echo 2. Import to Vercel
echo 3. Add environment variables in Vercel dashboard
echo.
echo Need help? Check README.md for detailed instructions
pause
