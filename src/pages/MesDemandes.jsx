import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useTranslation } from 'react-i18next';
import '../Styles/MesDemandes.css';
import { FiDownload } from 'react-icons/fi';

const STATUTS = {
  DEPOSEE: "Déposée",
  RECEPTIONNEE: "Réceptionnée",
  EN_COURS: "En cours d'instruction",
  PIECES_MANQUANTES: "Pièces manquantes",
  APPROUVEE: "Approuvée",
  REJETEE: "Rejetée",
  AUTORISATION_SIGNEE: "Autorisation signée",
  CLOTUREE: "Clôturée"
};

const STATUT_COLORS = {
  DEPOSEE: "#ffc107",
  RECEPTIONNEE: "#17a2b8",
  EN_COURS: "#007bff",
  PIECES_MANQUANTES: "#e67e22",
  APPROUVEE: "#28a745",
  REJETEE: "#dc3545",
  AUTORISATION_SIGNEE: "#6f42c1",
  CLOTUREE: "#6f42c1"
};

const parseLienAutorisation = (demande) => {
  if (!demande) return null;
  if (demande.lien_autorisation) return demande.lien_autorisation;
  if (demande.autorisation_pdf) return demande.autorisation_pdf;
  if (demande.notifications) {
    try {
      const notifications = Array.isArray(demande.notifications)
        ? demande.notifications
        : JSON.parse(demande.notifications);
      const notifAutorisationsignee = notifications.find(
        (n) => n.type === 'AUTORISATION_SIGNEE' && (n.lien || n.link)
      );
      if (notifAutorisationsignee) {
        const lien = notifAutorisationsignee.lien || notifAutorisationsignee.link;
        // S'assurer que le lien est complet
        if (lien && !lien.startsWith('http')) {
          return `http://localhost:4000${lien}`;
        }
        return lien;
      }
    } catch (err) {
      console.warn('Impossible de parser les notifications', err);
    }
  }
  // Fallback: si la demande est signée/clôturée, proposer le téléchargement par référence
  if ((demande.statut === 'AUTORISATION_SIGNEE' || demande.statut === 'CLOTUREE') && demande.reference) {
    return `http://localhost:4000/api/download-autorisation/${demande.reference}`;
  }
  return null;
};

