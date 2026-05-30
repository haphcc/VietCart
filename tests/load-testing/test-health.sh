#!/usr/bin/env bash
set -eu

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=common.sh
. "$SCRIPT_DIR/common.sh"

BASE_URL="${BASE_URL:-http://localhost:3000}"
TIMESTAMP="$(date '+%Y-%m-%d_%H-%M-%S')"
OUTPUT_FILE="$RESULTS_DIR/health_$TIMESTAMP.txt"

require_tools
check_server "$BASE_URL"

run_ab_get "$OUTPUT_FILE" "Health - tải nhẹ" 100 10 "$BASE_URL/health"
run_ab_get "$OUTPUT_FILE" "Health - tải trung bình" 500 50 "$BASE_URL/health"
run_ab_get "$OUTPUT_FILE" "Health - tải nặng" 1000 100 "$BASE_URL/health"

echo "Đã lưu kết quả: $OUTPUT_FILE"
