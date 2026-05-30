# Bảng so sánh trước/sau load testing

File kết quả gốc: `before_after_2026-05-30_17-10-32.txt`

| Giải pháp | Trạng thái | API kiểm thử | Tổng request | Request đồng thời | Requests per second | Time per request | Failed requests | Non-2xx responses | Nhận xét |
| --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| Redis cache cho Cart Service | Trước cải tiến | GET /api/cart/1 | 300 | 30 | 689.33 | 43.520 | 182 | 182 | Điền từ file kết quả gốc |
| Redis cache cho Cart Service | Sau cải tiến | GET /api/cart/1 | 300 | 30 | 901.25 | 33.287 | 0 | 300 | So sánh với dòng trước |
| Scale Cart Service qua Load Balancer | Trước cải tiến | GET /api/cart/1 | 300 | 30 | 1110.88 | 27.006 | 0 | 300 | Điền từ file kết quả gốc |
| Scale Cart Service qua Load Balancer | Sau cải tiến | GET /api/cart/1 | 300 | 30 | 819.47 | 36.609 | 0 | 300 | So sánh với dòng trước |
| Đồng bộ tồn kho qua Product Service | Trước cải tiến | GET /api/products/1 | 300 | 30 | 885.90 | 33.864 | 0 | 300 | Điền từ file kết quả gốc |
| Đồng bộ tồn kho qua Product Service | Sau cải tiến | GET /api/products/1 | 300 | 30 | 1092.98 | 27.448 | 0 | 300 | So sánh với dòng trước |

Ghi chú: nếu API Gateway đang bật rate limit 120 request/phút, các mức tải cao có thể phát sinh `Non-2xx responses` do bị giới hạn request.
