import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import DashboardLayout from '../components/DashboardLayout';
import {
  BellOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  ClockCircleOutlined,
  ArrowLeftOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { Card, List, Tag, Button, Empty, Spin, Typography, Space, Divider } from 'antd';
import '../Styles/DashboardDemandeur.css';
import '../Styles/DashboardLayout.css';
import '../Styles/NotificationsDemandeur.css';
import '../Styles/DashboardResponsive.css';
import { useTranslation } from 'react-i18next';

const { Title, Text } = Typography;

export default function NotificationsDemandeur({ user, logout }) {
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();

  // Fonction pour charger les notifications
  const loadNotifications = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    if (!showLoading) setRefreshing(true);
    
    try {
      const response = await fetch(`http://localhost:4000/api/notifications?user_id=${user.id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setNotifications(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Erreur lors du chargement des notifications:', error);
      setNotifications([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [user.id]);

  const handleRefresh = () => {
    loadNotifications(false);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'SUCCESS':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'WARNING':
        return <ExclamationCircleOutlined style={{ color: '#faad14' }} />;
      case 'INFO':
        return <InfoCircleOutlined style={{ color: '#1890ff' }} />;
      case 'PENDING':
        return <ClockCircleOutlined style={{ color: '#722ed1' }} />;
      default:
        return <BellOutlined style={{ color: '#1890ff' }} />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'SUCCESS':
        return 'success';
      case 'WARNING':
        return 'warning';
      case 'INFO':
        return 'processing';
      case 'PENDING':
        return 'default';
      default:
        return 'processing';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleViewDemande = (demandeId) => {
    navigate(`/dashboard?demande=${demandeId}`);
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <Header user={user} logout={logout} />
        <div className="loading-container">
          <Spin size="large" />
          <Text>Chargement des notifications...</Text>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <>
      <Header user={user} logout={logout} />
      
      <div className="notifications-demandeur-container">
        {/* Left Panel - Sidebar */}
        <div className="left-panel">
          <div className="sidebar-header">
            <h3>Notifications</h3>
            <p>Centre de notifications</p>
          </div>
          
          <nav className="sidebar-nav">
            <button 
              className="nav-item"
              onClick={() => navigate('/dashboard')}
            >
              <i className="fa fa-arrow-left" style={{ marginRight: '8px' }}></i>
              Retour au Dashboard
            </button>
            
            <button className="nav-item active">
              <i className="fa fa-bell" style={{ marginRight: '8px' }}></i>
              Notifications
            </button>
            
            <button 
              className="nav-item"
              onClick={() => navigate('/nouvelle-demande')}
            >
              <i className="fa fa-plus-circle" style={{ marginRight: '8px' }}></i>
              Nouvelle demande
            </button>
            
            <button 
              className="nav-item"
              onClick={() => navigate('/mes-demandes')}
            >
              <i className="fa fa-list" style={{ marginRight: '8px' }}></i>
              Mes demandes
            </button>
          </nav>

          {/* Bouton de déconnexion */}
          <div className="sidebar-footer">
            <button
              className="nav-item deconnexion-btn"
              onClick={() => navigate('/dashboard')}
            >
              <i className="fa fa-sign-out" style={{ marginRight: '8px' }}></i>
              Retour au Dashboard
            </button>
          </div>
        </div>

        {/* Main Section - Contenu principal */}
        <div className="main-section">
          <div className="dashboard-header">
            <h1 className="dashboard-title">🔔 Mes Notifications</h1>
          </div>
          
          <div className="dashboard-content">
          <div className="notifications-page">
            <div className="page-header">
              <Space>
                <Button 
                  type="text" 
                  icon={<ArrowLeftOutlined />} 
                  onClick={() => navigate('/dashboard')}
                  className="back-button"
                >
                  Retour au Dashboard
                </Button>
                <Title level={2} className="page-title">
                  <BellOutlined /> Mes Notifications
                </Title>
              </Space>
              <Button 
                type="primary" 
                icon={<ReloadOutlined />} 
                onClick={handleRefresh}
                loading={refreshing}
              >
                Actualiser
              </Button>
            </div>

            <Divider />

            {notifications.length === 0 ? (
              <Empty
                description="Aucune notification pour le moment"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            ) : (
              <List
                dataSource={notifications}
                renderItem={(notification) => (
                  <List.Item className="notification-item">
                    <Card className="notification-card">
                      <div className="notification-header">
                        <Space>
                          {getNotificationIcon(notification.type)}
                          <Tag color={getNotificationColor(notification.type)}>
                            {notification.type || 'INFO'}
                          </Tag>
                          <Text type="secondary">
                            {formatDate(notification.created_at)}
                          </Text>
                        </Space>
                      </div>
                      
                      <div className="notification-content">
                        <Title level={4} className="notification-title">
                          {notification.titre || 'Notification'}
                        </Title>
                        <Text className="notification-message">
                          {notification.message || 'Aucun message'}
                        </Text>
                      </div>

                      {notification.demande_id && (
                        <div className="notification-actions">
                          <Button 
                            type="primary" 
                            size="small"
                            onClick={() => handleViewDemande(notification.demande_id)}
                          >
                            Voir la demande
                          </Button>
                        </div>
                      )}
                    </Card>
                  </List.Item>
                )}
              />
            )}
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </>
  );
}
