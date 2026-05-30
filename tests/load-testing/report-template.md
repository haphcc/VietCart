# Mẫu tổng hợp kết quả load testing

| API được kiểm thử | Tổng request | Số request đồng thời | Requests per second | Time per request | Failed requests | Non-2xx responses | Nhận xét |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| GET /health | 100 | 10 |  |  |  |  |  |
| GET /health | 500 | 50 |  |  |  |  |  |
| GET /health | 1000 | 100 |  |  |  |  |  |
| GET /api/products | 100 | 10 |  |  |  |  |  |
| GET /api/products/1 | 100 | 10 |  |  |  |  |  |
| GET /api/cart/1 | 100 | 10 |  |  |  |  |  |
| GET /api/orders/user/1 | 100 | 10 |  |  |  |  |  |
| GET /api/users/1 | 100 | 10 |  |  |  |  |  |
| GET /api/notifications/user/1 | 100 | 10 |  |  |  |  |  |

## Ghi chú

- Lấy `Requests per second`, `Time per request`, `Failed requests`, `Non-2xx responses` từ file `.txt` trong thư mục `results`.
- Nếu `Failed requests` hoặc `Non-2xx responses` lớn hơn 0, cần ghi rõ endpoint, mức tải và nguyên nhân dự đoán.
- Nếu cần chứng minh trước/sau cải tiến, dùng thêm `run-before-after-tests.sh` và bảng `evidence/before-after-template.md`.
