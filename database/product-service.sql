CREATE DATABASE IF NOT EXISTS vietcart_product CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE vietcart_product;

CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(12, 2) NOT NULL,
  stock INT NOT NULL DEFAULT 0,
  image_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

TRUNCATE TABLE products;

INSERT INTO products (id, name, description, price, stock, image_url) VALUES
(1, 'Áo thun VietCart', 'Áo thun cotton thoáng mát, phù hợp mặc hằng ngày', 129000, 50, 'https://example.com/product-1.jpg'),
(2, 'Balo công nghệ', 'Balo đi học và đi làm, có ngăn chống sốc laptop', 349000, 25, 'https://example.com/product-2.jpg'),
(3, 'Tai nghe không dây', 'Tai nghe bluetooth âm thanh rõ, pin dùng cả ngày', 499000, 40, 'https://example.com/product-3.jpg'),
(4, 'Chuột không dây', 'Chuột văn phòng nhỏ gọn, kết nối ổn định', 189000, 60, 'https://example.com/product-4.jpg'),
(5, 'Bàn phím cơ mini', 'Bàn phím cơ 84 phím, đèn nền trắng', 729000, 18, 'https://example.com/product-5.jpg'),
(6, 'Sạc nhanh USB-C', 'Củ sạc nhanh 30W dùng cho điện thoại và máy tính bảng', 249000, 35, 'https://example.com/product-6.jpg'),
(7, 'Cáp sạc bện dù', 'Cáp USB-C dài 1.5m, chống rối và bền chắc', 99000, 100, 'https://example.com/product-7.jpg'),
(8, 'Bình giữ nhiệt', 'Bình inox giữ nóng lạnh, dung tích 500ml', 219000, 45, 'https://example.com/product-8.jpg'),
(9, 'Sổ tay kế hoạch', 'Sổ ghi chú bìa cứng, giấy dày chống lem mực', 79000, 80, 'https://example.com/product-9.jpg'),
(10, 'Đèn bàn LED', 'Đèn học chống cận, có điều chỉnh độ sáng', 299000, 30, 'https://example.com/product-10.jpg'),
(11, 'Giá đỡ laptop', 'Giá nhôm gấp gọn, hỗ trợ tản nhiệt tốt', 269000, 22, 'https://example.com/product-11.jpg'),
(12, 'Ốp lưng điện thoại', 'Ốp mềm chống sốc, thiết kế trong suốt', 89000, 70, 'https://example.com/product-12.jpg'),
(13, 'Kính cường lực', 'Kính bảo vệ màn hình chống trầy xước', 59000, 120, 'https://example.com/product-13.jpg'),
(14, 'Túi đeo chéo', 'Túi thời trang nhỏ gọn, nhiều ngăn tiện lợi', 199000, 33, 'https://example.com/product-14.jpg'),
(15, 'Áo khoác chống nắng', 'Áo khoác nhẹ, chống tia UV khi đi ngoài trời', 259000, 28, 'https://example.com/product-15.jpg'),
(16, 'Giày thể thao', 'Giày chạy bộ êm chân, kiểu dáng năng động', 699000, 16, 'https://example.com/product-16.jpg'),
(17, 'Mũ lưỡi trai', 'Mũ cotton thoáng khí, dễ phối đồ', 119000, 55, 'https://example.com/product-17.jpg'),
(18, 'Loa bluetooth mini', 'Loa nhỏ gọn, âm bass tốt, chống nước nhẹ', 399000, 24, 'https://example.com/product-18.jpg'),
(19, 'Ổ cắm điện đa năng', 'Ổ cắm có cổng USB, bảo vệ quá tải', 329000, 20, 'https://example.com/product-19.jpg'),
(20, 'Thẻ nhớ 128GB', 'Thẻ nhớ tốc độ cao cho điện thoại và máy ảnh', 289000, 38, 'https://example.com/product-20.jpg');
