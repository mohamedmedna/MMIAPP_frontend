import React, { useState } from 'react';
import { Form, Input, Button, Typography, Alert, Divider } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import Header from '../components/Header';
import Footer from '../components/Footer';
import banniereMinistere from '../assets/banniere-ministere.jpg';
import '../Styles/LoginAntd.css';
import { useTranslation } from 'react-i18next';

const { Title, Text } = Typography;

export default function LoginSecretaireGeneral() {
  const { t } = useTranslation();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    setError('');
    setLoading(true);
    try {
      const response = await fetch('http://localhost:4000/api/login/secretaire-general', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: values.email,
          mot_de_passe: values.password,
        }),
      });
      const data = await response.json();
      // role_id = 3 pour Secrétaire Général
      if (response.ok && data.token && data.user && data.user.role_id === 3) {
        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        window.location.href = '/dashboard-sg2';
      } else if (response.ok && data.user && data.user.role_id !== 3) {
        setError(t('loginSecretaireGeneral.accessDenied'));
      } else if (response.status === 403) {
        setError(
          <>
            <div>{data.error || "Votre compte n'est pas encore activé."}</div>
            <div style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>
              Vérifiez votre email pour le lien d'activation ou contactez l'administrateur.
            </div>
          </>
        );
      } else {
        setError(data.error || t('loginSecretaireGeneral.loginError'));
      }
    } catch {
      setError(t('loginSecretaireGeneral.networkError'));
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
      <div className="login-container">
        <div className="login-intro">
          <Title level={2} style={{ color: '#229954', fontWeight: 'bold' }}>MMIAPP</Title>
          <Title level={4} style={{ color: '#145a32' }}>
            {t('loginSecretaireGeneral.platformTitle')}
          </Title>
          <Text style={{ fontSize: 18, fontWeight: 500, color: '#333' }}>
            {t('loginSecretaireGeneral.platformTitleAr')}
          </Text>
          <br />
          <Text style={{ fontSize: 14, fontWeight: 400, color: '#666' }}>
            {t('loginSecretaireGeneral.platformSubtitle')}
          </Text>
          <Divider style={{ borderColor: '#229954', margin: '24px 0' }} />
          <Title level={3} style={{ color: '#229954' }}>{t('loginSecretaireGeneral.loginSpace')}</Title>
        </div>

        <div className="login-antd-form-container">
          {error && <Alert message={error} type="error" showIcon style={{ marginBottom: 16 }} />}
          <Form
            name="login_sg_form"
            initialValues={{ remember: true }}
            onFinish={onFinish}
            layout="vertical"
            size="large"
          >
            <Form.Item
              label={t('loginSecretaireGeneral.emailLabel')}
              name="email"
              rules={[
                { required: true, message: t('loginSecretaireGeneral.emailRequired') },
                { type: 'email', message: t('loginSecretaireGeneral.emailInvalid') },
              ]}
            >
              <Input prefix={<UserOutlined />} placeholder={t('loginSecretaireGeneral.emailPlaceholder')} />
            </Form.Item>

            <Form.Item
              label={t('loginSecretaireGeneral.passwordLabel')}
              name="password"
              rules={[{ required: true, message: t('loginSecretaireGeneral.passwordRequired') }]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder={t('loginSecretaireGeneral.passwordPlaceholder')} />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" block loading={loading} className="login-antd-button">
                {t('loginSecretaireGeneral.loginButton')}
              </Button>
            </Form.Item>
          </Form>
          <div className="login-antd-links">
            <a href="/forgot-password" className="login-antd-link">{t('loginSecretaireGeneral.forgotPassword')}</a>
          </div>
          <a href="/" className="login-antd-back-home">← {t('loginSecretaireGeneral.backHome')}</a>
        </div>
      </div>

      <Footer />
    </>
  );
}
