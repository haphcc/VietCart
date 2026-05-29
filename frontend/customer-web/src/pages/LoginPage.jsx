import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { userApi } from '../api/userApi.js';
import { saveStoredAuth } from '../utils/authStorage.js';

const initialForm = {
  name: '',
  email: 'demo@vietcart.local',
  password: '123456',
  phone: '',
  address: ''
};

export default function LoginPage() {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const isRegister = mode === 'register';

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = isRegister
        ? form
        : { email: form.email, password: form.password };
      const response = isRegister
        ? await userApi.register(payload)
        : await userApi.login(payload);

      saveStoredAuth(response.data);
      navigate('/notifications');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Không thể xử lý yêu cầu đăng nhập.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="page-section auth-page">
      <div className="auth-panel">
        <div className="auth-copy">
          <p className="section-kicker">Tài khoản VietCart</p>
          <h1>{isRegister ? 'Tạo tài khoản mới' : 'Đăng nhập'}</h1>
          <p>
            Đăng nhập để xem thông báo cá nhân, nhận email xác nhận đơn hàng và sử dụng
            user_id thật từ User Service.
          </p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="segmented-control" aria-label="Auth mode">
            <button
              type="button"
              className={mode === 'login' ? 'active' : ''}
              onClick={() => setMode('login')}
            >
              Đăng nhập
            </button>
            <button
              type="button"
              className={mode === 'register' ? 'active' : ''}
              onClick={() => setMode('register')}
            >
              Đăng ký
            </button>
          </div>

          {isRegister && (
            <label className="form-field">
              Họ tên
              <input name="name" value={form.name} onChange={updateField} placeholder="Nguyễn Văn A" />
            </label>
          )}

          <label className="form-field">
            Email
            <input name="email" type="email" value={form.email} onChange={updateField} />
          </label>

          <label className="form-field">
            Mật khẩu
            <input name="password" type="password" value={form.password} onChange={updateField} />
          </label>

          {isRegister && (
            <>
              <label className="form-field">
                Số điện thoại
                <input name="phone" value={form.phone} onChange={updateField} placeholder="0900000000" />
              </label>
              <label className="form-field">
                Địa chỉ
                <textarea name="address" value={form.address} onChange={updateField} rows="3" />
              </label>
            </>
          )}

          {error && <p className="form-error">{error}</p>}

          <button className="btn btn-primary auth-submit" type="submit" disabled={loading}>
            {loading ? 'Đang xử lý...' : isRegister ? 'Tạo tài khoản' : 'Đăng nhập'}
          </button>

          <p className="demo-account">
            Tài khoản demo: <strong>demo@vietcart.local</strong> / <strong>123456</strong>
          </p>
        </form>
      </div>
    </section>
  );
}
