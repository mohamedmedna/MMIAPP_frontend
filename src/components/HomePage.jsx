import React from 'react';
import { Link } from 'react-router-dom';
import Header from './Header';
import BanniereMinistere from './BanniereMinistere';
import Footer from './Footer';
import '../App.css';
import { useTranslation } from 'react-i18next';

function HomePage() {
  const { t } = useTranslation();

  return (
    <>
      <Header />
      <div className="homepage-container">
        <div className="ministere-titres">
          <div className="project-title">
            <h1 className="titre-fr">{t('homepage.title')}</h1>
            <div className="project-subtitle">{t('homepage.subtitle')}</div>
          </div>
          <div className="titre-ar">{t('homepage.title_ar')}</div>
          <div className="sous-titre-fr">{t('homepage.sous_titre')}</div>
        </div>
        <main className="main-choix">
          <Link to="/login" className="carte-espace">
            <span className="icon"><i className="fa-solid fa-user-edit"></i></span>
            <h2>{t('homepage.demandeur_space')}</h2>
            <p>{t('homepage.demandeur_desc')}</p>
          </Link>
          <Link to="/admin" className="carte-espace">
            <span className="icon"><i className="fa-solid fa-user-shield"></i></span>
            <h2>{t('homepage.admin_space')}</h2>
            <p>{t('homepage.admin_desc')}</p>
          </Link>
        </main>
      </div>
      <Footer />
    </>
  );
}

export default HomePage;