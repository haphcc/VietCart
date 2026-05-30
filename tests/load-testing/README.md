# Load Testing / Performance Testing

Thư mục này phục vụ Chương V / Câu 5: xây dựng kịch bản kiểm thử tải cho project VietCart Microservices bằng Apache Benchmark.

## Mục đích

- Đo khả năng đáp ứng của API Gateway và các service khi có nhiều request đồng thời.
- Ghi lại chỉ số hiệu năng để đưa vào báo cáo Chương V.
- Có kịch bản so sánh trước/sau cải tiến cho 3 nhóm giải pháp: Redis cache, scale Cart Service, đồng bộ tồn kho.
- Chuẩn bị payload mẫu cho một số API POST để nhóm chỉnh theo dữ liệu thật trong database.

## Yêu cầu

Cần cài Apache Benchmark, thường có sẵn trong Apache HTTP Server hoặc XAMPP.

Kiểm tra đã cài `ab` chưa:

```bash
ab -V
```

Trên Windows, nếu dùng XAMPP thì `ab.exe` thường nằm tại:

```text
C:\xampp\apache\bin\ab.exe
```

Các script `.sh` đã có fallback tới đường dẫn này khi chạy bằng Git Bash/WSL.

## Kiểm tra server

Trước khi chạy load test, start project:

```powershell
npm run dev
```

Các script sẽ tự gọi:

```bash
curl http://localhost:3000/health
```

Nếu API Gateway chưa chạy, script sẽ báo:

```text
API Gateway chưa chạy. Hãy start project trước khi chạy load test.
```

## Chạy từng nhóm API

```bash
cd tests/load-testing
bash test-health.sh
bash test-products.sh
bash test-cart.sh
bash test-orders.sh
bash test-users.sh
bash test-notifications.sh
```

Chạy toàn bộ:

```bash
bash run-all-tests.sh
```

Đổi API Gateway URL bằng biến môi trường:

```bash
BASE_URL=http://localhost:3000 bash test-products.sh
```

Endpoint cần JWT sẽ dùng biến môi trường `JWT_TOKEN`:

```bash
JWT_TOKEN=your_token_here bash test-notifications.sh
JWT_TOKEN=your_token_here bash test-users.sh
```

Nếu `JWT_TOKEN` rỗng, script sẽ bỏ qua endpoint cần đăng nhập.

## Kịch bản so sánh trước/sau cải tiến

Script chính:

```bash
bash run-before-after-tests.sh
```

Trên Windows có thể chạy:

```powershell
.\run-before-after-tests.bat
```

Mặc định cả trước và sau đều trỏ tới `http://localhost:3000`. Khi nhóm có hai môi trường khác nhau, truyền URL riêng:

```bash
BASELINE_URL=http://localhost:3000 OPTIMIZED_URL=http://localhost:3000 bash run-before-after-tests.sh
```

Ý nghĩa:

- `BASELINE_URL`: môi trường trước cải tiến.
- `OPTIMIZED_URL`: môi trường sau cải tiến.
- `LEVEL_TOTAL`: tổng request cho mỗi lượt, mặc định `300`.
- `LEVEL_CONCURRENCY`: request đồng thời, mặc định `30`.

Ví dụ:

```bash
LEVEL_TOTAL=500 LEVEL_CONCURRENCY=50 bash run-before-after-tests.sh
```

Ba nhóm so sánh trong script:

- Redis cache cho Cart Service: `GET /api/cart/1`.
- Scale Cart Service qua Load Balancer: `GET /api/cart/1`.
- Đồng bộ tồn kho qua Product Service: `GET /api/products/1`.

Mặc định script không chạy POST để tránh làm thay đổi tồn kho. Nếu cần kiểm thử ghi cho đồng bộ tồn kho:

```bash
RUN_WRITE_TESTS=1 bash run-before-after-tests.sh
```

Trước khi chạy ghi, hãy kiểm tra `payloads/reserve-stock.json` và chắc chắn `product_id` còn đủ tồn kho.

## Chạy POST test mẫu

Mặc định các script POST không chạy để tránh tạo nhiều dữ liệu rác. Muốn chạy POST test mẫu:

```bash
RUN_POST_TESTS=1 bash test-cart.sh
RUN_POST_TESTS=1 bash test-orders.sh
RUN_POST_TESTS=1 bash test-users.sh
```

Payload nằm trong:

- `payloads/cart-item.json`
- `payloads/order.json`
- `payloads/user-register.json`
- `payloads/user-login.json`
- `payloads/payment.json`
- `payloads/reserve-stock.json`

Cần chỉnh `userId`, `productId`, `orderId`, email và các trường khác theo dữ liệu thật trong database trước khi chạy POST.

Ví dụ lệnh Apache Benchmark POST:

```bash
ab -n 100 -c 10 -p payloads/cart-item.json -T application/json http://localhost:3000/api/cart/items
```

## Mức tải đang dùng

Mỗi script API cơ bản chạy 3 mức tải:

- Nhẹ: `-n 100 -c 10`
- Trung bình: `-n 500 -c 50`
- Nặng: `-n 1000 -c 100`

Ý nghĩa tham số:

- `-n`: tổng số request gửi đi.
- `-c`: số request đồng thời.
- `Requests per second`: số request xử lý mỗi giây, càng cao càng tốt.
- `Time per request`: thời gian trung bình cho mỗi request, càng thấp càng tốt.
- `Failed requests`: số request lỗi, nên bằng 0 trong kịch bản ổn định.
- `Non-2xx responses`: số response không thuộc nhóm 2xx, thường xuất hiện nếu bị rate limit hoặc endpoint trả lỗi.
- `Transfer rate`: tốc độ truyền dữ liệu qua mạng.

## Kết quả và bằng chứng

Kết quả thật khi chạy local được lưu trong:

```text
tests/load-testing/results/
```

Ví dụ:

```text
results/products_2026-05-26_10-30-00.txt
```

Thư mục lưu bằng chứng có thể commit vào repo:

```text
tests/load-testing/evidence/
```

Sau khi chạy xong, có thể copy file `.txt` hoặc bảng `.md` quan trọng từ `results/` sang `evidence/` để nộp kèm báo cáo.

Khi đọc kết quả, lấy các dòng:

- `Requests per second`
- `Time per request`
- `Failed requests`
- `Non-2xx responses`
- `Transfer rate`

Dùng `report-template.md` hoặc `evidence/before-after-template.md` để điền số liệu vào bảng tổng hợp. Trong báo cáo Chương V nên so sánh từng mức tải và ghi rõ nếu request lỗi tăng khi `-c` cao.

## Windows

Có sẵn các file batch:

```bat
test-health.bat
test-products.bat
test-cart.bat
test-orders.bat
test-users.bat
test-notifications.bat
run-all-tests.bat
run-before-after-tests.bat
```

Chạy trong Command Prompt hoặc PowerShell:

```bat
test-health.bat
test-products.bat
run-all-tests.bat
```

Nếu Windows không nhận `ab`, thêm `C:\xampp\apache\bin` vào `PATH`, hoặc chạy bằng Git Bash/WSL.

## Ghi chú về rate limit

API Gateway hiện có rate limit trong:

```text
backend/api-gateway/src/middlewares/rateLimit.middleware.js
```

Nếu chạy mức tải cao, kết quả có thể xuất hiện `Non-2xx responses` do bị giới hạn request. Khi đưa vào báo cáo, cần ghi rõ đây là giới hạn bảo vệ API Gateway, không nhất thiết là lỗi xử lý nghiệp vụ của service.
