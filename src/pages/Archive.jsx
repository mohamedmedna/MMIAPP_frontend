import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../Styles/Archive.css';

export default function Archive({ user, logout }) {
  const [archives, setArchives] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadArchives = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:4000/api/archive');
      
      if (response.ok) {
        const data = await response.json();
        setArchives(data);
      } else {
        console.error('Erreur lors du chargement des archives');
      }
    } catch (error) {
      console.error('Erreur lors du chargement des archives:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadArchives();
  }, []);

  const handleDownloadAutorisation = async (reference) => {
    try {
      const response = await fetch(`http://localhost:4000/api/download-autorisation/${reference}`, {
        method: 'GET'
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `autorisation_${reference}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
      alert('Erreur lors du téléchargement de l\'autorisation');
    }
  };

  const getStatutStyle = (statut) => {
    const styles = {
      'AUTORISATION_SIGNEE': { backgroundColor: '#52c41a', color: '#fff' },
      'CLOTUREE': { backgroundColor: '#1890ff', color: '#fff' },
    };
    return styles[statut] || { backgroundColor: '#d9d9d9', color: '#000' };
  };

  const getStatutText = (statut) => {
    const texts = {
      'AUTORISATION_SIGNEE': 'Autorisation Signée',
      'CLOTUREE': 'Clôturée',
    };
    return texts[statut] || statut;
  };

  if (loading) {
    return (
      <div className="dashboard-layout archive-page">
        <Header />
        <div className="dashboard-body">
          <main className="dashboard-main-content">
            <div className="dashboard-container">
              <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                <div>Chargement des archives...</div>
              </div>
            </div>
          </main>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="dashboard-layout archive-page">
      <Header />
      <div className="dashboard-body">
        <main className="dashboard-main-content">
          <div className="dashboard-container">
            <div className="archive-header">
              <h1>📁 Archive des Demandes Clôturées</h1>
              <button 
                onClick={() => navigate('/dashboard')}
                className="back-btn"
              >
                <i className="fa fa-arrow-left"></i> Retour au Dashboard
              </button>
            </div>

            {archives.length === 0 ? (
              <div className="no-archives">
                <div className="no-archives-icon">📁</div>
                <h3>Aucune demande clôturée</h3>
                <p>Les demandes clôturées apparaîtront ici.</p>
              </div>
            ) : (
              <div className="archive-stats">
                <div className="stat-card">
                  <div className="stat-number">{archives.length}</div>
                  <div className="stat-label">Total Clôturées</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">{archives.filter(a => a.autorisation).length}</div>
                  <div className="stat-label">Avec Autorisation</div>
                </div>
              </div>
            )}

            <div className="archive-table-container">
              <table className="archive-table">
                <thead>
                  <tr>
                    <th>Référence</th>
                    <th>Type</th>
                    <th>Demandeur</th>
                    <th>Date Demande</th>
                    <th>Date Clôture</th>
                    <th>Statut</th>
                    <th>Autorisation</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {archives.map((archive, index) => (
                    <tr key={index}>
                      <td className="reference-cell">
                        <span className="reference-badge">{archive.reference}</span>
                      </td>
                      <td className="type-cell" title={archive.type}>{archive.type}</td>
                      <td className="demandeur-cell" title={archive.demandeur}>{archive.demandeur}</td>
                      <td className="date-cell">{new Date(archive.date_demande).toLocaleDateString('fr-FR')}</td>
                      <td className="date-cell">{new Date(archive.date_cloture).toLocaleDateString('fr-FR')}</td>
                      <td className="statut-cell">
                        <span 
                          className="statut-badge" 
                          style={getStatutStyle(archive.statut)}
                          title={getStatutText(archive.statut)}
                        >
                          {getStatutText(archive.statut)}
                        </span>
                      </td>
                      <td className="autorisation-cell">
                        {archive.autorisation ? (
                          <span className="autorisation-available" title="Autorisation disponible">✅ Disponible</span>
                        ) : (
                          <span className="autorisation-unavailable" title="Autorisation non disponible">❌ Non disponible</span>
                        )}
                      </td>
                      <td className="actions-cell">
                        {archive.autorisation && (
                          <button 
                            onClick={() => handleDownloadAutorisation(archive.reference)}
                            className="download-btn"
                            title="Télécharger l'autorisation"
                          >
                            <i className="fa fa-download"></i>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}
