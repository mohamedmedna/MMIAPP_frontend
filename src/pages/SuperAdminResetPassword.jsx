import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

function SuperAdminResetPassword() {
  const baseUrl = window.__APP_CONFIG__.API_BASE;
  const { t } = useTranslation();
  const { token } = useParams();
  const [password, setPassword] = useState('');
  const [notif, setNotif] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async e => {
    e.preventDefault();
    setNotif('');
    setError('');
    try {
      const response = await fetch(`${baseUrl}/api/admin-reset-password/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nouveau_mot_de_passe: password }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setNotif(t('superAdminResetPassword.success'));
      } else {
        setError(data.error || t('superAdminResetPassword.resetError'));
      }
    } catch {
      setError(t('superAdminResetPassword.networkError'));
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <form className="auth-form" onSubmit={handleSubmit}>
          <h2 className="auth-title">{t('superAdminResetPassword.title')}</h2>
          <div className="form-group">
            <label className="auth-label">{t('superAdminResetPassword.newPassword')}</label>
            <input
              type="password"
              className="auth-input"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="auth-button">{t('superAdminResetPassword.button')}</button>
          {notif && <div className="form-success">{notif}</div>}
          {error && <div className="form-error">{error}</div>}
          <Link to="/superadmin-login" className="forgot-password">{t('superAdminResetPassword.backToLogin')}</Link>
        </form>
      </div>
    </div>
  );
}

export default SuperAdminResetPassword;
