export default function NotificationItem({ notification, onMarkRead, onDelete }) {
  const isRead = Boolean(notification?.is_read);
  const createdAt = notification?.created_at
    ? new Date(notification.created_at).toLocaleString('vi-VN')
    : '';

  return (
    <article className={`notification-item ${isRead ? 'is-read' : 'is-unread'}`}>
      <div className="notification-main">
        <div className="notification-title-row">
          <span className="notification-type">{notification?.type || 'system'}</span>
          {!isRead && <span className="unread-dot" aria-label="Unread"></span>}
        </div>
        <h3>{notification?.title || 'Thong bao'}</h3>
        <p>{notification?.message || 'Noi dung thong bao'}</p>
        {createdAt && <time>{createdAt}</time>}
      </div>

      <div className="notification-actions">
        <button
          type="button"
          className="btn btn-secondary btn-small"
          onClick={() => onMarkRead(notification.id)}
          disabled={isRead}
        >
          Da doc
        </button>
        <button
          type="button"
          className="btn btn-secondary btn-small danger"
          onClick={() => onDelete(notification.id)}
        >
          Xoa
        </button>
      </div>
    </article>
  );
}
