#!/usr/bin/env bash
set -eu

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=common.sh
. "$SCRIPT_DIR/common.sh"

BASE_URL="${BASE_URL:-http://localhost:3000}"
TIMESTAMP="$(date '+%Y-%m-%d_%H-%M-%S')"
OUTPUT_FILE="$RESULTS_DIR/products_$TIMESTAMP.txt"

require_tools
check_server "$BASE_URL"

for endpoint in "/api/products" "/api/products/1"; do
  run_ab_get "$OUTPUT_FILE" "Products $endpoint - tải nhẹ" 100 10 "$BASE_URL$endpoint"
  run_ab_get "$OUTPUT_FILE" "Products $endpoint - tải trung bình" 500 50 "$BASE_URL$endpoint"
  run_ab_get "$OUTPUT_FILE" "Products $endpoint - tải nặng" 1000 100 "$BASE_URL$endpoint"
done

echo "Đã lưu kết quả: $OUTPUT_FILE"
