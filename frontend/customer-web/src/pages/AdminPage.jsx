import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { orderApi } from '../api/orderApi.js';
import { paymentApi } from '../api/paymentApi.js';
import { productApi } from '../api/productApi.js';
import { userApi } from '../api/userApi.js';
import { getStoredAuth } from '../utils/authStorage.js';

const tabs = [
  { id: 'users', label: 'Người dùng' },
  { id: 'products', label: 'Sản phẩm' },
  { id: 'orders', label: 'Đơn hàng' }
];

const orderStatuses = [
  { value: 'pending', label: 'Đang xử lý' },
  { value: 'confirmed', label: 'Đã xác nhận' },
  { value: 'shipping', label: 'Đang giao' },
  { value: 'completed', label: 'Hoàn thành' },
  { value: 'cancelled', label: 'Đã hủy' }
];

const emptyUserForm = {
  name: '',
  email: '',
  password: '123456',
  phone: '',
  address: '',
  role: 'customer',
  is_active: true
};

const emptyProductForm = {
  name: '',
  description: '',
  price: '',
  stock: '',
  image_url: ''
};

function formatCurrency(value) {
  return `${Number(value || 0).toLocaleString('vi-VN')}đ`;
}

function formatDateTime(value) {
  if (!value) return 'Chưa có';
  return new Date(value).toLocaleString('vi-VN');
}

function getOrderCode(id) {
  return `#VC-${String(id).padStart(5, '0')}`;
}

function getErrorMessage(error, fallback) {
  return error.response?.data?.message || fallback;
}

function normalizeText(value) {
  return String(value || '').toLowerCase().trim();
}

function StatusBadge({ status }) {
  const label = orderStatuses.find((item) => item.value === status)?.label || status || 'Chưa có';
  return <span className={`status-badge ${status || ''}`}>{label}</span>;
}

