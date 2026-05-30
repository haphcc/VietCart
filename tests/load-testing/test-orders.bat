@echo off
setlocal
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0run-ab-basic.ps1" -Group orders
exit /b %ERRORLEVEL%
