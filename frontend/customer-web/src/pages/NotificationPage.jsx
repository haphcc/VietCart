import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { notificationApi } from '../api/notificationApi.js';
import NotificationItem from '../components/NotificationItem.jsx';
import { getStoredAuth } from '../utils/authStorage.js';

export default function NotificationPage() {
  const [auth] = useState(() => getStoredAuth());
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const userId = auth?.user?.id;
  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.is_read).length,
    [notifications]
  );

  useEffect(() => {
    if (!userId) return undefined;

    let cancelled = false;

    async function loadNotifications() {
      setLoading(true);
      setError('');

      try {
        const response = await notificationApi.getByUser(userId);
        if (!cancelled) setNotifications(Array.isArray(response.data) ? response.data : []);
      } catch (requestError) {
        if (!cancelled) {
          setError(requestError.response?.data?.message || 'Không thể tải danh sách thông báo.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadNotifications();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  async function markRead(id) {
    const response = await notificationApi.markRead(id);
    setNotifications((current) => current.map((item) => (item.id === id ? response.data : item)));
  }

  async function markAllRead() {
    await notificationApi.markAllRead(userId);
    setNotifications((current) => current.map((item) => ({ ...item, is_read: true })));
  }

  async function deleteNotification(id) {
    await notificationApi.remove(id);
    setNotifications((current) => current.filter((item) => item.id !== id));
  }

  if (!auth?.user) {
    return (
      <section className="page-section notification-page">
        <div className="empty-state">
          <p className="section-kicker">Thông báo cá nhân</p>
          <h1>Cần đăng nhập</h1>
          <p>Đăng nhập bằng User Service để xem thông báo và email gắn với tài khoản của bạn.</p>
          <Link to="/login" className="btn btn-primary">Đăng nhập</Link>
        </div>
      </section>
    );
  }

  return (
    <section className="page-section notification-page">
      <div className="page-heading-row">
        <div>
          <p className="section-kicker">Notification Service</p>
          <h1>Thông báo của {auth.user.name || auth.user.email}</h1>
          <p className="page-subtitle">
            {unreadCount > 0 ? `${unreadCount} thông báo chưa đọc` : 'Tất cả thông báo đã được đọc'}
          </p>
        </div>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={markAllRead}
          disabled={unreadCount === 0 || loading}
        >
          Đọc tất cả
        </button>
      </div>

      {loading && <div className="status-box">Đang tải thông báo...</div>}
      {error && <div className="status-box error">{error}</div>}

      {!loading && !error && notifications.length === 0 && (
        <div className="empty-state">
          <h2>Chưa có thông báo</h2>
          <p>Các thông báo đơn hàng, thanh toán và hệ thống sẽ hiển thị tại đây.</p>
        </div>
      )}

      <div className="notification-list">
        {notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onMarkRead={markRead}
            onDelete={deleteNotification}
          />
        ))}
      </div>
    </section>
  );
}
