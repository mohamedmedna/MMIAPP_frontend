import React from 'react';
import { Link } from 'react-router-dom';
import './SecretaireGeneralDemo.css';

const SecretaireGeneralDemo = () => {
  return (
    <div className="demo-container">
      <div className="demo-header">
        <h1>🚀 Démonstration - Page Secrétaire Général</h1>
        <p>Interface complète pour la gestion des autorisations industrielles</p>
      </div>

      <div className="demo-content">
        <div className="demo-section">
          <h2>✨ Fonctionnalités implémentées</h2>
          <div className="features-grid">
            <div className="feature-card">
              <h3>📊 Tableau de bord</h3>
              <ul>
                <li>Statistiques en temps réel</li>
                <li>Demandes récentes</li>
                <li>Vue d'ensemble</li>
              </ul>
            </div>
            
            <div className="feature-card">
              <h3>📋 Gestion des demandes</h3>
              <ul>
                <li>Liste des demandes à traiter</li>
                <li>Filtrage par statut</li>
                <li>Détails complets</li>
              </ul>
            </div>
            
            <div className="feature-card">
              <h3>🔄 Actions</h3>
              <ul>
                <li>Transmission au Ministre</li>
                <li>Transmission à la DGI</li>
                <li>Ajout d'annotations</li>
              </ul>
            </div>
            
            <div className="feature-card">
              <h3>📈 Historique</h3>
              <ul>
                <li>Suivi des actions</li>
                <li>Historique global</li>
                <li>Traçabilité complète</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="demo-section">
          <h2>🔗 Intégration backend</h2>
          <div className="api-endpoints">
            <div className="endpoint">
              <span className="method get">GET</span>
              <span className="url">/api/demandes-a-traiter</span>
              <span className="description">Liste des demandes</span>
            </div>
            <div className="endpoint">
              <span className="method get">GET</span>
              <span className="url">/api/demande/:id</span>
              <span className="description">Détails d'une demande</span>
            </div>
            <div className="endpoint">
              <span className="method post">POST</span>
              <span className="url">/api/demande/:id/transmettre</span>
              <span className="description">Transmission au Ministre</span>
            </div>
            <div className="endpoint">
              <span className="method post">POST</span>
              <span className="url">/api/demande/:id/transmettre-dgi</span>
              <span className="description">Transmission à la DGI</span>
            </div>
            <div className="endpoint">
              <span className="method post">POST</span>
              <span className="url">/api/demande/:id/annoter</span>
              <span className="description">Ajout d'annotation</span>
            </div>
          </div>
        </div>

        <div className="demo-section">
          <h2>🎨 Design et UX</h2>
          <div className="design-features">
            <div className="design-item">
              <h4>🎯 Layout responsive</h4>
              <p>Adaptation automatique aux différentes tailles d'écran</p>
            </div>
            <div className="design-item">
              <h4>🎨 Interface moderne</h4>
              <p>Design épuré avec animations et transitions fluides</p>
            </div>
            <div className="design-item">
              <h4>🔒 Sécurisé</h4>
              <p>Authentification JWT et routes protégées</p>
            </div>
            <div className="design-item">
              <h4>🌐 Internationalisation</h4>
              <p>Support multilingue (FR, EN, AR)</p>
            </div>
          </div>
        </div>

        <div className="demo-section">
          <h2>🚀 Tester la page</h2>
          <div className="demo-actions">
            <Link to="/secretaire-general" className="demo-btn primary">
              Accéder à la page Secrétaire Général
            </Link>
            <Link to="/login-secretaire-general" className="demo-btn secondary">
              Page de connexion
            </Link>
          </div>
          <div className="demo-note">
            <p><strong>Note :</strong> La page est protégée et nécessite une connexion en tant que Secrétaire Général.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecretaireGeneralDemo;
