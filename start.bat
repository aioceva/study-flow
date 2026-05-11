@echo off
setlocal enabledelayedexpansion
cd /d %~dp0
if exist "..\.env.local" (
  for /f "usebackq tokens=1,* delims==" %%A in ("..\.env.local") do (
    set "key=%%A"
    if not "!key!"=="" if not "!key:~0,1!"=="#" set "%%A=%%B"
  )
)
npm run dev
