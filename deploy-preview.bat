@echo off
cd /d %~dp0
echo.
echo Current branch:
git branch --show-current
echo.
echo Pulling latest commits...
git pull
echo.
echo Deploying to Vercel Preview...
npx vercel
echo.
pause
