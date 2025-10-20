import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Input, Button, Alert, Typography, Divider } from 'antd';
import { useTranslation } from 'react-i18next';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../Styles/LoginSecretaireDGI.css';

const { Title, Text } = Typography;

export default function LoginSecretaireDGI() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const baseUrl = window.__APP_CONFIG__.API_BASE;


  const onFinish = async (values) => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${baseUrl}/api/login-secretaire-dgi`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        navigate('/dashboard-secretaire-dgi');
      } else {
        setError(data.error || 'Erreur de connexion.');
      }
    } catch (error) {
      console.error('Erreur de connexion:', error);
      setError('Erreur réseau ou serveur.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <Header />
      
      {/* Bannière Ministère */}
      <div className="banniere-ministere">
        <img 
          src={require('../assets/banniere-ministere.jpg')} 
          alt="Bannière Ministère des Mines et de l'Industrie"
          className="banniere-image"
          onError={(e) => {
            e.target.style.display = 'none';
            console.log('Image bannière non trouvée');
          }}
        />
      </div>
      
      <div className="login-container">
        {/* Bloc d'introduction */}
        <div className="login-intro">
          <Title level={2} style={{ color: '#229954', fontWeight: 'bold' }}>{t('loginsecretairedgi.app_name')}</Title>
          <Title level={4} style={{ color: '#145a32' }}>
            {t('homepage.subtitle')}
          </Title>
          <Text style={{ color: '#666', fontSize: '1rem', textAlign: 'center', display: 'block' }}>
            {t('homepage.sous_titre')}
          </Text>
          <Divider style={{ borderColor: '#229954', margin: '24px 0' }} />
          <Title level={3} style={{ color: '#229954' }}>{t('loginsecretairedgi.title')}</Title>
        </div>
        
        {/* Formulaire */}
        <div className="login-form-container">
          {error && (
            <Alert
              message={error}
              type="error"
              showIcon
              style={{ marginBottom: '20px' }}
            />
          )}
          
          <Form
            name="login"
            onFinish={onFinish}
            layout="vertical"
            size="large"
          >
            <Form.Item
              name="email"
              rules={[
                { required: true, message: t('loginsecretairedgi.error_email') },
                { type: 'email', message: t('loginsecretairedgi.error_email_invalid') }
              ]}
            >
              <Input
                placeholder={t('loginsecretairedgi.email')}
                prefix={<i className="fa fa-envelope" style={{ color: '#229954' }} />}
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[
                { required: true, message: t('loginsecretairedgi.error_password') }
              ]}
            >
              <Input.Password
                placeholder={t('loginsecretairedgi.password')}
                prefix={<i className="fa fa-lock" style={{ color: '#229954' }} />}
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                className="login-submit-btn"
              >
                {loading ? t('loginsecretairedgi.loading') : t('loginsecretairedgi.submit')}
              </Button>
            </Form.Item>
          </Form>

          <div className="login-links">
            <Link to="/forgot-password" className="forgot-link">
              {t('loginsecretairedgi.forgot_password')}
            </Link>
          </div>
        </div>

        {/* Lien de retour */}
        <div className="back-home">
          <Link to="/" className="back-link">
            {t('loginsecretairedgi.back_home')}
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
}
