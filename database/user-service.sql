CREATE DATABASE IF NOT EXISTS vietcart_user CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE vietcart_user;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  phone VARCHAR(30),
  address VARCHAR(500),
  role ENUM('customer', 'admin') NOT NULL DEFAULT 'customer',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO users (id, name, email, password_hash, phone, address, role, is_active) VALUES
(1, 'Demo Customer', 'demo@vietcart.local', '$2a$10$SgebjrLMXmkkdb.a3aBxZOSqq9hqOuFecQ1tiUQsPI2XPsftGORNe', '0900000001', 'Demo address 1', 'customer', TRUE),
(2, 'Customer 2', 'user2@vietcart.local', '$2a$10$SgebjrLMXmkkdb.a3aBxZOSqq9hqOuFecQ1tiUQsPI2XPsftGORNe', '0900000002', 'Demo address 2', 'customer', TRUE),
(3, 'Customer 3', 'user3@vietcart.local', '$2a$10$SgebjrLMXmkkdb.a3aBxZOSqq9hqOuFecQ1tiUQsPI2XPsftGORNe', '0900000003', 'Demo address 3', 'customer', TRUE),
(4, 'Customer 4', 'user4@vietcart.local', '$2a$10$SgebjrLMXmkkdb.a3aBxZOSqq9hqOuFecQ1tiUQsPI2XPsftGORNe', '0900000004', 'Demo address 4', 'customer', TRUE),
(5, 'Customer 5', 'user5@vietcart.local', '$2a$10$SgebjrLMXmkkdb.a3aBxZOSqq9hqOuFecQ1tiUQsPI2XPsftGORNe', '0900000005', 'Demo address 5', 'customer', TRUE),
(6, 'Customer 6', 'user6@vietcart.local', '$2a$10$SgebjrLMXmkkdb.a3aBxZOSqq9hqOuFecQ1tiUQsPI2XPsftGORNe', '0900000006', 'Demo address 6', 'customer', TRUE),
(7, 'Customer 7', 'user7@vietcart.local', '$2a$10$SgebjrLMXmkkdb.a3aBxZOSqq9hqOuFecQ1tiUQsPI2XPsftGORNe', '0900000007', 'Demo address 7', 'customer', TRUE),
(8, 'Customer 8', 'user8@vietcart.local', '$2a$10$SgebjrLMXmkkdb.a3aBxZOSqq9hqOuFecQ1tiUQsPI2XPsftGORNe', '0900000008', 'Demo address 8', 'customer', TRUE),
(9, 'Customer 9', 'user9@vietcart.local', '$2a$10$SgebjrLMXmkkdb.a3aBxZOSqq9hqOuFecQ1tiUQsPI2XPsftGORNe', '0900000009', 'Demo address 9', 'customer', TRUE),
(10, 'Customer 10', 'user10@vietcart.local', '$2a$10$SgebjrLMXmkkdb.a3aBxZOSqq9hqOuFecQ1tiUQsPI2XPsftGORNe', '0900000010', 'Demo address 10', 'customer', TRUE),
(11, 'Customer 11', 'user11@vietcart.local', '$2a$10$SgebjrLMXmkkdb.a3aBxZOSqq9hqOuFecQ1tiUQsPI2XPsftGORNe', '0900000011', 'Demo address 11', 'customer', TRUE),
(12, 'Customer 12', 'user12@vietcart.local', '$2a$10$SgebjrLMXmkkdb.a3aBxZOSqq9hqOuFecQ1tiUQsPI2XPsftGORNe', '0900000012', 'Demo address 12', 'customer', TRUE),
(13, 'Customer 13', 'user13@vietcart.local', '$2a$10$SgebjrLMXmkkdb.a3aBxZOSqq9hqOuFecQ1tiUQsPI2XPsftGORNe', '0900000013', 'Demo address 13', 'customer', TRUE),
(14, 'Customer 14', 'user14@vietcart.local', '$2a$10$SgebjrLMXmkkdb.a3aBxZOSqq9hqOuFecQ1tiUQsPI2XPsftGORNe', '0900000014', 'Demo address 14', 'customer', TRUE),
(15, 'Customer 15', 'user15@vietcart.local', '$2a$10$SgebjrLMXmkkdb.a3aBxZOSqq9hqOuFecQ1tiUQsPI2XPsftGORNe', '0900000015', 'Demo address 15', 'customer', TRUE),
(16, 'Customer 16', 'user16@vietcart.local', '$2a$10$SgebjrLMXmkkdb.a3aBxZOSqq9hqOuFecQ1tiUQsPI2XPsftGORNe', '0900000016', 'Demo address 16', 'customer', TRUE),
(17, 'Customer 17', 'user17@vietcart.local', '$2a$10$SgebjrLMXmkkdb.a3aBxZOSqq9hqOuFecQ1tiUQsPI2XPsftGORNe', '0900000017', 'Demo address 17', 'customer', TRUE),
(18, 'Customer 18', 'user18@vietcart.local', '$2a$10$SgebjrLMXmkkdb.a3aBxZOSqq9hqOuFecQ1tiUQsPI2XPsftGORNe', '0900000018', 'Demo address 18', 'customer', TRUE),
(19, 'Customer 19', 'user19@vietcart.local', '$2a$10$SgebjrLMXmkkdb.a3aBxZOSqq9hqOuFecQ1tiUQsPI2XPsftGORNe', '0900000019', 'Demo address 19', 'customer', TRUE),
(20, 'Customer 20', 'user20@vietcart.local', '$2a$10$SgebjrLMXmkkdb.a3aBxZOSqq9hqOuFecQ1tiUQsPI2XPsftGORNe', '0900000020', 'Demo address 20', 'customer', TRUE),
(21,'VietCart Admin', 'admin@vietcart.local', '$2a$10$SgebjrLMXmkkdb.a3aBxZOSqq9hqOuFecQ1tiUQsPI2XPsftGORNe', '0900000000', 'VietCart Admin Office', 'admin', TRUE)

ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  password_hash = VALUES(password_hash),
  phone = VALUES(phone),
  address = VALUES(address),
  role = VALUES(role),
  is_active = VALUES(is_active);
