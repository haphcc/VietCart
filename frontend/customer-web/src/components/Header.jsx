import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AUTH_EVENT, clearStoredAuth, getStoredAuth } from '../utils/authStorage.js';

export default function Header() {
  const [auth, setAuth] = useState(() => getStoredAuth());
  const navigate = useNavigate();

  useEffect(() => {
    const syncAuth = () => setAuth(getStoredAuth());

    window.addEventListener('storage', syncAuth);
    window.addEventListener(AUTH_EVENT, syncAuth);
    return () => {
      window.removeEventListener('storage', syncAuth);
      window.removeEventListener(AUTH_EVENT, syncAuth);
    };
  }, []);

  function handleLogout() {
    clearStoredAuth();
    setAuth(null);
    navigate('/login');
  }

  return (
    <header className="site-header">
      <NavLink to="/" className="brand">
        VietCart
        <span className="brand-dot"></span>
      </NavLink>
      <nav>
        <NavLink
          to="/"
          className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
          end
        >
          Trang chủ
        </NavLink>
        <NavLink
          to="/products"
          className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
        >
          Sản phẩm
        </NavLink>
        <NavLink
          to="/cart"
          className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
        >
          Giỏ hàng
        </NavLink>
        <NavLink
          to="/orders"
          className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
        >
          Đơn hàng
        </NavLink>
        <NavLink
          to="/notifications"
          className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
        >
          Thông báo
        </NavLink>
      </nav>
      <div className="header-auth">
        {auth?.user ? (
          <>
            <NavLink
              to="/profile"
              className={({ isActive }) => isActive ? 'nav-user nav-user-link active' : 'nav-user nav-user-link'}
            >
              {auth.user.name || auth.user.email}
            </NavLink>
            <button type="button" className="btn btn-secondary btn-small" onClick={handleLogout}>
              Đăng xuất
            </button>
          </>
        ) : (
          <NavLink
            to="/login"
            className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
          >
            Đăng nhập
          </NavLink>
        )}
      </div>
    </header>
  );
}
