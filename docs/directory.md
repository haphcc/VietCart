VietCart/
|
|-- frontend/                         -> Giao dien nguoi dung
|   `-- customer-web/                 -> ReactJS + Vite
|
|-- backend/                          -> Cac microservice Node.js
|   |
|   |-- api-gateway/                  -> Cong vao duy nhat, dieu phoi request
|   |   `-- src/
|   |       |-- config/               -> Cau hinh dia chi cac service
|   |       |-- routes/               -> Dinh tuyen API den tung service
|   |       `-- middlewares/          -> Xu ly CORS, rate limit, loi
|   |
|   |-- product-service/              -> Quan ly san pham
|   |   `-- src/
|   |       |-- config/               -> Cau hinh ket noi MySQL
|   |       |-- routes/               -> Dinh nghia endpoint san pham
|   |       |-- controllers/          -> Nhan request va tra response
|   |       `-- services/             -> Xu ly logic va truy van CSDL
|   |
|   |-- cart-service/                 -> Quan ly gio hang
|   |-- order-service/                -> Tao va quan ly don hang
|   |-- payment-service/              -> Xu ly thanh toan
|   |-- notification-service/         -> Gui thong bao/email
|   `-- user-service/                 -> Dang ky, dang nhap va quan ly user
|
|-- database/                         -> Script MySQL cho XAMPP
|
|-- shared/                           -> Hang so va ham dung chung
|
`-- docs/                             -> Noi dung bao cao va so do
