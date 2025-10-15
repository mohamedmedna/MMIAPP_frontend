import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Calendar, User, Tag, ArrowLeft } from 'lucide-react';
import '../Styles/ActualiteDetail.css';

function ActualiteDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [actualite, setActualite] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActualite = async () => {
      try {
        const response = await fetch(`http://localhost:4000/api/actualites/${id}`);
        if (response.ok) {
          const data = await response.json();
          setActualite(data);
        } else {
          // Données de secours
          const actualitesSecours = [
            {
              id: 1,
              titre: "Inauguration d'une usine numérique",
              image: "/assets/news1.jpg",
              contenu: `<h2>Inauguration d'une usine numérique de pointe</h2>
              <p>Le Ministère de l'Industrie et du Commerce a inauguré aujourd'hui une nouvelle usine numérique équipée des dernières technologies de l'industrie 4.0.</p>
              <p>Cette usine représente un investissement de 50 millions d'euros et créera plus de 200 emplois directs dans la région.</p>
              <h3>Technologies innovantes</h3>
              <ul>
                <li>Robotique avancée et automatisation</li>
                <li>Intelligence artificielle pour l'optimisation de la production</li>
                <li>IoT pour le suivi en temps réel</li>
                <li>Systèmes de gestion énergétique intelligents</li>
              </ul>
              <p>Cette initiative s'inscrit dans le cadre du plan national de modernisation industrielle.</p>`,
              date: "2025-10-10",
              auteur: "Ministère de l'Industrie",
              categorie: "Innovation"
            },
            {
              id: 2,
              titre: "Lancement du Portail de l'Industrie",
              image: "/assets/news2.jpg",
              contenu: `<h2>Le nouveau Portail de l'Industrie est en ligne</h2>
              <p>Le Ministère lance officiellement son portail numérique destiné à simplifier les démarches administratives pour les entreprises industrielles.</p>
              <h3>Fonctionnalités principales</h3>
              <ul>
                <li>Demandes d'autorisations en ligne</li>
                <li>Suivi en temps réel des dossiers</li>
                <li>Accès aux documents juridiques</li>
                <li>Espace de communication sécurisé</li>
              </ul>
              <p>Le portail est accessible 24h/24 et 7j/7 pour tous les industriels du pays.</p>`,
              date: "2025-10-08",
              auteur: "Direction Générale",
              categorie: "Digital"
            },
            {
              id: 3,
              titre: "Formations à la transformation numérique",
              image: "/assets/news3.jpg",
              contenu: `<h2>Programme de formation à la transformation numérique</h2>
              <p>Le Ministère lance un vaste programme de formation pour accompagner les entreprises dans leur transformation numérique.</p>
              <h3>Thématiques abordées</h3>
              <ul>
                <li>Industrie 4.0 et automatisation</li>
                <li>Cybersécurité industrielle</li>
                <li>Analyse de données et Big Data</li>
                <li>Gestion de projet digital</li>
              </ul>
              <p>Plus de 500 professionnels seront formés au cours des 6 prochains mois.</p>`,
              date: "2025-10-05",
              auteur: "Service Formation",
              categorie: "Formation"
            },
            {
              id: 4,
              titre: "Nouvelle réglementation sur les normes industrielles",
              image: "/assets/news4.jpg",
              contenu: `<h2>Nouvelles normes industrielles 2025</h2>
              <p>Le Ministère annonce la mise en application de nouvelles normes de sécurité et de qualité pour toutes les installations industrielles.</p>
              <h3>Principales modifications</h3>
              <ul>
                <li>Renforcement des normes de sécurité</li>
                <li>Nouvelles exigences environnementales</li>
                <li>Standards de qualité ISO mis à jour</li>
                <li>Procédures de contrôle renforcées</li>
              </ul>
              <p>Les entreprises disposent d'une période de transition de 12 mois pour se conformer aux nouvelles normes.</p>`,
              date: "2025-10-01",
              auteur: "Direction Technique",
              categorie: "Réglementation"
            }
          ];
          const found = actualitesSecours.find(a => a.id === parseInt(id));
          setActualite(found || null);
        }
      } catch (error) {
        console.error('Erreur lors du chargement de l\'actualité:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchActualite();
  }, [id]);

  if (loading) {
    return (
      <>
        <Header />
        <div className="actualite-detail-container">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Chargement de l'actualité...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!actualite) {
    return (
      <>
        <Header />
        <div className="actualite-detail-container">
          <div className="error-message">
            <h2>Actualité non trouvée</h2>
            <Link to="/plateforme-gestion" className="back-link">
              <ArrowLeft size={20} />
              Retour aux actualités
            </Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="actualite-detail-container">
        <div className="actualite-detail-content">
          <Link to="/plateforme-gestion" className="back-link">
            <ArrowLeft size={20} />
            Retour aux actualités
          </Link>

          <article className="actualite-article">
            <div className="actualite-header">
              <span className="actualite-category">{actualite.categorie}</span>
              <h1 className="actualite-title">{actualite.titre}</h1>
              
              <div className="actualite-meta">
                <div className="meta-item">
                  <Calendar size={18} />
                  <span>{new Date(actualite.date).toLocaleDateString('fr-FR', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</span>
                </div>
                <div className="meta-item">
                  <User size={18} />
                  <span>{actualite.auteur}</span>
                </div>
              </div>
            </div>

            {actualite.image && (
              <div className="actualite-image-container">
                <img src={actualite.image} alt={actualite.titre} className="actualite-image" />
              </div>
            )}

            <div 
              className="actualite-content" 
              dangerouslySetInnerHTML={{ __html: actualite.contenu }}
            />
          </article>

          <div className="actualite-actions">
            <button onClick={() => navigate(-1)} className="btn-secondary">
              Retour
            </button>
            <button onClick={() => window.print()} className="btn-primary">
              Imprimer
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default ActualiteDetail;
