@echo off
setlocal enabledelayedexpansion
cd /d %~dp0
if exist "..\.env.local" (
  for /f "usebackq tokens=1,* delims==" %%A in ("..\.env.local") do (
    set "key=%%A"
    if not "!key!"=="" if not "!key:~0,1!"=="#" set "%%A=%%B"
  )
)
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
