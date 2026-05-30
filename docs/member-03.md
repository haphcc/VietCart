# Thanh vien 3 - Chuong IV: Dong bo ton kho

## Bai toan dong bo du lieu

Trong VietCart, Order Service va Product Service la hai service doc lap. Order Service tao don hang, con Product Service nam quyen quan ly so luong ton kho. Neu Order Service chi doc ton kho roi moi goi API tru ton sau khi tao don, nhieu request dat hang cung luc co the cung nhin thay cung mot so ton kho cu. Ket qua la ban vuot ton, don hang da tao nhung Product Service khong tru duoc hang, hoac phai huy don bang thao tac bu tru.

Nguyen nhan chinh:

- Du lieu bi chia theo service, khong co transaction ACID duy nhat bao trum Order DB va Product DB.
- Mau check-then-act khong an toan khi co concurrency cao.
- Saga giup bu tru khi mot buoc that bai, nhung neu chi bu tru sau khi da tao don thi nguoi dung van thay don bi huy va he thong co khoang thoi gian lech trang thai.
- Distributed Lock co the khoa theo product_id, nhung tang do phuc tap van hanh va phu thuoc them Redis/ZooKeeper/etcd. Voi bai toan hien tai, khoa hang bang transaction trong Product Service la du va don gian hon.

## Phuong an de xuat

Giai phap su dung Event-driven Architecture ket hop message queue noi bo va co che giu hang tam thoi:

1. Order Service goi Product Service de reserve stock truoc khi tao don.
2. Product Service dung MySQL transaction va `SELECT ... FOR UPDATE` tren tung product theo thu tu `product_id` de tranh race condition va giam deadlock.
3. Product Service tru ton ngay trong transaction, dong thoi ghi `stock_reservations` voi trang thai `reserved` va thoi han 10 phut.
4. Order Service tao don kem danh sach `reservation_id`.
5. Message queue noi bo phat su kien `order.created`. Don COD duoc handler xac nhan reservation bat dong bo va chuyen order sang `confirmed`.
6. Don `bank_transfer` giu hang o trang thai `reserved` den khi Payment Service xac nhan thanh toan va goi Order Service chuyen sang `confirmed`.
7. Neu don bi huy, Order Service goi Product Service release reservation de cong tra ton kho.
8. Product Service chay cleanup dinh ky, tu dong release reservation qua han de tranh giu hang vo han.

## Dam bao dong bo ton kho

Product Service la noi duy nhat duoc thay doi ton kho. Moi thao tac reserve, confirm, release va cleanup deu nam trong transaction rieng cua Product Service. Cach nay khong can distributed transaction, nhung van dam bao khong co hai don hang nao cung tru cung mot phan ton kho vi row lock cua MySQL serializes cac thao tac tren cung product.

Voi co che nay, Saga van ton tai o muc nghiep vu: neu tao don that bai sau khi reserve, Order Service phat hanh bu tru bang release reservation. Distributed Lock duoc thay bang row-level lock trong database cua Product Service, phu hop hon voi pham vi du an vi khong can them ha tang khoa phan tan.
