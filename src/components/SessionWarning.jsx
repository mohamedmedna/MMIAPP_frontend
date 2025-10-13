import React, { useEffect, useState } from 'react';
import { Modal, Button, Typography, Space, message } from 'antd';
import { ExclamationCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useAuth } from '../hooks/useAuth';
import { AUTH_MESSAGES } from '../config/auth';

const { Text, Title } = Typography;

const SessionWarning = ({ warningThreshold = 10 * 60 * 1000 }) => { // 10 minutes par défaut
  const { logout, refreshAuth } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    const checkSessionExpiry = () => {
      const token = localStorage.getItem('adminToken');
      if (!token) return;

      try {
        // Décoder le token JWT pour obtenir l'expiration
        const payload = JSON.parse(atob(token.split('.')[1]));
        const expiryTime = payload.exp * 1000; // Convertir en millisecondes
        const currentTime = Date.now();
        const timeUntilExpiry = expiryTime - currentTime;

        if (timeUntilExpiry <= warningThreshold && timeUntilExpiry > 0) {
          setTimeLeft(Math.ceil(timeUntilExpiry / 1000)); // Convertir en secondes
          setIsVisible(true);
        } else if (timeUntilExpiry <= 0) {
          // Session expirée, déconnexion automatique
          logout();
        }
      } catch (error) {
        console.error('❌ [SessionWarning] Erreur lors de la vérification du token:', error);
      }
    };

    // Vérifier toutes les minutes
    const interval = setInterval(checkSessionExpiry, 60 * 1000);
    
    // Vérification initiale
    checkSessionExpiry();

    return () => clearInterval(interval);
  }, [warningThreshold, logout]);

  useEffect(() => {
    if (isVisible && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(prev => prev - 1);
        if (timeLeft <= 1) {
          setIsVisible(false);
          logout();
        }
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [isVisible, timeLeft, logout]);

  const handleExtendSession = () => {
    // Ici, vous pourriez appeler une API pour rafraîchir le token
    // Pour l'instant, on ferme juste le modal
    setIsVisible(false);
    message.success('Session maintenue active');
  };

  const handleLogout = () => {
    setIsVisible(false);
    logout();
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <Modal
      title={
        <Space>
          <ExclamationCircleOutlined style={{ color: '#faad14' }} />
          <span>Avertissement de session</span>
        </Space>
      }
      open={isVisible}
      onCancel={handleExtendSession}
      footer={[
        <Button key="extend" type="primary" onClick={handleExtendSession}>
          Maintenir la session
        </Button>,
        <Button key="logout" danger onClick={handleLogout}>
          Se déconnecter
        </Button>,
      ]}
      closable={false}
      maskClosable={false}
      width={500}
    >
      <div style={{ textAlign: 'center', padding: '20px 0' }}>
        <ClockCircleOutlined style={{ fontSize: '48px', color: '#faad14', marginBottom: '16px' }} />
        <Title level={4} style={{ marginBottom: '16px' }}>
          Votre session va expirer
        </Title>
        <Text style={{ fontSize: '16px', display: 'block', marginBottom: '16px' }}>
          {AUTH_MESSAGES.SESSION_EXPIRED}
        </Text>
        <div style={{ 
          background: '#fff2e8', 
          border: '1px solid #ffd591', 
          borderRadius: '8px', 
          padding: '16px',
          marginBottom: '16px'
        }}>
          <Text strong style={{ fontSize: '18px', color: '#d46b08' }}>
            Temps restant : {formatTime(timeLeft)}
          </Text>
        </div>
        <Text type="secondary" style={{ fontSize: '14px' }}>
          Cliquez sur "Maintenir la session" pour rester connecté, ou "Se déconnecter" pour fermer la session maintenant.
        </Text>
      </div>
    </Modal>
  );
};

export default SessionWarning;
