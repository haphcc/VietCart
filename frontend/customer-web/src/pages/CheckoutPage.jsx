import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { orderApi } from '../api/orderApi.js';

export default function CheckoutPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  
  // Dummy user for now, in a real app this comes from auth context
  const currentUser = { id: 1, name: 'Khách hàng', email: 'khachhang@example.com' };

  const [formData, setFormData] = useState({
    fullName: currentUser.name,
    phone: '',
    address: '',
    notes: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if we came from "Buy Now" on ProductDetail
    if (location.state && location.state.product) {
      const product = location.state.product;
      setItems([{
        product_id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        image_url: product.image_url
      }]);
      setTotal(Number(product.price));
    } else {
      // In a real app, we would fetch the cart here if location.state is empty
      // For this assignment scope, we'll just redirect back if no items
      setError('Không có sản phẩm nào để thanh toán.');
    }
  }, [location]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (items.length === 0) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const payload = {
        user_id: currentUser.id,
        items: items.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity
        })),
        shipping_info: formData // In real app, we'd save this
      };
      
      await orderApi.create(payload);
      
      // Navigate to order history on success
      navigate('/orders', { state: { message: 'Đặt hàng thành công!' } });
      
    } catch (err) {
      console.error('Lỗi khi đặt hàng:', err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Đã xảy ra lỗi hệ thống khi xử lý đơn hàng. Vui lòng thử lại.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (error && items.length === 0) {
    return (
      <section className="page-section">
        <div className="empty-state">
          <h2> giỏ hàng trống</h2>
          <p>{error}</p>
          <Link to="/products" className="btn btn-primary">Tiếp tục mua sắm</Link>
        </div>
      </section>
    );
  }

  return (
    <section className="page-section checkout-page">
      <h1 className="section-title">Thanh Toán</h1>
      
      {error && (
        <div className="alert-error">
          <strong>Lỗi đặt hàng:</strong> {error}
        </div>
      )}

      <div className="checkout-layout">
        <div className="checkout-form-section">
          <h2>Thông tin giao hàng</h2>
          <form className="checkout-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Họ và tên</label>
              <input 
                type="text" 
                name="fullName" 
                value={formData.fullName} 
                onChange={handleChange} 
                required 
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label>Số điện thoại</label>
              <input 
                type="tel" 
                name="phone" 
                value={formData.phone} 
                onChange={handleChange} 
                required 
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label>Địa chỉ nhận hàng</label>
              <textarea 
                name="address" 
                value={formData.address} 
                onChange={handleChange} 
                required 
                className="form-input"
                rows="3"
              />
            </div>
            <div className="form-group">
              <label>Ghi chú (Tùy chọn)</label>
              <textarea 
                name="notes" 
                value={formData.notes} 
                onChange={handleChange} 
                className="form-input"
                rows="2"
              />
            </div>
            
            <button 
              type="submit" 
              className="btn btn-primary btn-submit-order" 
              disabled={loading || items.length === 0}
            >
              {loading ? 'Đang xử lý...' : `Xác nhận đặt hàng (${Number(total).toLocaleString('vi-VN')}₫)`}
            </button>
          </form>
        </div>
        
        <div className="checkout-summary-section">
          <h2>Tóm tắt đơn hàng</h2>
          <div className="order-items-list">
            {items.map((item, idx) => (
              <div key={idx} className="order-item-row">
                <div className="item-name">
                  <span className="item-qty">{item.quantity}x</span> {item.name}
                </div>
                <div className="item-price">
                  {(Number(item.price) * Number(item.quantity)).toLocaleString('vi-VN')}₫
                </div>
              </div>
            ))}
          </div>
          
          <div className="order-total-row">
            <span>Tổng cộng:</span>
            <span className="total-price">{Number(total).toLocaleString('vi-VN')}₫</span>
          </div>
        </div>
      </div>
    </section>
  );
}
