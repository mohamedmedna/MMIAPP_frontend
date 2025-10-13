import React, { useState } from 'react';
import Header from './Header';
import BanniereMinistere from './BanniereMinistere';
import Footer from './Footer';
import { Link } from 'react-router-dom';
import '../App.css';
import { useTranslation } from 'react-i18next';

function ForgotPasswordForm() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (!email) {
      setError(t('forgot_password.error_required'));
      return;
    }
    try {
      const response = await fetch('http://localhost:4000/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setMessage(data.success);
        setEmail('');
      } else {
        setError(data.error || t('forgot_password.error_request'));
      }
    } catch (err) {
      setError(t('forgot_password.error_network'));
    }
  };

  return (
    <>
      <Header />
      <BanniereMinistere />
      <div className="ministere-titres">
        <div className="project-title">
          <h1 className="titre-fr">{t('homepage.title')}</h1>
          <div className="project-subtitle">{t('homepage.subtitle')}</div>
        </div>
        <div className="titre-ar">{t('homepage.title_ar')}</div>
        <div className="sous-titre-fr">{t('homepage.sous_titre')}</div>
      </div>
      <div className="auth-container">
        <div className="auth-box">
          <form className="auth-form" onSubmit={handleSubmit}>
            <h2 className="auth-title">{t('forgot_password.title')}</h2>
            <div className="form-group">
              <label htmlFor="email" className="auth-label">{t('forgot_password.email_label')}</label>
              <input
                id="email"
                name="email"
                type="email"
                className="auth-input"
                placeholder={t('forgot_password.email_placeholder')}
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <button type="submit" className="auth-button">{t('forgot_password.send')}</button>
            {error && <div className="form-error"><i className="fa fa-exclamation-circle"></i>{error}</div>}
            {message && <div className="form-success"><i className="fa fa-check-circle"></i>{message}</div>}
            <div className="auth-links">
              <Link to="/login" className="register-link">{t('forgot_password.back_to_login')}</Link>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default ForgotPasswordForm;
