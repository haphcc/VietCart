export default function CartItem({ item }) {
  return (
    <article className="item-card">
      <h3>{item?.productName || 'San pham trong gio'}</h3>
      <p>So luong: {item?.quantity || 1}</p>
    </article>
  );
}

