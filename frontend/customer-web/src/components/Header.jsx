import { NavLink } from 'react-router-dom';

export default function Header() {
  return (
    <header className="site-header">
      <NavLink to="/" className="brand">
        VietCart
        <span className="brand-dot"></span>
      </NavLink>
      <nav>
        <NavLink 
          to="/" 
          className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
          end
        >
          Trang chủ
        </NavLink>
        <NavLink 
          to="/products" 
          className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
        >
          Sản phẩm
        </NavLink>
        <NavLink 
          to="/cart" 
          className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
        >
          Giỏ hàng
        </NavLink>
        <NavLink 
          to="/orders" 
          className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
        >
          Đơn hàng
        </NavLink>
        <NavLink 
          to="/notifications" 
          className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
        >
          Thông báo
        </NavLink>
      </nav>
    </header>
  );
}
