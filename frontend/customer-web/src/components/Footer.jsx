import { Link } from 'react-router-dom';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="footer-content">
        <div className="footer-logo">
          <h3>VietCart</h3>
          <p>
            Hệ thống thương mại điện tử trực tuyến phân tán được xây dựng trên kiến trúc Microservices, phục vụ đồ án môn học Kiến trúc Phần mềm.
          </p>
          <div className="footer-tech-stack">
            <span className="tech-badge">React + Vite</span>
            <span className="tech-badge">NodeJS (Express)</span>
            <span className="tech-badge">API Gateway</span>
            <span className="tech-badge">MySQL via XAMPP</span>
            <span className="tech-badge">Redis Cache</span>
          </div>
        </div>

        <div className="footer-column">
          <h4>Điều hướng</h4>
          <ul>
            <li><Link to="/">Trang chủ</Link></li>
            <li><Link to="/products">Danh sách sản phẩm</Link></li>
            <li><Link to="/cart">Giỏ hàng của bạn</Link></li>
            <li><Link to="/orders">Lịch sử mua hàng</Link></li>
          </ul>
        </div>

        <div className="footer-column">
          <h4>Thông tin Đồ án</h4>
          <ul>
            <li><strong>Môn học:</strong> Kiến trúc Phần mềm</li>
            <li><strong>Kiến trúc:</strong> Microservices</li>
            <li><strong>Mô hình:</strong> Database-per-service</li>
            <li><strong>Công cụ thử nghiệm:</strong> Apache Benchmark</li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {currentYear} VietCart Project. Tất cả các quyền được bảo lưu.</p>
        <p>Đồ án Kiến trúc Phần mềm - Nhóm VietCart</p>
      </div>
    </footer>
  );
}
