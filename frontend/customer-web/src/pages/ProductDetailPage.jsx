import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { productApi } from '../api/productApi.js';

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Lỗi khi tải chi tiết sản phẩm:', err);
          if (err.response && err.response.status === 404) {
            setError('Sản phẩm không tồn tại hoặc đã bị xóa.');
          } else {
            setError('Không thể tải thông tin sản phẩm. Vui lòng thử lại sau.');
          }
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

  const icon = product ? (productIcons[product.id] || '📦') : '📦';
  const inStock = product ? product.stock > 0 : false;
  const showRealImg = product && product.image_url && !product.image_url.includes('example.com') && !imgError;

  return (
    <section className="page-section">
      {/* Breadcrumb */}
      <nav className="product-detail-breadcrumb">
        <Link to="/">Trang chủ</Link>
        <span className="separator">/</span>
        <Link to="/products">Sản phẩm</Link>
        <span className="separator">/</span>
        <span>{product ? product.name : 'Chi tiết'}</span>
      </nav>

      {/* Loading */}
      {loading && <DetailSkeleton />}

      {/* Error */}
      {error && (
        <div className="empty-state">
          <h2>😔 Lỗi</h2>
          <p>{error}</p>
          <Link to="/products" className="btn btn-primary">
            ← Quay lại danh sách
          </Link>
        </div>
      )}

      {/* Product Detail */}
      {!loading && !error && product && (
        <div className="product-detail-card">
          <div className="product-detail-layout">
            {/* Ảnh sản phẩm */}
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

            {/* Thông tin chi tiết */}
            <div className="product-detail-info">
              <span className="product-detail-category">Sản phẩm VietCart</span>

              <h1 className="product-detail-name">{product.name}</h1>

              <p className="product-detail-desc">{product.description}</p>

              {/* Giá */}
              <div className="detail-price">
                {formatPrice(product.price)}<span className="currency">₫</span>
              </div>

              {/* Meta info */}
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

              {/* Actions */}
              <div className="product-detail-actions">
                <button
                  className="btn-cart"
                  disabled={!inStock}
                  onClick={() => navigate('/checkout', { state: { product } })}
                >
                  ⚡ {inStock ? 'Mua ngay' : 'Hết hàng'}
                </button>
                <Link to="/products" className="btn-back">
                  ← Quay lại
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
