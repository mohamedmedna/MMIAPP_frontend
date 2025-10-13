import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useTranslation } from 'react-i18next';
import banniereMinistere from '../assets/banniere-ministere.jpg';
import '../App.css';
import '../style.css';

function PlateformeGestion() {
  const { i18n } = useTranslation();

  return (
    <>
      <Header />
      <div className="plateforme-gestion-container">
      
      {/* Section Hero */}
      <section className="hero section" role="banner" style={{ 
        backgroundImage: `url(${banniereMinistere})`,
        backgroundPosition: 'center',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat'
      }}>
        <div className="digital-animation" aria-hidden="true">
          <div className="circle big"></div>
          <div className="circle medium"></div>
          <div className="circle small"></div>
        </div>
      </section>

      {/* Section Applications modernes */}
      <section className="apps section" aria-labelledby="apps-title">
        <div className="container">

          <div className="apps-grid">
            {/* Application 1 : Gestion des autorisations industrielles */}
            <article className="app-card animate-fade-in-up delay-0" tabIndex="0">
              <i className="fas fa-file-alt app-icon" aria-hidden="true"></i>
              <h3 className="app-title">Gestion des autorisations</h3>
              <p className="app-desc">
                Digitalisation des processus de demandes d'autorisations numérisées<br/>
                Simplifiez et accélérez la gestion des autorisations industrielles grâce à une plateforme numérique qui optimise le traitement des demandes, réduit les délais et améliore la transparence.
              </p>
            </article>

            {/* Application 2 : Analyse Prédictive */}
            <article className="app-card animate-fade-in-up delay-1" tabIndex="0">
              <i className="fas fa-chart-line app-icon" aria-hidden="true"></i>
              <h3 className="app-title">Analyse Prédictive</h3>
              <p className="app-desc">
                Application de recueil de données pour le programme de Mise à Niveau<br/>
                Exploitez les données collectées en temps réel pour anticiper les besoins des entreprises industrielles et faciliter l'accès aux programmes du Ministère.
              </p>
            </article>

            {/* Application 3 : Portail de l'industrie */}
            <article className="app-card animate-fade-in-up delay-2" tabIndex="0">
              <i className="fas fa-industry app-icon" aria-hidden="true"></i>
              <h3 className="app-title">Portail de l'industrie</h3>
              <p className="app-desc">
                Plateforme de gestion documentaire industrielle<br/>
                Accédez facilement à la documentation et simplifiez les échanges administratifs et techniques via un portail sécurisé et centralisé.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* Section News */}
      <section className="news section" aria-labelledby="news-title">
        <div className="container">
          <h2 className="section-title" id="news-title">Actualités</h2>
          <div className="news-grid">
            <article className="news-card animate-fade-in-up delay-0" tabIndex="0">
              <img src="/assets/news1.jpg" alt="Nouvelle usine numérique" className="news-image" />
              <h3 className="news-title">Inauguration d'une usine numérique</h3>
              <p className="news-excerpt">Une nouvelle usine industrielle équipée des dernières technologies a été inaugurée pour moderniser la production locale.</p>
              <Link to="/news1" className="news-link" aria-label="Lire l'article sur l'inauguration d'une usine numérique">Lire la suite</Link>
            </article>

            <article className="news-card animate-fade-in-up delay-1" tabIndex="0">
              <img src="/assets/news2.jpg" alt="Lancement du portail industriel" className="news-image" />
              <h3 className="news-title">Lancement du Portail de l'Industrie</h3>
              <p className="news-excerpt">Découvrez le nouveau portail numérique pour faciliter l'accès aux services industriels et améliorer la collaboration.</p>
              <Link to="/news2" className="news-link" aria-label="Lire l'article sur le lancement du portail industriel">Lire la suite</Link>
            </article>

            <article className="news-card animate-fade-in-up delay-2" tabIndex="0">
              <img src="/assets/news3.jpg" alt="Formations à la transformation numérique" className="news-image" />
              <h3 className="news-title">Formations à la transformation numérique</h3>
              <p className="news-excerpt">Le ministère organise des sessions de formation visant à développer les compétences numériques dans l'industrie.</p>
              <Link to="/news3" className="news-link" aria-label="Lire l'article sur les formations à la transformation numérique">Lire la suite</Link>
            </article>
          </div>
        </div>
      </section>

      <Footer />
      </div>
    </>
  );
}

export default PlateformeGestion;