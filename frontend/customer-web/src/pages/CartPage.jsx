import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cartApi } from '../api/cartApi.js';
import { productApi } from '../api/productApi.js';
import { getStoredAuth } from '../utils/authStorage.js';

function getCurrentUser() {
  return getStoredAuth()?.user || { id: 1 };
}

function formatPrice(price) {
  return Number(price).toLocaleString('vi-VN');
}

export default function CartPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(location.state?.message || null);

  const currentUser = useMemo(() => getCurrentUser(), []);
  const total = items.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0), 0);

  useEffect(() => {
    let cancelled = false;

    async function fetchCart() {
      try {
        setLoading(true);
        setError(null);
        const cartRes = await cartApi.getByUser(currentUser.id);
        const enrichedItems = await Promise.all(cartRes.data.map(async (item) => {
          try {
            const productRes = await productApi.getById(item.product_id);
            const product = productRes.data;
            return {
              ...item,
              name: product.name,
              price: product.price,
              stock: product.stock,
              image_url: product.image_url
            };
          } catch (err) {
            console.warn(`Không thể tải sản phẩm ${item.product_id}:`, err);
            return {
              ...item,
              name: `Sản phẩm #${item.product_id}`,
              price: 0,
              stock: item.quantity,
              image_url: null
            };
          }
        }));

        if (!cancelled) {
          setItems(enrichedItems);
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Lỗi khi tải giỏ hàng:', err);
          setError('Không thể tải giỏ hàng. Vui lòng thử lại sau.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchCart();
    return () => { cancelled = true; };
  }, [currentUser.id]);

  async function updateQuantity(item, quantity) {
    const nextQuantity = Math.max(0, Math.min(Number(item.stock || quantity), quantity));
    try {
      setUpdatingId(item.id);
      setMessage(null);
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
      console.error('Lỗi khi cập nhật giỏ hàng:', err);
      setError(err.response?.data?.message || 'Không thể cập nhật số lượng sản phẩm.');
    } finally {
      setUpdatingId(null);
    }
  }

  async function removeItem(item) {
    try {
      setUpdatingId(item.id);
      setMessage(null);
      await cartApi.removeItem(item.id);
      setItems((current) => current.filter((cartItem) => cartItem.id !== item.id));
    } catch (err) {
      console.error('Lỗi khi xóa sản phẩm khỏi giỏ:', err);
      setError('Không thể xóa sản phẩm khỏi giỏ hàng.');
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <section className="page-section cart-page">
      <div className="cart-page-header">
        <div>
          <h1 className="section-title">Giỏ hàng</h1>
          <p>Kiểm tra sản phẩm và số lượng trước khi sang bước giao hàng.</p>
        </div>
        <Link to="/products" className="btn-back">Tiếp tục mua sắm</Link>
      </div>

      {message && (
        <div className="cart-toast" role="status">
          <span className="cart-toast-icon" aria-hidden="true">✓</span>
          <span>{message}</span>
          <button type="button" onClick={() => setMessage(null)} aria-label="Đóng thông báo">
            ×
          </button>
        </div>
      )}
      {error && <div className="alert-error">{error}</div>}
      {loading && <div className="loading-state">Đang tải giỏ hàng...</div>}

      {!loading && items.length === 0 && (
        <div className="empty-state">
          <h2>Giỏ hàng trống</h2>
          <p>Chọn sản phẩm để thêm vào giỏ hàng trước khi đặt mua.</p>
          <Link to="/products" className="btn btn-primary">Xem sản phẩm</Link>
        </div>
      )}

      {!loading && items.length > 0 && (
        <div className="cart-layout">
          <div className="cart-items-list">
            {items.map((item) => (
              <article key={item.id} className="cart-line-item">
                <div className="cart-line-main">
                  <div className="cart-line-thumb">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.name} />
                    ) : (
                      <span>📦</span>
                    )}
                  </div>
                  <div>
                    <h3>{item.name}</h3>
                    <p>{formatPrice(item.price)}đ</p>
                    <span className="cart-stock-note">Còn {item.stock} sản phẩm</span>
                  </div>
                </div>

                <div className="cart-line-actions">
                  <div className="quantity-control">
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
                  <strong>{formatPrice(Number(item.price) * Number(item.quantity))}đ</strong>
                  <button type="button" className="btn-link-danger" onClick={() => removeItem(item)}>
                    Xóa
                  </button>
                </div>
              </article>
            ))}
          </div>

          <aside className="cart-summary">
            <h2>Tóm tắt đơn hàng</h2>
            <div className="order-total-row">
              <span>Tổng cộng</span>
              <span className="total-price">{formatPrice(total)}đ</span>
            </div>
            <button
              type="button"
              className="btn btn-primary btn-submit-order"
              onClick={() => navigate('/checkout')}
            >
              Xác nhận giỏ hàng
            </button>
          </aside>
        </div>
      )}
    </section>
  );
}
