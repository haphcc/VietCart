@echo off
setlocal
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0run-before-after-tests.ps1"
exit /b %ERRORLEVEL%
