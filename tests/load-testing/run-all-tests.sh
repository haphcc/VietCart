#!/usr/bin/env bash
set -eu

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "Chay load test voi BASE_URL=${BASE_URL:-http://localhost:3000}"
echo "Ket qua se nam trong: $SCRIPT_DIR/results"
echo ""

bash "$SCRIPT_DIR/test-health.sh"
bash "$SCRIPT_DIR/test-products.sh"
bash "$SCRIPT_DIR/test-cart.sh"
bash "$SCRIPT_DIR/test-orders.sh"
bash "$SCRIPT_DIR/test-users.sh"
bash "$SCRIPT_DIR/test-notifications.sh"

echo ""
echo "Da chay xong cac script load test."
