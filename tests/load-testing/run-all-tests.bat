@echo off
setlocal

set "SCRIPT_DIR=%~dp0"
echo Chay load test voi BASE_URL=%BASE_URL%
if "%BASE_URL%"=="" echo BASE_URL mac dinh: http://localhost:3000
echo Ket qua se nam trong: %SCRIPT_DIR%results
echo.

call "%SCRIPT_DIR%test-health.bat"
if errorlevel 1 exit /b 1

call "%SCRIPT_DIR%test-products.bat"
if errorlevel 1 exit /b 1

echo.
echo Da chay xong cac script batch mau.
echo Cac script cart/orders/users/notifications day du nam o dang .sh de chay bang Git Bash/WSL.
