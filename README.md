# VietCart

VietCart la he thong thuong mai dien tu truc tuyen dung kien truc Microservices cho bao cao mon Kien truc phan mem.

## Cong nghe

- Frontend: ReactJS + Vite
- Backend: Node.js + ExpressJS
- Database: MySQL qua XAMPP
- Kien truc: Microservices + API Gateway

## Phan cong theo cau hoi

- Cau 1, Cau 2: Chuong I & II, mo hinh kien truc Microservices, so do, viet dac ta kien truc, thiet lap API Gateway, cau truc thu muc, routing va thiet ke CSDL ket noi.
- Cau 3: Chuong III, cache/queue va Cart Service.
- Cau 4: Chuong IV, dong bo du lieu va Product Service, Order Service.
- Cau 5: Chuong V, kiem thu load test va tong hop ket qua.
- Tong hop: User Service/Notification Service, muc luc, phu luc, tai lieu tham khao.

## Cau truc chinh

- `frontend/customer-web`: ung dung ReactJS cho khach hang.
- `backend/api-gateway`: cong vao duy nhat cho frontend, dieu phoi request den cac service.
- `backend/*-service`: cac microservice doc lap.
- `database`: script tao database/table cho MySQL.
- `shared`: hang so va tien ich dung chung.
- `docs`: noi viet noi dung bao cao va so do kien truc.

## Chay nhanh

1. Cai Node.js va bat MySQL trong XAMPP.
2. Import `database/ecommerce_db.sql` vao phpMyAdmin hoac MySQL CLI.
3. Copy cac file `.env.example` thanh `.env` trong tung service can chay.
4. Cai dependency tu thu muc goc:

```powershell
cd C:\Users\phuoc\Downloads\VietCart
npm install
```

5. Chay frontend:

```powershell
npm run dev:frontend
```

Mo trinh duyet tai `http://127.0.0.1:5173/` hoac URL Vite in ra trong terminal.

6. Chay cac backend service can dung, moi service nen mo trong mot terminal rieng:

```powershell
npm run dev:api-gateway
npm run dev:product-service
npm run dev:cart-service
npm run dev:order-service
npm run dev:payment-service
npm run dev:notification-service
```

## Lenh npm chinh

- `npm run dev:frontend`: chay giao dien React/Vite.
- `npm run build:frontend`: build frontend de kiem tra loi truoc khi nop/chay production.
- `npm run dev:api-gateway`: chay API Gateway.
- `npm run dev:<ten-service>`: chay tung service backend, vi du `dev:product-service`.

Neu muon chay truc tiep trong tung thu muc van duoc:

```powershell
cd frontend/customer-web
npm install
npm run dev
```
