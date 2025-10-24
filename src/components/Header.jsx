import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/Logo.png';
import './Navbar.css';
import { useTranslation } from 'react-i18next';

const Navbar = () => {
  const { t, i18n } = useTranslation();

  return (
    <header className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <Link to="/gestion" className="logo-link">
          <img src={logo} alt="Logo Ministère de l'Industrie" className="logo" />
        </Link>

                {/* Navigation Links */}
        <nav className="nav-links">
          <Link to="/" className="nav-link">
            {t('header.portail_industrie')}
          </Link>
          <Link to="/gestion" className="nav-link">
            {t('header.gestion_autorisations')}
          </Link>
          <Link to="/pmne" className="nav-link">
            {t('header.pmne')}
          </Link>
          <Link to="/contact" className="nav-link">
            {t('header.contact')}
          </Link>
    </nav>

        {/* Language and Social Icons */}
        <div className="navbar-right">
          <div className="language-buttons">
            <button
              className={`lang-btn ${i18n.language === 'fr' ? 'selected' : ''}`}
              onClick={() => i18n.changeLanguage('fr')}
            >
              🇫🇷 Français
            </button>
            <button
              className={`lang-btn ${i18n.language === 'en' ? 'selected' : ''}`}
              onClick={() => i18n.changeLanguage('en')}
            >
              🇬🇧 English
            </button>
            <button
              className={`lang-btn ${i18n.language === 'ar' ? 'selected' : ''}`}
              onClick={() => i18n.changeLanguage('ar')}
            >
              🇸🇦 العربية
            </button>
          </div>

          <div className="social-icons">
            <a href="https://chk.me/yxMNFpF" target="_blank" rel="noopener noreferrer" className="social-icon">
              <i className="fab fa-facebook"></i>
            </a>
            <a href="https://chk.me/B2HR41P" target="_blank" rel="noopener noreferrer" className="social-icon">
              <i className="fab fa-linkedin"></i>
            </a>
            <a href="https://mmi.gov.mr/fr/" target="_blank" rel="noopener noreferrer" className="social-icon">
              <i className="fas fa-globe"></i>
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
