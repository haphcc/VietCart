import { useEffect, useState } from 'react';
import { productApi } from '../api/productApi.js';
import ProductCard from '../components/ProductCard.jsx';

function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div className="skeleton-img" />
      <div className="skeleton-body">
        <div className="skeleton-line h-lg w-80" />
        <div className="skeleton-line w-60" />
        <div className="skeleton-line w-40" />
      </div>
      <div className="skeleton-footer">
        <div className="skeleton-line" />
      </div>
    </div>
  );
}

export default function ProductListPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function fetchProducts() {
      try {
        setLoading(true);
        setError(null);
        const res = await productApi.getAll();
        if (!cancelled) {
          setProducts(res.data);
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Lỗi khi tải sản phẩm:', err);
          setError('Không thể tải danh sách sản phẩm. Vui lòng kiểm tra kết nối hoặc thử lại sau.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchProducts();
    return () => { cancelled = true; };
  }, []);

  // Filter client-side theo tên và mô tả
  const filtered = products.filter((p) => {
    const keyword = search.toLowerCase().trim();
    if (!keyword) return true;
    return (
      p.name.toLowerCase().includes(keyword) ||
      (p.description && p.description.toLowerCase().includes(keyword))
    );
  });

  return (
    <section className="page-section">
      {/* Hero Header */}
      <div className="product-page-hero">
        <h1>Cửa Hàng Sản Phẩm</h1>
        <p>
          Khám phá bộ sưu tập đa dạng các sản phẩm công nghệ, phụ kiện và thời trang từ VietCart.
        </p>
      </div>

      {/* Toolbar: Search + Count */}
      <div className="product-toolbar">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            id="product-search"
            type="text"
            placeholder="Tìm kiếm sản phẩm..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {!loading && !error && (
          <span className="product-count">
            Hiển thị <strong>{filtered.length}</strong> / {products.length} sản phẩm
          </span>
        )}
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="skeleton-grid">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="status-box error">
          <p>{error}</p>
        </div>
      )}

      {/* Product Grid */}
      {!loading && !error && filtered.length > 0 && (
        <div className="product-grid">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {/* No Results */}
      {!loading && !error && filtered.length === 0 && products.length > 0 && (
        <div className="no-results">
          <span className="no-results-icon">🔎</span>
          <h3>Không tìm thấy sản phẩm</h3>
          <p>Không có sản phẩm nào khớp với từ khóa "{search}". Hãy thử tìm kiếm với từ khóa khác.</p>
        </div>
      )}

      {/* Empty State - No products at all */}
      {!loading && !error && products.length === 0 && (
        <div className="empty-state">
          <h2>Chưa có sản phẩm</h2>
          <p>Cửa hàng hiện chưa có sản phẩm nào. Vui lòng quay lại sau!</p>
        </div>
      )}
    </section>
  );
}
