import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeftOutlined,
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
  BarChartOutlined
} from '@ant-design/icons';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../Styles/DashboardDemandeur.css';
import '../Styles/DashboardLayout.css';
import '../Styles/DetailsDemande.css';
import { useTranslation } from 'react-i18next';

export default function DetailsDemande({ user, logout }) {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [demande, setDemande] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Vérification supplémentaire de l'utilisateur
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      console.log('❌ [DetailsDemande] Aucun utilisateur dans localStorage');
      navigate('/login');
      return;
    }
    
    const parsedUser = JSON.parse(storedUser);
    console.log('🔍 [DetailsDemande] Utilisateur depuis localStorage:', parsedUser);
    
    if (!parsedUser || !parsedUser.id) {
      console.log('❌ [DetailsDemande] Utilisateur invalide dans localStorage');
      navigate('/login');
      return;
    }
  }, [navigate]);

  useEffect(() => {
    const loadDemandeDetails = async () => {
      console.log('🔍 [DetailsDemande] Debug - user:', user);
      console.log('🔍 [DetailsDemande] Debug - id:', id);
      
      if (!user || !user.id) {
        console.log('❌ [DetailsDemande] Utilisateur non connecté, redirection...');
        navigate('/login');
        return;
      }

      try {
        setLoading(true);
        console.log(`🔄 [DetailsDemande] Chargement demande ${id} pour utilisateur ${user.id}`);
        
        const response = await fetch(`http://localhost:4000/api/mes-demandes/${id}?user_id=${user.id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        console.log(`📡 [DetailsDemande] Réponse serveur: ${response.status} ${response.statusText}`);

        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ [DetailsDemande] Erreur serveur:', errorText);
          throw new Error(`Erreur ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('✅ [DetailsDemande] Données reçues:', data);
        setDemande(data);
      } catch (error) {
        console.error('❌ [DetailsDemande] Erreur lors du chargement des détails:', error);
        setError('Impossible de charger les détails de la demande');
      } finally {
        setLoading(false);
      }
    };

    loadDemandeDetails();
  }, [id, user, navigate]);

  // Fonction pour télécharger l'autorisation signée
  const handleDownloadAutorisation = async (reference) => {
    try {
      console.log(`📄 Téléchargement de l'autorisation pour ${reference}`);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token d\'authentification manquant');
      }
      
      const response = await fetch(`http://localhost:4000/api/mes-demandes/${reference}/autorisation`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        if (errorData.error && errorData.error.includes('jwt expired')) {
          alert('Votre session a expiré. Veuillez vous reconnecter pour télécharger l\'autorisation.');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
          return;
        }
        
        throw new Error(errorData.error || `Erreur ${response.status}`);
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `autorisation_${reference}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      console.log('✅ Autorisation téléchargée avec succès');
    } catch (error) {
      console.error('❌ Erreur lors du téléchargement:', error);
      alert(`Erreur lors du téléchargement de l'autorisation: ${error.message}`);
    }
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

  if (loading) {
    return (
      <div className="dashboard-layout">
        <Header />
        <div className="dashboard-body">
          <main className="dashboard-main-content">
            <div className="dashboard-container">
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Chargement des détails...</p>
              </div>
            </div>
          </main>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !demande) {
    return (
      <div className="dashboard-layout">
        <Header />
        <div className="dashboard-body">
          <main className="dashboard-main-content">
            <div className="dashboard-container">
              <div className="error-container">
                <h2>Erreur</h2>
                <p>{error || 'Demande non trouvée'}</p>
                <Link to="/mes-demandes" className="btn-retour">
                  <ArrowLeftOutlined /> Retour à mes demandes
                </Link>
              </div>
            </div>
          </main>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <Header />
      <div className="dashboard-body">
        <main className="dashboard-main-content">
          <div className="dashboard-container">
            {/* En-tête avec bouton retour */}
            <div className="details-header">
              <Link to="/mes-demandes" className="btn-retour">
                <ArrowLeftOutlined /> Retour à mes demandes
              </Link>
              <h1>Détails de la demande</h1>
            </div>

            {/* Informations principales */}
            <div className="demande-details">
              <div className="demande-header">
                <div className="demande-type-info">
                  <span className="type-icon-large">{getTypeIcon(demande.type)}</span>
                  <div>
                    <h2>{getTypeLabel(demande.type)}</h2>
                    <p className="demande-reference">Référence: {demande.reference || "N/A"}</p>
                  </div>
                </div>
                <div className="demande-statut-large">
                  <span 
                    className="statut-badge-large"
                    style={getStatutStyle(demande.statut)}
                  >
                    {getStatutLabel(demande.statut)}
                  </span>
                </div>
              </div>

              {/* Informations générales */}
              <div className="details-section">
                <h3>Informations générales</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <CalendarOutlined />
                    <div>
                      <strong>Date de dépôt</strong>
                      <p>{demande.created_at ? new Date(demande.created_at).toLocaleDateString() : 'N/A'}</p>
                    </div>
                  </div>
                  
                  <div className="info-item">
                    <UserOutlined />
                    <div>
                      <strong>Demandeur</strong>
                      <p>{user.prenom} {user.nom}</p>
                    </div>
                  </div>
                  
                                     <div className="info-item">
                     <MailOutlined />
                     <div>
                       <strong>Email</strong>
                       <p>{user.email}</p>
                     </div>
                   </div>
                   
                   <div className="info-item">
                     <PhoneOutlined />
                     <div>
                       <strong>Téléphone</strong>
                       <p>{demande.telephone_proprietaire || demande.donnees?.telephone_proprietaire || user.telephone || 'Non renseigné'}</p>
                     </div>
                   </div>
                </div>
              </div>

              {/* Dossier et fichiers */}
              <div className="details-section">
                <h3>Dossier et fichiers</h3>
                <div className="fichiers-info">
                  {demande.fichiers && Object.keys(demande.fichiers).length > 0 ? (
                    <div className="fichiers-list">
                      <h4>Fichiers uploadés ({Object.keys(demande.fichiers).length})</h4>
                      <ul>
                        {Object.entries(demande.fichiers).map(([key, value]) => (
                          <li key={key}>
                            <FileTextOutlined />
                            <span>{key}: {value}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <p className="no-fichiers">Aucun fichier uploadé</p>
                  )}
                </div>
              </div>

              {/* Motif de rejet */}
              {demande.motif_rejet && (
                <div className="details-section">
                  <h3>Motif de rejet</h3>
                  <div className="rejet-info">
                    <p>{demande.motif_rejet}</p>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="details-section">
                <h3>Actions</h3>
                <div className="actions-buttons">
                  <Link to={`/suivi/${demande.id}`} className="btn-action btn-suivi">
                    <BarChartOutlined /> Voir le suivi
                  </Link>
                  
                  {demande.statut === 'AUTORISATION_SIGNEE' && (
                    <button
                      onClick={() => handleDownloadAutorisation(demande.reference)}
                      className="btn-action btn-download"
                    >
                      <DownloadOutlined /> Télécharger l'autorisation
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}
 