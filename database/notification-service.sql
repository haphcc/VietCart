CREATE DATABASE IF NOT EXISTS vietcart_notification CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE vietcart_notification;

CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type ENUM('system', 'order', 'payment', 'promotion') NOT NULL DEFAULT 'system',
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

TRUNCATE TABLE notifications;

INSERT INTO notifications (user_id, title, message, type, is_read) VALUES
(1, 'Đơn hàng đã được tạo', 'Đơn hàng #1 của bạn đã được tạo thành công.', 'order', TRUE),
(2, 'Chờ xác nhận thanh toán', 'Đơn hàng #2 đang chờ xác nhận thanh toán khi nhận hàng.', 'payment', FALSE),
(3, 'Đơn hàng đang giao', 'Đơn hàng #3 đang được vận chuyển đến địa chỉ của bạn.', 'order', FALSE),
(4, 'Thanh toán thành công', 'Thanh toán cho đơn hàng #4 đã được ghi nhận.', 'payment', TRUE),
(5, 'Cảm ơn bạn đã mua hàng', 'Đơn hàng #5 đã hoàn tất. Cảm ơn bạn đã tin dùng VietCart.', 'system', TRUE),
(6, 'Giỏ hàng đang chờ', 'Bạn có sản phẩm trong giỏ hàng chưa hoàn tất đặt mua.', 'system', FALSE),
(7, 'Khuyến mãi cuối tuần', 'Nhận ưu đãi giảm giá cho đơn hàng tiếp theo trong cuối tuần này.', 'promotion', FALSE),
(8, 'Đơn hàng đang giao', 'Đơn hàng #8 đang trên đường giao đến bạn.', 'order', FALSE),
(9, 'Hoàn tất đơn hàng', 'Đơn hàng #9 đã giao thành công.', 'order', TRUE),
(10, 'Nhắc thanh toán', 'Vui lòng kiểm tra trạng thái thanh toán của đơn hàng #10.', 'payment', FALSE),
(11, 'Sản phẩm yêu thích', 'Bình giữ nhiệt bạn từng xem hiện còn hàng.', 'promotion', FALSE),
(12, 'Xác nhận đơn hàng', 'Đơn hàng #12 đã được xác nhận bởi hệ thống.', 'order', TRUE),
(13, 'Thanh toán MoMo thành công', 'Giao dịch MoMo cho đơn hàng #13 đã hoàn tất.', 'payment', TRUE),
(14, 'Đơn hàng đã hủy', 'Đơn hàng #14 đã được hủy và hoàn tiền theo chính sách.', 'order', TRUE),
(15, 'Đang chờ xử lý', 'Đơn hàng #15 đang được hệ thống xử lý.', 'order', FALSE),
(16, 'Chuyển khoản thành công', 'Thanh toán chuyển khoản cho đơn hàng #16 đã được xác nhận.', 'payment', TRUE),
(17, 'Đánh giá sản phẩm', 'Hãy đánh giá sản phẩm cáp sạc bạn vừa mua.', 'system', FALSE),
(18, 'Đơn hàng đang giao', 'Đơn hàng #18 đã rời kho và đang giao đến bạn.', 'order', FALSE),
(19, 'Ưu đãi thành viên', 'Bạn nhận được mã giảm giá cho lần mua tiếp theo.', 'promotion', FALSE),
(20, 'Đơn hàng mới', 'Đơn hàng #20 đã được tạo và đang chờ xác nhận.', 'order', FALSE);
