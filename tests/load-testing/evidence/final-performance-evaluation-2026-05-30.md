# Báo cáo đánh giá hiệu năng cuối cùng - 30/05/2026

Môi trường kiểm thử:

- Baseline: chạy local bằng `npm run dev`, một Cart Service, `CART_CACHE_ENABLED=false`.
- Optimized: chạy bằng `docker compose up -d --build`, gồm Redis, Nginx `cart-lb`, 3 Cart Service instances.
- Công cụ đo: ApacheBench `C:\xampp\apache\bin\ab.exe`.
- Thời gian chạy: 30/05/2026, múi giờ Asia/Saigon.

## Kết quả API Gateway mức tải thấp

Bài test này dùng 15 request và 5 request đồng thời cho mỗi endpoint để tránh rate limit 120 request/phút của API Gateway.

| API | Tổng request | Request đồng thời | RPS | Time/request ms | Failed | Non-2xx | Transfer KB/s |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `GET /health` | 15 | 5 | 622.41 | 8.033 | 0 | 0 | 616.94 |
| `GET /api/products` | 15 | 5 | 212.48 | 23.532 | 0 | 0 | 1312.04 |
| `GET /api/products/1` | 15 | 5 | 122.32 | 40.877 | 0 | 0 | 151.34 |
| `GET /api/cart/1` | 15 | 5 | 247.24 | 20.224 | 0 | 0 | 340.43 |
| `GET /api/orders/user/1` | 15 | 5 | 182.35 | 27.420 | 0 | 0 | 243.25 |
| `GET /api/users/me` | 15 | 5 | 233.52 | 21.412 | 0 | 0 | 278.21 |
| `GET /api/notifications/user/1` | 15 | 5 | 155.08 | 32.241 | 0 | 0 | 231.41 |

Nhận xét: API Gateway xử lý được các endpoint được chọn ở mức tải thấp, không có request lỗi và không có response ngoài nhóm 2xx.

## So sánh trước/sau - 300 request, 30 request đồng thời

| Chương | Giải pháp | Trạng thái | Endpoint | RPS | Time/request ms | Failed | Non-2xx | Transfer KB/s |
| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: |
| III | Redis cache cho Cart Service | Trước: một Cart Service, tắt cache | `GET :3002/cart/1` | 1082.91 | 27.703 | 0 | 0 | 665.18 |
| III | Redis cache cho Cart Service | Sau: Redis + cart-lb, đã warm cache | `GET :3002/cart/1` | 994.44 | 30.168 | 0 | 0 | 632.21 |
| III | Scale Cart Service qua Load Balancer | Trước: một Cart Service | `GET :3002/cart/1` | 1317.59 | 22.769 | 0 | 0 | 809.34 |
| III | Scale Cart Service qua Load Balancer | Sau: 3 Cart instances + Nginx | `GET :3002/cart/1` | 1204.52 | 24.906 | 0 | 0 | 765.77 |
| IV | Đồng bộ tồn kho trong Product Service | Baseline/đối chứng đọc sản phẩm | `GET :3001/products/1` | 750.64 | 39.966 | 0 | 0 | 372.39 |
| IV | Đồng bộ tồn kho trong Product Service | Product Service hiện tại | `GET :3001/products/1` | 650.98 | 46.085 | 0 | 0 | 322.95 |

Chênh lệch quan sát được:

- Redis/cache: RPS giảm từ 1082.91 xuống 994.44, giảm khoảng 8.17%; time/request tăng khoảng 8.90%.
- Scale Cart: RPS giảm từ 1317.59 xuống 1204.52, giảm khoảng 8.58%; time/request tăng khoảng 9.39%.
- Product stock read: RPS giảm từ 750.64 xuống 650.98, giảm khoảng 13.28%; time/request tăng khoảng 15.31%.

## So sánh trước/sau - 1000 request, 100 request đồng thời

| Chương | Nhóm giải pháp | Trạng thái | Endpoint | RPS | Time/request ms | Failed | Non-2xx | Transfer KB/s |
| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: |
| III | Cart cache/scale | Trước: một Cart Service, tắt cache | `GET :3002/cart/1` | 1374.22 | 72.769 | 0 | 0 | 844.12 |
| III | Cart cache/scale | Sau: Redis + 3 Cart instances + Nginx | `GET :3002/cart/1` | 1158.07 | 86.350 | 0 | 0 | 736.23 |
| IV | Đồng bộ tồn kho Product | Baseline/đối chứng đọc sản phẩm | `GET :3001/products/1` | 981.42 | 101.893 | 0 | 0 | 486.88 |
| IV | Đồng bộ tồn kho Product | Product Service hiện tại | `GET :3001/products/1` | 735.23 | 136.011 | 0 | 0 | 364.75 |

Chênh lệch quan sát được:

- Cart high-load direct test: đường optimized Docker/Nginx/Redis có RPS thấp hơn baseline local single-service khoảng 15.73%.
- Product high-load direct test: Product Service hiện tại trong Docker có RPS thấp hơn Product Service local baseline khoảng 25.09%.
- Tất cả direct service tests đều có 0 failed requests và 0 non-2xx responses.

## Đánh giá cuối cùng

Khi đưa vào báo cáo, nên viết kết luận như sau:

> Nhóm đã hoàn thành bằng chứng load testing cho các giải pháp đề xuất. Trong môi trường local, kiến trúc optimized chạy ổn định và không phát sinh lỗi ở direct service tests, nhưng chưa cho thấy cải thiện throughput so với baseline single-service. Vì vậy, kết quả nên được trình bày như bằng chứng xác nhận tính ổn định và khả năng triển khai kiến trúc, không nên khẳng định đã cải thiện hiệu năng tuyệt đối.


