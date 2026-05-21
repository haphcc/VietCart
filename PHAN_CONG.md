# PHÂN CÔNG CÔNG VIỆC DỰ ÁN VIETCART

Dự án: VietCart - Hệ thống thương mại điện tử trực tuyến sử dụng kiến trúc Microservices  
Công nghệ: ReactJS + Vite, Node.js + ExpressJS, MySQL qua XAMPP  
Kiến trúc: Microservices + API Gateway

## 1. Bảng phân công tổng quan

| Thành viên | Câu hỏi đảm nhận | Chương đảm nhận | Nhiệm vụ lý thuyết | Nhiệm vụ thực hành | Deadline |
| --- | --- | --- | --- | --- | --- |
| Thành viên 1 | Câu 1, Câu 2 | Chương I & II | Xây dựng lý thuyết về mô hình kiến trúc Microservices, vẽ sơ đồ, viết đặc tả kiến trúc | Thiết lập API Gateway, cấu trúc thư mục dự án, quản lý luồng định tuyến, thiết kế CSDL để kết nối | Code: 22/5, Báo cáo: 27/5 |
| Thành viên 2 | Câu 3 | Chương III | Phân tích vấn đề quá tải và giải pháp cache/queue, đề xuất 2 giải pháp | Lập trình Cart Service, xử lý cache hoặc queue giảm tải cho giỏ hàng | Code: 24/5, Báo cáo: 28/5 |
| Thành viên 3 | Câu 4 | Chương IV | Phân tích bài toán đồng bộ dữ liệu, nguyên nhân Saga/Distributed Lock, đề xuất 1 phương án đảm bảo đồng bộ | Lập trình Product Service và Order Service, xử lý logic đồng bộ tồn kho | Code: 25/5, Báo cáo: 28/5 |
| Thành viên 4 | Câu 5 | Chương V | Tổng hợp kết quả thử nghiệm và viết khuyến nghị thực tế | Xây dựng kịch bản test/load testing bằng Apache Benchmark, dùng công cụ đo hiệu năng | Code: 26/5, Báo cáo: 28/5 |
| Thành viên 5 | Tổng hợp | Mục lục & Phụ lục | Biên tập, định dạng Word, viết lời cảm ơn/cảm ơn, quản lý tài liệu tham khảo | Lập trình User Service hoặc Notification Service, tích hợp gửi email/thông báo | Báo cáo: 29/5 |

## 2. Chi tiết folder và file phụ trách

### Thành viên 1 - Câu 1, Câu 2

Phạm vi chính:

- `docs/diagrams/microservices.mmd`: vẽ sơ đồ kiến trúc Microservices.
- `docs/diagrams/database-er.mmd`: vẽ sơ đồ ERD/CSDL.
- `directory.md` hoặc `docs/directory.md`: cây thư mục minh họa cho báo cáo.
- `backend/api-gateway/`: xây dựng API Gateway.
- `backend/api-gateway/src/server.js`: cấu hình Express, CORS, logging, health check, mount routes.
- `backend/api-gateway/src/config/services.js`: khai báo địa chỉ các service.
- `backend/api-gateway/src/routes/*.routes.js`: định tuyến request từ Gateway đến từng service.
- `backend/api-gateway/src/middlewares/*.js`: xử lý lỗi và rate limit.
- `database/ecommerce_db.sql`: script CSDL tổng.
- `database/*-service.sql`: script CSDL riêng cho từng service.
- `frontend/customer-web/src/main.jsx`: điểm khởi chạy React.
- `frontend/customer-web/src/App.jsx`: khai báo routing tổng thể của frontend.
- `frontend/customer-web/src/api/axiosClient.js`: cấu hình base URL gọi API Gateway.
- `frontend/customer-web/src/layouts/MainLayout.jsx`: layout chính cho các trang.
- `frontend/customer-web/src/components/Header.jsx`: thanh điều hướng chính.
- `frontend/customer-web/src/components/Footer.jsx`: footer chung.
- `frontend/customer-web/src/pages/HomePage.jsx`: trang chủ giới thiệu hệ thống.

Lưu ý:

- API Gateway chỉ đóng vai trò cổng vào và điều phối request, không xử lý nghiệp vụ chi tiết.
- Trong báo cáo cần nhấn mạnh mô hình database-per-service.
- Các service giao tiếp với nhau qua API, không truy cập trực tiếp database của nhau.
- Cần chụp sơ đồ `microservices.mmd`, `database-er.mmd` và cây thư mục để đưa vào Chương I & II.

### Thành viên 2 - Câu 3

Phạm vi chính:

- `backend/cart-service/`: xây dựng Cart Service.
- `backend/cart-service/src/server.js`: khởi tạo service giỏ hàng.
- `backend/cart-service/src/config/database.js`: kết nối MySQL.
- `backend/cart-service/src/config/redis.js`: cấu hình Redis/cache nếu sử dụng.
- `backend/cart-service/src/routes/cart.routes.js`: định nghĩa API giỏ hàng.
- `backend/cart-service/src/controllers/cart.controller.js`: nhận request, trả response.
- `backend/cart-service/src/services/cart.service.js`: xử lý logic thêm/xóa/xem giỏ hàng.
- `database/cart-service.sql`: bảng dữ liệu giỏ hàng.
- `frontend/customer-web/src/api/cartApi.js`: API client gọi Cart Service qua Gateway.
- `frontend/customer-web/src/pages/CartPage.jsx`: giao diện giỏ hàng.
- `frontend/customer-web/src/components/CartItem.jsx`: component item trong giỏ hàng.

Lưu ý:

