#!/usr/bin/env bash
set -eu

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=common.sh
. "$SCRIPT_DIR/common.sh"

require_tools

BASELINE_URL="${BASELINE_URL:-http://localhost:3000}"
OPTIMIZED_URL="${OPTIMIZED_URL:-http://localhost:3000}"
TIMESTAMP="$(date '+%Y-%m-%d_%H-%M-%S')"
OUTPUT_FILE="$RESULTS_DIR/before_after_$TIMESTAMP.txt"
SUMMARY_FILE="$RESULTS_DIR/before_after_summary_$TIMESTAMP.md"

check_server "$BASELINE_URL"
check_server "$OPTIMIZED_URL"

echo "Bắt đầu chạy kịch bản so sánh trước/sau." | tee "$OUTPUT_FILE"
echo "BASELINE_URL=$BASELINE_URL" | tee -a "$OUTPUT_FILE"
echo "OPTIMIZED_URL=$OPTIMIZED_URL" | tee -a "$OUTPUT_FILE"
echo "" | tee -a "$OUTPUT_FILE"

LEVEL_TOTAL="${LEVEL_TOTAL:-300}"
LEVEL_CONCURRENCY="${LEVEL_CONCURRENCY:-30}"

run_pair_get() {
  local group="$1"
  local endpoint="$2"
  local note="$3"

  run_ab_get "$OUTPUT_FILE" "$group - TRƯỚC cải tiến - $note" "$LEVEL_TOTAL" "$LEVEL_CONCURRENCY" "$BASELINE_URL$endpoint"
  run_ab_get "$OUTPUT_FILE" "$group - SAU cải tiến - $note" "$LEVEL_TOTAL" "$LEVEL_CONCURRENCY" "$OPTIMIZED_URL$endpoint"
}

run_pair_get "Giải pháp 1: Redis cache cho Cart Service" "/api/cart/1" "đọc giỏ hàng"
run_pair_get "Giải pháp 2: Scale Cart Service qua Load Balancer" "/api/cart/1" "đọc giỏ hàng khi nhiều request đồng thời"
run_pair_get "Giải pháp 3: Đồng bộ tồn kho qua Product Service" "/api/products/1" "đọc sản phẩm để theo dõi API tồn kho"

if [ "${RUN_WRITE_TESTS:-0}" = "1" ]; then
  echo "RUN_WRITE_TESTS=1 nên chạy thêm POST reserve-stock. Hãy chắc chắn product_id còn đủ tồn kho." | tee -a "$OUTPUT_FILE"
  run_ab_post "$OUTPUT_FILE" "Giải pháp 3: Đồng bộ tồn kho - TRƯỚC cải tiến - reserve stock" 50 10 "$SCRIPT_DIR/payloads/reserve-stock.json" "$BASELINE_URL/api/products/reserve-stock"
  run_ab_post "$OUTPUT_FILE" "Giải pháp 3: Đồng bộ tồn kho - SAU cải tiến - reserve stock" 50 10 "$SCRIPT_DIR/payloads/reserve-stock.json" "$OPTIMIZED_URL/api/products/reserve-stock"
else
  echo "Bỏ qua POST /api/products/reserve-stock để tránh làm thay đổi tồn kho. Đặt RUN_WRITE_TESTS=1 nếu cần test ghi." | tee -a "$OUTPUT_FILE"
fi

{
  echo "# Bảng so sánh trước/sau load testing"
  echo ""
  echo "File kết quả gốc: \`$(basename "$OUTPUT_FILE")\`"
  echo ""
  echo "| Giải pháp | Trạng thái | API kiểm thử | Tổng request | Request đồng thời | Requests per second | Time per request | Failed requests | Non-2xx responses | Nhận xét |"
  echo "| --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |"
  echo "| Redis cache cho Cart Service | Trước cải tiến | GET /api/cart/1 | $LEVEL_TOTAL | $LEVEL_CONCURRENCY |  |  |  |  | Điền từ file kết quả gốc |"
  echo "| Redis cache cho Cart Service | Sau cải tiến | GET /api/cart/1 | $LEVEL_TOTAL | $LEVEL_CONCURRENCY |  |  |  |  | So sánh với dòng trước |"
  echo "| Scale Cart Service qua Load Balancer | Trước cải tiến | GET /api/cart/1 | $LEVEL_TOTAL | $LEVEL_CONCURRENCY |  |  |  |  | Chạy với mô hình thường |"
  echo "| Scale Cart Service qua Load Balancer | Sau cải tiến | GET /api/cart/1 | $LEVEL_TOTAL | $LEVEL_CONCURRENCY |  |  |  |  | Chạy với \`npm run dev:scale\` hoặc Docker Compose |"
  echo "| Đồng bộ tồn kho qua Product Service | Trước cải tiến | GET /api/products/1 | $LEVEL_TOTAL | $LEVEL_CONCURRENCY |  |  |  |  | Theo dõi API liên quan tồn kho |"
  echo "| Đồng bộ tồn kho qua Product Service | Sau cải tiến | GET /api/products/1 | $LEVEL_TOTAL | $LEVEL_CONCURRENCY |  |  |  |  | Nếu bật RUN_WRITE_TESTS=1 thì bổ sung POST reserve-stock |"
  echo ""
  echo "Ghi chú: nếu API Gateway đang bật rate limit 120 request/phút, các mức tải cao có thể phát sinh \`Non-2xx responses\` do bị giới hạn request."
} > "$SUMMARY_FILE"

echo "Đã lưu kết quả gốc: $OUTPUT_FILE"
echo "Đã tạo bảng điền kết quả: $SUMMARY_FILE"
