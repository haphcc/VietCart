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
- `backend/user-service`: dang ky, dang nhap, cap JWT va tra thong tin nguoi dung.
- `backend/notification-service`: luu thong bao, danh dau da doc va gui email neu co SMTP.
- `database`: script tao database/table cho MySQL.
- `shared`: hang so va tien ich dung chung.
- `docs`: noi viet noi dung bao cao va so do kien truc.

## Chay nhanh

1. Cai Node.js va bat MySQL trong XAMPP.
2. Import database mot lan neu chua co du lieu:

```powershell
& "C:\xampp\mysql\bin\mysql.exe" --default-character-set=utf8mb4 -u root -e "SOURCE database/product-service.sql; SOURCE database/cart-service.sql; SOURCE database/order-service.sql; SOURCE database/payment-service.sql; SOURCE database/notification-service.sql; SOURCE database/user-service.sql;"
```

3. Copy cac file `.env.example` thanh `.env` trong tung service can chay neu can doi cau hinh mac dinh.
4. Cai dependency tu thu muc goc:

```powershell
npm install
```

5. Chay toan bo frontend va backend bang mot lenh:

```powershell
npm run dev
```

Mo trinh duyet tai `http://127.0.0.1:5173/` hoac URL Vite in ra trong terminal. Nhan `Ctrl + C` de dung tat ca service.

Neu lenh bao port dang duoc su dung, hay dung cac terminal dang chay truoc do bang `Ctrl + C` roi chay lai `npm run dev`.

Tai khoan demo sau khi import database:

- Email: `demo@vietcart.local`
- Mat khau: `123456`

Neu muon test gui email that, cau hinh `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` trong `backend/notification-service/.env`. Neu chua cau hinh SMTP, notification van duoc luu va email se co trang thai `skipped`.

## Lenh npm chinh

- `npm run dev`: chay toan bo frontend va cac backend service cung luc.
- `npm run dev:frontend`: chay giao dien React/Vite.
- `npm run build:frontend`: build frontend de kiem tra loi truoc khi nop/chay production.
- `npm run dev:api-gateway`: chay API Gateway.
- `npm run dev:notification-service`: chay Notification Service.
- `npm run dev:user-service`: chay User Service.
- `npm run dev:<ten-service>`: chay rieng tung service backend, vi du `dev:product-service`.



Neu muon chay truc tiep trong tung thu muc van duoc:

```powershell
cd frontend/customer-web
npm install
npm run dev
```
