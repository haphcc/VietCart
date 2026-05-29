import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { orderApi } from '../api/orderApi.js';

export default function OrderHistoryPage() {
  const location = useLocation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Dummy user for now
  const currentUser = { id: 1, name: 'Khách hàng' };

  useEffect(() => {
    async function fetchOrders() {
      try {
        setLoading(true);
        const res = await orderApi.getByUser(currentUser.id);
        setOrders(res.data);
      } catch (err) {
        console.error('Lỗi khi tải lịch sử đơn hàng:', err);
        setError('Không thể tải lịch sử đơn hàng. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, [currentUser.id]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending': return <span className="status-badge pending">Đang xử lý</span>;
      case 'confirmed': return <span className="status-badge confirmed">Đã xác nhận</span>;
      case 'shipping': return <span className="status-badge shipping">Đang giao hàng</span>;
      case 'completed': return <span className="status-badge completed">Đã hoàn thành</span>;
      case 'cancelled': return <span className="status-badge cancelled">Đã hủy</span>;
      default: return <span className="status-badge">{status}</span>;
    }
  };

  return (
    <section className="page-section order-history-page">
      <h1 className="section-title">Lịch sử đơn hàng</h1>
      
      {location.state && location.state.message && (
        <div className="alert-success">
          {location.state.message}
        </div>
      )}

      {loading && <div className="loading-state">Đang tải lịch sử đơn hàng...</div>}
      
      {error && (
        <div className="alert-error">
          {error}
        </div>
      )}

      {!loading && !error && orders.length === 0 && (
        <div className="empty-state">
          <h2>Bạn chưa có đơn hàng nào</h2>
          <p>Hãy khám phá các sản phẩm của chúng tôi và đặt hàng nhé.</p>
          <Link to="/products" className="btn btn-primary">Mua sắm ngay</Link>
        </div>
      )}

      {!loading && !error && orders.length > 0 && (
        <div className="orders-list">
          {orders.map(order => (
            <div key={order.id} className="order-card">
              <div className="order-header">
                <div className="order-id">Đơn hàng <strong>#SP-{String(order.id).padStart(4, '0')}</strong></div>
                <div className="order-date">
                  {new Date(order.created_at).toLocaleString('vi-VN')}
                </div>
              </div>
              <div className="order-body">
                <div className="order-total">
                  Tổng tiền: <strong>{Number(order.total_amount).toLocaleString('vi-VN')}₫</strong>
                </div>
                <div className="order-status">
                  {getStatusBadge(order.status)}
                </div>
              </div>
              {/* Note: In a real app we would have an expand button to fetch and show order items */}
              <div className="order-footer">
                <button 
                  className="btn-outline-primary btn-sm"
                  onClick={() => alert(`Xem chi tiết đơn hàng #${order.id} - Đang hoàn thiện!`)}
                >
                  Xem chi tiết
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
