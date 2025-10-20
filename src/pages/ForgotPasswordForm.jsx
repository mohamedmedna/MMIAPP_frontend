import React, { useState } from 'react';
import { Form, Input, Button, Typography, Alert, Divider } from 'antd';
import { MailOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import banniereMinistere from '../assets/banniere-ministere.jpg';
import '../Styles/ForgotPassword.css';
import { useTranslation } from 'react-i18next';

function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const baseUrl = window.__APP_CONFIG__.API_BASE;


  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);
    try {
      const response = await fetch(`${baseUrl}/api/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setMessage("Un email de réinitialisation vous a été envoyé.");
      } else {
        setError(data.error || "Erreur lors de la demande.");
      }
    } catch (err) {
      setError("Erreur réseau ou serveur.");
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
      <div className="forgot-password-container">
        <div className="forgot-form-wrapper">
          <h2 className="forgot-title">Mot de passe oublié</h2>
          <form onSubmit={handleSubmit} className="forgot-form">
            <div className="forgot-field">
              <label className="forgot-label">Email</label>
              <input
                type="email"
                name="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="forgot-input"
              />
            </div>
            <button type="submit" className="forgot-button" disabled={loading}>
              {loading ? "Envoi..." : "Envoyer"}
            </button>
          </form>
          {message && <div className="forgot-message">{message}</div>}
          {error && <div className="forgot-error">{error}</div>}
          <p className="forgot-link">
            <Link to="/login" className="forgot-link-text">Retour à la connexion</Link>
          </p>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default ForgotPasswordForm;
