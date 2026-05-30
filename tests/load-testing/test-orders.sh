#!/usr/bin/env bash
set -eu

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=common.sh
. "$SCRIPT_DIR/common.sh"

BASE_URL="${BASE_URL:-http://localhost:3000}"
TIMESTAMP="$(date '+%Y-%m-%d_%H-%M-%S')"
OUTPUT_FILE="$RESULTS_DIR/orders_$TIMESTAMP.txt"

require_tools
check_server "$BASE_URL"

run_ab_get "$OUTPUT_FILE" "Orders /api/orders/user/1 - tải nhẹ" 100 10 "$BASE_URL/api/orders/user/1"
run_ab_get "$OUTPUT_FILE" "Orders /api/orders/user/1 - tải trung bình" 500 50 "$BASE_URL/api/orders/user/1"
run_ab_get "$OUTPUT_FILE" "Orders /api/orders/user/1 - tải nặng" 1000 100 "$BASE_URL/api/orders/user/1"

if [ "${RUN_POST_TESTS:-0}" = "1" ]; then
  run_ab_post "$OUTPUT_FILE" "Orders POST /api/orders - tải nhẹ" 100 10 "$SCRIPT_DIR/payloads/order.json" "$BASE_URL/api/orders"
  run_ab_post "$OUTPUT_FILE" "Orders POST /api/orders - tải trung bình" 500 50 "$SCRIPT_DIR/payloads/order.json" "$BASE_URL/api/orders"
  run_ab_post "$OUTPUT_FILE" "Orders POST /api/orders - tải nặng" 1000 100 "$SCRIPT_DIR/payloads/order.json" "$BASE_URL/api/orders"
else
  echo "Bỏ qua POST /api/orders. Đặt RUN_POST_TESTS=1 nếu muốn chạy với payloads/order.json."
fi

echo "Đã lưu kết quả: $OUTPUT_FILE"
