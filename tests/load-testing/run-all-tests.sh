#!/usr/bin/env bash
set -eu

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "Chạy load test với BASE_URL=${BASE_URL:-http://localhost:3000}"
echo "Kết quả sẽ nằm trong: $SCRIPT_DIR/results"
echo ""

bash "$SCRIPT_DIR/test-health.sh"
bash "$SCRIPT_DIR/test-products.sh"
bash "$SCRIPT_DIR/test-cart.sh"
bash "$SCRIPT_DIR/test-orders.sh"
bash "$SCRIPT_DIR/test-users.sh"
bash "$SCRIPT_DIR/test-notifications.sh"

echo ""
echo "Đã chạy xong các script load test."
