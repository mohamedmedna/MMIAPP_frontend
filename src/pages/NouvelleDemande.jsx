import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import FormUsine from './FormUsine';
import FormBoulangerie from './FormBoulangerie';
import FormEauMinerale from './FormEauMinerale';
import FormPMNE from './FormPMNE';
import FormExtension from './FormExtension';
import '../Styles/NouvelleDemande.css';
import { useTranslation } from 'react-i18next';

const FORMULAIRES = {
  usine: FormUsine,
  boulangerie: FormBoulangerie,
  eaux: FormEauMinerale,
  pnme: FormPMNE,
  extension: FormExtension
};

// Configuration des types de demandes avec icônes et descriptions
const TYPES_DEMANDES = [
  {
    id: 'usine',
    icon: '🏭',
    title: 'Usine',
    description: 'Demande d\'autorisation pour usine',
    color: '#1890ff'
  },
  {
    id: 'boulangerie',
    icon: '🥖',
    title: 'Boulangerie',
    description: 'Demande d\'autorisation pour boulangerie',
    color: '#52c41a'
  },
  {
    id: 'eaux',
    icon: '💧',
    title: 'Eaux Minérales',
    description: 'Demande d\'autorisation pour eaux minérales',
    color: '#722ed1'
  },
  {
    id: 'pnme',
    icon: '🏢',
    title: 'PMNE',
    description: 'Demande d\'autorisation pour PMNE',
    color: '#fa8c16'
  },
  {
    id: 'extension',
    icon: '📈',
    title: 'Extension',
    description: 'Demande d\'extension d\'activité',
    color: '#eb2f96'
  }
];

function NouvelleDemande({ user }) {
  const { t } = useTranslation();
  const [type, setType] = useState('');
  const [notif, setNotif] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleTypeSelect = (selectedType) => {
    setType(selectedType);
    setNotif('');
    setError('');
  };

  const FormComponent = FORMULAIRES[type];

  return (
    <>
      <Header />
      
      <div className="nouvelle-demande-container">
        {/* Left Panel - Sidebar */}
        <div className="left-panel">
          <div className="sidebar-header">
            <h3>Nouvelle Demande</h3>
            <p>Créer une nouvelle demande</p>
          </div>
          
          <nav className="sidebar-nav">
            <button 
              className="nav-item"
              onClick={() => navigate('/dashboard')}
            >
              <i className="fa fa-arrow-left" style={{ marginRight: '8px' }}></i>
              Retour au Dashboard
            </button>
            
            <button className="nav-item active">
              <i className="fa fa-plus-circle" style={{ marginRight: '8px' }}></i>
              Nouvelle demande
            </button>
            
            <button 
              className="nav-item"
              onClick={() => navigate('/mes-demandes')}
            >
              <i className="fa fa-list" style={{ marginRight: '8px' }}></i>
              Mes demandes
            </button>
            
            <button 
              className="nav-item"
              onClick={() => navigate('/notifications')}
            >
              <i className="fa fa-bell" style={{ marginRight: '8px' }}></i>
              Notifications
            </button>
          </nav>

          {/* Bouton de déconnexion */}
          <div className="sidebar-footer">
            <button
              className="nav-item deconnexion-btn"
              onClick={() => navigate('/dashboard')}
            >
              <i className="fa fa-sign-out" style={{ marginRight: '8px' }}></i>
              Retour au Dashboard
            </button>
          </div>
        </div>

        {/* Main Section - Contenu principal */}
        <div className="main-section">
          <div className="dashboard-header">
            <h1 className="dashboard-title">📝 {t('nouvelleDemande.title')}</h1>
          </div>
          
          <div className="dashboard-content">
            <div className="dashboard-form">
              <h2>{t('nouvelleDemande.title')}</h2>
          
          {!type ? (
            <div className="types-selection">
              <p className="selection-description">
                Sélectionnez le type de demande que vous souhaitez déposer :
              </p>
              
              <div className="types-grid">
                {TYPES_DEMANDES.map((typeDemande) => (
                  <div
                    key={typeDemande.id}
                    className="type-card"
                    onClick={() => handleTypeSelect(typeDemande.id)}
                    style={{ borderColor: typeDemande.color }}
                  >
                    <div className="type-icon" style={{ color: typeDemande.color }}>
                      {typeDemande.icon}
                    </div>
                    <div className="type-content">
                      <h3 className="type-title">{typeDemande.title}</h3>
                      <p className="type-description">{typeDemande.description}</p>
                    </div>
                    <div className="type-arrow">
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path d="M7.5 15L12.5 10L7.5 5" stroke={typeDemande.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="form-selection">
              <div className="selected-type-header">
                <button
                  type="button"
                  className="btn-change-type"
                  onClick={() => setType('')}
                >
                  <span className="btn-change-icon">
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                      <path d="M15 18L3 9L15 0" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                  Changer le type
                </button>
                
                <div className="selected-type-info">
                  <span className="selected-type-icon">
                    {TYPES_DEMANDES.find(t => t.id === type)?.icon}
                  </span>
                  <span className="selected-type-title">
                    {TYPES_DEMANDES.find(t => t.id === type)?.title}
                  </span>
                </div>
              </div>
              
              <FormComponent
                user={user}
                setNotif={setNotif}
                setError={setError}
              />
            </div>
          )}
          
          {notif && <div className="form-success">{notif}</div>}
          {error && <div className="form-error">{error}</div>}
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </>
  );
}

export default NouvelleDemande;
