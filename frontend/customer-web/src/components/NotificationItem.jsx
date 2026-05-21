export default function NotificationItem({ notification }) {
  return (
    <article className="item-card">
      <h3>{notification?.title || 'Thong bao'}</h3>
      <p>{notification?.message || 'Noi dung thong bao'}</p>
    </article>
  );
}

