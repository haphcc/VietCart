import { Link } from 'react-router-dom';

export default function Header() {
  return (
    <header className="site-header">
      <Link to="/" className="brand">VietCart</Link>
      <nav>
        <Link to="/products">San pham</Link>
        <Link to="/cart">Gio hang</Link>
        <Link to="/orders">Don hang</Link>
        <Link to="/notifications">Thong bao</Link>
      </nav>
    </header>
  );
}

