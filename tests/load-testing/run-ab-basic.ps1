param(
  [Parameter(Mandatory = $true)]
  [ValidateSet('health', 'products', 'cart', 'orders', 'users', 'notifications', 'all')]
  [string]$Group
)

$ErrorActionPreference = 'Stop'
$BaseUrl = if ($env:BASE_URL) { $env:BASE_URL } else { 'http://localhost:3000' }
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ResultsDir = Join-Path $ScriptDir 'results'
New-Item -ItemType Directory -Force -Path $ResultsDir | Out-Null

function Find-Ab {
  $cmd = Get-Command ab -ErrorAction SilentlyContinue
  if ($cmd) { return $cmd.Source }
  if (Test-Path 'C:\xampp\apache\bin\ab.exe') { return 'C:\xampp\apache\bin\ab.exe' }
  return $null
}

function Test-Server {
  try {
    Invoke-WebRequest -UseBasicParsing -Uri "$BaseUrl/health" -TimeoutSec 5 | Out-Null
  } catch {
    Write-Host 'API Gateway chưa chạy. Hãy start project trước khi chạy load test.'
    Write-Host "URL kiểm tra: $BaseUrl/health"
    exit 1
  }
}

function Invoke-AbGet {
  param(
    [string]$OutputFile,
    [string]$Label,
    [int]$Total,
    [int]$Concurrency,
    [string]$Url,
    [string[]]$ExtraArgs = @()
  )

  @(
    '============================================================'
    $Label
    "URL: $Url"
    "Tổng request: $Total"
    "Request đồng thời: $Concurrency"
    "Thời gian: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
    '============================================================'
  ) | Tee-Object -FilePath $OutputFile -Append

  $oldPreference = $ErrorActionPreference
  $ErrorActionPreference = 'Continue'
  & $script:AbExe -n $Total -c $Concurrency @ExtraArgs $Url 2>&1 | Tee-Object -FilePath $OutputFile -Append
  $ErrorActionPreference = $oldPreference
  '' | Tee-Object -FilePath $OutputFile -Append
}

$script:AbExe = Find-Ab
if (-not $script:AbExe) {
  Write-Host 'Apache Benchmark chưa được cài. Vui lòng cài Apache HTTP Server hoặc dùng XAMPP/Git Bash/WSL.'
  exit 1
}

Test-Server

$timestamp = Get-Date -Format 'yyyy-MM-dd_HH-mm-ss'

function Run-Health {
  $output = Join-Path $ResultsDir "health_$timestamp.txt"
  Invoke-AbGet $output 'Health - tải nhẹ' 100 10 "$BaseUrl/health"
  Invoke-AbGet $output 'Health - tải trung bình' 500 50 "$BaseUrl/health"
  Invoke-AbGet $output 'Health - tải nặng' 1000 100 "$BaseUrl/health"
  Write-Host "Đã lưu kết quả: $output"
}

function Run-Products {
  $output = Join-Path $ResultsDir "products_$timestamp.txt"
  foreach ($endpoint in @('/api/products', '/api/products/1')) {
    Invoke-AbGet $output "Products $endpoint - tải nhẹ" 100 10 "$BaseUrl$endpoint"
    Invoke-AbGet $output "Products $endpoint - tải trung bình" 500 50 "$BaseUrl$endpoint"
    Invoke-AbGet $output "Products $endpoint - tải nặng" 1000 100 "$BaseUrl$endpoint"
  }
  Write-Host "Đã lưu kết quả: $output"
}

function Run-Cart {
  $output = Join-Path $ResultsDir "cart_$timestamp.txt"
  Invoke-AbGet $output 'Cart /api/cart/1 - tải nhẹ' 100 10 "$BaseUrl/api/cart/1"
  Invoke-AbGet $output 'Cart /api/cart/1 - tải trung bình' 500 50 "$BaseUrl/api/cart/1"
  Invoke-AbGet $output 'Cart /api/cart/1 - tải nặng' 1000 100 "$BaseUrl/api/cart/1"
  Write-Host "Đã lưu kết quả: $output"
}

function Run-Orders {
  $output = Join-Path $ResultsDir "orders_$timestamp.txt"
  Invoke-AbGet $output 'Orders /api/orders/user/1 - tải nhẹ' 100 10 "$BaseUrl/api/orders/user/1"
  Invoke-AbGet $output 'Orders /api/orders/user/1 - tải trung bình' 500 50 "$BaseUrl/api/orders/user/1"
  Invoke-AbGet $output 'Orders /api/orders/user/1 - tải nặng' 1000 100 "$BaseUrl/api/orders/user/1"
  Write-Host "Đã lưu kết quả: $output"
}

function Run-Users {
  $output = Join-Path $ResultsDir "users_$timestamp.txt"
  Invoke-AbGet $output 'Users /api/users/1 - tải nhẹ' 100 10 "$BaseUrl/api/users/1"
  Invoke-AbGet $output 'Users /api/users/1 - tải trung bình' 500 50 "$BaseUrl/api/users/1"
  Invoke-AbGet $output 'Users /api/users/1 - tải nặng' 1000 100 "$BaseUrl/api/users/1"
  if ($env:JWT_TOKEN) {
    Invoke-AbGet $output 'Users /api/users/me - tải nhẹ' 100 10 "$BaseUrl/api/users/me" @('-H', "Authorization: Bearer $env:JWT_TOKEN")
  } else {
    Write-Host 'Bỏ qua GET /api/users/me vì JWT_TOKEN rỗng.'
  }
  Write-Host "Đã lưu kết quả: $output"
}

function Run-Notifications {
  if (-not $env:JWT_TOKEN) {
    Write-Host 'Bỏ qua notification user endpoint vì JWT_TOKEN rỗng.'
    return
  }
  $output = Join-Path $ResultsDir "notifications_$timestamp.txt"
  Invoke-AbGet $output 'Notifications /api/notifications/user/1 - tải nhẹ' 100 10 "$BaseUrl/api/notifications/user/1" @('-H', "Authorization: Bearer $env:JWT_TOKEN")
  Invoke-AbGet $output 'Notifications /api/notifications/user/1 - tải trung bình' 500 50 "$BaseUrl/api/notifications/user/1" @('-H', "Authorization: Bearer $env:JWT_TOKEN")
  Invoke-AbGet $output 'Notifications /api/notifications/user/1 - tải nặng' 1000 100 "$BaseUrl/api/notifications/user/1" @('-H', "Authorization: Bearer $env:JWT_TOKEN")
  Write-Host "Đã lưu kết quả: $output"
}

switch ($Group) {
  'health' { Run-Health }
  'products' { Run-Products }
  'cart' { Run-Cart }
  'orders' { Run-Orders }
  'users' { Run-Users }
  'notifications' { Run-Notifications }
  'all' {
    Run-Health
    Run-Products
    Run-Cart
    Run-Orders
    Run-Users
    Run-Notifications
    Write-Host 'Đã chạy xong các script batch.'
  }
}



