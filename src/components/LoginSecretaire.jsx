import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import banniereMinistere from '../assets/banniere-ministere.jpg';
import '../Styles/Login.css';
import { useTranslation } from 'react-i18next';

function LoginSecretaire() {
  const { t } = useTranslation();
  const [form, setForm] = useState({ email: '', mot_de_passe: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    try {
      const response = await fetch('http://localhost:4000/api/login/secretaire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (response.ok && data.token && data.user.role_id === 2) {
        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        navigate('/dashboard_secretaire');
      } else if (response.ok && data.user && data.user.role_id !== 2) {
        setError(t('loginSecretaire.error_access'));
      } else {
        setError(data.error || t('loginSecretaire.error_login'));
      }
    } catch (err) {
      setError(t('loginSecretaire.error_network'));
    }
  };

  return (
    <>
      <Header />
      <div className="banniere-ministere" style={{ height: '120px', overflow: 'hidden' }}>
        <img 
          src={banniereMinistere} 
          alt="Bannière Ministère" 
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>
      <div className="login-container">
        <form className="auth-form" onSubmit={handleSubmit}>
          <h2>{t('loginSecretaire.title')}</h2>
          <input
            type="email"
            name="email"
            placeholder={t('loginSecretaire.emailPlaceholder')}
            value={form.email}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="mot_de_passe"
            placeholder={t('loginSecretaire.passwordPlaceholder')}
            value={form.mot_de_passe}
            onChange={handleChange}
            required
          />
          <button type="submit">{t('loginSecretaire.submit')}</button>
          {error && <div className="form-error">{error}</div>}
        </form>
      </div>
      <Footer />
    </>
  );
}

export default LoginSecretaire;
