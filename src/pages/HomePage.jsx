import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import BanniereMinistere from '../components/BanniereMinistere';
import '../App.css';
import '../style.css';
import { useTranslation } from 'react-i18next';

function HomePage() {
  const { t } = useTranslation();
  return (
    <>
      <Header />
      
      {/* Bannière du ministère */}
      <BanniereMinistere />
      
      {/* Section principale */}
      <div className="homepage-container">

        {/* Section des espaces */}
        <div className="spaces-section">
          <div className="space-card">
            <div className="space-icon">
              <i className="fas fa-desktop"></i>
              <i className="fas fa-mobile-alt"></i>
            </div>
            <h2 className="space-title">{t('homepage.demandeur_space')}</h2>
            <p className="space-description">{t('homepage.demandeur_desc')}</p>
            <Link to="/login" className="space-link">{t('homepage.acceder')}</Link>
          </div>

          <div className="space-card">
            <div className="space-icon">
              <i className="fas fa-desktop"></i>
            </div>
            <h2 className="space-title">{t('homepage.admin_space')}</h2>
            <p className="space-description">{t('homepage.admin_desc')}</p>
            <Link to="/admin-code-verification" className="space-link">{t('homepage.acceder')}</Link>
          </div>


        </div>
      </div>

      <Footer />
    </>
  );
}

export default HomePage;

