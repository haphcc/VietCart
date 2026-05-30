#!/usr/bin/env bash
set -eu

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=common.sh
. "$SCRIPT_DIR/common.sh"

BASE_URL="${BASE_URL:-http://localhost:3000}"
TIMESTAMP="$(date '+%Y-%m-%d_%H-%M-%S')"
OUTPUT_FILE="$RESULTS_DIR/notifications_$TIMESTAMP.txt"

require_tools
check_server "$BASE_URL"

if [ -z "${JWT_TOKEN:-}" ]; then
  echo "Bỏ qua notification user endpoint vì JWT_TOKEN rỗng."
  echo "Ví dụ: JWT_TOKEN=your_token_here bash test-notifications.sh"
  exit 0
fi

run_ab_get "$OUTPUT_FILE" "Notifications /api/notifications/user/1 - tải nhẹ" 100 10 "$BASE_URL/api/notifications/user/1" -H "Authorization: Bearer $JWT_TOKEN"
run_ab_get "$OUTPUT_FILE" "Notifications /api/notifications/user/1 - tải trung bình" 500 50 "$BASE_URL/api/notifications/user/1" -H "Authorization: Bearer $JWT_TOKEN"
run_ab_get "$OUTPUT_FILE" "Notifications /api/notifications/user/1 - tải nặng" 1000 100 "$BASE_URL/api/notifications/user/1" -H "Authorization: Bearer $JWT_TOKEN"

echo "Đã lưu kết quả: $OUTPUT_FILE"
