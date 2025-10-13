import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import BanniereMinistereCoupee from '../components/BanniereMinistereCoupee';
import Footer from '../components/Footer';
import '../Styles/SecrGeneralDemande.css';
import { useTranslation } from 'react-i18next';

interface DemandeData {
  ref?: string;
  dem?: string;
  date?: string;
  statut?: string;
}

const SecrGeneralDemande = () => {
  const { t } = useTranslation();
  const [demandeData, setDemandeData] = useState({} as DemandeData);
  const [annotation, setAnnotation] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    // Récupérer les données de la demande depuis localStorage
    const data = JSON.parse(localStorage.getItem('ficheDemande') || '{}');
    setDemandeData(data);
  }, []);

  const handleTransmettreMMI = () => {
    alert(t('secrGeneral.transmitMMIAlert'));
  };

  const handleOrienterDGI = () => {
    alert(t('secrGeneral.orientDGIAlert'));
  };

  const handleSaveAnnotation = () => {
    alert(t('secrGeneral.saveAnnotationAlert', { annotation }));
  };

  const toggleNotifications = (e: MouseEvent) => {
    e.stopPropagation();
    setShowNotifications(!showNotifications);
  };

  useEffect(() => {
    const handleClickOutside = () => {
      if (showNotifications) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showNotifications]);

  const renderTableRows = () => {
    const rows = [
      [t('secrGeneral.reference'), demandeData.ref],
      [t('secrGeneral.demandeur'), demandeData.dem],
      [t('secrGeneral.date'), demandeData.date],
      [t('secrGeneral.statut'), demandeData.statut]
    ];

    return rows.map(([label, value], index) => {
      if (value) {
        return (
          <tr key={index}>
            <th>{label}</th>
            <td>{value}</td>
          </tr>
        );
      }
      return null;
    });
  };

  return (
    <div>
      <Header />
      <div className="secretaire-general-demande-container">
        <aside className="sidebar">
          <div className="sidebar-header">
            <i className="fa-solid fa-bars"></i>
            <span className="sidebar-title">{t('secrGeneral.sidebarTitle')}</span>
          </div>
          <nav className="sidebar-nav">
            <Link to="/dashboard_sg2" className="sidebar-link">
              <i className="fa-solid fa-house"></i> {t('secrGeneral.dashboard')}
            </Link>
            <Link to="#" className="sidebar-link">
              <i className="fa-solid fa-plus"></i> {t('secrGeneral.newRequest')}
            </Link>
            <Link to="#" className="sidebar-link">
              <i className="fa-solid fa-list"></i> {t('secrGeneral.myRequests')}
            </Link>
            <Link to="#" className="sidebar-link">
              <i className="fa-solid fa-rotate-left"></i> {t('secrGeneral.history')}
            </Link>
          </nav>
        </aside>

        <div className="dashboard-main">
          <main className="secretaire-dashboard-container" style={{ boxShadow: 'none', maxWidth: 'unset' }}>
            <div className="fiche-title">{t('secrGeneral.detailTitle')}</div>
            <table className="fiche-table">
              <tbody>
                {renderTableRows()}
              </tbody>
            </table>
            <div className="fiche-btn-container">
              <div className="fiche-actions">
                <button onClick={handleTransmettreMMI}>{t('secrGeneral.transmitMMI')}</button>
                <button onClick={handleOrienterDGI}>{t('secrGeneral.orientDGI')}</button>
              </div>
              <div className="fiche-annotation">
                <textarea 
                  value={annotation}
                  onChange={(e) => setAnnotation(e.target.value)}
                  placeholder={t('secrGeneral.annotationPlaceholder')}
                />
                <button onClick={handleSaveAnnotation}>{t('secrGeneral.saveAnnotation')}</button>
              </div>
            </div>
          </main>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default SecrGeneralDemande;