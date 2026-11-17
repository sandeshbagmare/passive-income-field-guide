@echo off
setlocal
cd /d "%~dp0"
if not exist "setup-pc.ps1" (
  echo Extract the complete kit before running start.cmd.
  pause
  exit /b 1
)
echo Starting the local income dashboard. No provider app is installed or activated.
echo Keep this window open. Press Ctrl+C to stop.
powershell.exe -NoProfile -File "%~dp0setup-pc.ps1" -Action Serve -OpenBrowser
if errorlevel 1 (
  echo.
  echo Dashboard could not start. Read the error above.
  echo If port 8769 is already in use, check http://127.0.0.1:8769/dashboard.html
  echo If script policy blocks a reviewed download, use your normal permitted workflow.
  echo No security policy is changed by this launcher.
  pause
)
