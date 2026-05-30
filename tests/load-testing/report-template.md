# Mau tong hop ket qua load testing

| API duoc kiem thu | Tong request | So request dong thoi | Requests per second | Time per request | Failed requests | Nhan xet |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| GET /health | 100 | 10 |  |  |  |  |
| GET /health | 500 | 50 |  |  |  |  |
| GET /health | 1000 | 100 |  |  |  |  |
| GET /api/products | 100 | 10 |  |  |  |  |
| GET /api/products/1 | 100 | 10 |  |  |  |  |
| GET /api/cart/1 | 100 | 10 |  |  |  |  |
| GET /api/orders/user/1 | 100 | 10 |  |  |  |  |
| GET /api/users/1 | 100 | 10 |  |  |  |  |
| GET /api/notifications/user/1 | 100 | 10 |  |  |  |  |

## Ghi chu

- Lay `Requests per second`, `Time per request`, `Failed requests` tu file `.txt` trong thu muc `results`.
- Neu `Failed requests` lon hon 0, can ghi ro endpoint, muc tai va nguyen nhan du doan.
- Nen chup man hinh hoac dinh kem file ket qua khi dua vao bao cao Chuong V.
