# Thanh vien 5 - User Service va Notification Service

## Noi dung thuc hien

- Xay dung `backend/user-service` chay port `3006`, database rieng `vietcart_user`.
- Ho tro dang ky, dang nhap, lay thong tin ca nhan bang Bearer JWT va cap nhat ho so co ban.
- Hoan thien `backend/notification-service`: tao thong bao, lay danh sach theo user, danh dau da doc, danh dau tat ca da doc va xoa thong bao.
- Tich hop email bang Nodemailer theo cau hinh SMTP. Neu chua co SMTP, service van luu notification va tra trang thai email `skipped`.
- Ket noi Order Service voi User Service de lay email user khi tao don hang, sau do goi Notification Service de luu thong bao don hang.
- Frontend co trang `/login` de dang nhap/dang ky va trang `/notifications` hien thi thong bao cua user dang dang nhap.

## Tai khoan demo

- Email: `demo@vietcart.local`
- Mat khau: `123456`

## API chinh

- `POST /api/users/register`
- `POST /api/users/login`
- `GET /api/users/me`
- `PATCH /api/users/me`
- `GET /api/users/:id`
- `GET /api/notifications/user/:userId`
- `POST /api/notifications`
- `PATCH /api/notifications/:id/read`
- `PATCH /api/notifications/user/:userId/read-all`
- `DELETE /api/notifications/:id`

## Ghi chu kien truc

- User Service va Notification Service co database rieng, dung dung mo hinh database-per-service.
- Cac bang khac chi luu `user_id`, khong tao foreign key cheo database.
- JWT trong project nay dung cho demo mon hoc va duoc luu trong `localStorage` tren frontend.
