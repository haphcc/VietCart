import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { userApi } from '../api/userApi.js';
import { getStoredAuth, saveStoredAuth } from '../utils/authStorage.js';

function buildInitialForm(user) {
  return {
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || ''
  };
}

export default function ProfilePage() {
  const [auth, setAuth] = useState(() => getStoredAuth());
  const [form, setForm] = useState(() => buildInitialForm(getStoredAuth()?.user));
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [error, setError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const navigate = useNavigate();

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function updatePasswordField(event) {
    const { name, value } = event.target;
    setPasswordForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await userApi.updateMe({
        name: form.name,
        phone: form.phone,
        address: form.address
      });
      const nextAuth = { ...auth, user: response.data };
      saveStoredAuth(nextAuth);
      setAuth(nextAuth);
      setForm(buildInitialForm(response.data));
      navigate('/notifications');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Không thể cập nhật hồ sơ.');
    } finally {
      setLoading(false);
    }
  }

  async function handlePasswordSubmit(event) {
    event.preventDefault();
    setPasswordLoading(true);
    setPasswordError('');
    setPasswordMessage('');

    try {
      const response = await userApi.changePassword(passwordForm);
      setPasswordForm({
        current_password: '',
        new_password: '',
        confirm_password: ''
      });
      setPasswordMessage(response.data?.message || 'Mật khẩu đã được cập nhật.');
    } catch (requestError) {
      setPasswordError(requestError.response?.data?.message || 'Không thể đổi mật khẩu.');
    } finally {
      setPasswordLoading(false);
    }
  }

  if (!auth?.user) {
    return (
      <section className="page-section profile-page">
        <div className="empty-state">
          <p className="section-kicker">Hồ sơ cá nhân</p>
          <h1>Cần đăng nhập</h1>
          <p>Đăng nhập để xem và cập nhật thông tin tài khoản.</p>
          <Link to="/login" className="btn btn-primary">Đăng nhập</Link>
        </div>
      </section>
    );
  }

  return (
    <section className="page-section profile-page">
      <div className="profile-layout">
        <div className="auth-panel profile-panel">
          <div className="auth-copy">
            <p className="section-kicker">User Service</p>
            <h1>Hồ sơ cá nhân</h1>
            <p>Cập nhật tên, số điện thoại và địa chỉ giao hàng của tài khoản đang đăng nhập.</p>
            <div className="profile-summary">
              <span>Email</span>
              <strong>{form.email}</strong>
            </div>
            <div className="profile-summary">
              <span>Vai trò</span>
              <strong>{auth.user.role || 'customer'}</strong>
            </div>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <label className="form-field">
              Họ tên
              <input name="name" value={form.name} onChange={updateField} />
            </label>

            <label className="form-field">
              Email
              <input name="email" type="email" value={form.email} disabled />
            </label>

            <label className="form-field">
              Số điện thoại
              <input name="phone" value={form.phone} onChange={updateField} placeholder="0900000000" />
            </label>

            <label className="form-field">
              Địa chỉ
              <textarea name="address" value={form.address} onChange={updateField} rows="4" />
            </label>

            {error && <p className="form-error">{error}</p>}

            <button className="btn btn-primary auth-submit" type="submit" disabled={loading}>
              {loading ? 'Đang lưu...' : 'Lưu hồ sơ'}
            </button>
          </form>
        </div>

        <div className="auth-panel profile-panel">
          <div className="auth-copy">
            <p className="section-kicker">Bảo mật</p>
            <h1>Đổi mật khẩu</h1>
            <p>Cập nhật mật khẩu đăng nhập cho tài khoản hiện tại.</p>
          </div>

          <form className="auth-form" onSubmit={handlePasswordSubmit}>
            <label className="form-field">
              Mật khẩu hiện tại
              <input
                name="current_password"
                type="password"
                value={passwordForm.current_password}
                onChange={updatePasswordField}
              />
            </label>

            <label className="form-field">
              Mật khẩu mới
              <input
                name="new_password"
                type="password"
                value={passwordForm.new_password}
                onChange={updatePasswordField}
              />
            </label>

            <label className="form-field">
              Xác nhận mật khẩu mới
              <input
                name="confirm_password"
                type="password"
                value={passwordForm.confirm_password}
                onChange={updatePasswordField}
              />
            </label>

            {passwordError && <p className="form-error">{passwordError}</p>}
            {passwordMessage && (
              <p className="form-success">
                {passwordMessage} Thông báo xác nhận đã được gửi về trang thông báo.
              </p>
            )}

            <button className="btn btn-primary auth-submit" type="submit" disabled={passwordLoading}>
              {passwordLoading ? 'Đang đổi...' : 'Đổi mật khẩu'}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
