# Huong Dan Scale Cart Service Va Redis Cache

Tai lieu nay dung cho Chuong III: xu ly qua tai Cart Service khi nhieu nguoi dung them, sua, xem gio hang cung luc.

## Muc Tieu

- Chay nhieu instance cua Cart Service de tang kha nang xu ly request.
- Dat Load Balancer phia truoc Cart Service de phan phoi request.
- Dung Redis Cache cho API doc gio hang: `GET /api/cart/:userId`.
- Khi Redis khong chay, Cart Service van doc MySQL nen he thong khong bi dung.
- Khi gio hang thay doi, cache cua user do se bi xoa de lan doc tiep theo lay du lieu moi tu MySQL.

## Cach Chay Bang Docker Compose

Yeu cau:

- Docker Desktop hoac Docker Engine.
- MySQL/XAMPP dang chay tren may host.
- Da import database mau:

```powershell
npm run db:init
```

Chay backend, Redis va Load Balancer:

```powershell
docker compose up --build
```

Neu muon tu dong chay backend Docker va frontend local bang mot lenh:

```powershell
npm run dev:scale
```

Kien truc Cart Service trong Docker Compose:

- `redis`: Redis cache dung chung cho cac Cart Service instance.
- `cart-service-1`, `cart-service-2`, `cart-service-3`: ba instance Cart Service.
- `cart-lb`: Nginx Load Balancer, listen port `3002`.
- `api-gateway`: goi Cart Service qua `http://cart-lb:3002`.
- `order-service`: khi tao don hang, service nay clear gio hang qua `http://cart-lb:3002`.

Luong request:

```text
Frontend / Load test -> API Gateway :3000 -> cart-lb :3002 -> cart-service-1/2/3 -> MySQL
                                                          \-> Redis cache
```

## Cach Chay Khong Dung Docker

Neu khong dung Docker, co the chay Redis va nhieu Cart Service thu cong.

Redis:

```env
REDIS_URL=redis://localhost:6379
CART_CACHE_ENABLED=true
CART_CACHE_TTL_SECONDS=60
```

Ba instance Cart Service tren ba port khac nhau:

```powershell
$env:PORT=3002; npm run dev -w vietcart-cart-service
$env:PORT=3012; npm run dev -w vietcart-cart-service
$env:PORT=3022; npm run dev -w vietcart-cart-service
```

Sau do dat Nginx, Caddy, HAProxy hoac mot proxy Node.js phia truoc cac URL:

```text
http://localhost:3002
http://localhost:3012
http://localhost:3022
```

API Gateway can tro `CART_SERVICE_URL` toi Load Balancer.

## Redis Cache Cho Cart Service

Bien moi truong:

```env
REDIS_URL=redis://localhost:6379
CART_CACHE_ENABLED=true
CART_CACHE_TTL_SECONDS=60
```

Du lieu cache:

- Key: `cart:user:<userId>`
- Value: danh sach item trong gio hang cua user.
- TTL mac dinh: 60 giay.

Cache duoc doc khi:

- Goi `GET /api/cart/:userId`.

Cache bi xoa khi:

- Them san pham vao gio hang: `POST /api/cart/items`.
- Cap nhat so luong: `PATCH /api/cart/items`.
- Xoa mot item: `DELETE /api/cart/items/:itemId`.
- Xoa toan bo gio hang cua user: `DELETE /api/cart/user/:userId`.

## Endpoint Cho Load Testing

Tat ca lenh ben duoi test qua API Gateway de dung dung luong that:

```text
Apache Benchmark -> API Gateway -> Cart Load Balancer -> Cart Service instances
```

Kiem tra Load Balancer truc tiep:

```powershell
ab -n 300 -c 30 http://127.0.0.1:3002/health
```

Kiem tra doc gio hang qua API Gateway:

```powershell
ab -n 300 -c 30 http://127.0.0.1:3000/api/cart/1
```

Test doc gio hang, phu hop de so sanh truoc/sau Redis cache:

```powershell
ab -n 1000 -c 50 http://127.0.0.1:3000/api/cart/1
```

Test ghi gio hang bang AB can tao file JSON payload, vi AB doc body tu file:

```json
{"user_id":1,"product_id":1,"quantity":1}
```

Vi du lenh:

```powershell
ab -n 300 -c 30 -p cart-add.json -T application/json http://127.0.0.1:3000/api/cart/items
```

Sau khi test ghi, co the test lai doc gio hang:

```powershell
ab -n 1000 -c 50 http://127.0.0.1:3000/api/cart/1
```

## File Lien Quan

- `docker-compose.yml`: Redis, ba Cart Service instance, Nginx Load Balancer.
- `backend/cart-lb/nginx.conf`: cau hinh Load Balancer.
- `backend/cart-service/src/config/redis.js`: cau hinh Redis client.
- `backend/cart-service/src/utils/cache.js`: helper doc, ghi va xoa cache.
- `backend/cart-service/src/services/cart.service.js`: ap dung cache cho Cart Service.
