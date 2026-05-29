import { useState } from 'react';
import { Link } from 'react-router-dom';

// Map sản phẩm theo id → emoji icon để hiển thị khi ảnh lỗi
const productIcons = {
  1: '👕', 2: '🎒', 3: '🎧', 4: '🖱️', 5: '⌨️',
  6: '🔌', 7: '🔗', 8: '🧊', 9: '📓', 10: '💡',
  11: '💻', 12: '📱', 13: '🛡️', 14: '👜', 15: '🧥',
  16: '👟', 17: '🧢', 18: '🔊', 19: '🔌', 20: '💾'
};

function formatPrice(price) {
  return Number(price).toLocaleString('vi-VN');
}

export default function ProductCard({ product }) {
  const [imgError, setImgError] = useState(false);
  const icon = productIcons[product.id] || '📦';
  const inStock = product.stock > 0;

  return (
    <Link to={`/products/${product.id}`} className="product-card" id={`product-card-${product.id}`}>
      {/* Ảnh sản phẩm */}
      <div className="product-card-img-wrapper">
        {!imgError && product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="product-card-placeholder">{icon}</div>
        )}

        {/* Badge tình trạng kho */}
        <span className={`stock-badge ${inStock ? 'in-stock' : 'out-of-stock'}`}>
          {inStock ? `Còn ${product.stock}` : 'Hết hàng'}
        </span>
      </div>

      {/* Nội dung */}
      <div className="product-card-body">
        <h3 className="product-card-name">{product.name}</h3>
        <p className="product-card-desc">{product.description}</p>
      </div>

      {/* Footer: giá + action hint */}
      <div className="product-card-footer">
        <span className="price-tag">
          {formatPrice(product.price)}<span className="currency">₫</span>
        </span>
        <span className="card-action-hint">
          Xem chi tiết →
        </span>
      </div>
    </Link>
  );
}
