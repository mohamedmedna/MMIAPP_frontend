import React, { useState } from 'react';
import { Form, Input, Button, Typography, Alert, Divider } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import Header from './Header';
import Footer from './Footer';
import banniereMinistere from '../assets/banniere-ministere.jpg';
import '../Styles/LoginAntd.css';
import { useTranslation } from 'react-i18next';

const { Title, Text } = Typography;

export default function LoginDRMNE() {
  const { t } = useTranslation();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    setError('');
    setLoading(true);
    
    try {
      // Utiliser l'endpoint DRMNE/PMNE avec role_id 11
      const response = await fetch('http://localhost:4000/api/login/pnme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: values.email,
          mot_de_passe: values.password,
        }),
      });
      
      const data = await response.json();
      
      if (response.ok && data.token && data.user && data.user.role_id === 11) {
        // Stocker le token et les informations utilisateur
        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('token', data.token);
        
        // Rediriger vers le dashboard DRMNE
        window.location.href = '/dashboard-drmne';
      } else if (response.ok && data.user && data.user.role_id !== 11) {
        setError(t('loginDRMNE.error_access'));
      } else {
        setError(data.error || t('loginDRMNE.error_login'));
      }
    } catch (error) {
      setError(t('loginDRMNE.error_network'));
    } finally {
      setLoading(false);
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
          <Title level={3} style={{ color: '#229954' }}>{t('loginDRMNE.title')}</Title>
          <Text style={{ fontSize: 14, color: '#666' }}>
            {t('loginDRMNE.description')}
          </Text>
        </div>
        
        <div className="login-antd-form-container">
          {error && <Alert message={error} type="error" showIcon style={{ marginBottom: 16 }} />}
          
          <Form
            name="login_drmne_form"
            initialValues={{ remember: true }}
            onFinish={onFinish}
            layout="vertical"
            size="large"
          >
            <Form.Item
              label={t('loginDRMNE.identifiant')}
              name="email"
              rules={[
                { required: true, message: t('loginDRMNE.error_identifiant') },
                { 
                  validator: (_, value) => {
                    if (!value) {
                      return Promise.reject(new Error(t('loginDRMNE.error_identifiant')));
                    }
                    // Accepter soit un email soit un identifiant de 8 chiffres
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    const identifiantRegex = /^\d{8}$/;
                    
                    if (emailRegex.test(value) || identifiantRegex.test(value)) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error(t('loginDRMNE.error_identifiant_invalid')));
                  }
                }
              ]}
            >
              <Input 
                prefix={<UserOutlined />} 
                placeholder={t('loginDRMNE.identifiant_placeholder')} 
              />
            </Form.Item>
            
            <Form.Item
              label={t('loginDRMNE.password')}
              name="password"
              rules={[{ required: true, message: t('loginDRMNE.error_password') }]}
            >
              <Input.Password 
                prefix={<LockOutlined />} 
                placeholder={t('loginDRMNE.password')} 
              />
            </Form.Item>
            
            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                block 
                loading={loading} 
                className="login-antd-button"
                style={{ backgroundColor: '#229954', borderColor: '#229954' }}
              >
                {loading ? t('loginDRMNE.connecting') : t('loginDRMNE.submit')}
              </Button>
            </Form.Item>
          </Form>
          
          <div className="login-antd-links">
            <a href="/forgot-password" className="login-antd-link">
              {t('loginDRMNE.forgot_password')}
            </a>
          </div>
          
          <a href="/" className="login-antd-back-home">
            {t('loginDRMNE.back_home')}
          </a>
        </div>
      </div>
      <Footer />
    </>
  );
}


