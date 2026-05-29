CREATE DATABASE IF NOT EXISTS vietcart_payment CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE vietcart_payment;

DROP TABLE IF EXISTS payments;

CREATE TABLE IF NOT EXISTS payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  method ENUM('cod', 'bank_transfer', 'momo', 'vnpay') NOT NULL DEFAULT 'cod',
  status ENUM('pending', 'paid', 'failed', 'refunded') NOT NULL DEFAULT 'pending',
  payos_order_code BIGINT UNIQUE,
  payos_payment_link_id VARCHAR(100),
  payos_checkout_url VARCHAR(500),
  payos_qr_code TEXT,
  transaction_reference VARCHAR(100),
  paid_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO payments (order_id, amount, method, status) VALUES
(1, 628000, 'momo', 'paid'),
(2, 1078000, 'cod', 'pending'),
(3, 675000, 'bank_transfer', 'paid'),
(4, 548000, 'vnpay', 'paid'),
(5, 237000, 'cod', 'paid'),
(6, 387000, 'momo', 'pending'),
(7, 898000, 'bank_transfer', 'paid'),
(8, 917000, 'vnpay', 'paid'),
(9, 697000, 'momo', 'paid'),
(10, 329000, 'cod', 'pending'),
(11, 219000, 'vnpay', 'paid'),
(12, 299000, 'bank_transfer', 'paid'),
(13, 499000, 'momo', 'paid'),
(14, 189000, 'cod', 'refunded'),
(15, 729000, 'vnpay', 'pending'),
(16, 249000, 'bank_transfer', 'paid'),
(17, 99000, 'cod', 'paid'),
(18, 399000, 'momo', 'paid'),
(19, 259000, 'vnpay', 'paid'),
(20, 289000, 'cod', 'pending');
