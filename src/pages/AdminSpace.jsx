import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Card, Typography, Space, Divider, message } from 'antd';
import '../Styles/AdminSpace.css';
import Header from '../components/Header';
import Footer from '../components/Footer';
import BanniereMinistereCoupee from '../components/BanniereMinistereCoupee';
import '../Styles/AdminSpace.css';
import { useTranslation } from 'react-i18next';

const { Title, Text, Paragraph } = Typography;

const adminRoles = [
  {
    id: 'ministre',
    href: '/login-ministre',
    icon: 'fa-solid fa-user-tie',
    titleKey: 'adminspace.roles.ministre.title',
    descKey: 'adminspace.roles.ministre.desc'
  },
  
  {
    id: 'dgi',
    href: '/login-dgi',
    icon: 'fa-solid fa-landmark',
    titleKey: 'adminspace.roles.dgi.title',
    descKey: 'adminspace.roles.dgi.desc'
  },
  {
    id: 'secretaire-dgi',
    href: '/login-secretaire-dgi',
    icon: 'fa-solid fa-user-edit',
    titleKey: 'adminspace.roles.secretairedgi.title',
    descKey: 'adminspace.roles.secretairedgi.desc'
  },
  {
    id: 'ddpi',
    href: '/login-ddpi',
    icon: 'fa-solid fa-map-location-dot',
    titleKey: 'adminspace.roles.ddpi.title',
    descKey: 'adminspace.roles.ddpi.desc'
  },
  {
    id: 'chef-service',
    href: '/login-chef-service',
    icon: 'fa-solid fa-user-gear',
    titleKey: 'adminspace.roles.chefservice.title',
    descKey: 'adminspace.roles.chefservice.desc'
  },
  {
    id: 'commission',
    href: '/login/commission',
    icon: 'fa-solid fa-users',
    titleKey: 'adminspace.roles.commission.title',
    descKey: 'adminspace.roles.commission.desc'
  },
  {
    id: 'comite',
    href: '/login/comite',
    icon: 'fa-solid fa-user-tie',
    titleKey: 'adminspace.roles.comite.title',
    descKey: 'adminspace.roles.comite.desc'
  },
 
  {
    id: 'secretariat-central',
    href: '/login-secretaire',
    icon: 'fa-solid fa-user-shield',
    titleKey: 'adminspace.roles.secretariatcentral.title',
    descKey: 'adminspace.roles.secretariatcentral.desc'
  },
  {
    id: 'secretariat-general',
    href: '/login-secretaire-general',
    icon: 'fa-solid fa-user-tie',
    titleKey: 'adminspace.roles.secretariatgeneral.title',
    descKey: 'adminspace.roles.secretariatgeneral.desc'
  },
  {
    id: 'drmne-pnme',
    href: '/login-drmne',
    icon: 'fa-solid fa-building',
    titleKey: 'adminspace.roles.drmne.title',
    descKey: 'adminspace.roles.drmne.desc'
  },
  {
    id: 'superadmin',
    href: '/superadmin-login',
    icon: 'fa-solid fa-user-shield',
    titleKey: 'adminspace.roles.superadmin.title',
    descKey: 'adminspace.roles.superadmin.desc'
  },
  
];

function AdminSpace() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  useEffect(() => {
    // Vérifier si l'utilisateur est connecté et son rôle
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    setIsSuperAdmin(user.role_id === 1);
  }, []);

  return (
    <>
      <Header />
      <div className="adminspace-bg">
        <main className="adminspace-main">
          <Title level={1} className="adminspace-title">
            {t('adminspace.title')}
          </Title>
          


          {/* Section des rôles d'administration */}
          <div className="adminspace-roles-section">
            <Title level={3} style={{ textAlign: 'center', marginBottom: '30px', color: '#1890ff' }}>
              {t('adminspace.roles_section_title', 'Accès par Rôle')}
            </Title>
            
            <div className="adminspace-roles-grid">
              {adminRoles.map(role => (
                <Link
                  key={role.id}
                  to={role.href}
                  className="adminspace-role-card"
                  tabIndex="0"
                  aria-label={`${t(role.titleKey)} - ${t(role.descKey)}`}
                >
                  <span className="adminspace-role-icon">
                    <i className={role.icon}></i>
                  </span>
                  <span className="adminspace-role-title">{t(role.titleKey)}</span>
                  <span className="adminspace-role-desc">{t(role.descKey)}</span>
                </Link>
              ))}
            </div>
          </div>

        </main>
        
        <footer className="adminspace-footer">
          &copy; 2025 {t('adminspace.footer')}
        </footer>
      </div>


    </>
  );
}

export default AdminSpace;
