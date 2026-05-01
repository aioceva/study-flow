@echo off
cd /d %~dp0
echo.
echo Pulling latest main...
git pull origin main
echo.
echo Deploying to Vercel production...
npx vercel --prod
echo.
pause
