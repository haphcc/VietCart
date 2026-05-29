import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import QRCode from 'qrcode';
import { cartApi } from '../api/cartApi.js';
import { orderApi } from '../api/orderApi.js';
import { paymentApi } from '../api/paymentApi.js';
import { productApi } from '../api/productApi.js';
import { userApi } from '../api/userApi.js';
import { getStoredAuth } from '../utils/authStorage.js';

function getCurrentUser() {
  return getStoredAuth()?.user || { id: 1 };
}

function formatPrice(price) {
  return Number(price).toLocaleString('vi-VN');
}

export default function CheckoutPage() {
  const navigate = useNavigate();
  const currentUser = useMemo(() => getCurrentUser(), []);
  const isLoggedIn = Boolean(getStoredAuth()?.token);

  const [items, setItems] = useState([]);
  const [formData, setFormData] = useState({
    fullName: currentUser.name || '',
    phone: currentUser.phone || '',
    address: currentUser.address || '',
    notes: ''
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [payosPayment, setPayosPayment] = useState(null);
  const [payosQrImage, setPayosQrImage] = useState('');
  const [checkingPayment, setCheckingPayment] = useState(false);

  const total = items.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0), 0);

  useEffect(() => {
    let cancelled = false;

    async function loadCheckoutData() {
      try {
        setLoading(true);
        setError(null);

        if (isLoggedIn) {
          try {
            const userRes = await userApi.me();
            if (!cancelled) {
              const user = userRes.data;
              setFormData((current) => ({
                ...current,
                fullName: user.name || current.fullName,
                phone: user.phone || current.phone,
                address: user.address || current.address
              }));
            }
          } catch (err) {
            console.warn('Không thể tải thông tin người dùng đăng nhập:', err);
          }
        }

        const cartRes = await cartApi.getByUser(currentUser.id);
        const enrichedItems = await Promise.all(cartRes.data.map(async (item) => {
          const productRes = await productApi.getById(item.product_id);
          const product = productRes.data;
          return {
            ...item,
            name: product.name,
            price: product.price,
            stock: product.stock,
            image_url: product.image_url
          };
        }));

        if (!cancelled) {
          setItems(enrichedItems);
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Lỗi khi tải dữ liệu thanh toán:', err);
          setError('Không thể tải giỏ hàng để thanh toán. Vui lòng thử lại sau.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadCheckoutData();
    return () => { cancelled = true; };
  }, [currentUser.id, isLoggedIn]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handlePaymentMethodChange = (event) => {
    setPaymentMethod(event.target.value);
    setPayosPayment(null);
    setPayosQrImage('');
  };

  async function updateQuantity(item, quantity) {
    const nextQuantity = Math.max(0, Math.min(Number(item.stock || quantity), quantity));

    try {
      setUpdatingId(item.id);
      setError(null);
      await cartApi.updateQuantity({
        user_id: currentUser.id,
        product_id: item.product_id,
        quantity: nextQuantity
      });

      if (nextQuantity <= 0) {
        setItems((current) => current.filter((cartItem) => cartItem.id !== item.id));
      } else {
        setItems((current) => current.map((cartItem) => (
          cartItem.id === item.id ? { ...cartItem, quantity: nextQuantity } : cartItem
        )));
      }
    } catch (err) {
      console.error('Lỗi khi cập nhật số lượng:', err);
      setError(err.response?.data?.message || 'Không thể cập nhật số lượng sản phẩm.');
    } finally {
      setUpdatingId(null);
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (items.length === 0) return;

    try {
      setSubmitting(true);
      setError(null);
      const orderRes = await orderApi.create({
        user_id: currentUser.id,
        items: items.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity
        })),
        shipping_info: formData,
        payment_method: paymentMethod
      });

      const order = orderRes.data;
      try {
        const paymentRes = await paymentApi.create({
          order_id: order.id,
          amount: order.total_amount,
          method: paymentMethod,
          buyer: formData,
          items: items.map((item) => ({
            product_id: item.product_id,
            name: item.name,
            quantity: item.quantity,
            price: item.price
          }))
        });

        if (paymentMethod === 'bank_transfer') {
          const payment = paymentRes.data;
          const qrImage = await QRCode.toDataURL(payment.payos_qr_code, {
            errorCorrectionLevel: 'M',
            margin: 1,
            width: 260
          });
          setPayosPayment(payment);
          setPayosQrImage(qrImage);
          setItems([]);
          return;
        }

        navigate('/orders', { state: { message: 'Đặt hàng COD thành công!' } });
      } catch (paymentError) {
        if (paymentMethod === 'bank_transfer') {
          try {
            await orderApi.updateStatus(order.id, 'cancelled');
          } catch (cancelError) {
            console.warn('Không thể hủy đơn sau khi tạo PayOS thất bại:', cancelError);
          }
        }
        throw paymentError;
      }
    } catch (err) {
      console.error('Lỗi khi đặt hàng:', err);
      setError(err.response?.data?.message || 'Đã xảy ra lỗi hệ thống khi xử lý đơn hàng.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCheckPayosStatus = async () => {
    if (!payosPayment?.order_id) return;

    try {
      setCheckingPayment(true);
      setError(null);
      const res = await paymentApi.syncPayosStatus(payosPayment.order_id);
      if (res.data.status === 'paid') {
        navigate('/orders', { state: { message: 'Thanh toán chuyển khoản thành công!' } });
        return;
      }
      setError('Chưa ghi nhận thanh toán. Vui lòng thử lại sau ít phút.');
    } catch (err) {
      console.error('Lỗi khi kiểm tra PayOS:', err);
      setError(err.response?.data?.message || 'Không thể kiểm tra trạng thái thanh toán.');
    } finally {
      setCheckingPayment(false);
    }
  };

  if (payosPayment) {
    return (
      <section className="page-section checkout-page">
        <h1 className="section-title">Thanh toán chuyển khoản</h1>
        {error && <div className="alert-error"><strong>Lỗi:</strong> {error}</div>}
        <div className="payos-panel">
          <div className="payos-qr-box">
            {payosQrImage && <img src={payosQrImage} alt="PayOS QR" />}
          </div>
          <div className="payos-details">
            <h2>Đơn hàng #{payosPayment.order_id}</h2>
            <p>Số tiền: <strong>{formatPrice(payosPayment.amount)}đ</strong></p>
            <p>Trạng thái: <span className="status-badge pending">Chờ thanh toán</span></p>
            {payosPayment.payos_checkout_url && (
              <a
                className="btn btn-primary"
                href={payosPayment.payos_checkout_url}
                target="_blank"
                rel="noreferrer"
              >
                Mở trang thanh toán PayOS
              </a>
            )}
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleCheckPayosStatus}
              disabled={checkingPayment}
            >
              {checkingPayment ? 'Đang kiểm tra...' : 'Tôi đã thanh toán'}
            </button>
            <Link to="/orders" className="checkout-back-link">Xem đơn hàng đang chờ</Link>
          </div>
        </div>
      </section>
    );
  }

  if (!loading && items.length === 0) {
    return (
      <section className="page-section">
        <div className="empty-state">
          <h2>Giỏ hàng trống</h2>
          <p>Thêm sản phẩm vào giỏ hàng trước khi xác nhận đặt hàng.</p>
          <Link to="/products" className="btn btn-primary">Tiếp tục mua sắm</Link>
        </div>
      </section>
    );
  }

  return (
    <section className="page-section checkout-page">
      <h1 className="section-title">Xác nhận đặt hàng</h1>

      {loading && <div className="loading-state">Đang tải thông tin thanh toán...</div>}
      {error && <div className="alert-error"><strong>Lỗi:</strong> {error}</div>}

      {!loading && (
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
                <label>Ghi chú</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  className="form-input"
                  rows="2"
                />
              </div>
              <div className="form-group">
                <label>Phương thức thanh toán</label>
                <div className="payment-methods">
                  <label className={`payment-method-option ${paymentMethod === 'cod' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={paymentMethod === 'cod'}
                      onChange={handlePaymentMethodChange}
                    />
                    <span>Thanh toán khi nhận hàng</span>
                  </label>
                  <label className={`payment-method-option ${paymentMethod === 'bank_transfer' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="bank_transfer"
                      checked={paymentMethod === 'bank_transfer'}
                      onChange={handlePaymentMethodChange}
                    />
                    <span>Chuyển khoản PayOS</span>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-submit-order"
                disabled={submitting || items.length === 0}
              >
                {submitting ? 'Đang xử lý...' : `Đặt hàng (${formatPrice(total)}đ)`}
              </button>
            </form>
          </div>

          <div className="checkout-summary-section">
            <h2>Tóm tắt đơn hàng</h2>
            <div className="order-items-list">
              {items.map((item) => (
                <div key={item.id} className="order-item-row checkout-order-item">
                  <div className="item-name">
                    <strong>{item.name}</strong>
                    <span>{formatPrice(item.price)}đ</span>
                  </div>
                  <div className="quantity-control summary-quantity-control">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item, Number(item.quantity) - 1)}
                      disabled={updatingId === item.id}
                      aria-label="Giảm số lượng"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="1"
                      max={item.stock}
                      value={item.quantity}
                      disabled={updatingId === item.id}
                      onChange={(event) => updateQuantity(item, Number(event.target.value || 1))}
                    />
                    <button
                      type="button"
                      onClick={() => updateQuantity(item, Number(item.quantity) + 1)}
                      disabled={updatingId === item.id || Number(item.quantity) >= Number(item.stock)}
                      aria-label="Tăng số lượng"
                    >
                      +
                    </button>
                  </div>
                  <div className="item-price">
                    {formatPrice(Number(item.price) * Number(item.quantity))}đ
                  </div>
                </div>
              ))}
            </div>

            <div className="order-total-row">
              <span>Tổng cộng:</span>
              <span className="total-price">{formatPrice(total)}đ</span>
            </div>
            <Link to="/cart" className="checkout-back-link">Quay lại giỏ hàng</Link>
          </div>
        </div>
      )}
    </section>
  );
}
