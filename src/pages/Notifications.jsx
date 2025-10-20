import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import {
  HomeOutlined,
  PlusCircleOutlined,
  FolderOpenOutlined,
  LogoutOutlined,
  ReloadOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BellOutlined
} from '@ant-design/icons';
import '../Styles/DashboardDemandeur.css';
import '../Styles/DashboardLayout.css';
import { useTranslation } from 'react-i18next';

export default function Notifications({ user, logout }) {
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [demandes, setDemandes] = useState([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const [activeMenu, setActiveMenu] = useState('/notifications');
  const baseUrl = window.__APP_CONFIG__.API_BASE;


  useEffect(() => {
    setActiveMenu(location.pathname);
  }, [location.pathname]);

  // Fonction pour charger les notifications
  const loadNotifications = async (showLoading = true) => {
    if (!user?.id) return;
    
    if (showLoading) setLoading(true);
    if (!showLoading) setRefreshing(true);
    
    try {
      const response = await fetch(`${baseUrl}/api/notifications?user_id=${user.id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      setNotifications(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('❌ Erreur lors du chargement des notifications:', error);
      setNotifications([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Fonction pour charger les demandes (pour les badges)
  const loadDemandes = async () => {
    if (!user?.id) return;
    
    try {
      const response = await fetch(`${baseUrl}/api/mes-demandes?user_id=${user.id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      setDemandes(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('❌ Erreur lors du chargement des demandes:', error);
      setDemandes([]);
    }
  };

  // Charger les données au montage
  useEffect(() => {
    if (!user || !user.id) {
      navigate('/login');
      return;
    }
    
    loadNotifications();
    loadDemandes();
  }, [user, navigate]);

  // Fonction pour actualiser les données
  const handleRefresh = () => {
    console.log('🔄 Rafraîchissement manuel déclenché');
    loadNotifications(false);
    loadDemandes();
  };

  // Fonction pour basculer le sidebar
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Fonction pour basculer le menu mobile
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Fonction pour fermer le menu mobile
  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  // Fonction pour marquer une notification comme lue
  const markAsRead = async (notificationId) => {
    try {
      const response = await fetch(`${baseUrl}/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        // Mettre à jour l'état local
        setNotifications(prev => 
          prev.map(n => 
            n.id === notificationId ? { ...n, lu: true } : n
          )
        );
      }
    } catch (error) {
      console.error('❌ Erreur lors du marquage comme lu:', error);
    }
  };

  if (!user || !user.prenom || !user.nom) {
    return <div>Chargement du profil...</div>;
  }

  return (
    <div className="dashboard-layout">
      <Header />
      <div className="dashboard-body">
        {/* Bouton mobile pour ouvrir/fermer le menu */}
        <button 
          className="mobile-menu-toggle"
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
        >
          <MenuUnfoldOutlined />
        </button>

        {/* Overlay pour fermer le menu mobile */}
        {mobileMenuOpen && (
          <div className="mobile-menu-overlay" onClick={closeMobileMenu}></div>
        )}

        {/* Sidebar à gauche */}
        <nav className={`dashboard-sidebar ${sidebarCollapsed ? 'collapsed' : ''} ${mobileMenuOpen ? 'mobile-open' : ''}`}>
          <div className="sidebar-header">
            <div className="sidebar-title">
              {!sidebarCollapsed && t('dashboardDemandeur.sidebar.title')}
            </div>
            <button 
              className="sidebar-toggle"
              onClick={toggleSidebar}
              aria-label="Toggle sidebar"
            >
              {sidebarCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            </button>
          </div>
          
          <div className="sidebar-menu">
            <Link
              className={`sidebar-link${activeMenu === '/dashboard' ? ' active' : ''}`}
              to="/dashboard"
              onClick={closeMobileMenu}
            >
              <HomeOutlined /> 
              {!sidebarCollapsed && <span>{t('dashboardDemandeur.sidebar.dashboard')}</span>}
            </Link>
            
            <Link
              className={`sidebar-link${activeMenu === '/mes-demandes' ? ' active' : ''}`}
              to="/mes-demandes"
              onClick={closeMobileMenu}
            >
              <FolderOpenOutlined /> 
              {!sidebarCollapsed && (
                <>
                  <span>{t('dashboardDemandeur.sidebar.demandes')}</span>
                  {demandes.length > 0 && (
                    <span className="sidebar-badge">{demandes.length}</span>
                  )}
                </>
              )}
            </Link>

            <Link
              className={`sidebar-link${activeMenu === '/notifications' ? ' active' : ''}`}
              to="/notifications"
              onClick={closeMobileMenu}
            >
              <BellOutlined /> 
              {!sidebarCollapsed && (
                <>
                  <span>{t('dashboardDemandeur.sidebar.notifications')}</span>
                  {notifications.filter(n => !n.lu).length > 0 && (
                    <span className="sidebar-badge notification-badge">
                      {notifications.filter(n => !n.lu).length}
                    </span>
                  )}
                </>
              )}
            </Link>
            
            <button className="sidebar-link logout-link" onClick={logout}>
              <LogoutOutlined /> 
              {!sidebarCollapsed && <span>{t('dashboardDemandeur.sidebar.logout')}</span>}
            </button>
          </div>
        </nav>

        {/* Contenu principal */}
        <main className={`dashboard-main-content ${sidebarCollapsed ? 'with-sidebar-collapsed' : 'with-sidebar'}`}>
          <div className="dashboard-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h1>Mes notifications</h1>
              <button 
                onClick={handleRefresh}
                disabled={refreshing}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 18px',
                  border: refreshing ? '2px solid #dee2e6' : '2px solid #17a2b8',
                  borderRadius: '8px',
                  background: refreshing ? '#f8f9fa' : 'linear-gradient(135deg, #17a2b8, #138496)',
                  cursor: refreshing ? 'not-allowed' : 'pointer',
                  color: refreshing ? '#6c757d' : 'white',
                  fontWeight: '500',
                  fontSize: '0.9em',
                  transition: 'all 0.3s ease',
                  boxShadow: refreshing ? 'none' : '0 2px 4px rgba(23, 162, 184, 0.3)'
                }}
              >
                <ReloadOutlined spin={refreshing} />
                {refreshing ? 'Actualisation...' : 'Actualiser'}
              </button>
            </div>

            {/* Actions rapides */}
            <div className="dashboard-actions">
              <Link to="/nouvelle-demande" className="dashboard-btn dashboard-btn-primary">
                <PlusCircleOutlined /> Nouvelle demande
              </Link>
              <Link to="/dashboard" className="dashboard-btn dashboard-btn-secondary">
                <HomeOutlined /> Retour au tableau de bord
              </Link>
            </div>

            {/* Liste des notifications */}
            <div className="dashboard-notifications">
              <h2>Historique des notifications</h2>
              {loading ? (
                <div>Chargement...</div>
              ) : notifications.length === 0 ? (
                <div className="no-demandes">
                  <p>Aucune notification.</p>
                  <p>Vous recevrez des notifications ici quand vos demandes seront traitées.</p>
                </div>
              ) : (
                <div className="notifications-list">
                  {notifications.map(notification => (
                    <div 
                      key={notification.id} 
                      className={`notification-item ${!notification.lu ? 'unread' : ''}`}
                      onClick={() => !notification.lu && markAsRead(notification.id)}
                    >
                      <div className="notification-content">
                        <div className="notification-message">
                          {notification.message}
                        </div>
                        <div className="notification-meta">
                          <span className="notification-date">
                            {new Date(notification.created_at).toLocaleString('fr-FR')}
                          </span>
                          {!notification.lu && (
                            <span className="notification-status">
                              <i className="fa fa-circle"></i> Non lue
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
} 