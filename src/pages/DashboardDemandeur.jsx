import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import DashboardLayout from "../components/DashboardLayout";

import { PlusCircleOutlined, ReloadOutlined } from "@ant-design/icons";
import "../Styles/DashboardDemandeur.css";
import "../Styles/DashboardResponsive.css";
import "../Styles/DashboardSpaceOptimization.css";
import { useTranslation } from "react-i18next";

export default function DashboardDemandeur({ user, logout }) {
  const { t } = useTranslation();
  const [demandes, setDemandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [notifLoading, setNotifLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    enCours: 0,
    approuvees: 0,
    refusees: 0,
  });
  const [refreshing, setRefreshing] = useState(false);
  const [lastAccuseCheck, setLastAccuseCheck] = useState(Date.now());
  const API_BASE = window.__APP_CONFIG__?.API_BASE;

  // Fonction pour calculer le pourcentage de progression d'une demande
  const getProgressPercentage = (statut) => {
    const progressMap = {
      DEPOSEE: 16,
      RECEPTIONNEE: 33,
      TRANSMISE_AU_SG: 50,
      TRANSMISE_AU_DGI: 66,
      EN_COURS_DGI: 75,
      VALIDEE_DGI: 83,
      TRANSMISE_AU_MINISTRE: 91,
      AUTORISATION_SIGNEE: 100,
      REJETEE: 0,
      RETOURNEE: 0,
    };
    return progressMap[statut] || 0;
  };

  // Fonction pour vérifier les mises à jour d'accusés
  const checkForAccuseUpdates = () => {
    const lastUpdate = localStorage.getItem("lastAccuseUpdate");
    const lastUpdateTime = lastUpdate ? parseInt(lastUpdate) : 0;

    console.log(
      `🔍 Vérification des mises à jour d'accusé. Dernière vérification: ${new Date(
        lastAccuseCheck
      ).toLocaleTimeString()}, Dernière mise à jour: ${
        lastUpdateTime
          ? new Date(lastUpdateTime).toLocaleTimeString()
          : "jamais"
      }`
    );

    if (lastUpdateTime > lastAccuseCheck) {
      console.log(
        "🔄 Nouvelle mise à jour d'accusé détectée, rafraîchissement automatique..."
      );
      loadDemandes(false); // Rafraîchir sans loader principal
      setLastAccuseCheck(Date.now());

      // Recharger les notifications depuis le serveur au lieu d'ajouter des notifications locales
      loadNotifications();
    }
  };

  const navigate = useNavigate();
  const location = useLocation();

  // Fonction pour charger les demandes
  const loadDemandes = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    if (!showLoading) setRefreshing(true);

    try {
      console.log(`🔄 Chargement des demandes pour l'utilisateur ${user.id}`);

      const response = await fetch(
        `${API_BASE}/api/mes-demandes?user_id=${user.id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("📋 Demandes reçues du serveur:", data);

      // Vérifier s'il y a de nouveaux accusés
      if (demandes.length > 0) {
        const newAccuses = data.filter((newDemande) => {
          const oldDemande = demandes.find((d) => d.id === newDemande.id);
          return (
            oldDemande &&
            !oldDemande.fichier_accuse &&
            newDemande.fichier_accuse
          );
        });

        if (newAccuses.length > 0) {
          console.log(
            "🎉 Nouveaux accusés de réception détectés:",
            newAccuses.map((d) => d.reference)
          );
          // Recharger les notifications depuis le serveur
          loadNotifications();
        }
      }

      const demandesArray = Array.isArray(data) ? data : [];
      setDemandes(demandesArray);

      // Calculer les statistiques avec les nouveaux statuts
      const newStats = {
        total: demandesArray.length,
        enCours: demandesArray.filter((d) =>
          [
            "EN_ATTENTE_DECISION_CIRCUIT",
            "REÇUE",
            "DEPOSEE",
            "RECEPTIONNEE",
            "TRANSMISE_AU_SG",
            "TRANSMISE_AU_DGI",
            "TRANSMISE_AU_MINISTRE",
            "EN_COURS_PNME",
            "COMPLEMENT_REQUIS_PNME",
            "VALIDEE_DDPI",
            "TRANSMISE_A_DGI",
            "EN_COURS_DGI",
            "VALIDEE_DGI",
            "VALIDEE_PNME",
          ].includes(d.statut)
        ).length,
        approuvees: demandesArray.filter((d) =>
          [
            "APPROUVEE",
            "AUTORISATION_SIGNEE",
            "VALIDEE_PNME",
            "CLOTUREE",
          ].includes(d.statut)
        ).length,
        refusees: demandesArray.filter((d) =>
          ["REFUSEE", "REJETEE"].includes(d.statut)
        ).length,
      };

      console.log("📊 Statistiques calculées:", newStats);
      setStats(newStats);
    } catch (error) {
      console.error("❌ Erreur lors du chargement des demandes:", error);
      setDemandes([]);
      setStats({ total: 0, enCours: 0, approuvees: 0, refusees: 0 });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Fonction pour charger les notifications
  const loadNotifications = async () => {
    if (!user?.id) return;

    setNotifLoading(true);
    try {
      const response = await fetch(
        `${API_BASE}/api/notifications?user_id=${user.id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();
      setNotifications(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("❌ Erreur lors du chargement des notifications:", error);
      setNotifications([]);
    } finally {
      setNotifLoading(false);
    }
  };

  // Écouter les changements dans le localStorage
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "lastAccuseUpdate") {
        console.log(
          "🔄 Changement détecté dans localStorage, rafraîchissement..."
        );
        loadDemandes(false);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Vérifier les mises à jour toutes les 5 secondes (plus réactif)
  useEffect(() => {
    const interval = setInterval(checkForAccuseUpdates, 5000);
    return () => clearInterval(interval);
  }, [lastAccuseCheck]);

  // Charger les données au montage et quand l'utilisateur change
  useEffect(() => {
    if (!user || !user.id) {
      navigate("/login");
      return;
    }

    loadDemandes();
    loadNotifications();
  }, [user, navigate]);

  // Fonction pour actualiser les données
  const handleRefresh = () => {
    console.log("🔄 Rafraîchissement manuel déclenché");
    loadDemandes(false); // Ne pas afficher le spinner principal
    loadNotifications();
  };

  // Fonction pour basculer le sidebar

  // Fonction pour télécharger l'accusé de réception
  const handleDownloadAccuse = async (reference) => {
    try {
      console.log(`📄 Téléchargement de l'accusé pour la demande ${reference}`);

      const response = await fetch(
        `${API_BASE}/api/download-accuse/${reference}`,
        {
          method: "GET",
        }
      );

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = `accuse_reception_${reference}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      console.log("✅ Accusé de réception téléchargé avec succès");
    } catch (error) {
      console.error("❌ Erreur lors du téléchargement de l'accusé:", error);
      alert("Erreur lors du téléchargement de l'accusé de réception");
    }
  };

  // Fonction pour télécharger l'autorisation signée
  const handleDownloadAutorisation = async (reference) => {
    try {
      console.log(
        `📄 Téléchargement de l'autorisation pour la référence ${reference}`
      );

      const response = await fetch(
        `${API_BASE}/api/download-autorisation/${reference}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = `autorisation_${reference}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      console.log("✅ Autorisation téléchargée avec succès");
    } catch (error) {
      console.error(
        "❌ Erreur lors du téléchargement de l'autorisation:",
        error
      );
      alert(
        "Erreur lors du téléchargement de l'autorisation. Vérifiez que vous êtes connecté et que l'autorisation est disponible."
      );
    }
  };

  // Fonction pour obtenir le style du badge de statut
  const getStatutStyle = (statut) => {
    const styles = {
      DEPOSEE: { backgroundColor: "#ffa940", color: "#fff" },
      RECEPTIONNEE: { backgroundColor: "#1890ff", color: "#fff" },
      TRANSMISE_AU_SG: { backgroundColor: "#13c2c2", color: "#fff" },
      TRANSMISE_AU_DGI: { backgroundColor: "#722ed1", color: "#fff" },
      TRANSMISE_AU_MINISTRE: { backgroundColor: "#eb2f96", color: "#fff" },
      AUTORISATION_SIGNEE: { backgroundColor: "#52c41a", color: "#fff" },
      VALIDEE_DDPI: { backgroundColor: "#52c41a", color: "#fff" },
      VALIDEE_DGI: { backgroundColor: "#52c41a", color: "#fff" },
      TRANSMISE_A_DGI: { backgroundColor: "#722ed1", color: "#fff" },
      EN_COURS_DGI: { backgroundColor: "#faad14", color: "#fff" },
      VALIDEE_PNME: { backgroundColor: "#52c41a", color: "#fff" },
      CLOTUREE: { backgroundColor: "#52c41a", color: "#fff" },
      REJETEE: { backgroundColor: "#f5222d", color: "#fff" },
      REFUSEE: { backgroundColor: "#f5222d", color: "#fff" },
      EN_COURS_PNME: { backgroundColor: "#faad14", color: "#fff" },
      COMPLEMENT_REQUIS_PNME: { backgroundColor: "#fa8c16", color: "#fff" },
    };

    return styles[statut] || { backgroundColor: "#d9d9d9", color: "#000" };
  };

  // Fonction pour obtenir le libellé du statut
  const getStatutLabel = (statut) => {
    const labels = {
      DEPOSEE: "Déposée",
      RECEPTIONNEE: "Réceptionnée",
      TRANSMISE_AU_SG: "Transmise au SG",
      TRANSMISE_AU_DGI: "Transmise à la DGI",
      TRANSMISE_AU_MINISTRE: "Transmise au Ministre",
      AUTORISATION_SIGNEE: "Autorisation Signée",
      VALIDEE_DDPI: "Validée DDPI",
      VALIDEE_DGI: "Validée DGI",
      TRANSMISE_A_DGI: "Transmise à la DGI",
      EN_COURS_DGI: "En cours DGI",
      VALIDEE_PNME: "Validée PNME",
      CLOTUREE: "Clôturée",
      REJETEE: "Rejetée",
      REFUSEE: "Refusée",
      EN_COURS_PNME: "En cours PNME",
      COMPLEMENT_REQUIS_PNME: "Complément requis",
    };

    return labels[statut] || statut;
  };

  // Protection contre user null
  if (!user) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          flexDirection: "column",
          gap: "20px",
        }}
      >
        <div className="loading-spinner"></div>
        <p>Chargement du profil utilisateur...</p>
      </div>
    );
  }

  return (
    <>
      <Header user={user} logout={logout} />

      <div className="dashboard-demandeur-container">
        {/* Left Panel - Sidebar */}
        <div className="left-panel">
          <div className="sidebar-header">
            <h3>Espace Demandeur</h3>
            <p>Dashboard Demandeur</p>
          </div>

          <nav className="sidebar-nav">
            <button className="nav-item active">
              <i className="fa fa-home" style={{ marginRight: "8px" }}></i>
              Tableau de bord
            </button>

            <Link to="/nouvelle-demande" className="nav-item">
              <i
                className="fa fa-plus-circle"
                style={{ marginRight: "8px" }}
              ></i>
              Nouvelle demande
            </Link>

            <Link to="/suivi-demandes" className="nav-item">
              <i
                className="fa fa-folder-open"
                style={{ marginRight: "8px" }}
              ></i>
              Suivi des demandes
            </Link>

            <Link to="/notifications" className="nav-item">
              <i className="fa fa-bell" style={{ marginRight: "8px" }}></i>
              Notifications
            </Link>

            <Link to="/mes-demandes" className="nav-item">
              <i className="fa fa-list" style={{ marginRight: "8px" }}></i>
              Mes demandes
            </Link>

            <Link to="/archive" className="nav-item">
              <i className="fa fa-archive" style={{ marginRight: "8px" }}></i>
              Archive
            </Link>
          </nav>

          {/* Bouton de déconnexion */}
          <div className="sidebar-footer">
            <button className="nav-item deconnexion-btn" onClick={logout}>
              <i className="fa fa-sign-out" style={{ marginRight: "8px" }}></i>
              Déconnexion
            </button>
          </div>
        </div>

        {/* Main Section - Contenu principal */}
        <div className="main-section">
          <div className="dashboard-header">
            <h1 className="dashboard-title">
              🏠 Bienvenue {user?.prenom_responsable || "Utilisateur"}{" "}
              {user?.nom_responsable || ""}
            </h1>
          </div>

          <div className="dashboard-content">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
              }}
            >
              <h2>
                Bienvenue {user?.prenom_responsable || "Utilisateur"}{" "}
                {user?.nom_responsable || ""}
              </h2>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "10px 18px",
                  border: refreshing
                    ? "2px solid #dee2e6"
                    : "2px solid #17a2b8",
                  borderRadius: "8px",
                  background: refreshing
                    ? "#f8f9fa"
                    : "linear-gradient(135deg, #17a2b8, #138496)",
                  cursor: refreshing ? "not-allowed" : "pointer",
                  color: refreshing ? "#6c757d" : "white",
                  fontWeight: "500",
                  fontSize: "0.9em",
                  transition: "all 0.3s ease",
                  boxShadow: refreshing
                    ? "none"
                    : "0 2px 4px rgba(23, 162, 184, 0.3)",
                }}
                onMouseOver={(e) => {
                  if (!refreshing) {
                    e.target.style.transform = "translateY(-1px)";
                    e.target.style.boxShadow =
                      "0 4px 8px rgba(23, 162, 184, 0.4)";
                  }
                }}
                onMouseOut={(e) => {
                  if (!refreshing) {
                    e.target.style.transform = "translateY(0)";
                    e.target.style.boxShadow =
                      "0 2px 4px rgba(23, 162, 184, 0.3)";
                  }
                }}
              >
                <ReloadOutlined spin={refreshing} />
                {refreshing
                  ? t("dashboardDemandeur.messages.loading")
                  : t("dashboardDemandeur.actions.nouvelleDemande")}
              </button>
            </div>

            {/* Statistiques horizontales */}
            <div className="dashboard-progress-bar">
              <div className="progress-item">
                <span className="progress-label">
                  {t("dashboardDemandeur.statistiques.totalDemandes")}
                </span>
                <span className="progress-value">{stats.total}</span>
              </div>
              <div className="progress-separator" />
              <div className="progress-item">
                <span className="progress-label">
                  {t("dashboardDemandeur.statistiques.enCours")}
                </span>
                <span className="progress-value">{stats.enCours}</span>
              </div>
              <div className="progress-separator" />
              <div className="progress-item">
                <span className="progress-label">
                  {t("dashboardDemandeur.statistiques.validees")}
                </span>
                <span className="progress-value">{stats.approuvees}</span>
              </div>
              <div className="progress-separator" />
              <div className="progress-item">
                <span className="progress-label">
                  {t("dashboardDemandeur.statistiques.rejetees")}
                </span>
                <span className="progress-value">{stats.refusees}</span>
              </div>
            </div>

            {/* Actions rapides */}
            <div className="dashboard-actions">
              <Link
                to="/nouvelle-demande"
                className="dashboard-btn dashboard-btn-primary"
              >
                <PlusCircleOutlined />{" "}
                {t("dashboardDemandeur.actions.nouvelleDemande")}
              </Link>
              <Link
                to="/suivi-demandes"
                className="dashboard-btn dashboard-btn-secondary"
              >
                <i className="fa fa-folder-open" style={{ marginRight: 8 }}></i>{" "}
                Suivi des Demandes
              </Link>
              <Link
                to="/notifications"
                className="dashboard-btn dashboard-btn-info"
              >
                <i className="fa fa-bell" style={{ marginRight: 8 }}></i>{" "}
                Notifications
              </Link>
              <Link
                to="/archive"
                className="dashboard-btn dashboard-btn-success"
              >
                <i className="fa fa-archive" style={{ marginRight: 8 }}></i>{" "}
                Archive
              </Link>
            </div>

            {/* Section Suivi des Demandes */}
            <div className="dashboard-section suivi-demandes-section">
              <h3 className="section-title">
                <i
                  className="fa fa-road"
                  style={{ marginRight: "8px", color: "#1e6a8e" }}
                ></i>
                Suivi des Étapes de vos Demandes ({demandes.length} demandes)
              </h3>

              {loading ? (
                <div className="loading-indicator">
                  <i
                    className="fa fa-spinner fa-spin"
                    style={{ marginRight: "8px" }}
                  ></i>
                  Chargement des demandes...
                </div>
              ) : demandes.length === 0 ? (
                <div className="no-demandes">
                  <i
                    className="fa fa-inbox"
                    style={{
                      fontSize: "3em",
                      color: "#ccc",
                      marginBottom: "16px",
                    }}
                  ></i>
                  <p>Aucune demande pour le moment</p>
                  <Link
                    to="/nouvelle-demande"
                    className="dashboard-btn dashboard-btn-primary"
                  >
                    <i className="fa fa-plus"></i> Créer ma première demande
                  </Link>
                </div>
              ) : (
                <div className="demandes-progression">
                  {demandes.slice(0, 5).map((demande, index) => (
                    <div key={demande.id} className="demande-progression-item">
                      <div className="demande-progression-header">
                        <div className="demande-info">
                          <span className="demande-reference">
                            {demande.reference}
                          </span>
                          <span className="demande-type">{demande.type}</span>
                        </div>
                        <span
                          className={`demande-statut ${demande.statut
                            .toLowerCase()
                            .replace(/_/g, "-")}`}
                        >
                          {getStatutLabel(demande.statut)}
                        </span>
                      </div>

                      <div className="demande-progression-bar">
                        <div className="progression-bar">
                          <div
                            className="progression-fill"
                            style={{
                              width:
                                getProgressPercentage(demande.statut) + "%",
                            }}
                          ></div>
                        </div>
                        <span className="progression-text">
                          {getProgressPercentage(demande.statut)}% complété
                        </span>
                      </div>

                      <div className="demande-etapes">
                        <div className="etape-item">
                          <span
                            className={`etape-icon ${
                              demande.statut === "DEPOSEE" ? "completed" : ""
                            }`}
                          >
                            <i className="fa fa-upload"></i>
                          </span>
                          <span className="etape-label">Déposée</span>
                        </div>

                        <div className="etape-item">
                          <span
                            className={`etape-icon ${
                              [
                                "RECEPTIONNEE",
                                "TRANSMISE_AU_SG",
                                "TRANSMISE_AU_DGI",
                                "EN_COURS_DGI",
                                "VALIDEE_DGI",
                                "TRANSMISE_AU_MINISTRE",
                                "AUTORISATION_SIGNEE",
                              ].includes(demande.statut)
                                ? "completed"
                                : ""
                            }`}
                          >
                            <i className="fa fa-check-circle"></i>
                          </span>
                          <span className="etape-label">Reçue</span>
                        </div>

                        <div className="etape-item">
                          <span
                            className={`etape-icon ${
                              [
                                "TRANSMISE_AU_SG",
                                "TRANSMISE_AU_DGI",
                                "EN_COURS_DGI",
                                "VALIDEE_DGI",
                                "TRANSMISE_AU_MINISTRE",
                                "AUTORISATION_SIGNEE",
                              ].includes(demande.statut)
                                ? "completed"
                                : ""
                            }`}
                          >
                            <i className="fa fa-share"></i>
                          </span>
                          <span className="etape-label">Transmise</span>
                        </div>

                        <div className="etape-item">
                          <span
                            className={`etape-icon ${
                              [
                                "EN_COURS_DGI",
                                "VALIDEE_DGI",
                                "TRANSMISE_AU_MINISTRE",
                                "AUTORISATION_SIGNEE",
                              ].includes(demande.statut)
                                ? "completed"
                                : ""
                            }`}
                          >
                            <i className="fa fa-cogs"></i>
                          </span>
                          <span className="etape-label">En cours</span>
                        </div>

                        <div className="etape-item">
                          <span
                            className={`etape-icon ${
                              [
                                "VALIDEE_DGI",
                                "TRANSMISE_AU_MINISTRE",
                                "AUTORISATION_SIGNEE",
                              ].includes(demande.statut)
                                ? "completed"
                                : ""
                            }`}
                          >
                            <i className="fa fa-thumbs-up"></i>
                          </span>
                          <span className="etape-label">Validée</span>
                        </div>

                        <div className="etape-item">
                          <span
                            className={`etape-icon ${
                              ["AUTORISATION_SIGNEE"].includes(demande.statut)
                                ? "completed"
                                : ""
                            }`}
                          >
                            <i className="fa fa-certificate"></i>
                          </span>
                          <span className="etape-label">Autorisée</span>
                        </div>
                      </div>

                      <div className="demande-actions">
                        <Link to="/suivi-demandes" className="btn-voir-details">
                          <i className="fa fa-eye"></i> Voir détails
                        </Link>
                        {demande.fichier_accuse && (
                          <button
                            onClick={() =>
                              handleDownloadAccuse(demande.reference)
                            }
                            className="btn-telecharger-accuse"
                          >
                            <i className="fa fa-download"></i> Télécharger
                            Accusé
                          </button>
                        )}
                        {(demande.statut === "AUTORISATION_SIGNEE" ||
                          demande.statut === "CLOTUREE") &&
                          demande.autorisation_pdf && (
                            <button
                              onClick={() =>
                                handleDownloadAutorisation(demande.reference)
                              }
                              className="btn-telecharger-autorisation"
                              style={{
                                backgroundColor: "#52c41a",
                                color: "white",
                                border: "none",
                                padding: "8px 16px",
                                borderRadius: "6px",
                                cursor: "pointer",
                                fontSize: "0.9em",
                                fontWeight: "500",
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                                transition: "all 0.3s ease",
                              }}
                              onMouseOver={(e) => {
                                e.target.style.backgroundColor = "#389e0d";
                                e.target.style.transform = "translateY(-1px)";
                              }}
                              onMouseOut={(e) => {
                                e.target.style.backgroundColor = "#52c41a";
                                e.target.style.transform = "translateY(0)";
                              }}
                            >
                              <i className="fa fa-certificate"></i> Télécharger
                              Autorisation
                            </button>
                          )}
                      </div>
                    </div>
                  ))}

                  {demandes.length > 5 && (
                    <div className="voir-plus-demandes">
                      <Link
                        to="/suivi-demandes"
                        className="dashboard-btn dashboard-btn-secondary"
                      >
                        Voir toutes mes demandes ({demandes.length})
                      </Link>
                    </div>
                  )}
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
