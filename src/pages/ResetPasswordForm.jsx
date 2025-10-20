import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Typography, Alert, Divider } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import { Link, useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import banniereMinistere from '../assets/banniere-ministere.jpg';
import '../Styles/ForgotPassword.css';
import { useTranslation } from 'react-i18next';

function ResetPasswordForm() {
  // On suppose que le token est passé dans l'URL : /reset-password/:token
  const { token } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const baseUrl = window.__APP_CONFIG__.API_BASE;


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!password || !confirm) {
      setError(t('resetPassword.requiredFields'));
      return;
    }
    if (password.length < 8) {
      setError(t('resetPassword.minLength'));
      return;
    }
    if (password !== confirm) {
      setError(t('resetPassword.notMatch'));
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${baseUrl}/api/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password })
      });
      const data = await response.json();

      if (response.ok && data.success) {
        setMessage(t('resetPassword.success'));
        setTimeout(() => navigate('/login'), 2500);
      } else {
        setError(data.error || t('resetPassword.resetError'));
      }
    } catch (err) {
      setError(t('resetPassword.networkError'));
    }
    setLoading(false);
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
      <div className="reset-password-container">
        <div className="forgot-form-wrapper">
          <h2 className="forgot-title">{t('resetPassword.title')}</h2>
          <form onSubmit={handleSubmit} className="forgot-form">
            <div className="forgot-field">
              <label className="forgot-label">{t('resetPassword.newPassword')}</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="forgot-input"
                required
                minLength={8}
                autoComplete="new-password"
              />
            </div>
            <div className="forgot-field">
              <label className="forgot-label">{t('resetPassword.confirmPassword')}</label>
              <input
                type="password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                className="forgot-input"
                required
                minLength={8}
                autoComplete="new-password"
              />
            </div>
            <button type="submit" className="forgot-button" disabled={loading}>
              {loading ? t('resetPassword.loading') : t('resetPassword.button')}
            </button>
          </form>
          {message && <div className="forgot-message">{message}</div>}
          {error && <div className="forgot-error">{error}</div>}
          <p className="forgot-link">
            <Link to="/login" className="forgot-link-text">{t('resetPassword.backToLogin')}</Link>
          </p>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default ResetPasswordForm;
