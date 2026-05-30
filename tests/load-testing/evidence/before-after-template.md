# Bảng bằng chứng trước/sau cải tiến

| Giải pháp | Trạng thái | API kiểm thử | Tổng request | Request đồng thời | Requests per second | Time per request | Failed requests | Non-2xx responses | Nhận xét |
| --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| Redis cache cho Cart Service | Trước cải tiến | GET /api/cart/1 | 300 | 30 |  |  |  |  |  |
| Redis cache cho Cart Service | Sau cải tiến | GET /api/cart/1 | 300 | 30 |  |  |  |  |  |
| Scale Cart Service qua Load Balancer | Trước cải tiến | GET /api/cart/1 | 300 | 30 |  |  |  |  |  |
| Scale Cart Service qua Load Balancer | Sau cải tiến | GET /api/cart/1 | 300 | 30 |  |  |  |  |  |
| Đồng bộ tồn kho qua Product Service | Trước cải tiến | GET /api/products/1 | 300 | 30 |  |  |  |  |  |
| Đồng bộ tồn kho qua Product Service | Sau cải tiến | GET /api/products/1 | 300 | 30 |  |  |  |  |  |

## Cách lấy số liệu

Mở file `.txt` sinh ra trong `results/`, tìm các dòng:

- `Requests per second`
- `Time per request`
- `Failed requests`
- `Non-2xx responses`

Sau đó điền vào bảng trên để đưa vào Chương V.
