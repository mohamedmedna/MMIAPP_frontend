import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  HomeOutlined,
  PlusCircleOutlined,
  FolderOpenOutlined,
  LogoutOutlined,
  BellOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  FileTextOutlined,
  UserOutlined
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import Footer from './Footer';
import '../Styles/DashboardLayoutOptimization.css';

export default function DashboardLayout({ children, user, logout, demandes = [], notifications = [] }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState('/dashboard');
  const [localDemandes, setLocalDemandes] = useState([]);
  const [localNotifications, setLocalNotifications] = useState([]);

  useEffect(() => {
    setActiveMenu(location.pathname);
  }, [location.pathname]);

  // Charger les demandes si elles ne sont pas fournies
  useEffect(() => {
    if (demandes.length === 0 && user?.id) {
      loadDemandes();
    } else {
      setLocalDemandes(demandes);
    }
  }, [demandes, user?.id]);

  // Charger les notifications si elles ne sont pas fournies
  useEffect(() => {
    if (notifications.length === 0 && user?.id) {
      loadNotifications();
    } else {
      setLocalNotifications(notifications);
    }
  }, [notifications, user?.id]);

  // Fonction pour charger les demandes
  const loadDemandes = async () => {
    try {
      const response = await fetch(`http://localhost:4000/api/mes-demandes?user_id=${user.id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setLocalDemandes(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des demandes:', error);
    }
  };

  // Fonction pour charger les notifications
  const loadNotifications = async () => {
    try {
      const response = await fetch(`http://localhost:4000/api/notifications?user_id=${user.id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setLocalNotifications(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des notifications:', error);
    }
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

  return (
    <div className="dashboard-layout">
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

      <div className="dashboard-body">
        <aside className={`dashboard-sidebar ${sidebarCollapsed ? 'collapsed' : ''} ${mobileMenuOpen ? 'mobile-open' : ''}`}>
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
                  {localDemandes.length > 0 && (
                    <span className="sidebar-badge">{localDemandes.length}</span>
                  )}
                </>
              )}
            </Link>

            <Link
              className={`sidebar-link${activeMenu === '/suivi-demandes' ? ' active' : ''}`}
              to="/suivi-demandes"
              onClick={closeMobileMenu}
            >
              <FileTextOutlined /> 
              {!sidebarCollapsed && (
                <>
                  <span>Suivi des Demandes</span>
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
                  {localNotifications.filter(n => !n.lu).length > 0 && (
                    <span className="sidebar-badge notification-badge">
                      {localNotifications.filter(n => !n.lu).length}
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
        </aside>
        
        <main className={`dashboard-main-content ${sidebarCollapsed ? 'with-sidebar-collapsed' : 'with-sidebar'}`}>
          {children}
        </main>
      </div>
      
      <Footer />
    </div>
  );
} 