#!/usr/bin/env bash
set -u

BASE_URL="${BASE_URL:-http://localhost:3000}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RESULTS_DIR="$SCRIPT_DIR/results"
PAYLOAD_DIR="$SCRIPT_DIR/payloads"
TIMESTAMP="$(date '+%Y-%m-%d_%H-%M-%S')"
OUTPUT_FILE="$RESULTS_DIR/users_$TIMESTAMP.txt"

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

run_get() {
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

run_post() {
  local label="$1"
  local total="$2"
  local concurrency="$3"
  local payload="$4"
  local url="$5"

  {
    echo "============================================================"
    echo "$label"
    echo "URL: $url"
    echo "Payload: $payload"
    echo "Tong request: $total"
    echo "Request dong thoi: $concurrency"
    echo "Thoi gian: $(date '+%Y-%m-%d %H:%M:%S')"
    echo "============================================================"
  } >> "$OUTPUT_FILE"

  "$AB_CMD" -n "$total" -c "$concurrency" -p "$payload" -T "application/json" "$url" >> "$OUTPUT_FILE" 2>&1
  echo "" >> "$OUTPUT_FILE"
}

run_get "Users /api/users/1 - tai nhe" 100 10 "$BASE_URL/api/users/1"
run_get "Users /api/users/1 - tai trung binh" 500 50 "$BASE_URL/api/users/1"
run_get "Users /api/users/1 - tai nang" 1000 100 "$BASE_URL/api/users/1"

if [ -n "${JWT_TOKEN:-}" ]; then
  "$AB_CMD" -n 100 -c 10 -H "Authorization: Bearer $JWT_TOKEN" "$BASE_URL/api/users/me" >> "$OUTPUT_FILE" 2>&1
else
  echo "Bo qua GET /api/users/me vi JWT_TOKEN rong. Chay: JWT_TOKEN=your_token_here ./test-users.sh"
fi

if [ "${RUN_POST_TESTS:-0}" = "1" ]; then
  run_post "Users POST /api/users/register - tai nhe" 100 10 "$PAYLOAD_DIR/user-register.json" "$BASE_URL/api/users/register"
  run_post "Users POST /api/users/login - tai nhe" 100 10 "$PAYLOAD_DIR/user-login.json" "$BASE_URL/api/users/login"
else
  echo "Bo qua POST users. Dat RUN_POST_TESTS=1 neu muon chay voi payload user-register/user-login."
fi

echo "Da luu ket qua: $OUTPUT_FILE"
