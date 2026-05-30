#!/usr/bin/env bash
set -eu

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=common.sh
. "$SCRIPT_DIR/common.sh"

BASE_URL="${BASE_URL:-http://localhost:3000}"
TIMESTAMP="$(date '+%Y-%m-%d_%H-%M-%S')"
OUTPUT_FILE="$RESULTS_DIR/cart_$TIMESTAMP.txt"

require_tools
check_server "$BASE_URL"

run_ab_get "$OUTPUT_FILE" "Cart /api/cart/1 - tải nhẹ" 100 10 "$BASE_URL/api/cart/1"
run_ab_get "$OUTPUT_FILE" "Cart /api/cart/1 - tải trung bình" 500 50 "$BASE_URL/api/cart/1"
run_ab_get "$OUTPUT_FILE" "Cart /api/cart/1 - tải nặng" 1000 100 "$BASE_URL/api/cart/1"

if [ "${RUN_POST_TESTS:-0}" = "1" ]; then
  run_ab_post "$OUTPUT_FILE" "Cart POST /api/cart/items - tải nhẹ" 100 10 "$SCRIPT_DIR/payloads/cart-item.json" "$BASE_URL/api/cart/items"
  run_ab_post "$OUTPUT_FILE" "Cart POST /api/cart/items - tải trung bình" 500 50 "$SCRIPT_DIR/payloads/cart-item.json" "$BASE_URL/api/cart/items"
  run_ab_post "$OUTPUT_FILE" "Cart POST /api/cart/items - tải nặng" 1000 100 "$SCRIPT_DIR/payloads/cart-item.json" "$BASE_URL/api/cart/items"
else
  echo "Bỏ qua POST /api/cart/items. Đặt RUN_POST_TESTS=1 nếu muốn chạy với payloads/cart-item.json."
fi

echo "Đã lưu kết quả: $OUTPUT_FILE"
