export default function ProductCard({ product }) {
  return (
    <article className="item-card">
      <h3>{product?.name || 'Ten san pham'}</h3>
      <p>{product?.price || 0} VND</p>
    </article>
  );
}

