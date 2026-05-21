export default function OrderItem({ order }) {
  return (
    <article className="item-card">
      <h3>Don hang #{order?.id || 'N/A'}</h3>
      <p>Trang thai: {order?.status || 'pending'}</p>
    </article>
  );
}

