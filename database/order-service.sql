CREATE DATABASE IF NOT EXISTS vietcart_order CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE vietcart_order;

DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;

CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  total_amount DECIMAL(12, 2) NOT NULL,
  payment_method ENUM('cod', 'bank_transfer', 'momo', 'vnpay') NOT NULL DEFAULT 'cod',
  shipping_name VARCHAR(255),
  shipping_phone VARCHAR(30),
  shipping_address VARCHAR(500),
  shipping_note TEXT,
  status ENUM('pending', 'confirmed', 'shipping', 'completed', 'cancelled') NOT NULL DEFAULT 'pending',
  reservation_id VARCHAR(500) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL,
  price DECIMAL(12, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

INSERT INTO orders (id, user_id, total_amount, payment_method, shipping_name, shipping_phone, shipping_address, shipping_note, status) VALUES
(1, 1, 628000, 'momo', 'Khách hàng 1', '0900000001', 'Quận 1, TP. Hồ Chí Minh', 'Giao giờ hành chính', 'confirmed'),
(2, 2, 1078000, 'cod', 'Khách hàng 2', '0900000002', 'Quận 2, TP. Hồ Chí Minh', NULL, 'pending'),
(3, 3, 675000, 'bank_transfer', 'Khách hàng 3', '0900000003', 'Quận 3, TP. Hồ Chí Minh', NULL, 'shipping'),
(4, 4, 548000, 'vnpay', 'Khách hàng 4', '0900000004', 'Quận 4, TP. Hồ Chí Minh', NULL, 'completed'),
(5, 5, 237000, 'cod', 'Khách hàng 5', '0900000005', 'Quận 5, TP. Hồ Chí Minh', NULL, 'completed'),
(6, 6, 387000, 'momo', 'Khách hàng 6', '0900000006', 'Quận 6, TP. Hồ Chí Minh', NULL, 'pending'),
(7, 7, 898000, 'bank_transfer', 'Khách hàng 7', '0900000007', 'Quận 7, TP. Hồ Chí Minh', NULL, 'confirmed'),
(8, 8, 917000, 'vnpay', 'Khách hàng 8', '0900000008', 'Quận 8, TP. Hồ Chí Minh', NULL, 'shipping'),
(9, 9, 697000, 'momo', 'Khách hàng 9', '0900000009', 'Quận 9, TP. Hồ Chí Minh', NULL, 'completed'),
(10, 10, 329000, 'cod', 'Khách hàng 10', '0900000010', 'TP. Thủ Đức, TP. Hồ Chí Minh', NULL, 'pending'),
(11, 11, 219000, 'vnpay', 'Khách hàng 11', '0900000011', 'Hà Nội', NULL, 'completed'),
(12, 12, 299000, 'bank_transfer', 'Khách hàng 12', '0900000012', 'Đà Nẵng', NULL, 'confirmed'),
(13, 13, 499000, 'momo', 'Khách hàng 13', '0900000013', 'Cần Thơ', NULL, 'completed'),
(14, 14, 189000, 'cod', 'Khách hàng 14', '0900000014', 'Bình Dương', NULL, 'cancelled'),
(15, 15, 729000, 'vnpay', 'Khách hàng 15', '0900000015', 'Đồng Nai', NULL, 'pending'),
(16, 16, 249000, 'bank_transfer', 'Khách hàng 16', '0900000016', 'Hải Phòng', NULL, 'confirmed'),
(17, 17, 99000, 'cod', 'Khách hàng 17', '0900000017', 'Huế', NULL, 'completed'),
(18, 18, 399000, 'momo', 'Khách hàng 18', '0900000018', 'Nha Trang', NULL, 'shipping'),
(19, 19, 259000, 'vnpay', 'Khách hàng 19', '0900000019', 'Vũng Tàu', NULL, 'completed'),
(20, 20, 289000, 'cod', 'Khách hàng 20', '0900000020', 'Long An', NULL, 'pending');

INSERT INTO order_items (order_id, product_id, quantity, price) VALUES
(1, 1, 1, 129000),
(1, 3, 1, 499000),
(2, 2, 1, 349000),
(2, 5, 1, 729000),
(3, 4, 2, 189000),
(3, 7, 3, 99000),
(4, 6, 1, 249000),
(4, 10, 1, 299000),
(5, 9, 3, 79000),
(6, 11, 1, 269000),
(6, 13, 2, 59000),
(7, 14, 1, 199000),
(7, 16, 1, 699000),
(8, 15, 2, 259000),
(8, 18, 1, 399000),
(9, 17, 1, 119000),
(9, 20, 2, 289000),
(10, 19, 1, 329000),
(11, 8, 1, 219000),
(12, 10, 1, 299000),
(13, 3, 1, 499000),
(14, 4, 1, 189000),
(15, 5, 1, 729000),
(16, 6, 1, 249000),
(17, 7, 1, 99000),
(18, 18, 1, 399000),
(19, 15, 1, 259000),
(20, 20, 1, 289000);
