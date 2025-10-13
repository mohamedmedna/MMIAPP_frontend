import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeftOutlined,
  FileTextOutlined,
  DownloadOutlined,
  EyeOutlined,
  HomeOutlined,
  LogoutOutlined
} from '@ant-design/icons';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../Styles/DashboardDemandeur.css';
import '../Styles/DashboardLayout.css';
import '../Styles/DemandeDocuments.css';
import { useTranslation } from 'react-i18next';

export default function DemandeDocuments({ user, logout }) {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [demande, setDemande] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadDemandeDocuments = async () => {
      try {
        setLoading(true);
        console.log(`🔄 [DemandeDocuments] Chargement documents demande ${id}`);
        
        // Utiliser la route appropriée selon le rôle de l'utilisateur
        const isAdmin = user?.role_id && [1, 2, 3, 5, 6, 7, 8, 9, 12].includes(user.role_id);
        const url = isAdmin 
          ? `http://localhost:4000/api/demande-documents/${id}`
          : `http://localhost:4000/api/mes-demandes/${id}?user_id=${user?.id}`;
        
        const token = localStorage.getItem('token');
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        console.log(`📡 [DemandeDocuments] Réponse serveur: ${response.status} ${response.statusText}`);

        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ [DemandeDocuments] Erreur serveur:', errorText);
          throw new Error(`Erreur ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('✅ [DemandeDocuments] Données reçues:', data);
        setDemande(data);
      } catch (error) {
        console.error('❌ [DemandeDocuments] Erreur lors du chargement des documents:', error);
        setError('Impossible de charger les documents de la demande');
      } finally {
        setLoading(false);
      }
    };

    if (user && id) {
      loadDemandeDocuments();
    }
  }, [id, user]);

  const handleDownloadDocument = async (fileName, filePath) => {
    try {
      console.log(`📄 Téléchargement du document: ${fileName}`);
      
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:4000/api/download/${encodeURIComponent(filePath)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      console.log('✅ Document téléchargé avec succès');
    } catch (error) {
      console.error('❌ Erreur lors du téléchargement:', error);
      alert(`Erreur lors du téléchargement: ${error.message}`);
    }
  };

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

  // Fonction pour déterminer le bon dashboard selon le rôle
  const getDashboardPath = () => {
    if (!user) return '/dashboard';
    
    switch (user.role_id) {
      case 1: return '/superadmin-dashboard';
      case 2: return '/dashboard-secretaire-central';
      case 3: return '/dashboard-secretaire-general';
      case 5: return '/dashboard-chef-service';
      case 6: return '/dashboard-dgi';
      case 7: return '/dashboard-ddpi';
      case 8: return '/dashboard-secretaire-general';
      case 9: return '/dashboard-ministre';
      case 12: return '/dashboard-secretaire-dgi';
      default: return '/dashboard';
    }
  };

  if (loading) {
    return (
      <div className="dashboard-layout">
        <Header />
        <div className="dashboard-body">
          <main className="dashboard-main-content">
            <div className="dashboard-container">
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Chargement des documents...</p>
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
                <Link to={getDashboardPath()} className="btn-retour">
                  <ArrowLeftOutlined /> Retour au dashboard
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
            <div className="documents-header">
              <Link to={getDashboardPath()} className="btn-retour">
                <ArrowLeftOutlined /> Retour au dashboard
              </Link>
              <h1>Documents de la demande</h1>
            </div>

            {/* Informations de la demande */}
            <div className="demande-info-section">
              <div className="demande-header">
                <div className="demande-type-info">
                  <span className="type-icon-large">{getTypeIcon(demande.type)}</span>
                  <div>
                    <h2>{getTypeLabel(demande.type)}</h2>
                    <p className="demande-reference">Référence: {demande.reference || "N/A"}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Liste des documents */}
            <div className="documents-section">
              <h3>Documents uploadés</h3>
              {demande.fichiers && Object.keys(demande.fichiers).length > 0 ? (
                <div className="documents-list">
                  {Object.entries(demande.fichiers).map(([key, value]) => (
                    <div key={key} className="document-item">
                      <div className="document-info">
                        <FileTextOutlined className="document-icon" />
                        <div className="document-details">
                          <h4>{key}</h4>
                          <p className="document-path">{value}</p>
                        </div>
                      </div>
                      <div className="document-actions">
                        <button
                          onClick={() => handleDownloadDocument(key, value)}
                          className="btn-download"
                          title="Télécharger le document"
                        >
                          <DownloadOutlined /> Télécharger
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-documents">
                  <FileTextOutlined className="no-documents-icon" />
                  <p>Aucun document uploadé pour cette demande</p>
                </div>
              )}
            </div>

            {/* Données de la demande */}
            {demande.donnees && (
              <div className="demande-data-section">
                <h3>Données de la demande</h3>
                <div className="demande-data">
                  <pre>{JSON.stringify(demande.donnees, null, 2)}</pre>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}
