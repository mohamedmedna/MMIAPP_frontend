import React from 'react';
import './Navbar.css';
// @ts-ignore
import logo from '../assets/Logo.png';
import { useTranslation } from 'react-i18next';

const Navbar = () => {
  const { t } = useTranslation();
  return (
    <header className="navbar">
      <div className="navbar-left">
        <img src={logo} alt={t('navbar.logoAlt')} className="navbar-logo" />
      </div>
      <nav className="navbar-nav">
        <a href="/" className="nav-link">{t('navbar.home')}</a>
        <a href="#" className="nav-link">{t('navbar.menu')}</a>
        <a href="#" className="nav-link">{t('navbar.contact')}</a>
        <a href="#" className="nav-link">{t('navbar.admin')}</a>
      </nav>
      <div className="navbar-right">
        <div className="lang-switch">
          <span className="lang-btn selected">{t('navbar.fr')}</span>
          <span className="lang-btn">{t('navbar.en')}</span>
          <span className="lang-btn">{t('navbar.ar')}</span>
        </div>
        <div className="social-icons">
          <a href="#"><i className="fab fa-facebook"></i></a>
          <a href="#"><i className="fab fa-linkedin"></i></a>
          <a href="#"><i className="fas fa-globe"></i></a>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
