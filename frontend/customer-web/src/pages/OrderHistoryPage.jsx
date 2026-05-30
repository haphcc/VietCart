import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { orderApi } from '../api/orderApi.js';
import { paymentApi } from '../api/paymentApi.js';
import { getStoredAuth } from '../utils/authStorage.js';

function getCurrentUser() {
  return getStoredAuth()?.user || { id: 1, name: 'Khách hàng' };
}

function formatCurrency(value) {
  return `${Number(value || 0).toLocaleString('vi-VN')}đ`;
}

function formatDateTime(value) {
  if (!value) return 'Chưa có';
  return new Date(value).toLocaleString('vi-VN');
}

function getOrderCode(id) {
  return `#SP-${String(id).padStart(4, '0')}`;
}

const orderStatusLabels = {
  pending: 'Đang xử lý',
  confirmed: 'Đã xác nhận',
  shipping: 'Đang giao hàng',
  completed: 'Đã hoàn thành',
  cancelled: 'Đã hủy'
};

const paymentStatusLabels = {
  pending: 'Chờ thanh toán',
  paid: 'Đã thanh toán',
  failed: 'Thất bại',
  refunded: 'Đã hoàn tiền'
};

const paymentMethodLabels = {
  cod: 'Thanh toán khi nhận hàng',
  bank_transfer: 'Chuyển khoản PayOS',
  momo: 'Ví MoMo',
  vnpay: 'VNPay'
};

function StatusBadge({ status, labels = orderStatusLabels }) {
  return (
    <span className={`status-badge ${status || ''}`}>
      {labels[status] || status || 'Chưa có'}
    </span>
  );
}

function DetailField({ label, value }) {
  return (
    <div className="order-detail-field">
      <span>{label}</span>
      <strong>{value || 'Chưa có'}</strong>
    </div>
  );
}