function InfoPopup({ demande, onClose }) {
  const { t } = useTranslation();
  if (!demande) return null;
  const lienAutorisation = demande.lienAutorisation || parseLienAutorisation(demande);
  
  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <button className="popup-close" onClick={onClose}>&times;</button>
        <h2>{t('mesDemandes.detailTitle')}</h2>
        <div className="popup-section">
          <b>{t('mesDemandes.reference')}:</b> {demande.reference}
        </div>
        <div className="popup-section">
          <b>{t('mesDemandes.dateDepot')}:</b> {new Date(demande.created_at).toLocaleDateString('fr-FR')}
        </div>
        <div className="popup-section">
          <b>{t('mesDemandes.type')}:</b> {demande.type}
        </div>
        <div className="popup-section">
          <b>{t('mesDemandes.statut')}:</b>
          <span
            className="statut-badge"
            style={{
              background: STATUT_COLORS[demande.statut] || "#e3e3e3",
              color: ["#ffc107"].includes(STATUT_COLORS[demande.statut]) ? "#000" : "#fff"
            }}
          >
            {STATUTS[demande.statut] || demande.statut}
          </span>
        </div>
        <div className="popup-section">
          <b>{t('mesDemandes.piecesJointes')}:</b>
          <ul>
            {demande.fichiers && Object.entries(demande.fichiers).map(([label, filename]) => (
              <li key={label}>
                <a
                  href={`http://localhost:4000/uploads/${filename}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="piece-jointe-link"
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </div>
        {demande.historique && demande.historique.length > 0 && (
          <div className="popup-section">
            <b>{t('mesDemandes.historiqueDossier')}:</b>
            <ul>
              {demande.historique.map((h, idx) => (
                <li key={idx}>
                  <span className="hist-date">{new Date(h.date).toLocaleString('fr-FR')}</span>
                  <span className="hist-statut">{STATUTS[h.statut] || h.statut}</span>
                  {h.message && <span className="hist-msg"> – {h.message}</span>}
                </li>
              ))}
            </ul>
          </div>
        )}
        {demande.motif_rejet && (
          <div className="popup-section popup-rejet">
            <b>{t('mesDemandes.motifRejet')}:</b> {demande.motif_rejet}
          </div>
        )}
        {lienAutorisation && (
          <div className="popup-section">
            <a
              href={lienAutorisation}
              className="btn-telecharger"
              download
              target="_blank"
              rel="noopener noreferrer"
            >
              <i className="fa fa-download"></i> {t('mesDemandes.telechargerAutorisationSignee')}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

export default function MesDemandes({ user }) {
  const [demandes, setDemandes] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState('');
  const [popup, setPopup] = useState(null);
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    fetch(`http://localhost:4000/api/mes-demandes?user_id=${user.id}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setDemandes(data);
        } else if (data && data.error) {
          setErreur(data.error);
          setDemandes([]);
        } else {
          console.warn('Format de données inattendu:', data);
          setErreur("Format de données inattendu reçu du serveur.");
          setDemandes([]);
        }
        setChargement(false);
      })
      .catch(error => {
        console.error('Erreur lors du fetch:', error);
        setErreur("Erreur lors du chargement des demandes.");
        setDemandes([]);
        setChargement(false);
      });
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  const demandesAvecLien = demandes.map((demande) => ({
    ...demande,
    lienAutorisation: parseLienAutorisation(demande)
  }));

  if (chargement) {
    return <div className="chargement">{t('mesDemandes.chargementDesDemandes')}</div>;
  }

  return (
    <>
      <Header />
      
      <div className="mes-demandes-container">
        {/* Left Panel - Sidebar */}
        <div className="left-panel">
          <div className="sidebar-header">
            <h3>Mes Demandes</h3>
            <p>Suivi des demandes</p>
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
              <i className="fa fa-list" style={{ marginRight: '8px' }}></i>
              Mes demandes
            </button>
            
            <button 
              className="nav-item"
              onClick={() => navigate('/nouvelle-demande')}
            >
              <i className="fa fa-plus-circle" style={{ marginRight: '8px' }}></i>
              Nouvelle demande
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
            <h1 className="dashboard-title">📋 {t('mesDemandes.mesDemandesDAutorisation')}</h1>
          </div>
          
          <div className="dashboard-content">
            {erreur && <div className="erreur">{erreur}</div>}
            {demandes.length === 0 ? (
              <div className="no-demandes">
                {erreur ? "Impossible de charger les demandes." : t('mesDemandes.aucuneDemandeDepose')}
              </div>
            ) : (
              <table className="table-demandes">
                <thead>
                  <tr>
                    <th>{t('mesDemandes.reference')}</th>
                    <th>{t('mesDemandes.dateDepot')}</th>
                    <th>{t('mesDemandes.type')}</th>
                    <th>{t('mesDemandes.statut')}</th>
                    <th>{t('mesDemandes.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {demandesAvecLien?.map(demande => (
                    <tr key={demande.id}>
                      <td>{demande.reference}</td>
                      <td>{new Date(demande.created_at).toLocaleDateString('fr-FR')}</td>
                      <td>{demande.type}</td>
                      <td>
                        <span
                          className="statut-badge"
                          style={{
                            background: STATUT_COLORS[demande.statut] || "#e3e3e3",
                            color: ["#ffc107"].includes(STATUT_COLORS[demande.statut]) ? "#000" : "#fff"
                          }}
                        >
                          {STATUTS[demande.statut] || demande.statut}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn-consulter"
                          onClick={() => setPopup(demande)}
                        >
                          <i className="fa fa-eye"></i> {t('mesDemandes.consulter')}
                        </button>
                        {demande.fichier_accuse && !demande.lienAutorisation && demande.statut !== 'AUTORISATION_SIGNEE' && demande.statut !== 'CLOTUREE' && (
                          <a
                            href={`http://localhost:4000/${demande.fichier_accuse}`}
                            download
                            className="download-link"
                          >
                            <FiDownload /> Télécharger l'accusé
                          </a>
                        )}
                        {demande.lienAutorisation && (
                          <a
                            href={demande.lienAutorisation}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="download-link btn-telecharger"
                          >
                            <FiDownload /> {t('mesDemandes.telechargerAutorisationSignee')}
                          </a>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
      
      <InfoPopup demande={popup ? { ...popup, lienAutorisation: parseLienAutorisation(popup) } : null} onClose={() => setPopup(null)} />
      <Footer />
    </>
  );
}