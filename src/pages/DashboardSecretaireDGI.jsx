import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  EyeOutlined,
  DownloadOutlined,
  FileTextOutlined,
  CalendarOutlined,
  TagOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  HomeOutlined,
  FolderOpenOutlined,
  LogoutOutlined,
  ReloadOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BellOutlined,
  PrinterOutlined
} from '@ant-design/icons';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../Styles/DashboardDemandeur.css';
import '../Styles/DashboardLayout.css';
import '../Styles/DashboardSecretaireDGI.css';
import { useTranslation } from 'react-i18next';

export default function DashboardSecretaireDGI({ user, logout }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [demandes, setDemandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const baseUrl = window.__APP_CONFIG__.API_BASE;


  useEffect(() => {
    loadDemandes();
  }, []);

  const loadDemandes = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('${baseUrl}/api/demandes-secretaire-dgi', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Erreur lors du chargement des demandes');
      }

      const data = await response.json();
      setDemandes(data);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDemandes();
    setRefreshing(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    logout();
    navigate('/');
  };

  const handlePrintAccuse = async (demandeId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${baseUrl}/api/demandes/${demandeId}/print-accuse`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `accuse_${demandeId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Erreur lors de l\'impression:', error);
    }
  };

  const handleViewDocuments = (demandeId) => {
    navigate(`/demande-documents/${demandeId}`);
  };

  // Fonction pour obtenir le style du badge de statut
  const getStatutStyle = (statut) => {
    const styles = {
      'DEPOSEE': { backgroundColor: '#ffa940', color: '#fff' },
      'RECEPTIONNEE': { backgroundColor: '#1890ff', color: '#fff' },
      'TRANSMISE_AU_SG': { backgroundColor: '#13c2c2', color: '#fff' },
      'TRANSMISE_AU_DGI': { backgroundColor: '#722ed1', color: '#fff' },
      'TRANSMISE_AU_MINISTRE': { backgroundColor: '#eb2f96', color: '#fff' },
      'AUTORISATION_SIGNEE': { backgroundColor: '#52c41a', color: '#fff' },
      'VALIDEE_DDPI': { backgroundColor: '#52c41a', color: '#fff' },
      'VALIDEE_DGI': { backgroundColor: '#52c41a', color: '#fff' },
      'TRANSMISE_A_DGI': { backgroundColor: '#722ed1', color: '#fff' },
      'EN_COURS_DGI': { backgroundColor: '#faad14', color: '#fff' },
      'EN_ATTENTE_SIGNATURE': { backgroundColor: '#52c41a', color: '#fff' },
      'CLOTUREE': { backgroundColor: '#52c41a', color: '#fff' },
      'REJETEE': { backgroundColor: '#f5222d', color: '#fff' },
      'REFUSEE': { backgroundColor: '#f5222d', color: '#fff' },
      'EN_COURS_TRAITEMENT': { backgroundColor: '#faad14', color: '#fff' },
      'PIECES_MANQUANTES': { backgroundColor: '#fa8c16', color: '#fff' },
    };
    
    return styles[statut] || { backgroundColor: '#d9d9d9', color: '#000' };
  };

  // Fonction pour obtenir le libellé du statut
  const getStatutLabel = (statut) => {
    const labels = {
      'DEPOSEE': 'Déposée',
      'RECEPTIONNEE': 'Réceptionnée',
      'TRANSMISE_AU_SG': 'Transmise au SG',
      'TRANSMISE_AU_DGI': 'Transmise à la DGI',
      'TRANSMISE_AU_MINISTRE': 'Transmise au Ministre',
      'AUTORISATION_SIGNEE': 'Autorisation Signée',
      'VALIDEE_DDPI': 'Validée DDPI',
      'VALIDEE_DGI': 'Validée DGI',
      'TRANSMISE_A_DGI': 'Transmise à la DGI',
      'EN_COURS_DGI': 'En cours DGI',
      'EN_ATTENTE_SIGNATURE': 'En attente signature',
      'CLOTUREE': 'Clôturée',
      'REJETEE': 'Rejetée',
      'REFUSEE': 'Refusée',
      'EN_COURS_TRAITEMENT': 'En cours traitement',
      'PIECES_MANQUANTES': 'Pièces manquantes',
    };
    
    return labels[statut] || statut;
  };

  // Fonction pour obtenir l'icône du type de demande
  const getTypeIcon = (type) => {
    const icons = {
      'usine': '🏭',
      'boulangerie': '🥖',
      'eaux': '💧',
      'pnme': '🏢',
      'extension': '📈'
    };
    return icons[type] || '📄';
  };

  // Fonction pour obtenir le libellé du type
  const getTypeLabel = (type) => {
    const labels = {
      'usine': 'Usine Industrielle',
      'boulangerie': 'Boulangerie',
      'eaux': 'Eaux Minérales',
      'pnme': 'PMNE',
      'extension': 'Demande Extension'
    };
    return labels[type] || type;
  };

  if (!user || !user.prenom || !user.nom) {
    return <div>Chargement du profil...</div>;
  }

  return (
    <>
      <Header />
      
      <div className="dashboard-secretaire-dgi-container">
        {/* Left Panel - Sidebar */}
        <div className="left-panel">
          <div className="sidebar-header">
            <h3>Espace Secrétaire DGI</h3>
            <p>Dashboard Secrétaire DGI</p>
          </div>
          
          <nav className="sidebar-nav">
            <button
              className={`nav-item ${true ? 'active' : ''}`}
            >
              <HomeOutlined />
              Tableau de bord
            </button>
            
            <button className="nav-item">
              <FolderOpenOutlined />
              Demandes
            </button>
            
            <button className="nav-item">
              <BellOutlined />
              Notifications
            </button>
          </nav>

          {/* Bouton de déconnexion */}
          <div className="sidebar-footer">
            <button
              className="nav-item deconnexion-btn"
              onClick={handleLogout}
            >
              <LogoutOutlined />
              Déconnexion
            </button>
          </div>
        </div>

        {/* Main Section - Contenu principal */}
        <div className="main-section">
          <div className="dashboard-header">
            <h1 className="dashboard-title">🏢 Tableau de Bord - Secrétaire DGI</h1>
          </div>
          
          <div className="dashboard-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h1>Tableau de Bord - Secrétaire DGI</h1>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 18px',
                  border: refreshing ? '2px solid #dee2e6' : '2px solid #17a2b8',
                  borderRadius: '8px',
                  background: refreshing ? '#f8f9fa' : 'linear-gradient(135deg, #17a2b8, #138496)',
                  cursor: refreshing ? 'not-allowed' : 'pointer',
                  color: refreshing ? '#6c757d' : 'white',
                  fontWeight: '500',
                  fontSize: '0.9em',
                  transition: 'all 0.3s ease',
                  boxShadow: refreshing ? 'none' : '0 2px 4px rgba(23, 162, 184, 0.3)'
                }}
              >
                <ReloadOutlined spin={refreshing} />
                {refreshing ? 'Actualisation...' : 'Actualiser'}
              </button>
            </div>

            {/* Statistiques */}
            <div className="stats-grid">
              <div className="stat-card">
                <h3>Total Demandes</h3>
                <p>{demandes.length}</p>
              </div>
              <div className="stat-card">
                <h3>En cours</h3>
                <p>{demandes.filter(d => d.statut === 'EN_COURS_DGI').length}</p>
              </div>
              <div className="stat-card">
                <h3>Validées</h3>
                <p>{demandes.filter(d => d.statut === 'VALIDEE_DGI').length}</p>
              </div>
            </div>

            {/* Liste des demandes */}
            <div className="demandes-section">
              <h2>Demandes à traiter</h2>
              {loading ? (
                <div className="loading-container">
                  <div className="loading-spinner"></div>
                  <p>Chargement des demandes...</p>
                </div>
              ) : demandes.length === 0 ? (
                <div className="no-demandes">
                  <div className="no-demandes-icon">📋</div>
                  <h3>Aucune demande à traiter</h3>
                  <p>Toutes les demandes ont été traitées.</p>
                </div>
              ) : (
                <div className="demandes-grid">
                  {demandes.map(d => (
                    <div key={d.id} className="demande-card">
                      <div className="demande-card-header">
                        <div className="demande-type">
                          <span className="type-icon">{getTypeIcon(d.type)}</span>
                          <span className="type-label">{getTypeLabel(d.type)}</span>
                        </div>
                        <div className="demande-reference">
                          <TagOutlined /> {d.reference || "N/A"}
                        </div>
                      </div>

                      <div className="demande-card-body">
                        <div className="demande-info">
                          <div className="info-item">
                            <CalendarOutlined />
                            <span>Déposée le {d.created_at ? new Date(d.created_at).toLocaleDateString() : 'N/A'}</span>
                          </div>

                          <div className="info-item">
                            <FileTextOutlined />
                            <span>
                              {d.fichiers && Object.keys(d.fichiers).length > 0
                                ? `Dossier complet (${Object.keys(d.fichiers).length} fichiers)`
                                : 'Dossier incomplet'
                              }
                            </span>
                          </div>
                        </div>

                        <div className="demande-statut">
                          <span
                            className="statut-badge"
                            style={getStatutStyle(d.statut)}
                          >
                            {getStatutLabel(d.statut)}
                          </span>
                        </div>
                      </div>

                      <div className="demande-card-footer">
                        <div className="demande-actions">
                          <button
                            className="btn-print"
                            onClick={() => handlePrintAccuse(d.id)}
                          >
                            <PrinterOutlined /> Imprimer Accusé
                          </button>

                          <button
                            className="btn-view-docs"
                            onClick={() => handleViewDocuments(d.id)}
                          >
                            <FileTextOutlined /> Voir Documents
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </>
  );
}
