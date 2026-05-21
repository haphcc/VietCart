CREATE DATABASE IF NOT EXISTS vietcart_cart CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE vietcart_cart;

CREATE TABLE IF NOT EXISTS cart_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_user_product (user_id, product_id)
);

TRUNCATE TABLE cart_items;

INSERT INTO cart_items (user_id, product_id, quantity) VALUES
(1, 1, 2),
(1, 3, 1),
(1, 8, 1),
(2, 2, 1),
(2, 5, 1),
(3, 4, 2),
(3, 7, 3),
(4, 6, 1),
(4, 10, 1),
(5, 9, 2),
(5, 12, 1),
(6, 11, 1),
(6, 13, 2),
(7, 14, 1),
(7, 16, 1),
(8, 15, 2),
(8, 18, 1),
(9, 17, 1),
(9, 20, 2),
(10, 19, 1);
