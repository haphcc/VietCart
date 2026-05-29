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
          Trang chu
        </NavLink>
        <NavLink
          to="/products"
          className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
        >
          San pham
        </NavLink>
        <NavLink
          to="/cart"
          className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
        >
          Gio hang
        </NavLink>
        <NavLink
          to="/orders"
          className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
        >
          Don hang
        </NavLink>
        <NavLink
          to="/notifications"
          className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
        >
          Thong bao
        </NavLink>
      </nav>
      <div className="header-auth">
        {auth?.user ? (
          <>
            <span className="nav-user">{auth.user.name || auth.user.email}</span>
            <button type="button" className="btn btn-secondary btn-small" onClick={handleLogout}>
              Dang xuat
            </button>
          </>
        ) : (
          <NavLink
            to="/login"
            className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
          >
            Dang nhap
          </NavLink>
        )}
      </div>
    </header>
  );
}
