import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { cartApi } from '../api/cartApi.js';
import { productApi } from '../api/productApi.js';
import { getStoredAuth } from '../utils/authStorage.js';

const productIcons = {
  1: '👕', 2: '🎒', 3: '🎧', 4: '🖱️', 5: '⌨️',
  6: '🔌', 7: '🔗', 8: '🧊', 9: '📓', 10: '💡',
  11: '💻', 12: '📱', 13: '🛡️', 14: '👜', 15: '🧥',
  16: '👟', 17: '🧢', 18: '🔊', 19: '🔌', 20: '💾'
};

function formatPrice(price) {
  return Number(price).toLocaleString('vi-VN');
}

function DetailSkeleton() {
  return (
    <div className="detail-skeleton">
      <div className="detail-skeleton-img" />
      <div className="detail-skeleton-info">
        <div className="skeleton-line w-40" style={{ height: '16px' }} />
        <div className="skeleton-line h-lg w-80" />
        <div className="skeleton-line w-60" />
        <div className="skeleton-line w-80" />
        <div className="skeleton-line w-60" />
        <div className="skeleton-line h-lg w-40" />
        <div className="skeleton-line w-60" style={{ height: '48px', marginTop: '12px' }} />
      </div>
    </div>
  );
}

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState(null);
  const [cartMessage, setCartMessage] = useState(null);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function fetchProduct() {
      try {
        setLoading(true);
        setError(null);
        const res = await productApi.getById(id);
        if (!cancelled) {
          setProduct(res.data);
          setQuantity(1);
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Lỗi khi tải chi tiết sản phẩm:', err);
          setError(err.response?.status === 404
            ? 'Sản phẩm không tồn tại hoặc đã bị xóa.'
            : 'Không thể tải thông tin sản phẩm. Vui lòng thử lại sau.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchProduct();
    return () => { cancelled = true; };
  }, [id]);

  async function handleAddToCart() {
    if (!product || product.stock <= 0) return;

    const auth = getStoredAuth();
    const userId = auth?.user?.id || 1;

    try {
      setAdding(true);
      setCartMessage(null);
      await cartApi.addItem({
        user_id: userId,
        product_id: product.id,
        quantity
      });
      navigate('/cart', { state: { message: 'Sản phẩm đã được thêm vào giỏ hàng.' } });
    } catch (err) {
      console.error('Lỗi khi thêm vào giỏ hàng:', err);
      setCartMessage(err.response?.data?.message || 'Không thể thêm sản phẩm vào giỏ hàng.');
    } finally {
      setAdding(false);
    }
  }

  const icon = product ? (productIcons[product.id] || '📦') : '📦';
  const inStock = product ? product.stock > 0 : false;
  const showRealImg = product && product.image_url && !product.image_url.includes('example.com') && !imgError;

  return (
    <section className="page-section">
      <nav className="product-detail-breadcrumb">
        <Link to="/">Trang chủ</Link>
        <span className="separator">/</span>
        <Link to="/products">Sản phẩm</Link>
        <span className="separator">/</span>
        <span>{product ? product.name : 'Chi tiết'}</span>
      </nav>

      {loading && <DetailSkeleton />}

      {error && (
        <div className="empty-state">
          <h2>Lỗi</h2>
          <p>{error}</p>
          <Link to="/products" className="btn btn-primary">Quay lại danh sách</Link>
        </div>
      )}

      {!loading && !error && product && (
        <div className="product-detail-card">
          <div className="product-detail-layout">
            <div className="product-detail-img-section">
              {showRealImg ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  onError={() => setImgError(true)}
                />
              ) : (
                <span className="product-detail-img-placeholder">{icon}</span>
              )}
            </div>

            <div className="product-detail-info">
              <span className="product-detail-category">Sản phẩm VietCart</span>
              <h1 className="product-detail-name">{product.name}</h1>
              <p className="product-detail-desc">{product.description}</p>

              <div className="detail-price">
                {formatPrice(product.price)}<span className="currency">đ</span>
              </div>

              <div className="product-detail-meta">
                <div className="product-detail-meta-row">
                  <span className="meta-row-label">Tình trạng</span>
                  <span className={`detail-stock-badge ${inStock ? 'in-stock' : 'out-of-stock'}`}>
                    {inStock ? `Còn hàng (${product.stock})` : 'Hết hàng'}
                  </span>
                </div>
                <div className="product-detail-meta-row">
                  <span className="meta-row-label">Mã sản phẩm</span>
                  <span className="meta-row-value">SP-{String(product.id).padStart(4, '0')}</span>
                </div>
                {product.created_at && (
                  <div className="product-detail-meta-row">
                    <span className="meta-row-label">Ngày đăng</span>
                    <span className="meta-row-value">
                      {new Date(product.created_at).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                )}
              </div>

              <div className="product-detail-actions">
                <div className="quantity-control detail-quantity-control">
                  <button
                    type="button"
                    onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                    disabled={!inStock || adding}
                    aria-label="Giảm số lượng"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    max={product.stock}
                    value={quantity}
                    disabled={!inStock || adding}
                    onChange={(event) => {
                      const nextValue = Number(event.target.value);
                      if (Number.isNaN(nextValue)) return;
                      setQuantity(Math.min(product.stock, Math.max(1, nextValue)));
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setQuantity((current) => Math.min(product.stock, current + 1))}
                    disabled={!inStock || adding || quantity >= product.stock}
                    aria-label="Tăng số lượng"
                  >
                    +
                  </button>
                </div>

                <button className="btn-cart" disabled={!inStock || adding} onClick={handleAddToCart}>
                  {adding ? 'Đang thêm...' : inStock ? 'Thêm vào giỏ hàng' : 'Hết hàng'}
                </button>

                <Link to="/products" className="btn-back">Quay lại</Link>
              </div>

              {cartMessage && <div className="alert-error">{cartMessage}</div>}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
