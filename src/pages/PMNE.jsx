import React from 'react';
import { Button } from 'antd';
import Header from '../components/Header';
import Footer from '../components/Footer';
import BanniereMinistere from '../components/BanniereMinistere';
import '../Styles/PMNE.css';

function PMNE() {
  return (
    <>
      <Header />
      <div className="full-width-banner-wrapper">
        <BanniereMinistere />
      </div>
      
      <div className="pmne-page">
        {/* Header Section */}
        <div className="pmne-header">
          <h1 className="pmne-title">Présentation du Programme</h1>
          <p className="pmne-description">
            L'objectif du programme de mise à niveau est d'accompagner l'entreprise 
            vers un niveau supérieur de performance à travers un appui technique, 
            financier et organisationnel.
          </p>
        </div>

        {/* Objectifs Principaux */}
        <div className="objectifs-section">
          <h2 className="section-title">Objectifs Principaux</h2>
          <ul className="objectifs-list">
            <li>Améliorer la performance des entreprises</li>
            <li>Moderniser les équipements et process industriels</li>
            <li>Renforcer la compétitivité internationale</li>
            <li>Stimuler l'innovation et la transformation digitale</li>
          </ul>
        </div>

        {/* Types d'Adhésion */}
        <div className="adhesion-section">
          <h2 className="section-title">Types d'Adhésion</h2>
          <div className="adhesion-cards">
            {/* Entreprise */}
            <div className="adhesion-card entreprise">
              <div className="card-icon">🏢</div>
              <h3 className="card-title">Entreprise</h3>
              <p className="card-description">Parcours de mise à niveau complet</p>
            </div>

            {/* Association */}
            <div className="adhesion-card association">
              <div className="card-icon">👥</div>
              <h3 className="card-title">Association</h3>
              <p className="card-description">Accompagnement collectif</p>
            </div>

            {/* Membre Individuel */}
            <div className="adhesion-card individuel">
              <div className="card-icon">👤</div>
              <h3 className="card-title">Membre Individuel</h3>
              <p className="card-description">Parcours personnalisé</p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="cta-section">
          <Button className="cta-button">
            Demander une adhésion au PMN A venir
          </Button>
        </div>
      </div>
      
      <Footer />
    </>
  );
}

export default PMNE;
