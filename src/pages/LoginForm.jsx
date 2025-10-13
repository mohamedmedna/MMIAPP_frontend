import React, { useState } from 'react';
import { Form, Input, Button, Alert, Typography, Divider } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useTranslation } from 'react-i18next';
import banniereMinistere from '../assets/banniere-ministere.jpg';
import '../Styles/LoginAntd.css';

const { Title, Text } = Typography;

export default function LoginFormAntd({ setUser }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    setError('');
    setLoading(true);
    
    console.log('🔐 Tentative de connexion pour:', values.email);
    
    try {
      const response = await fetch('http://localhost:4000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: values.email,
          mot_de_passe: values.password,
        }),
      });
      
      console.log('📡 Réponse du serveur:', response.status, response.statusText);
      
      const data = await response.json();
      console.log('📦 Données reçues:', data);
      
      if (response.ok && data.token && data.user) {
        console.log('✅ Connexion réussie, stockage des données...');
        
        // Stocker le token et l'utilisateur
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        console.log('💾 Données stockées dans localStorage');
        console.log('👤 Utilisateur:', data.user);
        console.log('🔑 Token:', data.token);
        
        // Mettre à jour l'état
        setUser(data.user);
        
        console.log('🚀 Redirection vers le dashboard...');
        navigate('/dashboard');
      } else {
        console.error('❌ Erreur de connexion:', data.error);
        setError(data.error || t('loginform.error_login', 'Erreur de connexion'));
      }
    } catch (error) {
      console.error('💥 Erreur réseau:', error);
      setError(t('loginform.error_network', 'Erreur réseau ou serveur'));
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
        {/* Bloc d'introduction */}
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
          <Title level={3} style={{ color: '#229954' }}>{t('loginform.title', 'Connexion')}</Title>
        </div>

        {/* Formulaire */}
        <div className="login-antd-form-container">
          {error && <Alert message={error} type="error" showIcon style={{ marginBottom: 16 }} />}
          <Form
            name="login_form"
            initialValues={{ remember: true }}
            onFinish={onFinish}
            layout="vertical"
            size="large"
          >
            <Form.Item
              label={t('loginform.identifiant', 'Identifiant')}
              name="email"
              rules={[
                { required: true, message: t('loginform.error_identifiant', 'Veuillez saisir votre identifiant !') },
                { 
                  validator: (_, value) => {
                    // Accepter soit un email soit un identifiant de 8 chiffres
                    if (!value) {
                      return Promise.reject(new Error(t('loginform.error_identifiant', 'Veuillez saisir votre identifiant !')));
                    }
                    // Vérifier si c'est un email valide
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    // Vérifier si c'est un identifiant de 8 chiffres
                    const identifiantRegex = /^\d{8}$/;
                    
                    if (emailRegex.test(value) || identifiantRegex.test(value)) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error(t('loginform.error_identifiant_invalid', 'Veuillez saisir un email valide ou votre identifiant de 8 chiffres')));
                  }
                }
              ]}
            >
              <Input prefix={<UserOutlined />} placeholder={t('loginform.identifiant_placeholder', 'Email ou Identifiant')} />
            </Form.Item>

            <Form.Item
              label={t('loginform.password', 'Mot de passe')}
              name="password"
              rules={[{ required: true, message: t('loginform.error_password', 'Veuillez saisir votre mot de passe !') }]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder={t('loginform.password', 'Mot de passe')} />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                className="login-antd-button"
                loading={loading}
                block
              >
                {t('loginform.submit', 'Se connecter')}
              </Button>
            </Form.Item>
          </Form>

          <div className="login-antd-links">
            <a href="/forgot-password" className="login-antd-link">
              {t('loginform.forgot_password', 'Mot de passe oublié')}
            </a>
            <span style={{ margin: '0 8px', color: '#666' }}>|</span>
            <a href="/inscription" className="login-antd-link">
              {t('loginform.create_account', 'Créer un compte')}
            </a>
          </div>

          <a href="/" className="login-antd-back-home">
            ← {t('loginform.back_home', 'Retour à l\'accueil')}
          </a>
        </div>
      </div>
      <Footer />
    </>
  );
}
