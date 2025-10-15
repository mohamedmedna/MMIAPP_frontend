import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useTranslation } from 'react-i18next';
import banniereMinistere from '../assets/banniere-ministere.jpg';
import { FileText, Download, Calendar, Tag } from 'lucide-react';

import '../Styles/PlateformeGestion.css';

function PlateformeGestion() {
  const { i18n } = useTranslation();
  const [actualites, setActualites] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Données de secours si le backend ne répond pas
  const actualitesSecours = [
    {
      id: 1,
      titre: "Inauguration d'une usine numérique",
      image: "/assets/news1.jpg",
      extrait: "Une nouvelle usine industrielle équipée des dernières technologies a été inaugurée pour moderniser la production locale.",
      date: "2025-10-10",
      categorie: "Innovation"
    },
    {
      id: 2,
      titre: "Lancement du Portail de l'Industrie",
      image: "/assets/news2.jpg",
      extrait: "Découvrez le nouveau portail numérique pour faciliter l'accès aux services industriels et améliorer la collaboration.",
      date: "2025-10-08",
      categorie: "Digital"
    },
    {
      id: 3,
      titre: "Formations à la transformation numérique",
      image: "/assets/news3.jpg",
      extrait: "Le ministère organise des sessions de formation visant à développer les compétences numériques dans l'industrie.",
      date: "2025-10-05",
      categorie: "Formation"
    },
    {
      id: 4,
      titre: "Nouvelle réglementation sur les normes industrielles",
      image: "/assets/news4.jpg",
      extrait: "Mise à jour des normes de sécurité et de qualité pour les installations industrielles.",
      date: "2025-10-01",
      categorie: "Réglementation"
    }
  ];

  const documentsSecours = [
    {
      id: 1,
      titre: "Loi n°2024-001 sur l'industrie numérique",
      description: "Cadre juridique pour la transformation numérique des entreprises industrielles",
      type: "Loi",
      date: "2024-12-15",
      taille: "2.5 MB",
      categorie: "Législation"
    },
    {
      id: 2,
      titre: "Décret d'application des normes ISO",
      description: "Modalités d'application des normes ISO dans le secteur industriel",
      type: "Décret",
      date: "2024-11-20",
      taille: "1.8 MB",
      categorie: "Normes"
    },
    {
      id: 3,
      titre: "Arrêté ministériel - Autorisations industrielles",
      description: "Procédures et conditions d'obtention des autorisations industrielles",
      type: "Arrêté",
      date: "2024-10-10",
      taille: "3.2 MB",
      categorie: "Autorisations"
    },
    {
      id: 4,
      titre: "Guide des bonnes pratiques environnementales",
      description: "Recommandations pour la protection de l'environnement dans l'industrie",
      type: "Guide",
      date: "2024-09-05",
      taille: "4.1 MB",
      categorie: "Environnement"
    },
    {
      id: 5,
      titre: "Règlement sur la sécurité industrielle",
      description: "Normes de sécurité obligatoires pour les installations industrielles",
      type: "Règlement",
      date: "2024-08-15",
      taille: "2.9 MB",
      categorie: "Sécurité"
    }
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('🔄 Chargement des actualités...');
        
        // Essayer de récupérer les données du backend
        const [actualitesRes, documentsRes] = await Promise.all([
          fetch('http://localhost:4000/api/actualites'),
          fetch('http://localhost:4000/api/documents')
        ]);

        console.log('📡 Réponse actualités:', actualitesRes.status);
        console.log('📡 Réponse documents:', documentsRes.status);

        if (actualitesRes.ok && documentsRes.ok) {
          const actualitesData = await actualitesRes.json();
          const documentsData = await documentsRes.json();
          
          console.log('✅ Actualités chargées:', actualitesData.length);
          console.log('✅ Documents chargés:', documentsData.length);
          
          setActualites(actualitesData);
          setDocuments(documentsData);
        } else {
          throw new Error('Backend non disponible');
        }
      } catch (err) {
        console.error('❌ Erreur:', err);
        console.warn('⚠️ Backend non disponible, utilisation des données de secours');
        setActualites(actualitesSecours);
        setDocuments(documentsSecours);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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
        {/* <div className="hero-content">
          <h1 className="hero-title">Portail de l'Industrie</h1>
          <p className="hero-subtitle">Votre plateforme centralisée pour l'information industrielle</p>
        </div> */}
      </section>

      {/* Section Actualités */}
      <section className="news section" aria-labelledby="news-title">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title" id="news-title">📰 Actualités</h2>
            <p className="section-subtitle">Restez informé des dernières nouvelles du secteur industriel</p>
          </div>
          
          {loading ? (
            <div className="loading-spinner">
              <div className="spinner"></div>
              <p>Chargement des actualités...</p>
            </div>
          ) : actualites.length === 0 ? (
            <div className="no-data">
              <p>❌ Aucune actualité disponible</p>
            </div>
          ) : (
            <>
              <div className="scroll-hint">
                <p>← Faites défiler pour voir plus d'actualités →</p>
              </div>
              <div className="news-grid">
                {actualites.map((actualite, index) => (
                <article key={actualite.id} className={`news-card animate-fade-in-up delay-${index % 3}`} tabIndex="0">
                  <div className="news-image-wrapper">
                    <img src={actualite.image} alt={actualite.titre} className="news-image" />
                    <span className="news-category">{actualite.categorie}</span>
                  </div>
                  <div className="news-content">
                    <div className="news-meta">
                      <Calendar size={16} />
                      <span>{new Date(actualite.date).toLocaleDateString('fr-FR')}</span>
                    </div>
                    <h3 className="news-title">{actualite.titre}</h3>
                    <p className="news-excerpt">{actualite.extrait}</p>
                    <Link to={`/actualite/${actualite.id}`} className="news-link">
                      Lire la suite →
                    </Link>
                  </div>
                </article>
              ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Section Documents Juridiques */}
      <section className="documents section" aria-labelledby="documents-title">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title" id="documents-title">📄 Documents Juridiques</h2>
            <p className="section-subtitle">Accédez aux textes législatifs et réglementaires</p>
          </div>

          {loading ? (
            <div className="loading-spinner">
              <div className="spinner"></div>
              <p>Chargement des documents...</p>
            </div>
          ) : (
            <div className="documents-grid">
              {documents.map((doc) => (
                <article key={doc.id} className="document-card">
                  <div className="document-icon">
                    <FileText size={32} />
                  </div>
                  <div className="document-content">
                    <div className="document-header">
                      <h3 className="document-title">{doc.titre}</h3>
                      <span className="document-type">{doc.type}</span>
                    </div>
                    <p className="document-description">{doc.description}</p>
                    <div className="document-meta">
                      <div className="meta-item">
                        <Calendar size={14} />
                        <span>{new Date(doc.date).toLocaleDateString('fr-FR')}</span>
                      </div>
                      <div className="meta-item">
                        <Tag size={14} />
                        <span>{doc.categorie}</span>
                      </div>
                      <div className="meta-item">
                        <span className="document-size">{doc.taille}</span>
                      </div>
                    </div>
                    <button className="document-download-btn">
                      <Download size={16} />
                      Télécharger
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Lien vers l'administration */}
      <section className="admin-access section">
        <div className="container">
          <div className="admin-card">
            <h3>Espace Administrateur</h3>
            <p>Gérez les actualités et les documents juridiques</p>
            <Link to="/admin-portail" className="admin-link-btn">
              Accéder à l'administration
            </Link>
          </div>
        </div>
      </section>

      <Footer />
      </div>
    </>
  );
}

export default PlateformeGestion;