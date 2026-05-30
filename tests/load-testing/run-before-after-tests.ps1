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
  $abOutput = & $script:AbExe -n $Total -c $Concurrency $Url 2>&1
  $ErrorActionPreference = $oldPreference

  $abOutput | Tee-Object -FilePath $OutputFile -Append
  '' | Tee-Object -FilePath $OutputFile -Append

  $abText = ($abOutput | Out-String)
  $abLines = @($abOutput | ForEach-Object { $_.ToString() })

  function Get-AbValue([string[]]$Lines, [string]$Pattern) {
    foreach ($line in $Lines) {
      if ($line -match $Pattern) {
        return $Matches[1]
      }
    }
    return $null
  }

  $metrics = [ordered]@{
    RequestsPerSecond = Get-AbValue $abLines '^Requests per second:\s+([0-9.]+)\s+\[#/sec\] \(mean\)$'
    TimePerRequestMs   = Get-AbValue $abLines '^Time per request:\s+([0-9.]+)\s+\[ms\] \(mean\)$'
    FailedRequests     = Get-AbValue $abLines '^Failed requests:\s+([0-9]+)$'
    Non2xxResponses    = Get-AbValue $abLines '^Non-2xx responses:\s+([0-9]+)$'
    TransferRateKBs    = Get-AbValue $abLines '^Transfer rate:\s+([0-9.]+)\s+\[Kbytes/sec\] received$'
  }

  if ([string]::IsNullOrWhiteSpace($metrics.RequestsPerSecond)) { $metrics.RequestsPerSecond = '0' }
  if ([string]::IsNullOrWhiteSpace($metrics.TimePerRequestMs)) { $metrics.TimePerRequestMs = '0' }
  if ([string]::IsNullOrWhiteSpace($metrics.FailedRequests)) { $metrics.FailedRequests = '0' }
  if ([string]::IsNullOrWhiteSpace($metrics.Non2xxResponses)) { $metrics.Non2xxResponses = '0' }
  if ([string]::IsNullOrWhiteSpace($metrics.TransferRateKBs)) { $metrics.TransferRateKBs = '0' }

  return [pscustomobject]@{
    Label              = $Label
    Url                = $Url
    RequestsPerSecond  = $metrics.RequestsPerSecond
    TimePerRequestMs   = $metrics.TimePerRequestMs
    FailedRequests     = $metrics.FailedRequests
    Non2xxResponses    = $metrics.Non2xxResponses
    TransferRateKBs    = $metrics.TransferRateKBs
  }
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

$rows = @()

foreach ($scenario in $scenarios) {
  $before = Invoke-AbGet $OutputFile "$($scenario.Solution) - TRƯỚC cải tiến - $($scenario.Note)" "$BaselineUrl$($scenario.Endpoint)"
  $after = Invoke-AbGet $OutputFile "$($scenario.Solution) - SAU cải tiến - $($scenario.Note)" "$OptimizedUrl$($scenario.Endpoint)"

  $rows += [pscustomobject]@{
    Solution         = $scenario.Solution
    Status           = 'Trước cải tiến'
    Api              = "GET $($scenario.Endpoint)"
    Total            = $Total
    Concurrency      = $Concurrency
    RequestsPerSecond = $before.RequestsPerSecond
    TimePerRequestMs = $before.TimePerRequestMs
    FailedRequests   = $before.FailedRequests
    Non2xxResponses  = $before.Non2xxResponses
    Note             = 'Điền từ file kết quả gốc'
  }

  $rows += [pscustomobject]@{
    Solution         = $scenario.Solution
    Status           = 'Sau cải tiến'
    Api              = "GET $($scenario.Endpoint)"
    Total            = $Total
    Concurrency      = $Concurrency
    RequestsPerSecond = $after.RequestsPerSecond
    TimePerRequestMs = $after.TimePerRequestMs
    FailedRequests   = $after.FailedRequests
    Non2xxResponses  = $after.Non2xxResponses
    Note             = 'So sánh với dòng trước'
  }
}

$summaryLines = @(
  '# Bảng so sánh trước/sau load testing'
  ''
  "File kết quả gốc: ``$(Split-Path -Leaf $OutputFile)``"
  ''
  '| Giải pháp | Trạng thái | API kiểm thử | Tổng request | Request đồng thời | Requests per second | Time per request | Failed requests | Non-2xx responses | Nhận xét |'
  '| --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |'
)

foreach ($row in $rows) {
  $summaryLines += "| $($row.Solution) | $($row.Status) | $($row.Api) | $($row.Total) | $($row.Concurrency) | $($row.RequestsPerSecond) | $($row.TimePerRequestMs) | $($row.FailedRequests) | $($row.Non2xxResponses) | $($row.Note) |"
}

$summaryLines += ''
$summaryLines += 'Ghi chú: nếu API Gateway đang bật rate limit 120 request/phút, các mức tải cao có thể phát sinh `Non-2xx responses` do bị giới hạn request.'

$summaryLines | Set-Content -Path $SummaryFile -Encoding UTF8

Write-Host "Đã lưu kết quả gốc: $OutputFile"
Write-Host "Đã tạo bảng điền kết quả: $SummaryFile"