- Cần giải thích vấn đề quá tải khi nhiều người dùng thêm sản phẩm vào giỏ cùng lúc.
- Nếu dùng cache, nêu rõ dữ liệu nào cache và thời điểm đồng bộ lại MySQL.
- Nếu dùng queue, mô tả luồng request vào hàng đợi và worker xử lý sau.

### Thành viên 3 - Câu 4

Phạm vi chính:

- `backend/product-service/`: xây dựng Product Service.
- `backend/product-service/src/config/database.js`: kết nối CSDL sản phẩm.
- `backend/product-service/src/routes/product.routes.js`: API sản phẩm.
- `backend/product-service/src/controllers/product.controller.js`: xử lý request sản phẩm.
- `backend/product-service/src/services/product.service.js`: logic truy vấn sản phẩm, tồn kho.
- `backend/order-service/`: xây dựng Order Service.
- `backend/order-service/src/routes/order.routes.js`: API đơn hàng.
- `backend/order-service/src/controllers/order.controller.js`: xử lý request đơn hàng.
- `backend/order-service/src/services/order.service.js`: logic tạo đơn hàng, tính tổng tiền.
- `backend/order-service/src/clients/*.client.js`: gọi Product, Cart, Notification Service.
- `database/product-service.sql`: bảng sản phẩm.
- `database/order-service.sql`: bảng đơn hàng và chi tiết đơn hàng.
- `frontend/customer-web/src/api/productApi.js`: API client sản phẩm.
- `frontend/customer-web/src/api/orderApi.js`: API client đơn hàng.
- `frontend/customer-web/src/api/paymentApi.js`: API client thanh toán.
- `frontend/customer-web/src/pages/ProductListPage.jsx`, `ProductDetailPage.jsx`, `OrderHistoryPage.jsx`: giao diện liên quan.
- `frontend/customer-web/src/pages/CheckoutPage.jsx`: giao diện xác nhận đặt hàng/thanh toán.

Lưu ý:

- Cần phân tích rủi ro lệch tồn kho khi nhiều đơn hàng được tạo cùng lúc.
- Đề xuất rõ giải pháp đồng bộ: Saga, Distributed Lock hoặc transaction theo phạm vi phù hợp.
- Không tạo foreign key trực tiếp giữa database của các service khác nhau.

### Thành viên 4 - Câu 5

Phạm vi chính:

- `backend/*-service/`: dùng các endpoint hiện có để test hiệu năng.
- `backend/api-gateway/`: test tải qua Gateway.
- `docs/chapters/chapter-05.md`: viết kết quả thử nghiệm và khuyến nghị nếu bổ sung file chương.
- `tests/` hoặc `load-tests/`: có thể tạo thêm folder chứa kịch bản test.
- `README.md`: bổ sung hướng dẫn chạy test nếu cần.

Lưu ý:

- Nên test tối thiểu các endpoint: `/health`, `/api/products`, `/api/cart`, `/api/orders`.
- Ghi lại số lượng request, concurrency, thời gian phản hồi trung bình, request lỗi.
- Nếu dùng Apache Benchmark, lưu lệnh test và kết quả để đưa vào phụ lục.

Ví dụ lệnh:

```bash
ab -n 1000 -c 50 http://localhost:3000/api/products/
```

### Thành viên 5 - Tổng hợp

Phạm vi chính:

- `backend/notification-service/`: xây dựng Notification Service.
- `backend/notification-service/src/routes/notification.routes.js`: API thông báo.
- `backend/notification-service/src/controllers/notification.controller.js`: xử lý request thông báo.
- `backend/notification-service/src/services/notification.service.js`: lưu thông báo.
- `backend/notification-service/src/services/email.service.js`: tích hợp gửi email.
- `database/notification-service.sql`: bảng thông báo.
- `frontend/customer-web/src/api/notificationApi.js`: API client thông báo.
- `frontend/customer-web/src/pages/NotificationPage.jsx`: giao diện thông báo.
- `frontend/customer-web/src/components/NotificationItem.jsx`: component thông báo.
- `docs/`: tổng hợp nội dung báo cáo.
- `README.md`: cập nhật hướng dẫn chạy dự án.

Lưu ý:

- Định dạng Word thống nhất font, heading, đánh số hình/bảng.
- Kiểm tra lại mục lục, phụ lục, tài liệu tham khảo.
- Tổng hợp hình ảnh: sơ đồ kiến trúc, ERD, cây thư mục, ảnh test hiệu năng.

## 3. Quy ước phối hợp

- Mỗi thành viên chỉ sửa file thuộc phần mình phụ trách, tránh sửa chồng lên phần của người khác.
- Khi cần gọi API giữa các service, ưu tiên tạo file trong thư mục `clients/`.
- Mỗi service phải có endpoint `/health` để kiểm tra service đang chạy.
- Các biến môi trường đặt trong `.env.example`, không hard-code thông tin nhạy cảm.
- Database dùng MySQL trong XAMPP; import script từ thư mục `database/`.
- Frontend chỉ gọi API Gateway qua `VITE_API_BASE_URL`, không gọi trực tiếp từng service.
- `frontend/customer-web/src/styles/main.css` là file style dùng chung. Thành viên nào làm giao diện nào thì bổ sung CSS tương ứng cho phần đó, tránh xóa style của người khác.

## 4. Thứ tự tích hợp đề xuất

1. Thành viên 1 hoàn thành API Gateway và CSDL nền.
2. Thành viên 3 hoàn thành Product Service để có dữ liệu sản phẩm.
3. Thành viên 2 hoàn thành Cart Service.
4. Thành viên 3 hoàn thành Order Service và luồng tạo đơn.
5. Thành viên 5 hoàn thành Notification Service.
6. Thành viên 4 chạy load test và tổng hợp kết quả.
7. Thành viên 5 gom báo cáo Word, kiểm tra định dạng và phụ lục.
