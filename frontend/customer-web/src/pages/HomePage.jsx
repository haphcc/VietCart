import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function HomePage() {
  const [selectedId, setSelectedId] = useState('gateway');

  const services = [
    {
      id: 'gateway',
      name: 'API Gateway',
      port: '3000',
      role: 'Cổng điều phối & Định tuyến',
      desc: 'Là điểm đầu vào (Single Entry Point) duy nhất của toàn bộ hệ thống. API Gateway chịu trách nhiệm nhận mọi request từ Client, thực hiện kiểm tra định tuyến, phân phối tải, ghi nhật ký (logging) và chuyển tiếp yêu cầu đến các microservices nội bộ tương ứng.',
      tech: 'NodeJS, ExpressJS, Http-Proxy',
      db: 'Không có (Stateless Service)',
      endpoints: [
        'GET /health - Health check Gateway',
        'ANY /api/products/* -> chuyển tiếp Product Service',
        'ANY /api/cart/* -> chuyển tiếp Cart Service',
        'ANY /api/orders/* -> chuyển tiếp Order Service',
        'ANY /api/notifications/* -> chuyển tiếp Notification Service'
      ]
    },
    {
      id: 'product',
      name: 'Product Service',
      port: '3001',
      role: 'Quản lý Sản phẩm & Tồn kho',
      desc: 'Đảm nhận việc quản lý toàn bộ cơ sở dữ liệu sản phẩm, danh mục hàng hóa và số lượng tồn kho thực tế. Dịch vụ này trả về thông tin danh sách sản phẩm và chi tiết sản phẩm cho khách hàng hiển thị trên giao diện.',
      tech: 'NodeJS, ExpressJS, MySQL',
      db: 'vietcart_product',
      endpoints: [
        'GET /api/products - Lấy danh sách sản phẩm',
        'GET /api/products/:id - Xem chi tiết sản phẩm',
        'POST /api/products/sync-stock - Trừ kho khi đặt hàng',
        'GET /health - Kiểm tra dịch vụ hoạt động'
      ]
    },
    {
      id: 'cart',
      name: 'Cart Service',
      port: '3002',
      role: 'Quản lý Giỏ hàng trực tuyến',
      desc: 'Quản lý trạng thái giỏ hàng tạm thời của khách hàng. Xử lý logic thêm sản phẩm vào giỏ, cập nhật số lượng, xóa sản phẩm và làm trống giỏ hàng sau khi đơn hàng được tạo.',
      tech: 'NodeJS, ExpressJS, Redis, MySQL',
      db: 'vietcart_cart',
      endpoints: [
        'GET /api/cart - Lấy giỏ hàng hiện tại',
        'POST /api/cart/add - Thêm sản phẩm vào giỏ',
        'PUT /api/cart/update - Thay đổi số lượng sản phẩm',
        'DELETE /api/cart/clear - Làm trống giỏ hàng'
      ]
    },
    {
      id: 'order',
      name: 'Order Service',
      port: '3003',
      role: 'Xử lý Đơn hàng & Giao dịch',
      desc: 'Chịu trách nhiệm thực hiện nghiệp vụ cốt lõi: tạo đơn hàng, tính tổng tiền, lưu trữ chi tiết đơn hàng và theo dõi trạng thái đơn hàng. Service này giao tiếp trực tiếp với Product Service để giảm số lượng tồn kho và Cart Service để dọn dẹp giỏ hàng.',
      tech: 'NodeJS, ExpressJS, Axios (HTTP Client), MySQL',
      db: 'vietcart_order',
      endpoints: [
        'POST /api/orders - Khởi tạo đơn hàng mới',
        'GET /api/orders - Xem lịch sử mua hàng',
        'GET /api/orders/:id - Xem chi tiết một đơn hàng',
        'PUT /api/orders/:id/status - Cập nhật trạng thái giao hàng'
      ]
    },
    {
      id: 'payment',
      name: 'Payment Service',
      port: '3004',
      role: 'Tích hợp Thanh toán',
      desc: 'Quản lý các giao dịch thanh toán của khách hàng liên kết với từng đơn hàng. Hỗ trợ nhiều phương thức khác nhau như COD (Giao hàng thu tiền), Chuyển khoản hoặc giả lập cổng ví điện tử Momo / VNPay.',
      tech: 'NodeJS, ExpressJS, MySQL',
      db: 'vietcart_payment',
      endpoints: [
        'POST /api/payments - Tạo yêu cầu thanh toán mới',
        'GET /api/payments/:orderId - Truy vấn trạng thái thanh toán',
        'GET /health - Kiểm tra dịch vụ hoạt động'
      ]
    },
    {
      id: 'notification',
      name: 'Notification Service',
      port: '3005',
      role: 'Hệ thống Gửi thông báo',
      desc: 'Xử lý bất đồng bộ các sự kiện gửi email/thông báo đến khách hàng. Khi đơn hàng được đặt hoặc thanh toán thành công, dịch vụ này sẽ tự động kích hoạt gửi Email xác nhận chi tiết đơn hàng cho khách hàng.',
      tech: 'NodeJS, ExpressJS, Nodemailer, MySQL',
      db: 'vietcart_notification',
      endpoints: [
        'POST /api/notifications - Lưu trữ thông báo mới',
        'GET /api/notifications - Lấy danh sách thông báo cá nhân',
        'POST /api/notifications/send-email - Gửi email xác nhận đơn hàng'
      ]
    }
  ];

  const currentService = services.find(s => s.id === selectedId) || services[0];

  // Trực quan hóa tọa độ SVG để tạo hiệu ứng luồng xung điện chạy trên màn hình
  const getActivePath = () => {
    switch (selectedId) {
      case 'gateway':
        return "M 500,40 L 500,140";
      case 'product':
        return "M 500,40 L 500,140 L 500,210 L 100,210 L 100,280 L 100,420";
      case 'cart':
        return "M 500,40 L 500,140 L 500,210 L 300,210 L 300,280 L 300,420";
      case 'order':
        return "M 500,40 L 500,140 L 500,280 L 500,420";
      case 'payment':
        return "M 500,40 L 500,140 L 500,210 L 700,210 L 700,280 L 700,420";
      case 'notification':
        return "M 500,40 L 500,140 L 500,210 L 900,210 L 900,280 L 900,420";
      default:
        return "";
    }
  };

  return (
    <section className="page-section">
      {/* Hero Section */}
      <div className="hero-section">
        <span className="project-tag">Đồ án kiến trúc phần mềm</span>
        <h1>Hệ Thống Thương Mại Điện Tử VietCart</h1>
        <p className="hero-subtitle">
          Giải pháp E-Commerce hiện đại, tối ưu hiệu năng dựa trên mô hình kiến trúc phân tán 
          <strong> Microservices</strong> kết hợp cơ chế <strong>Database-per-service</strong> độc lập và an toàn.
        </p>
        <div className="hero-actions">
          <Link to="/products" className="btn btn-primary">
            Khám phá Sản phẩm
          </Link>
          <a href="#architecture" className="btn btn-secondary">
            Xem Mô hình Kiến trúc
          </a>
        </div>
      </div>

      {/* Project Quick Stats */}
      <div className="stats-grid">
        <div className="stat-item">
          <div className="stat-num">5+</div>
          <div className="stat-label">Microservices Độc lập</div>
        </div>
        <div className="stat-item">
          <div className="stat-num">1</div>
          <div className="stat-label">API Gateway Tập trung</div>
        </div>
        <div className="stat-item">
          <div className="stat-num">100%</div>
          <div className="stat-label">Cơ chế Database-per-service</div>
        </div>
        <div className="stat-item">
          <div className="stat-num">Light</div>
          <div className="stat-label">Giao diện Light Mode Hiện đại</div>
        </div>
      </div>

      {/* Architecture Visualizer Section */}
      <div id="architecture" className="arch-section">
        <div className="arch-header">
          <h2>Sơ Đồ Kiến Trúc Hệ Thống Tương Tác</h2>
          <p>
            Click chọn các thành phần dưới đây để trực quan hóa luồng dữ liệu (Request Flow) 
            và kiểm tra chi tiết cấu hình kỹ thuật của từng Service trong hệ thống.
          </p>
        </div>

        <div className="arch-container">
          {/* Sơ đồ tương tác mạng */}
          <div className="arch-board">
            {/* SVG Background Lines */}
            <svg className="arch-paths" viewBox="0 0 1000 500" preserveAspectRatio="none">
              {/* Static faint gray lines for full picture */}
              <path d="M 500,40 L 500,140" stroke="#e2e8f0" strokeWidth="2" fill="none" />
              
              <path d="M 500,140 L 500,210 L 100,210 L 100,280" stroke="#e2e8f0" strokeWidth="2" fill="none" />
              <path d="M 500,140 L 500,210 L 300,210 L 300,280" stroke="#e2e8f0" strokeWidth="2" fill="none" />
              <path d="M 500,140 L 500,280" stroke="#e2e8f0" strokeWidth="2" fill="none" />
              <path d="M 500,140 L 500,210 L 700,210 L 700,280" stroke="#e2e8f0" strokeWidth="2" fill="none" />
              <path d="M 500,140 L 500,210 L 900,210 L 900,280" stroke="#e2e8f0" strokeWidth="2" fill="none" />

              <path d="M 100,280 L 100,420" stroke="#e2e8f0" strokeWidth="2" fill="none" />
              <path d="M 300,280 L 300,420" stroke="#e2e8f0" strokeWidth="2" fill="none" />
              <path d="M 500,280 L 500,420" stroke="#e2e8f0" strokeWidth="2" fill="none" />
              <path d="M 700,280 L 700,420" stroke="#e2e8f0" strokeWidth="2" fill="none" />
              <path d="M 900,280 L 900,420" stroke="#e2e8f0" strokeWidth="2" fill="none" />

              {/* Active Blue Path */}
              {selectedId && (
                <path 
                  d={getActivePath()} 
                  stroke="var(--primary)" 
                  strokeWidth="3" 
                  fill="none" 
                  className="pulse-line"
                />
              )}

              {/* Active Motion Pulse Signal */}
              {selectedId && (
                <circle r="6" fill="var(--primary)" className="pulse-signal">
                  <animateMotion dur="2.5s" repeatCount="indefinite" path={getActivePath()} />
                </circle>
              )}
            </svg>

            {/* Layer 1: Client Application */}
            <div className="arch-layer" style={{ height: '50px' }}>
              <div 
                className={`arch-node ${selectedId === 'client' ? 'active' : ''}`}
                style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', top: '15px' }}
                onClick={() => setSelectedId('gateway')}
              >
                <span className="node-title">Khách hàng</span>
                <span className="node-subtitle">ReactJS Customer Web</span>
              </div>
            </div>

            {/* Layer 2: API Gateway */}
            <div className="arch-layer" style={{ height: '50px' }}>
              <div 
                className={`arch-node ${selectedId === 'gateway' ? 'active' : ''}`}
                style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', top: '115px', zIndex: 10 }}
                onClick={() => setSelectedId('gateway')}
              >
                <span className="node-title">API Gateway</span>
                <span className="node-subtitle">Port 3000 / Stateless</span>
              </div>
            </div>

            {/* Layer 3: Microservices */}
            <div className="arch-layer" style={{ height: '70px' }}>
              {/* Product Node */}
              <div 
                className={`arch-node ${selectedId === 'product' ? 'active' : ''}`}
                style={{ position: 'absolute', left: '10%', transform: 'translateX(-50%)', top: '255px' }}
                onClick={() => setSelectedId('product')}
              >
                <span className="node-title">Product Service</span>
                <span className="node-subtitle">Port 3001</span>
              </div>

              {/* Cart Node */}
              <div 
                className={`arch-node ${selectedId === 'cart' ? 'active' : ''}`}
                style={{ position: 'absolute', left: '30%', transform: 'translateX(-50%)', top: '255px' }}
                onClick={() => setSelectedId('cart')}
              >
                <span className="node-title">Cart Service</span>
                <span className="node-subtitle">Port 3002</span>
              </div>

              {/* Order Node */}
              <div 
                className={`arch-node ${selectedId === 'order' ? 'active' : ''}`}
                style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', top: '255px' }}
                onClick={() => setSelectedId('order')}
              >
                <span className="node-title">Order Service</span>
                <span className="node-subtitle">Port 3003</span>
              </div>

              {/* Payment Node */}
              <div 
                className={`arch-node ${selectedId === 'payment' ? 'active' : ''}`}
                style={{ position: 'absolute', left: '70%', transform: 'translateX(-50%)', top: '255px' }}
                onClick={() => setSelectedId('payment')}
              >
                <span className="node-title">Payment Service</span>
                <span className="node-subtitle">Port 3004</span>
              </div>

              {/* Notification Node */}
              <div 
                className={`arch-node ${selectedId === 'notification' ? 'active' : ''}`}
                style={{ position: 'absolute', left: '90%', transform: 'translateX(-50%)', top: '255px' }}
                onClick={() => setSelectedId('notification')}
              >
                <span className="node-title">Notification Svc</span>
                <span className="node-subtitle">Port 3005</span>
              </div>
            </div>

            {/* Layer 4: Database per Service */}
            <div className="arch-layer" style={{ height: '70px' }}>
              {/* Product DB */}
              <div 
                className={`arch-node node-db ${selectedId === 'product' ? 'active' : ''}`}
                style={{ position: 'absolute', left: '10%', transform: 'translateX(-50%)', top: '395px' }}
                onClick={() => setSelectedId('product')}
              >
                <span className="node-title">product_db</span>
                <span className="node-subtitle">MySQL DB</span>
              </div>

              {/* Cart DB */}
              <div 
                className={`arch-node node-db ${selectedId === 'cart' ? 'active' : ''}`}
                style={{ position: 'absolute', left: '30%', transform: 'translateX(-50%)', top: '395px' }}
                onClick={() => setSelectedId('cart')}
              >
                <span className="node-title">cart_db</span>
                <span className="node-subtitle">MySQL DB</span>
              </div>

              {/* Order DB */}
              <div 
                className={`arch-node node-db ${selectedId === 'order' ? 'active' : ''}`}
                style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', top: '395px' }}
                onClick={() => setSelectedId('order')}
              >
                <span className="node-title">order_db</span>
                <span className="node-subtitle">MySQL DB</span>
              </div>

              {/* Payment DB */}
              <div 
                className={`arch-node node-db ${selectedId === 'payment' ? 'active' : ''}`}
                style={{ position: 'absolute', left: '70%', transform: 'translateX(-50%)', top: '395px' }}
                onClick={() => setSelectedId('payment')}
              >
                <span className="node-title">payment_db</span>
                <span className="node-subtitle">MySQL DB</span>
              </div>

              {/* Notification DB */}
              <div 
                className={`arch-node node-db ${selectedId === 'notification' ? 'active' : ''}`}
                style={{ position: 'absolute', left: '90%', transform: 'translateX(-50%)', top: '395px' }}
                onClick={() => setSelectedId('notification')}
              >
                <span className="node-title">notification_db</span>
                <span className="node-subtitle">MySQL DB</span>
              </div>
            </div>
          </div>

          {/* Chi tiết Service được chọn */}
          <div className="arch-detail-card accent-border">
            <div className="detail-header">
              <h3>{currentService.name}</h3>
              <span className="detail-port">Cổng dịch vụ: {currentService.port}</span>
            </div>

            <div className="detail-meta-list">
              <div className="detail-meta-item">
                <span className="meta-label">Vai trò:</span>
                <span className="meta-value" style={{ color: 'var(--primary)' }}>{currentService.role}</span>
              </div>
              <div className="detail-meta-item">
                <span className="meta-label">Công nghệ:</span>
                <span className="meta-value tech">{currentService.tech}</span>
              </div>
              <div className="detail-meta-item">
                <span className="meta-label">Cơ sở dữ liệu:</span>
                <span className="meta-value" style={{ fontStyle: 'italic' }}>{currentService.db}</span>
              </div>
            </div>

            <div className="detail-desc">
              <p>{currentService.desc}</p>
            </div>

            <div className="detail-endpoints" style={{ marginTop: '10px' }}>
              <h4 style={{ fontSize: '0.9rem', color: 'var(--text-main)', marginBottom: '8px', fontWeight: '700' }}>
                Các API Endpoints cốt lõi:
              </h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {currentService.endpoints.map((ep, i) => (
                  <li 
                    key={i} 
                    style={{ 
                      fontSize: '0.8rem', 
                      fontFamily: 'monospace', 
                      backgroundColor: 'var(--secondary-light)', 
                      padding: '6px 10px', 
                      borderRadius: '4px',
                      color: '#0f172a',
                      borderLeft: '3px solid var(--accent)'
                    }}
                  >
                    {ep}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Architecture Core Features */}
      <div className="features-grid">
        <div className="feature-card">
          <div className="feature-icon-wrapper">🚀</div>
          <h3>Độc lập phát triển & Triển khai</h3>
          <p>
            Mỗi microservice (Product, Cart, Order,...) là một ứng dụng Node.js độc lập hoàn toàn, 
            cho phép từng nhóm sinh viên phát triển, sửa đổi, kiểm thử mà không ảnh hưởng tới các dịch vụ khác.
          </p>
        </div>

        <div className="feature-card">
          <div className="feature-icon-wrapper">💾</div>
          <h3>Mô hình Database-per-service</h3>
          <p>
            Quy tắc kiến trúc nghiêm ngặt: Mỗi Service có database MySQL riêng trong XAMPP. 
            Không có service nào được phép truy cập trực tiếp DB của service khác, dữ liệu được đồng bộ an toàn qua RESTful APIs.
          </p>
        </div>

        <div className="feature-card">
          <div className="feature-icon-wrapper">🛡️</div>
          <h3>API Gateway & Bảo mật</h3>
          <p>
            Định tuyến tập trung tại cổng 3000. Ẩn đi địa chỉ mạng nội bộ của các microservice thực tế, 
            giúp bảo mật luồng thông tin, xử lý ghi log tập trung và hỗ trợ khắc phục lỗi CORS đơn giản.
          </p>
        </div>
      </div>
    </section>
  );
}
