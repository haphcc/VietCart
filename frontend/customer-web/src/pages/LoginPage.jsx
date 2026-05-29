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
      setError(requestError.response?.data?.message || 'Khong the xu ly yeu cau dang nhap.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="page-section auth-page">
      <div className="auth-panel">
        <div className="auth-copy">
          <p className="section-kicker">Tai khoan VietCart</p>
          <h1>{isRegister ? 'Tao tai khoan moi' : 'Dang nhap'}</h1>
          <p>
            Dang nhap de xem thong bao ca nhan, nhan email xac nhan don hang va su dung
            user_id that tu User Service.
          </p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="segmented-control" aria-label="Auth mode">
            <button
              type="button"
              className={mode === 'login' ? 'active' : ''}
              onClick={() => setMode('login')}
            >
              Dang nhap
            </button>
            <button
              type="button"
              className={mode === 'register' ? 'active' : ''}
              onClick={() => setMode('register')}
            >
              Dang ky
            </button>
          </div>

          {isRegister && (
            <label className="form-field">
              Ho ten
              <input name="name" value={form.name} onChange={updateField} placeholder="Nguyen Van A" />
            </label>
          )}

          <label className="form-field">
            Email
            <input name="email" type="email" value={form.email} onChange={updateField} />
          </label>

          <label className="form-field">
            Mat khau
            <input name="password" type="password" value={form.password} onChange={updateField} />
          </label>

          {isRegister && (
            <>
              <label className="form-field">
                So dien thoai
                <input name="phone" value={form.phone} onChange={updateField} placeholder="0900000000" />
              </label>
              <label className="form-field">
                Dia chi
                <textarea name="address" value={form.address} onChange={updateField} rows="3" />
              </label>
            </>
          )}

          {error && <p className="form-error">{error}</p>}

          <button className="btn btn-primary auth-submit" type="submit" disabled={loading}>
            {loading ? 'Dang xu ly...' : isRegister ? 'Tao tai khoan' : 'Dang nhap'}
          </button>

          <p className="demo-account">
            Tai khoan demo: <strong>demo@vietcart.local</strong> / <strong>123456</strong>
          </p>
        </form>
      </div>
    </section>
  );
}
