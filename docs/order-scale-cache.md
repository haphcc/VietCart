# Hướng Dẫn Scale Order Service Và Redis Cache

Tài liệu này dùng cho phần xử lý quá tải dịch vụ lịch sử/chi tiết đơn hàng trong mùa giảm giá.

## Mục Tiêu

- Chạy nhiều instance của Order Service để tăng khả năng xử lý request.
- Đặt Load Balancer phía trước Order Service để phân phối request.
- Dùng Redis Cache cho các API đọc nhiều:
  - `GET /orders/user/:userId`
  - `GET /orders/:id`
- Khi Redis không chạy, Order Service vẫn fallback về MySQL nên app không bị lỗi.

## Cách 1: Chạy Bằng Docker Compose

Yêu cầu:

- Docker Desktop hoặc Docker Engine.
- MySQL/XAMPP đang chạy trên máy host.
- Database đã được import bằng:

```powershell
npm run db:init
```

Chạy backend, Redis và Load Balancer:

```powershell
docker compose up --build
```

Kiến trúc khi chạy Docker Compose:

- `redis`: Redis cache dùng chung.
- `order-service-1`, `order-service-2`, `order-service-3`: ba instance Order Service.
- `order-lb`: Nginx Load Balancer, listen port `3003`.
- `api-gateway`: gọi Order Service thông qua `http://order-lb:3003`.
- `payment-service`: cũng gọi Order Service thông qua `http://order-lb:3003`.

Frontend không nằm trong `docker-compose.yml`. Chạy frontend bằng npm ở một terminal khác:

```powershell
npm run dev:frontend
```

Endpoint vẫn giữ nguyên:

```text
Frontend -> API Gateway -> order-lb:3003 -> order-service-1/2/3
```

Mở app:

```text
http://localhost:5173
```

API Gateway:

```text
http://localhost:3000
```

Kiểm tra nhanh:

```powershell
Invoke-WebRequest -UseBasicParsing http://127.0.0.1:3000/api/orders/user/1
Invoke-WebRequest -UseBasicParsing http://127.0.0.1:3000/api/orders/1
```

## Cách 2: Không Dùng Docker

Docker Compose không bắt buộc. Redis cache và nhiều instance vẫn có thể chạy thủ công.

### 1. Redis

Cần có Redis server ở một trong các nơi sau:

- Redis cài trực tiếp trên máy.
- Redis trên server khác.
- Redis Cloud/Upstash.

Cấu hình trong `.env` hoặc `.env.example`:

```env
REDIS_URL=redis://localhost:6379
ORDER_CACHE_ENABLED=true
ORDER_CACHE_TTL_SECONDS=60
```

Nếu Redis không chạy, Order Service vẫn đọc MySQL bình thường.

### 2. Nhiều Instance Order Service

Mỗi instance cần chạy ở một port khác nhau, ví dụ:

```powershell
$env:PORT=3003; npm run dev -w vietcart-order-service
$env:PORT=3013; npm run dev -w vietcart-order-service
$env:PORT=3023; npm run dev -w vietcart-order-service
```

Sau đó đặt Nginx/Caddy/HAProxy hoặc một Node.js proxy phía trước để phân phối request tới:

```text
http://localhost:3003
http://localhost:3013
http://localhost:3023
```

API Gateway cần trỏ tới Load Balancer, ví dụ:

```env
ORDER_SERVICE_URL=http://localhost:3003
```

Nếu Load Balancer chạy ở port khác, đổi `ORDER_SERVICE_URL` theo port đó.

## Cấu Hình Cache

Biến môi trường:

```env
REDIS_URL=redis://localhost:6379
ORDER_CACHE_ENABLED=true
ORDER_CACHE_TTL_SECONDS=60
```

Ý nghĩa:

- `REDIS_URL`: địa chỉ Redis.
- `ORDER_CACHE_ENABLED`: đặt `false` nếu muốn tắt cache.
- `ORDER_CACHE_TTL_SECONDS`: thời gian giữ cache, mặc định 60 giây.

Cache sẽ tự bị xóa khi:

- Tạo đơn hàng mới.
- Cập nhật trạng thái đơn hàng.

Các trường hợp này cần xóa cache để lịch sử đơn hàng không bị stale.

## File Liên Quan

- `docker-compose.yml`: Redis, ba instance Order Service, Nginx Load Balancer.
- `backend/order-lb/nginx.conf`: cấu hình Load Balancer.
- `backend/order-service/src/config/redis.js`: cấu hình Redis client.
- `backend/order-service/src/utils/cache.js`: helper đọc/ghi/xóa cache.
- `backend/order-service/src/services/order.service.js`: áp dụng cache cho lịch sử và chi tiết đơn hàng.
