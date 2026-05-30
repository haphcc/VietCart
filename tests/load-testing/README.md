# Load Testing / Performance Testing

Thu muc nay phuc vu Chuong V / Cau 5: xay dung kich ban kiem thu tai cho project VietCart Microservices bang Apache Benchmark.

## Muc dich

- Do kha nang dap ung cua API Gateway va cac service khi co nhieu request dong thoi.
- Ghi lai cac chi so hieu nang de dua vao bao cao Chuong V.
- Chuan bi san payload mau cho mot so API POST de nhom co the chinh theo du lieu that trong database.

## Yeu cau

Can cai Apache Benchmark, thuong co san trong Apache HTTP Server hoac XAMPP.

Kiem tra da cai `ab` chua:

```bash
ab -V
```

Neu chay tren Windows, co the dung Git Bash, WSL hoac terminal co cau hinh duong dan toi `ab.exe` cua XAMPP/Apache.

## Kiem tra server

Truoc khi chay load test, start project:

```powershell
npm run dev
```

Cac script se tu goi:

```bash
curl http://localhost:3000/health
```

Neu API Gateway chua chay, script se bao:

```text
API Gateway chưa chạy. Hãy start project trước khi chạy load test.
```

## Cach chay

Vao thu muc load testing:

```bash
cd tests/load-testing
```

Chay tung script:

```bash
./test-health.sh
./test-products.sh
./test-cart.sh
./test-orders.sh
./test-users.sh
./test-notifications.sh
```

Neu Git Bash/WSL bao chua co quyen chay file, dung:

```bash
chmod +x *.sh
```

Hoac chay truc tiep bang `bash`:

```bash
bash test-health.sh
bash test-products.sh
```

Chay toan bo:

```bash
./run-all-tests.sh
```

Hoac:

```bash
bash run-all-tests.sh
```

Doi API Gateway URL bang bien moi truong:

```bash
BASE_URL=http://localhost:3000 ./test-products.sh
```

Endpoint can JWT se dung bien moi truong `JWT_TOKEN`:

```bash
JWT_TOKEN=your_token_here ./test-notifications.sh
JWT_TOKEN=your_token_here ./test-users.sh
```

Neu `JWT_TOKEN` rong, script se bo qua endpoint can dang nhap.

## Chay POST test mau

Mac dinh cac script POST khong chay de tranh tao nhieu du lieu rac. Muon chay POST test mau, dat:

```bash
RUN_POST_TESTS=1 ./test-cart.sh
RUN_POST_TESTS=1 ./test-orders.sh
RUN_POST_TESTS=1 ./test-users.sh
```

Payload nam trong:

- `payloads/cart-item.json`
- `payloads/order.json`
- `payloads/user-register.json`
- `payloads/user-login.json`
- `payloads/payment.json`

Can chinh `userId`, `productId`, `orderId`, email va cac truong khac theo du lieu that trong database truoc khi chay POST.

Vi du lenh Apache Benchmark POST:

```bash
ab -n 100 -c 10 -p payloads/cart-item.json -T application/json http://localhost:3000/api/cart/items
```

## Muc tai dang dung

Moi script chay 3 muc tai:

- Nhe: `-n 100 -c 10`
- Trung binh: `-n 500 -c 50`
- Nang: `-n 1000 -c 100`

Y nghia tham so:

- `-n`: tong so request gui di.
- `-c`: so request dong thoi.
- `Requests per second`: so request xu ly moi giay, cang cao cang tot.
- `Time per request`: thoi gian trung binh cho moi request, cang thap cang tot.
- `Failed requests`: so request loi, nen bang 0 trong kich ban on dinh.
- `Transfer rate`: toc do truyen du lieu qua mang.

## Ket qua

Ket qua duoc luu trong `results/`, ten file co timestamp, vi du:

```text
results/products_2026-05-26_10-30-00.txt
```

Khi doc ket qua, nen lay cac dong:

- `Requests per second`
- `Time per request`
- `Failed requests`
- `Transfer rate`

Dung `report-template.md` de dien so lieu vao bang tong hop. Trong bao cao Chuong V nen so sanh tung muc tai, neu request loi tang khi `-c` cao thi ghi nhan API nao bat dau qua tai.

## Windows

Co san cac file batch mau:

```bat
test-health.bat
test-products.bat
run-all-tests.bat
```

Chay trong Command Prompt hoac PowerShell:

```bat
test-health.bat
test-products.bat
run-all-tests.bat
```

Neu Windows khong nhan `ab`, them thu muc Apache/XAMPP chua `ab.exe` vao `PATH`, hoac chay bang Git Bash/WSL.
