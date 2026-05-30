#!/usr/bin/env bash
set -eu

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=common.sh
. "$SCRIPT_DIR/common.sh"

BASE_URL="${BASE_URL:-http://localhost:3000}"
TIMESTAMP="$(date '+%Y-%m-%d_%H-%M-%S')"
OUTPUT_FILE="$RESULTS_DIR/users_$TIMESTAMP.txt"

require_tools
check_server "$BASE_URL"

run_ab_get "$OUTPUT_FILE" "Users /api/users/1 - tải nhẹ" 100 10 "$BASE_URL/api/users/1"
run_ab_get "$OUTPUT_FILE" "Users /api/users/1 - tải trung bình" 500 50 "$BASE_URL/api/users/1"
run_ab_get "$OUTPUT_FILE" "Users /api/users/1 - tải nặng" 1000 100 "$BASE_URL/api/users/1"

if [ -n "${JWT_TOKEN:-}" ]; then
  run_ab_get "$OUTPUT_FILE" "Users /api/users/me - tải nhẹ" 100 10 "$BASE_URL/api/users/me" -H "Authorization: Bearer $JWT_TOKEN"
else
  echo "Bỏ qua GET /api/users/me vì JWT_TOKEN rỗng. Ví dụ: JWT_TOKEN=your_token_here bash test-users.sh"
fi

if [ "${RUN_POST_TESTS:-0}" = "1" ]; then
  run_ab_post "$OUTPUT_FILE" "Users POST /api/users/register - tải nhẹ" 100 10 "$SCRIPT_DIR/payloads/user-register.json" "$BASE_URL/api/users/register"
  run_ab_post "$OUTPUT_FILE" "Users POST /api/users/login - tải nhẹ" 100 10 "$SCRIPT_DIR/payloads/user-login.json" "$BASE_URL/api/users/login"
else
  echo "Bỏ qua POST users. Đặt RUN_POST_TESTS=1 nếu muốn chạy với payload user-register/user-login."
fi

echo "Đã lưu kết quả: $OUTPUT_FILE"
