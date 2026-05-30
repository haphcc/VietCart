#!/usr/bin/env bash
set -u

BASE_URL="${BASE_URL:-http://localhost:3000}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RESULTS_DIR="$SCRIPT_DIR/results"
TIMESTAMP="$(date '+%Y-%m-%d_%H-%M-%S')"
OUTPUT_FILE="$RESULTS_DIR/products_$TIMESTAMP.txt"

mkdir -p "$RESULTS_DIR"

AB_CMD="ab"
if ! command -v "$AB_CMD" >/dev/null 2>&1; then
  if [ -x "/c/xampp/apache/bin/ab.exe" ]; then
    AB_CMD="/c/xampp/apache/bin/ab.exe"
  elif [ -x "/mnt/c/xampp/apache/bin/ab.exe" ]; then
    AB_CMD="/mnt/c/xampp/apache/bin/ab.exe"
  else
    echo "Apache Benchmark chưa được cài. Vui lòng cài Apache HTTP Server hoặc dùng XAMPP/Git Bash/WSL."
    exit 1
  fi
fi

if ! command -v curl >/dev/null 2>&1; then
  echo "curl chưa được cài. Vui lòng cài curl hoặc chạy bằng Git Bash/WSL."
  exit 1
fi

if ! curl -fsS "$BASE_URL/health" >/dev/null 2>&1; then
  echo "API Gateway chưa chạy. Hãy start project trước khi chạy load test."
  exit 1
fi

run_ab() {
  local label="$1"
  local total="$2"
  local concurrency="$3"
  local url="$4"

  {
    echo "============================================================"
    echo "$label"
    echo "URL: $url"
    echo "Tong request: $total"
    echo "Request dong thoi: $concurrency"
    echo "Thoi gian: $(date '+%Y-%m-%d %H:%M:%S')"
    echo "============================================================"
  } >> "$OUTPUT_FILE"

  "$AB_CMD" -n "$total" -c "$concurrency" "$url" >> "$OUTPUT_FILE" 2>&1
  echo "" >> "$OUTPUT_FILE"
}

for endpoint in "/api/products" "/api/products/1"; do
  run_ab "Products $endpoint - tai nhe" 100 10 "$BASE_URL$endpoint"
  run_ab "Products $endpoint - tai trung binh" 500 50 "$BASE_URL$endpoint"
  run_ab "Products $endpoint - tai nang" 1000 100 "$BASE_URL$endpoint"
done

echo "Da luu ket qua: $OUTPUT_FILE"
