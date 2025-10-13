import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import banniereMinistere from '../assets/banniere-ministere.jpg';
import '../App.css';
import { useTranslation } from 'react-i18next';

function VerifyEmail() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (token) {
      fetch(`http://localhost:4000/api/verify-email?token=${token}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) setMessage(data.success);
          else setError(data.error || t('verifyEmail.expired'));
        })
        .catch(() => setError(t('verifyEmail.networkError')));
    } else {
      setError(t('verifyEmail.invalidLink'));
    }
  }, [token, t]);

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
      <div className="verify-email-container">
        <div className="auth-box">
          <h2 className="auth-title">{t('verifyEmail.title')}</h2>
          {error && <div className="form-error"><i className="fa fa-exclamation-circle"></i>{error}</div>}
          {message && (
            <div className="form-success">
              <i className="fa fa-check-circle"></i>
              {message}
              <br />
              <Link to="/login" className="register-link">{t('verifyEmail.login')}</Link>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}

export default VerifyEmail;
