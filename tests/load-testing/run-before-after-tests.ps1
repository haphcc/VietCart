param()

$ErrorActionPreference = 'Stop'
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ResultsDir = Join-Path $ScriptDir 'results'
New-Item -ItemType Directory -Force -Path $ResultsDir | Out-Null

$BaselineUrl = if ($env:BASELINE_URL) { $env:BASELINE_URL } else { 'http://localhost:3000' }
$OptimizedUrl = if ($env:OPTIMIZED_URL) { $env:OPTIMIZED_URL } else { 'http://localhost:3000' }
$Total = if ($env:LEVEL_TOTAL) { [int]$env:LEVEL_TOTAL } else { 300 }
$Concurrency = if ($env:LEVEL_CONCURRENCY) { [int]$env:LEVEL_CONCURRENCY } else { 30 }

function Find-Ab {
  $cmd = Get-Command ab -ErrorAction SilentlyContinue
  if ($cmd) { return $cmd.Source }
  if (Test-Path 'C:\xampp\apache\bin\ab.exe') { return 'C:\xampp\apache\bin\ab.exe' }
  return $null
}

function Test-Server([string]$Url) {
  try {
    Invoke-WebRequest -UseBasicParsing -Uri "$Url/health" -TimeoutSec 5 | Out-Null
  } catch {
    Write-Host "API Gateway chưa chạy tại $Url. Hãy start project trước khi chạy load test."
    exit 1
  }
}

function Invoke-AbGet {
  param(
    [string]$OutputFile,
    [string]$Label,
    [string]$Url
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
  & $script:AbExe -n $Total -c $Concurrency $Url 2>&1 | Tee-Object -FilePath $OutputFile -Append
  $ErrorActionPreference = $oldPreference
  '' | Tee-Object -FilePath $OutputFile -Append
}

$script:AbExe = Find-Ab
if (-not $script:AbExe) {
  Write-Host 'Apache Benchmark chưa được cài. Vui lòng cài Apache HTTP Server hoặc dùng XAMPP/Git Bash/WSL.'
  exit 1
}

Test-Server $BaselineUrl
Test-Server $OptimizedUrl

$timestamp = Get-Date -Format 'yyyy-MM-dd_HH-mm-ss'
$OutputFile = Join-Path $ResultsDir "before_after_$timestamp.txt"
$SummaryFile = Join-Path $ResultsDir "before_after_summary_$timestamp.md"

Write-Host 'Bắt đầu chạy kịch bản so sánh trước/sau.'
"BASELINE_URL=$BaselineUrl" | Tee-Object -FilePath $OutputFile
"OPTIMIZED_URL=$OptimizedUrl" | Tee-Object -FilePath $OutputFile -Append
'' | Tee-Object -FilePath $OutputFile -Append

$scenarios = @(
  @{ Solution = 'Redis cache cho Cart Service'; Endpoint = '/api/cart/1'; Note = 'đọc giỏ hàng' },
  @{ Solution = 'Scale Cart Service qua Load Balancer'; Endpoint = '/api/cart/1'; Note = 'đọc giỏ hàng khi nhiều request đồng thời' },
  @{ Solution = 'Đồng bộ tồn kho qua Product Service'; Endpoint = '/api/products/1'; Note = 'đọc sản phẩm để theo dõi API tồn kho' }
)

foreach ($scenario in $scenarios) {
  Invoke-AbGet $OutputFile "$($scenario.Solution) - TRƯỚC cải tiến - $($scenario.Note)" "$BaselineUrl$($scenario.Endpoint)"
  Invoke-AbGet $OutputFile "$($scenario.Solution) - SAU cải tiến - $($scenario.Note)" "$OptimizedUrl$($scenario.Endpoint)"
}

@(
  '# Bảng so sánh trước/sau load testing'
  ''
  "File kết quả gốc: ``$(Split-Path -Leaf $OutputFile)``"
  ''
  '| Giải pháp | Trạng thái | API kiểm thử | Tổng request | Request đồng thời | Requests per second | Time per request | Failed requests | Non-2xx responses | Nhận xét |'
  '| --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |'
  "| Redis cache cho Cart Service | Trước cải tiến | GET /api/cart/1 | $Total | $Concurrency |  |  |  |  | Điền từ file kết quả gốc |"
  "| Redis cache cho Cart Service | Sau cải tiến | GET /api/cart/1 | $Total | $Concurrency |  |  |  |  | So sánh với dòng trước |"
  "| Scale Cart Service qua Load Balancer | Trước cải tiến | GET /api/cart/1 | $Total | $Concurrency |  |  |  |  | Chạy với mô hình thường |"
  "| Scale Cart Service qua Load Balancer | Sau cải tiến | GET /api/cart/1 | $Total | $Concurrency |  |  |  |  | Chạy với npm run dev:scale hoặc Docker Compose |"
  "| Đồng bộ tồn kho qua Product Service | Trước cải tiến | GET /api/products/1 | $Total | $Concurrency |  |  |  |  | Theo dõi API liên quan tồn kho |"
  "| Đồng bộ tồn kho qua Product Service | Sau cải tiến | GET /api/products/1 | $Total | $Concurrency |  |  |  |  | Bổ sung POST reserve-stock nếu cần test ghi |"
) | Set-Content -Path $SummaryFile -Encoding UTF8

Write-Host "Đã lưu kết quả gốc: $OutputFile"
Write-Host "Đã tạo bảng điền kết quả: $SummaryFile"


