import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaInbox, FaPaperPlane, FaSignOutAlt, FaHome } from 'react-icons/fa';
import '../Styles/SecretaireSidebar.css';
import { useTranslation } from 'react-i18next';

export default function SecretaireSidebar({ onLogout }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  // Utilise des chemins uniques pour chaque entrée du menu
  const menu = [
    { label: t('secretaireSidebar.dashboard'), icon: <FaHome />, to: "/dashboard-secretaire" },
    { label: t('secretaireSidebar.newRequests'), icon: <FaInbox />, to: "/dashboard-secretaire?tab=nouvelles" },
    { label: t('secretaireSidebar.transmittedSG'), icon: <FaPaperPlane />, to: "/dashboard-secretaire?tab=transmises" },
  ];

  // Pour que l'onglet actif fonctionne même avec les query params
  const isActive = (to) => {
    // On ne regarde que le pathname pour l'onglet principal
    if (to === "/dashboard-secretaire") {
      return location.pathname === "/dashboard-secretaire" && !location.search;
    }
    // Pour les autres onglets, on compare tout
    return location.pathname + location.search === to;
  };

  return (
    <aside className="secretaire-sidebar">
      <div className="sidebar-title">{t('secretaireSidebar.title')}</div>
      <nav className="sidebar-menu">
        {menu.map((item) => (
          <button
            key={item.to}
            className={`sidebar-link${isActive(item.to) ? " active" : ""}`}
            onClick={() => navigate(item.to)}
            type="button"
          >
            <span className="sidebar-icon">{item.icon}</span>
            {item.label}
          </button>
        ))}
        <button
          className="sidebar-link logout"
          onClick={() => {
            onLogout();
            navigate('/login-secretaire');
          }}
        >
          <span className="sidebar-icon"><FaSignOutAlt /></span>
          {t('secretaireSidebar.logout')}
        </button>
      </nav>
    </aside>
  );
}