export default function OrderHistoryPage() {
  const location = useLocation();
  const currentUser = useMemo(() => getCurrentUser(), []);

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [detailsByOrder, setDetailsByOrder] = useState({});
  const [detailLoadingId, setDetailLoadingId] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchOrders() {
      try {
        setLoading(true);
        setError(null);
        const res = await orderApi.getByUser(currentUser.id);
        if (!cancelled) {
          setOrders(res.data);
        }
      } catch (err) {
        console.error('Lỗi khi tải lịch sử đơn hàng:', err);
        if (!cancelled) {
          setError('Không thể tải lịch sử đơn hàng. Vui lòng thử lại sau.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchOrders();
    return () => { cancelled = true; };
  }, [currentUser.id]);

  async function loadOrderDetail(orderId) {
    if (detailsByOrder[orderId]) return;

    try {
      setDetailLoadingId(orderId);
      const [orderRes, paymentRes] = await Promise.all([
        orderApi.getById(orderId),
        paymentApi.getByOrder(orderId).catch(() => ({ data: null }))
      ]);

      setDetailsByOrder((current) => ({
        ...current,
        [orderId]: {
          order: orderRes.data,
          payment: paymentRes.data
        }
      }));
    } catch (err) {
      console.error('Lỗi khi tải chi tiết đơn hàng:', err);
      setDetailsByOrder((current) => ({
        ...current,
        [orderId]: {
          error: 'Không thể tải chi tiết đơn hàng. Vui lòng thử lại.'
        }
      }));
    } finally {
      setDetailLoadingId(null);
    }
  }

  async function toggleOrderDetail(orderId) {
    const nextExpandedId = expandedOrderId === orderId ? null : orderId;
    setExpandedOrderId(nextExpandedId);

    if (nextExpandedId) {
      await loadOrderDetail(orderId);
    }
  }

  async function cancelOrder(orderId) {
    const ok = window.confirm(`Bạn có chắc muốn hủy đơn hàng ${getOrderCode(orderId)}?`);
    if (!ok) return;

    try {
      setActionLoadingId(orderId);
      const res = await orderApi.updateStatus(orderId, 'cancelled');
      const updatedOrder = res.data;

      setOrders((current) => current.map((order) => (
        order.id === orderId ? { ...order, ...updatedOrder } : order
      )));
      setDetailsByOrder((current) => ({
        ...current,
        [orderId]: {
          ...(current[orderId] || {}),
          order: {
            ...(current[orderId]?.order || {}),
            ...updatedOrder
          }
        }
      }));
    } catch (err) {
      console.error('Lỗi khi hủy đơn hàng:', err);
      setError(err.response?.data?.message || 'Không thể hủy đơn hàng. Vui lòng thử lại sau.');
    } finally {
      setActionLoadingId(null);
    }
  }

  return (
    <section className="page-section order-history-page">
      <div className="order-page-heading">
        <div>
          <h1 className="section-title">Lịch sử đơn hàng</h1>
          <p>Kiểm tra trạng thái, sản phẩm đã mua và thông tin thanh toán của từng đơn.</p>
        </div>
        <Link to="/products" className="btn btn-secondary">Tiếp tục mua sắm</Link>
      </div>

      {location.state?.message && (
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

      {!loading && orders.length > 0 && (
        <div className="orders-list">
          {orders.map((order) => {
            const isExpanded = expandedOrderId === order.id;
            const detailState = detailsByOrder[order.id];
            const detail = detailState?.order || order;
            const payment = detailState?.payment;
            const items = detail.items || [];
            const canCancel = ['pending', 'confirmed'].includes(detail.status);
            const paymentMethod = payment?.method || detail.payment_method;

            return (
              <article key={order.id} className={`order-card ${isExpanded ? 'is-expanded' : ''}`}>
                <div className="order-header">
                  <div>
                    <div className="order-id">Đơn hàng <strong>{getOrderCode(order.id)}</strong></div>
                    <div className="order-date">{formatDateTime(order.created_at)}</div>
                  </div>
                  <StatusBadge status={order.status} />
                </div>

                <div className="order-body">
                  <div className="order-summary-metric">
                    <span>Sản phẩm</span>
                    <strong>{Number(order.item_count || items.length || 0)} món</strong>
                  </div>
                  <div className="order-summary-metric">
                    <span>Thanh toán</span>
                    <strong>{paymentMethodLabels[paymentMethod] || 'Chưa có'}</strong>
                  </div>
                  <div className="order-summary-metric">
                    <span>Tổng tiền</span>
                    <strong>{formatCurrency(order.total_amount)}</strong>
                  </div>
                </div>

                {isExpanded && (
                  <div className="order-detail-panel">
                    {detailLoadingId === order.id && (
                      <div className="loading-state order-detail-loading">Đang tải chi tiết đơn hàng...</div>
                    )}

                    {detailState?.error && (
                      <div className="alert-error">{detailState.error}</div>
                    )}

                    {!detailLoadingId && !detailState?.error && (
                      <>
                        <div className="order-detail-grid">
                          <div className="order-detail-box">
                            <h3>Thông tin giao hàng</h3>
                            <DetailField label="Người nhận" value={detail.shipping_name || currentUser.name} />
                            <DetailField label="Số điện thoại" value={detail.shipping_phone} />
                            <DetailField label="Địa chỉ" value={detail.shipping_address} />
                            <DetailField label="Ghi chú" value={detail.shipping_note} />
                          </div>

                          <div className="order-detail-box">
                            <h3>Thông tin đơn hàng</h3>
                            <DetailField label="Mã đơn" value={getOrderCode(detail.id)} />
                            <DetailField label="Ngày tạo" value={formatDateTime(detail.created_at)} />
                            <DetailField label="Cập nhật cuối" value={formatDateTime(detail.updated_at)} />
                            <div className="order-detail-field">
                              <span>Trạng thái đơn</span>
                              <StatusBadge status={detail.status} />
                            </div>
                          </div>

                          <div className="order-detail-box">
                            <h3>Thanh toán</h3>
                            <DetailField label="Phương thức" value={paymentMethodLabels[paymentMethod]} />
                            <div className="order-detail-field">
                              <span>Trạng thái</span>
                              {payment ? (
                                <StatusBadge status={payment.status} labels={paymentStatusLabels} />
                              ) : (
                                <strong>Chưa có</strong>
                              )}
                            </div>
                            <DetailField label="Mã giao dịch" value={payment?.transaction_reference} />
                            <DetailField label="Ngày thanh toán" value={payment?.paid_at ? formatDateTime(payment.paid_at) : null} />
                          </div>
                        </div>

                        <div className="order-detail-box order-products-box">
                          <h3>Sản phẩm đã mua</h3>
                          {items.length === 0 ? (
                            <div className="empty-inline">Chưa có dữ liệu sản phẩm cho đơn hàng này.</div>
                          ) : (
                            <div className="order-product-list">
                              {items.map((item) => (
                                <div key={item.id} className="order-product-row">
                                  <div className="order-product-thumb">
                                    {item.image_url ? (
                                      <img src={item.image_url} alt={item.product_name} />
                                    ) : (
                                      <span>SP</span>
                                    )}
                                  </div>
                                  <div className="order-product-info">
                                    <strong>{item.product_name}</strong>
                                    <span>Mã sản phẩm #{item.product_id}</span>
                                  </div>
                                  <div className="order-product-qty">x{item.quantity}</div>
                                  <div className="order-product-price">
                                    <span>{formatCurrency(item.price)}</span>
                                    <strong>{formatCurrency(item.subtotal)}</strong>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          <div className="order-detail-total">
                            <span>Tổng cộng</span>
                            <strong>{formatCurrency(detail.total_amount)}</strong>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}

                <div className="order-footer">
                  {isExpanded && canCancel && (
                    <button
                      type="button"
                      className="btn-outline-danger btn-sm"
                      onClick={() => cancelOrder(order.id)}
                      disabled={actionLoadingId === order.id}
                    >
                      {actionLoadingId === order.id ? 'Đang hủy...' : 'Hủy đơn'}
                    </button>
                  )}
                  <button
                    type="button"
                    className="btn-outline-primary btn-sm"
                    onClick={() => toggleOrderDetail(order.id)}
                  >
                    {isExpanded ? 'Thu gọn' : 'Xem chi tiết'}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
