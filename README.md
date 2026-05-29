# VietCart

VietCart là hệ thống thương mại điện tử trực tuyến dùng kiến trúc Microservices cho báo cáo môn Kiến trúc phần mềm.

## Công nghệ

- Frontend: ReactJS + Vite
- Backend: Node.js + ExpressJS
- Database: MySQL qua XAMPP
- Kiến trúc: Microservices + API Gateway

## Phân công theo câu hỏi

- Câu 1, Câu 2: Chương I & II, mô hình kiến trúc Microservices, sơ đồ, viết đặc tả kiến trúc, thiết lập API Gateway, cấu trúc thư mục, routing và thiết kế CSDL kết nối.
- Câu 3: Chương III, cache/queue, Cart Service và luồng Order Service/đơn hàng do thành viên 2 phụ trách.
- Câu 4: Chương IV, đồng bộ dữ liệu và Product Service do thành viên 3 phụ trách; thành viên 3 có hỗ trợ một phần Cart Service.
- Câu 5: Chương V, kiểm thử load test và tổng hợp kết quả.
- Tổng hợp: User Service/Notification Service, mục lục, phụ lục, tài liệu tham khảo.

## Cấu trúc chính

- `frontend/customer-web`: ứng dụng ReactJS cho khách hàng.
- `backend/api-gateway`: cổng vào duy nhất cho frontend, điều phối request đến các service.
- `backend/*-service`: các microservice độc lập.
- `backend/user-service`: đăng ký, đăng nhập, cấp JWT và trả thông tin người dùng.
- `backend/notification-service`: lưu thông báo, đánh dấu đã đọc và gửi email nếu có SMTP.
- `database`: script tạo database/table cho MySQL.
- `shared`: hằng số và tiện ích dùng chung.
- `docs`: nơi viết nội dung báo cáo và sơ đồ kiến trúc.

## Chạy nhanh

1. Cài Node.js và bật MySQL trong XAMPP.
2. Cài dependency từ thư mục gốc:

```powershell
npm install
```

3. Chạy toàn bộ frontend và backend bằng một lệnh:

```powershell
npm run dev
```

Lệnh `npm run dev` sẽ tự import/cập nhật database từ `database/init.sql` trước khi start services. Nếu muốn import database thủ công:

```powershell
& "C:\xampp\mysql\bin\mysql.exe" --protocol=TCP -h 127.0.0.1 -P 3306 --default-character-set=utf8mb4 -u root -e "SOURCE database/init.sql;"
```

Không cần copy `.env.example` thành `.env` để chạy mặc định. Backend sẽ tự đọc `.env` nếu có, nếu không có thì dùng `.env.example`. Chỉ tạo `.env` khi muốn cấu hình riêng trên máy cá nhân, ví dụ SMTP Gmail.

Mở trình duyệt tại `http://127.0.0.1:5173/` hoặc URL Vite in ra trong terminal. Nhấn `Ctrl + C` để dừng tất cả service.

Nếu lệnh báo port đang được sử dụng, hãy dừng các terminal đang chạy trước đó bằng `Ctrl + C` rồi chạy lại `npm run dev`.

Tài khoản demo sau khi import database:

- Email: `demo@vietcart.local`
- Mật khẩu: `123456`

Nếu muốn test gửi email thật, cấu hình `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` trong `backend/notification-service/.env`. Không commit mật khẩu email vào `.env.example`. Nếu chưa cấu hình SMTP, notification vẫn được lưu và email sẽ có trạng thái `skipped`.

## Lệnh npm chính

- `npm run dev`: chạy toàn bộ frontend và các backend service cùng lúc.
- `npm run dev:frontend`: chạy giao diện React/Vite.
- `npm run build:frontend`: build frontend để kiểm tra lỗi trước khi nộp/chạy production.
- `npm run dev:api-gateway`: chạy API Gateway.
- `npm run dev:notification-service`: chạy Notification Service.
- `npm run dev:user-service`: chạy User Service.
- `npm run dev:<ten-service>`: chạy riêng từng service backend, ví dụ `dev:product-service`.

Nếu muốn chạy trực tiếp trong từng thư mục vẫn được:

```powershell
cd frontend/customer-web
npm install
npm run dev
```
