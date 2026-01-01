import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/Logo.png';
import './Navbar.css';
import { useTranslation } from 'react-i18next';

const Navbar = () => {
  const { t, i18n } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 992);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 992);
      if (window.innerWidth > 992) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isMenuOpen && !e.target.closest('.navbar')) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isMenuOpen]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <header className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <Link to="/gestion" className="logo-link" onClick={closeMenu}>
          <img src={logo} alt="Logo Ministère de l'Industrie" className="logo" />
        </Link>

        {/* Hamburger Button - Mobile Only */}
        {isMobile && (
          <button 
            className={`hamburger ${isMenuOpen ? 'active' : ''}`}
            onClick={toggleMenu}
            aria-label="Toggle menu"
            aria-expanded={isMenuOpen}
          >
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
          </button>
        )}

        {/* Mobile Menu Overlay */}
        {isMobile && isMenuOpen && (
          <div className="mobile-overlay" onClick={closeMenu}></div>
        )}

        {/* Navigation Links */}
        <nav className={`nav-links ${isMobile ? 'mobile' : ''} ${isMenuOpen ? 'open' : ''}`}>
          <Link to="/" className="nav-link" onClick={closeMenu}>
            {t('header.portail_industrie')}
          </Link>
          <Link to="/gestion" className="nav-link" onClick={closeMenu}>
            {t('header.gestion_autorisations')}
          </Link>
          <Link to="/pmne" className="nav-link" onClick={closeMenu}>
            {t('header.pmne')}
          </Link>
          <Link to="/contact" className="nav-link" onClick={closeMenu}>
            {t('header.contact')}
          </Link>

          {/* Language and Social Icons - Inside mobile menu */}
          {isMobile && (
            <div className="navbar-right-mobile">
              <div className="language-buttons">
                <button
                  className={`lang-btn ${i18n.language === 'fr' ? 'selected' : ''}`}
                  onClick={() => { i18n.changeLanguage('fr'); closeMenu(); }}
                >
                  FR
                </button>
                <button
                  className={`lang-btn ${i18n.language === 'en' ? 'selected' : ''}`}
                  onClick={() => { i18n.changeLanguage('en'); closeMenu(); }}
                >
                  EN
                </button>
                <button
                  className={`lang-btn ${i18n.language === 'ar' ? 'selected' : ''}`}
                  onClick={() => { i18n.changeLanguage('ar'); closeMenu(); }}
                >
                  AR
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
          )}
        </nav>

        {/* Language and Social Icons - Desktop Only */}
        {!isMobile && (
          <div className="navbar-right">
            <div className="language-buttons">
              <button
                className={`lang-btn ${i18n.language === 'fr' ? 'selected' : ''}`}
                onClick={() => i18n.changeLanguage('fr')}
              >
                FR
              </button>
              <button
                className={`lang-btn ${i18n.language === 'en' ? 'selected' : ''}`}
                onClick={() => i18n.changeLanguage('en')}
              >
                EN
              </button>
              <button
                className={`lang-btn ${i18n.language === 'ar' ? 'selected' : ''}`}
                onClick={() => i18n.changeLanguage('ar')}
              >
                AR
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
        )}
      </div>
    </header>
  );
};

export default Navbar;