export default function AdminPage() {
  const auth = getStoredAuth();
  const isAdmin = auth?.user?.role === 'admin';

  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [payments, setPayments] = useState([]);
  const [detailsByOrder, setDetailsByOrder] = useState({});
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [search, setSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [editingUserId, setEditingUserId] = useState(null);
  const [editingProductId, setEditingProductId] = useState(null);
  const [userForm, setUserForm] = useState(emptyUserForm);
  const [productForm, setProductForm] = useState(emptyProductForm);

  useEffect(() => {
    if (!isAdmin) return;

    let cancelled = false;

    async function loadDashboard() {
      try {
        setLoading(true);
        setError('');
        const [userRes, productRes, orderRes] = await Promise.all([
          userApi.adminList(),
          productApi.getAll(),
          orderApi.getAll()
        ]);

        if (!cancelled) {
          setUsers(userRes.data);
          setProducts(productRes.data);
          setOrders(orderRes.data);
        }

        const paymentResults = await Promise.all(
          orderRes.data.map((order) => (
            paymentApi.getByOrder(order.id)
              .then((response) => response.data)
              .catch(() => null)
          ))
        );

        if (!cancelled) {
          setPayments(paymentResults.filter(Boolean));
        }
      } catch (requestError) {
        if (!cancelled) {
          setError(getErrorMessage(requestError, 'Không thể tải dữ liệu quản trị.'));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadDashboard();
    return () => { cancelled = true; };
  }, [isAdmin]);

  const userMap = useMemo(() => {
    return users.reduce((map, user) => {
      map.set(Number(user.id), user);
      return map;
    }, new Map());
  }, [users]);

  const filteredUsers = useMemo(() => {
    const keyword = normalizeText(search);
    return users.filter((user) => {
      if (!keyword) return true;
      return [user.name, user.email, user.phone, user.role].some((value) => normalizeText(value).includes(keyword));
    });
  }, [search, users]);

  const filteredProducts = useMemo(() => {
    const keyword = normalizeText(search);
    return products.filter((product) => {
      if (!keyword) return true;
      return [product.name, product.description, product.id].some((value) => normalizeText(value).includes(keyword));
    });
  }, [products, search]);

  const filteredOrders = useMemo(() => {
    const keyword = normalizeText(search);
    return orders.filter((order) => {
      const user = userMap.get(Number(order.user_id));
      const matchesStatus = orderStatusFilter === 'all' || order.status === orderStatusFilter;
      const matchesSearch = !keyword || [
        getOrderCode(order.id),
        order.id,
        order.user_id,
        order.shipping_name,
        order.shipping_phone,
        user?.name,
        user?.email,
        order.status
      ].some((value) => normalizeText(value).includes(keyword));

      return matchesStatus && matchesSearch;
    });
  }, [orderStatusFilter, orders, search, userMap]);

  const metrics = useMemo(() => {
    const activeUsers = users.filter((user) => Boolean(user.is_active)).length;
    const lowStock = products.filter((product) => Number(product.stock) <= 5).length;
    const openOrders = orders.filter((order) => ['pending', 'confirmed', 'shipping'].includes(order.status)).length;
    const revenue = payments
      .filter((payment) => payment?.status === 'paid')
      .reduce((sum, payment) => sum + Number(payment.amount || 0), 0);

    return { activeUsers, lowStock, openOrders, revenue };
  }, [orders, payments, products, users]);

  function showMessage(text) {
    setMessage(text);
    setError('');
  }

  function showError(text) {
    setError(text);
    setMessage('');
  }

  function updateUserField(event) {
    const { name, type, checked, value } = event.target;
    setUserForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value
    }));
  }

  function updateProductField(event) {
    const { name, value } = event.target;
    setProductForm((current) => ({ ...current, [name]: value }));
  }

  function resetUserForm() {
    setEditingUserId(null);
    setUserForm(emptyUserForm);
  }

  function resetProductForm() {
    setEditingProductId(null);
    setProductForm(emptyProductForm);
  }

  function editUser(user) {
    setActiveTab('users');
    setEditingUserId(user.id);
    setUserForm({
      name: user.name || '',
      email: user.email || '',
      password: '',
      phone: user.phone || '',
      address: user.address || '',
      role: user.role || 'customer',
      is_active: Boolean(user.is_active)
    });
  }

  function editProduct(product) {
    setActiveTab('products');
    setEditingProductId(product.id);
    setProductForm({
      name: product.name || '',
      description: product.description || '',
      price: String(product.price || ''),
      stock: String(product.stock || ''),
      image_url: product.image_url || ''
    });
  }

  async function saveUser(event) {
    event.preventDefault();

    try {
      setActionLoading('user-save');
      const payload = { ...userForm };
      if (editingUserId && !payload.password) {
        delete payload.password;
      }

      const response = editingUserId
        ? await userApi.adminUpdate(editingUserId, payload)
        : await userApi.adminCreate(payload);

      setUsers((current) => {
        if (editingUserId) {
          return current.map((user) => (user.id === editingUserId ? response.data : user));
        }
        return [response.data, ...current];
      });
      resetUserForm();
      showMessage(editingUserId ? 'Đã cập nhật tài khoản.' : 'Đã tạo tài khoản mới.');
    } catch (requestError) {
      showError(getErrorMessage(requestError, 'Không thể lưu tài khoản.'));
    } finally {
      setActionLoading('');
    }
  }

  async function deleteUser(user) {
    const ok = window.confirm(`Xóa tài khoản ${user.email}? Tài khoản sẽ bị vô hiệu hóa.`);
    if (!ok) return;

    try {
      setActionLoading(`user-delete-${user.id}`);
      await userApi.adminDelete(user.id);
      setUsers((current) => current.map((item) => (
        item.id === user.id ? { ...item, is_active: false } : item
      )));
      showMessage('Đã vô hiệu hóa tài khoản.');
    } catch (requestError) {
      showError(getErrorMessage(requestError, 'Không thể xóa tài khoản.'));
    } finally {
      setActionLoading('');
    }
  }

  async function saveProduct(event) {
    event.preventDefault();

    try {
      setActionLoading('product-save');
      const payload = {
        ...productForm,
        price: Number(productForm.price),
        stock: Number(productForm.stock)
      };

      const response = editingProductId
        ? await productApi.update(editingProductId, payload)
        : await productApi.create(payload);

      setProducts((current) => {
        if (editingProductId) {
          return current.map((product) => (product.id === editingProductId ? response.data : product));
        }
        return [response.data, ...current];
      });
      resetProductForm();
      showMessage(editingProductId ? 'Đã cập nhật sản phẩm.' : 'Đã thêm sản phẩm mới.');
    } catch (requestError) {
      showError(getErrorMessage(requestError, 'Không thể lưu sản phẩm.'));
    } finally {
      setActionLoading('');
    }
  }

  async function deleteProduct(product) {
    const ok = window.confirm(`Xóa sản phẩm "${product.name}"?`);
    if (!ok) return;

    try {
      setActionLoading(`product-delete-${product.id}`);
      await productApi.remove(product.id);
      setProducts((current) => current.filter((item) => item.id !== product.id));
      showMessage('Đã xóa sản phẩm.');
    } catch (requestError) {
      showError(getErrorMessage(requestError, 'Không thể xóa sản phẩm.'));
    } finally {
      setActionLoading('');
    }
  }

  async function toggleOrderDetail(orderId) {
    const nextId = expandedOrderId === orderId ? null : orderId;
    setExpandedOrderId(nextId);

    if (!nextId || detailsByOrder[orderId]) return;

    try {
      setActionLoading(`order-detail-${orderId}`);
      const response = await orderApi.getById(orderId);
      setDetailsByOrder((current) => ({ ...current, [orderId]: response.data }));
    } catch (requestError) {
      showError(getErrorMessage(requestError, 'Không thể tải chi tiết đơn hàng.'));
    } finally {
      setActionLoading('');
    }
  }

  async function changeOrderStatus(orderId, status) {
    try {
      setActionLoading(`order-status-${orderId}`);
      const response = await orderApi.updateStatus(orderId, status);
      setOrders((current) => current.map((order) => (
        order.id === orderId ? { ...order, ...response.data } : order
      )));
      setDetailsByOrder((current) => ({
        ...current,
        [orderId]: {
          ...(current[orderId] || {}),
          ...response.data
        }
      }));
      showMessage(`Đã cập nhật trạng thái ${getOrderCode(orderId)}.`);
    } catch (requestError) {
      showError(getErrorMessage(requestError, 'Không thể cập nhật trạng thái đơn hàng.'));
    } finally {
      setActionLoading('');
    }
  }

  if (!auth?.user) {
    return (
      <section className="page-section admin-page">
        <div className="empty-state">
          <p className="section-kicker">Admin</p>
          <h1>Cần đăng nhập</h1>
          <p>Đăng nhập bằng tài khoản quản trị để mở bảng điều khiển.</p>
          <Link to="/login" className="btn btn-primary">Đăng nhập</Link>
        </div>
      </section>
    );
  }

  if (!isAdmin) {
    return (
      <section className="page-section admin-page">
        <div className="empty-state">
          <p className="section-kicker">Admin</p>
          <h1>Không có quyền truy cập</h1>
          <p>Tài khoản hiện tại không có vai trò admin.</p>
          <Link to="/" className="btn btn-secondary">Về trang chủ</Link>
        </div>
      </section>
    );
  }

  return (
    <section className="page-section admin-page">
      <div className="admin-topbar">
        <div>
          <p className="section-kicker">VietCart Admin</p>
          <h1>Bảng điều khiển quản trị</h1>
          <p>Quản lý tài khoản, sản phẩm và trạng thái đơn hàng từ một màn hình.</p>
        </div>
        <div className="admin-operator">
          <span>Đang đăng nhập</span>
          <strong>{auth.user.name || auth.user.email}</strong>
        </div>
      </div>

      <div className="admin-metrics">
        <div className="admin-metric">
          <span>Người dùng hoạt động</span>
          <strong>{metrics.activeUsers}</strong>
        </div>
        <div className="admin-metric">
          <span>Sản phẩm sắp hết</span>
          <strong>{metrics.lowStock}</strong>
        </div>
        <div className="admin-metric">
          <span>Đơn đang mở</span>
          <strong>{metrics.openOrders}</strong>
        </div>
        <div className="admin-metric">
          <span>Doanh thu</span>
          <strong>{formatCurrency(metrics.revenue)}</strong>
        </div>
      </div>

      <div className="admin-toolbar">
        <div className="admin-tabs" role="tablist" aria-label="Admin sections">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={activeTab === tab.id ? 'active' : ''}
              onClick={() => {
                setActiveTab(tab.id);
                setSearch('');
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="admin-search-row">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Tìm theo tên, email, mã đơn..."
            aria-label="Tìm kiếm trong trang admin"
          />
          {activeTab === 'orders' && (
            <select
              value={orderStatusFilter}
              onChange={(event) => setOrderStatusFilter(event.target.value)}
              aria-label="Lọc trạng thái đơn hàng"
            >
              <option value="all">Tất cả trạng thái</option>
              {orderStatuses.map((status) => (
                <option key={status.value} value={status.value}>{status.label}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {message && <div className="admin-alert success">{message}</div>}
      {error && <div className="admin-alert error">{error}</div>}
      {loading && <div className="status-box">Đang tải dữ liệu quản trị...</div>}

      {!loading && activeTab === 'users' && (
        <div className="admin-workspace">
          <form className="admin-form-panel" onSubmit={saveUser}>
            <div className="admin-panel-heading">
              <h2>{editingUserId ? 'Sửa tài khoản' : 'Thêm tài khoản'}</h2>
              {editingUserId && (
                <button type="button" className="btn btn-secondary btn-small" onClick={resetUserForm}>
                  Hủy sửa
                </button>
              )}
            </div>

            <label className="form-field">
              Họ tên
              <input name="name" value={userForm.name} onChange={updateUserField} required />
            </label>
            <label className="form-field">
              Email
              <input name="email" type="email" value={userForm.email} onChange={updateUserField} required />
            </label>
            <label className="form-field">
              Mật khẩu {editingUserId ? 'mới' : ''}
              <input
                name="password"
                type="password"
                value={userForm.password}
                onChange={updateUserField}
                placeholder={editingUserId ? 'Để trống nếu không đổi' : 'Tối thiểu 6 ký tự'}
                required={!editingUserId}
              />
            </label>
            <label className="form-field">
              Số điện thoại
              <input name="phone" value={userForm.phone} onChange={updateUserField} />
            </label>
            <label className="form-field">
              Địa chỉ
              <textarea name="address" value={userForm.address} onChange={updateUserField} rows="3" />
            </label>
            <div className="admin-form-grid">
              <label className="form-field">
                Vai trò
                <select name="role" value={userForm.role} onChange={updateUserField}>
                  <option value="customer">Khách hàng</option>
                  <option value="admin">Admin</option>
                </select>
              </label>
              <label className="admin-check-field">
                <input
                  name="is_active"
                  type="checkbox"
                  checked={userForm.is_active}
                  onChange={updateUserField}
                />
                Đang hoạt động
              </label>
            </div>
            <button className="btn btn-primary" type="submit" disabled={actionLoading === 'user-save'}>
              {actionLoading === 'user-save' ? 'Đang lưu...' : editingUserId ? 'Lưu tài khoản' : 'Tạo tài khoản'}
            </button>
          </form>

          <div className="admin-table-panel">
            <div className="admin-panel-heading">
              <h2>Danh sách tài khoản</h2>
              <span>{filteredUsers.length} tài khoản</span>
            </div>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Tài khoản</th>
                    <th>Liên hệ</th>
                    <th>Vai trò</th>
                    <th>Trạng thái</th>
                    <th>Cập nhật</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id}>
                      <td>
                        <strong>{user.name}</strong>
                        <span>#{user.id} · {user.email}</span>
                      </td>
                      <td>
                        <span>{user.phone || 'Chưa có số điện thoại'}</span>
                        <span>{user.address || 'Chưa có địa chỉ'}</span>
                      </td>
                      <td><span className={`admin-pill ${user.role}`}>{user.role}</span></td>
                      <td>
                        <span className={`admin-pill ${user.is_active ? 'active' : 'inactive'}`}>
                          {user.is_active ? 'Hoạt động' : 'Đã khóa'}
                        </span>
                      </td>
                      <td>{formatDateTime(user.updated_at)}</td>
                      <td>
                        <div className="admin-actions">
                          <button type="button" className="btn btn-secondary btn-small" onClick={() => editUser(user)}>
                            Sửa
                          </button>
                          <button
                            type="button"
                            className="btn btn-secondary btn-small danger"
                            onClick={() => deleteUser(user)}
                            disabled={!user.is_active || actionLoading === `user-delete-${user.id}`}
                          >
                            Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {!loading && activeTab === 'products' && (
        <div className="admin-workspace">
          <form className="admin-form-panel" onSubmit={saveProduct}>
            <div className="admin-panel-heading">
              <h2>{editingProductId ? 'Sửa sản phẩm' : 'Thêm sản phẩm'}</h2>
              {editingProductId && (
                <button type="button" className="btn btn-secondary btn-small" onClick={resetProductForm}>
                  Hủy sửa
                </button>
              )}
            </div>

            <label className="form-field">
              Tên sản phẩm
              <input name="name" value={productForm.name} onChange={updateProductField} required />
            </label>
            <label className="form-field">
              Mô tả
              <textarea name="description" value={productForm.description} onChange={updateProductField} rows="4" />
            </label>
            <div className="admin-form-grid">
              <label className="form-field">
                Giá
                <input name="price" type="number" min="0" value={productForm.price} onChange={updateProductField} required />
              </label>
              <label className="form-field">
                Tồn kho
                <input name="stock" type="number" min="0" value={productForm.stock} onChange={updateProductField} required />
              </label>
            </div>
            <label className="form-field">
              Ảnh sản phẩm
              <input name="image_url" value={productForm.image_url} onChange={updateProductField} placeholder="/images/products/product-1.jpg" />
            </label>
            <button className="btn btn-primary" type="submit" disabled={actionLoading === 'product-save'}>
              {actionLoading === 'product-save' ? 'Đang lưu...' : editingProductId ? 'Lưu sản phẩm' : 'Thêm sản phẩm'}
            </button>
          </form>

          <div className="admin-table-panel">
            <div className="admin-panel-heading">
              <h2>Kho sản phẩm</h2>
              <span>{filteredProducts.length} sản phẩm</span>
            </div>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Sản phẩm</th>
                    <th>Giá</th>
                    <th>Tồn kho</th>
                    <th>Ảnh</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => (
                    <tr key={product.id}>
                      <td>
                        <strong>{product.name}</strong>
                        <span>#{product.id} · {product.description || 'Chưa có mô tả'}</span>
                      </td>
                      <td>{formatCurrency(product.price)}</td>
                      <td>
                        <span className={`admin-pill ${Number(product.stock) <= 5 ? 'low-stock' : 'active'}`}>
                          {Number(product.stock)} còn lại
                        </span>
                      </td>
                      <td>
                        <div className="admin-product-thumb">
                          {product.image_url ? <img src={product.image_url} alt={product.name} /> : <span>SP</span>}
                        </div>
                      </td>
                      <td>
                        <div className="admin-actions">
                          <button type="button" className="btn btn-secondary btn-small" onClick={() => editProduct(product)}>
                            Sửa
                          </button>
                          <button
                            type="button"
                            className="btn btn-secondary btn-small danger"
                            onClick={() => deleteProduct(product)}
                            disabled={actionLoading === `product-delete-${product.id}`}
                          >
                            Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {!loading && activeTab === 'orders' && (
        <div className="admin-orders">
          <div className="admin-panel-heading">
            <h2>Trạng thái đơn hàng</h2>
            <span>{filteredOrders.length} đơn hàng</span>
          </div>

          <div className="admin-order-list">
            {filteredOrders.map((order) => {
              const detail = detailsByOrder[order.id] || order;
              const user = userMap.get(Number(order.user_id));
              const isExpanded = expandedOrderId === order.id;
              const items = detail.items || [];

              return (
                <article key={order.id} className={`admin-order-row ${isExpanded ? 'is-expanded' : ''}`}>
                  <div className="admin-order-summary">
                    <div>
                      <strong>{getOrderCode(order.id)}</strong>
                      <span>{user?.name || order.shipping_name || `User #${order.user_id}`}</span>
                    </div>
                    <div>
                      <span>Ngày tạo</span>
                      <strong>{formatDateTime(order.created_at)}</strong>
                    </div>
                    <div>
                      <span>Tổng tiền</span>
                      <strong>{formatCurrency(order.total_amount)}</strong>
                    </div>
                    <div>
                      <span>Trạng thái</span>
                      <StatusBadge status={order.status} />
                    </div>
                    <div className="admin-order-controls">
                      <select
                        value={order.status}
                        onChange={(event) => changeOrderStatus(order.id, event.target.value)}
                        disabled={actionLoading === `order-status-${order.id}`}
                        aria-label={`Cập nhật trạng thái ${getOrderCode(order.id)}`}
                      >
                        {orderStatuses.map((status) => (
                          <option key={status.value} value={status.value}>{status.label}</option>
                        ))}
                      </select>
                      <button
                        type="button"
                        className="btn btn-secondary btn-small"
                        onClick={() => toggleOrderDetail(order.id)}
                      >
                        {isExpanded ? 'Thu gọn' : 'Chi tiết'}
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="admin-order-detail">
                      {actionLoading === `order-detail-${order.id}` ? (
                        <div className="status-box">Đang tải chi tiết đơn hàng...</div>
                      ) : (
                        <>
                          <div className="admin-detail-grid">
                            <div>
                              <span>Người nhận</span>
                              <strong>{detail.shipping_name || user?.name || 'Chưa có'}</strong>
                            </div>
                            <div>
                              <span>Số điện thoại</span>
                              <strong>{detail.shipping_phone || user?.phone || 'Chưa có'}</strong>
                            </div>
                            <div>
                              <span>Địa chỉ</span>
                              <strong>{detail.shipping_address || user?.address || 'Chưa có'}</strong>
                            </div>
                            <div>
                              <span>Thanh toán</span>
                              <strong>{detail.payment_method || 'Chưa có'}</strong>
                            </div>
                          </div>

                          <div className="admin-order-items">
                            {items.length === 0 ? (
                              <div className="empty-inline">Chưa có dữ liệu sản phẩm cho đơn hàng này.</div>
                            ) : (
                              items.map((item) => (
                                <div key={item.id} className="admin-order-item">
                                  <div className="admin-product-thumb">
                                    {item.image_url ? <img src={item.image_url} alt={item.product_name} /> : <span>SP</span>}
                                  </div>
                                  <div>
                                    <strong>{item.product_name || `Sản phẩm #${item.product_id}`}</strong>
                                    <span>x{item.quantity} · {formatCurrency(item.price)}</span>
                                  </div>
                                  <strong>{formatCurrency(item.subtotal)}</strong>
                                </div>
                              ))
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
