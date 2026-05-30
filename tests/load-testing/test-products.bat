@echo off
setlocal

if "%BASE_URL%"=="" set "BASE_URL=http://localhost:3000"
set "SCRIPT_DIR=%~dp0"
set "RESULTS_DIR=%SCRIPT_DIR%results"
if not exist "%RESULTS_DIR%" mkdir "%RESULTS_DIR%"

set "AB_EXE=ab"
where ab >nul 2>nul
if errorlevel 1 if exist "C:\xampp\apache\bin\ab.exe" set "AB_EXE=C:\xampp\apache\bin\ab.exe"
if "%AB_EXE%"=="ab" (
  where ab >nul 2>nul
  if errorlevel 1 (
  echo Apache Benchmark chua duoc cai. Vui long cai Apache HTTP Server hoac dung XAMPP/Git Bash/WSL.
  exit /b 1
  )
)

where curl >nul 2>nul
if errorlevel 1 (
  echo curl chua duoc cai. Vui long cai curl hoac chay bang Git Bash/WSL.
  exit /b 1
)

curl -fsS "%BASE_URL%/health" >nul 2>nul
if errorlevel 1 (
  echo API Gateway chua chay. Hay start project truoc khi chay load test.
  exit /b 1
)

for /f %%i in ('powershell -NoProfile -Command "Get-Date -Format yyyy-MM-dd_HH-mm-ss"') do set "TIMESTAMP=%%i"
set "OUTPUT_FILE=%RESULTS_DIR%\products_%TIMESTAMP%.txt"

call :run_ab "Products /api/products - tai nhe" 100 10 "%BASE_URL%/api/products"
call :run_ab "Products /api/products - tai trung binh" 500 50 "%BASE_URL%/api/products"
call :run_ab "Products /api/products - tai nang" 1000 100 "%BASE_URL%/api/products"
call :run_ab "Products /api/products/1 - tai nhe" 100 10 "%BASE_URL%/api/products/1"
call :run_ab "Products /api/products/1 - tai trung binh" 500 50 "%BASE_URL%/api/products/1"
call :run_ab "Products /api/products/1 - tai nang" 1000 100 "%BASE_URL%/api/products/1"

echo Da luu ket qua: %OUTPUT_FILE%
exit /b 0

:run_ab
set "LABEL=%~1"
set "TOTAL=%~2"
set "CONCURRENCY=%~3"
set "URL=%~4"
(
  echo ============================================================
  echo %LABEL%
  echo URL: %URL%
  echo Tong request: %TOTAL%
  echo Request dong thoi: %CONCURRENCY%
  echo ============================================================
) >> "%OUTPUT_FILE%"
"%AB_EXE%" -n %TOTAL% -c %CONCURRENCY% "%URL%" >> "%OUTPUT_FILE%" 2>&1
echo. >> "%OUTPUT_FILE%"
exit /b 0
