CREATE DATABASE IF NOT EXISTS vietcart_order CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE vietcart_order;

CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  total_amount DECIMAL(12, 2) NOT NULL,
  status ENUM('pending', 'confirmed', 'shipping', 'completed', 'cancelled') NOT NULL DEFAULT 'pending',
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

SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE order_items;
TRUNCATE TABLE orders;
SET FOREIGN_KEY_CHECKS = 1;

INSERT INTO orders (id, user_id, total_amount, status) VALUES
(1, 1, 628000, 'confirmed'),
(2, 2, 1078000, 'pending'),
(3, 3, 675000, 'shipping'),
(4, 4, 548000, 'completed'),
(5, 5, 237000, 'completed'),
(6, 6, 387000, 'pending'),
(7, 7, 898000, 'confirmed'),
(8, 8, 917000, 'shipping'),
(9, 9, 697000, 'completed'),
(10, 10, 329000, 'pending'),
(11, 11, 219000, 'completed'),
(12, 12, 299000, 'confirmed'),
(13, 13, 499000, 'completed'),
(14, 14, 189000, 'cancelled'),
(15, 15, 729000, 'pending'),
(16, 16, 249000, 'confirmed'),
(17, 17, 99000, 'completed'),
(18, 18, 399000, 'shipping'),
(19, 19, 259000, 'completed'),
(20, 20, 289000, 'pending');

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
