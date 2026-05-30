#!/usr/bin/env bash

# Hàm dùng chung cho các kịch bản Apache Benchmark.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RESULTS_DIR="$SCRIPT_DIR/results"
EVIDENCE_DIR="$SCRIPT_DIR/evidence"

mkdir -p "$RESULTS_DIR" "$EVIDENCE_DIR"

find_ab() {
  if command -v ab >/dev/null 2>&1; then
    echo "ab"
  elif [ -x "/c/xampp/apache/bin/ab.exe" ]; then
    echo "/c/xampp/apache/bin/ab.exe"
  elif [ -x "/mnt/c/xampp/apache/bin/ab.exe" ]; then
    echo "/mnt/c/xampp/apache/bin/ab.exe"
  else
    echo ""
  fi
}

require_tools() {
  AB_CMD="$(find_ab)"
  if [ -z "$AB_CMD" ]; then
    echo "Apache Benchmark chưa được cài. Vui lòng cài Apache HTTP Server hoặc dùng XAMPP/Git Bash/WSL."
    exit 1
  fi

  if ! command -v curl >/dev/null 2>&1; then
    echo "curl chưa được cài. Vui lòng cài curl hoặc chạy bằng Git Bash/WSL."
    exit 1
  fi
}

check_server() {
  local base_url="$1"
  if ! curl -fsS "$base_url/health" >/dev/null 2>&1; then
    echo "API Gateway chưa chạy. Hãy start project trước khi chạy load test."
    echo "URL kiểm tra: $base_url/health"
    exit 1
  fi
}

run_ab_get() {
  local output_file="$1"
  local label="$2"
  local total="$3"
  local concurrency="$4"
  local url="$5"
  shift 5

  {
    echo "============================================================"
    echo "$label"
    echo "URL: $url"
    echo "Tổng request: $total"
    echo "Request đồng thời: $concurrency"
    echo "Thời gian: $(date '+%Y-%m-%d %H:%M:%S')"
    echo "============================================================"
  } | tee -a "$output_file"

  "$AB_CMD" -n "$total" -c "$concurrency" "$@" "$url" 2>&1 | tee -a "$output_file"
  echo "" | tee -a "$output_file"
}

run_ab_post() {
  local output_file="$1"
  local label="$2"
  local total="$3"
  local concurrency="$4"
  local payload="$5"
  local url="$6"
  shift 6

  {
    echo "============================================================"
    echo "$label"
    echo "URL: $url"
    echo "Payload: $payload"
    echo "Tổng request: $total"
    echo "Request đồng thời: $concurrency"
    echo "Thời gian: $(date '+%Y-%m-%d %H:%M:%S')"
    echo "============================================================"
  } | tee -a "$output_file"

  "$AB_CMD" -n "$total" -c "$concurrency" -p "$payload" -T "application/json" "$@" "$url" 2>&1 | tee -a "$output_file"
  echo "" | tee -a "$output_file"
}
