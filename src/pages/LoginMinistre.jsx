import React, { useState } from 'react';
import { Form, Input, Button, Typography, Alert, Divider } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import Header from '../components/Header';
import Footer from '../components/Footer';
import banniereMinistere from '../assets/banniere-ministere.jpg';
import '../Styles/LoginAntd.css';
import { useTranslation } from 'react-i18next';

const { Title, Text } = Typography;

export default function LoginMinistre() {
  const { t } = useTranslation();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const baseUrl = window.__APP_CONFIG__.API_BASE;


  const onFinish = async (values) => {
    setError('');
    setLoading(true);
    try {
      const response = await fetch(`${baseUrl}/api/login/ministere`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: values.email,
          mot_de_passe: values.password,
        }),
      });
      const data = await response.json();
      // role_id = 9 pour Ministre
      if (response.ok && data.token && data.user && data.user.role_id === 9) {
        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        window.location.href = '/dashboard-ministre';
      } else if (response.ok && data.user && data.user.role_id !== 9) {
        setError(t('loginministre.error_access'));
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
        setError(data.error || t('loginministre.error_login'));
      }
    } catch {
      setError(t('loginministre.error_network'));
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
            {t('homepage.subtitle')}
          </Title>
          <Text style={{ fontSize: 18, fontWeight: 500, color: '#333' }}>
            {t('homepage.title_ar')}
          </Text>
          <br />
          <Text style={{ fontSize: 14, fontWeight: 400, color: '#666' }}>
            {t('homepage.sous_titre')}
          </Text>
          <Divider style={{ borderColor: '#229954', margin: '24px 0' }} />
          <Title level={3} style={{ color: '#229954' }}>{t('loginministre.title')}</Title>
        </div>

        <div className="login-antd-form-container">
          {error && <Alert message={error} type="error" showIcon style={{ marginBottom: 16 }} />}
          <Form
            name="login_ministre_form"
            initialValues={{ remember: true }}
            onFinish={onFinish}
            layout="vertical"
            size="large"
          >
            <Form.Item
              label={t('loginministre.email')}
              name="email"
              rules={[
                { required: true, message: t('loginministre.error_email') },
                { type: 'email', message: t('loginministre.error_email_invalid') },
              ]}
            >
              <Input prefix={<UserOutlined />} placeholder={t('loginministre.email')} />
            </Form.Item>

            <Form.Item
              label={t('loginministre.password')}
              name="password"
              rules={[{ required: true, message: t('loginministre.error_password') }]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder={t('loginministre.password')} />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" block loading={loading} className="login-antd-button">
                {t('loginministre.submit')}
              </Button>
            </Form.Item>
          </Form>
          <div className="login-antd-links">
            <a href="/forgot-password" className="login-antd-link">{t('loginministre.forgot_password')}</a>
          </div>
          <a href="/" className="login-antd-back-home">{t('loginministre.back_home')}</a>
        </div>
      </div>

      <Footer />
    </>
  );
}
