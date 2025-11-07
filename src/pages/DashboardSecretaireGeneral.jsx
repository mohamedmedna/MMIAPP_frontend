import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  FiTrello,
  FiList,
  FiClock,
  FiFileText,
  FiDownload,
  FiArrowLeft,
  FiCheckCircle,
  FiSend,
  FiLogOut,
  FiEye,
} from "react-icons/fi";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "./DashboardSecretaireGeneral.css";
import { apiCall, API_ENDPOINTS } from "../config/api";

const DashboardSecretaireGeneral = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [demandes, setDemandes] = useState([]);
  const [filteredDemandes, setFilteredDemandes] = useState([]);
  const [selectedDemande, setSelectedDemande] = useState(null);
  const [historique, setHistorique] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [selectedDemandeForDocs, setSelectedDemandeForDocs] = useState(null);

  useEffect(() => {
    if (activeTab === "dashboard" || activeTab === "demandes") {
      chargerDemandes();
    }
  }, [activeTab]);

  const chargerDemandes = async () => {
    setLoading(true);
    try {
      const data = await apiCall(API_ENDPOINTS.DEMANDES_A_TRAITER);
      console.log("Demandes chargées depuis API:", data);
      const demandesRecues = data.demandes || [];
      setDemandes(demandesRecues);
      setFilteredDemandes(demandesRecues);
    } catch (error) {
      console.error("Erreur:", error);
      if (
        error.message.includes("Session expirée") ||
        error.message.includes("Token invalide")
      ) {
        // Rediriger vers la page de login
        window.location.href = "/login-secretaire-general";
        return;
      }
      setMessage(error.message || "Erreur lors du chargement des demandes");
    } finally {
      setLoading(false);
    }
  };

  const chargerDemandeDetails = async (id) => {
    setLoading(true);
    try {
      const data = await apiCall(API_ENDPOINTS.DEMANDE_DETAILS(id));

      // Vérifier et nettoyer les données reçues
      const demande = data.demande || {};

      // S'assurer que fichiers est un tableau
      if (demande.fichiers && !Array.isArray(demande.fichiers)) {
        demande.fichiers = [];
      }

      // S'assurer que les autres champs sont définis
      demande.nom_demandeur = demande.nom_demandeur || "Non spécifié";
      demande.reference = demande.reference || "N/A";
      demande.type = demande.type || "Non spécifié";

      setSelectedDemande(demande);
      setActiveTab("details");
    } catch (error) {
      console.error("Erreur:", error);
      setMessage(error.message || "Erreur lors du chargement des détails");
    } finally {
      setLoading(false);
    }
  };

  const chargerHistorique = async () => {
    setLoading(true);
    try {
      const data = await apiCall(API_ENDPOINTS.HISTORIQUE_TRANSMISSIONS);
      setHistorique(data.historique || []);
    } catch (error) {
      console.error("Erreur:", error);
      setMessage(error.message || "Erreur lors du chargement de l'historique");
    } finally {
      setLoading(false);
    }
  };

  const transmettreAuMinistre = async (id) => {
    if (!window.confirm("Confirmer la transmission au Ministre ?")) return;

    setLoading(true);
    try {
      await apiCall(API_ENDPOINTS.DEMANDE_TRANSMETTRE(id), {
        method: "POST",
      });

      setMessage("Demande transmise au Ministre avec succès");
      chargerDemandes();
      if (selectedDemande && selectedDemande.id === id) {
        chargerDemandeDetails(id);
      }
    } catch (error) {
      console.error("Erreur:", error);
      setMessage(error.message || "Erreur lors de la transmission");
    } finally {
      setLoading(false);
    }
  };

  const transmettreAuDGI = async (id) => {
    if (!window.confirm("Confirmer la transmission à la DGI ?")) return;

    setLoading(true);
    try {
      await apiCall(API_ENDPOINTS.DEMANDE_TRANSMETTRE_DGI(id), {
        method: "POST",
      });

      setMessage("Demande transmise à la DGI avec succès");
      chargerDemandes();
      if (selectedDemande && selectedDemande.id === id) {
        chargerDemandeDetails(id);
      }
    } catch (error) {
      console.error("Erreur:", error);
      setMessage(error.message || "Erreur lors de la transmission");
    } finally {
      setLoading(false);
    }
  };

  const ajouterAnnotation = async (id, annotation) => {
    setLoading(true);
    try {
      await apiCall(API_ENDPOINTS.DEMANDE_ANNOTER(id), {
        method: "POST",
        body: JSON.stringify({ annotation }),
      });

      setMessage("Annotation ajoutée avec succès");
      if (selectedDemande && selectedDemande.id === id) {
        chargerDemandeDetails(id);
      }
    } catch (error) {
      console.error("Erreur:", error);
      setMessage(error.message || "Erreur lors de l'ajout de l'annotation");
    } finally {
      setLoading(false);
    }
  };

  const getStatutBadgeClass = (statut) => {
    switch (statut) {
      case "RECEPTIONNEE":
        return "statut-badge receptionnee";
      case "TRANSMISE":
      case "TRANSMISE_AU_SG":
      case "TRANSMISE_AU_MINISTRE":
      case "TRANSMISE_AU_DGI":
      case "TRANSMISE_AU_DDPI":
        return "statut-badge transmise";
      case "RETOURNEE":
        return "statut-badge retournee";
      case "APPROUVEE":
      case "VALIDE":
      case "APPROUVEE_MINISTRE":
        return "statut-badge approuvee";
      case "REJETEE":
        return "statut-badge rejetee";
      default:
        return "statut-badge";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("fr-FR");
  };

  const handleDeconnexion = () => {
    if (window.confirm("Êtes-vous sûr de vouloir vous déconnecter ?")) {
      localStorage.removeItem("adminToken");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login-secretaire-general";
    }
  };

  const ouvrirDocuments = async (demande) => {
    setMessage("Chargement des documents...");
    try {
      const [details, documents] = await Promise.all([
        apiCall(API_ENDPOINTS.DEMANDE_DETAILS(demande.id)),
        apiCall(API_ENDPOINTS.DEMANDE_DOCUMENTS(demande.id)),
      ]);

      setSelectedDemandeForDocs({
        ...demande,
        ...details.demande,
        nom_demandeur:
          details.demande.nom_demandeur || details.demande.demandeur_nom,
        documents: documents.documents || [],
      });
      setActiveTab("documents");
      setMessage("");
    } catch (err) {
      console.error("Erreur chargement documents:", err);
      setMessage(err.message || "Impossible de récupérer les documents");
    }
  };

  const demandesRecues = React.useMemo(
    () =>
      demandes.filter((d) =>
        ["RECEPTIONNEE", "DEPOSEE", "RETOURNEE", "RETOURNEE_SG"].includes(
          d.statut
        )
      ).length,
    [demandes]
  );

  const demandesTransmises = React.useMemo(
    () =>
      demandes.filter((d) =>
        [
          "TRANSMISE",
          "TRANSMISE_AU_SG",
          "TRANSMISE_AU_MINISTRE",
          "TRANSMISE_AU_DGI",
          "TRANSMISE_AU_DDPI",
        ].includes(d.statut)
      ).length,
    [demandes]
  );

  const demandesApprouvees = React.useMemo(
    () =>
      demandes.filter((d) =>
        ["APPROUVEE", "VALIDE", "APPROUVEE_MINISTRE"].includes(d.statut)
      ).length,
    [demandes]
  );

  const filtrerDemandes = (statut) => {
    if (statut === "all") {
      setFilteredDemandes(demandes);
      return;
    }

    if (statut === "RECEPTIONNEE") {
      setFilteredDemandes(
        demandes.filter((d) =>
          ["RECEPTIONNEE", "DEPOSEE", "RETOURNEE", "RETOURNEE_SG"].includes(
            d.statut
          )
        )
      );
      return;
    }

    if (statut === "TRANSMISE") {
      setFilteredDemandes(
        demandes.filter((d) =>
          [
            "TRANSMISE",
            "TRANSMISE_AU_SG",
            "TRANSMISE_AU_MINISTRE",
            "TRANSMISE_AU_DGI",
            "TRANSMISE_AU_DDPI",
          ].includes(d.statut)
        )
      );
      return;
    }

    if (statut === "APPROUVEE") {
      setFilteredDemandes(
        demandes.filter((d) =>
          ["APPROUVEE", "VALIDE", "APPROUVEE_MINISTRE"].includes(d.statut)
        )
      );
      return;
    }

    setFilteredDemandes(demandes.filter((d) => d.statut === statut));
  };

  return (
    <div className="dashboard-secretaire-general-page">
      <Header />

      <div className="main-container">
        {/* Barre latérale gauche */}
        <div className="left-panel">
          <div className="sidebar-header">
            <h3>Secrétaire Général</h3>
          </div>

          <nav className="sidebar-nav">
            <button
              className={`nav-item ${
                activeTab === "dashboard" ? "active" : ""
              }`}
              onClick={() => setActiveTab("dashboard")}
            >
              <FiTrello />
              Tableau de bord
            </button>

            <button
              className={`nav-item ${activeTab === "demandes" ? "active" : ""}`}
              onClick={() => setActiveTab("demandes")}
            >
              <FiList />
              Demandes à traiter
            </button>

            <button
              className={`nav-item ${
                activeTab === "historique" ? "active" : ""
              }`}
              onClick={() => {
                setActiveTab("historique");
                chargerHistorique();
              }}
            >
              <FiClock />
              Historique global
            </button>

            <button
              className={`nav-item ${
                activeTab === "documents" ? "active" : ""
              }`}
              onClick={() => setActiveTab("documents")}
            >
              <FiEye />
              Voir Documents
            </button>
          </nav>

          {/* Bouton de déconnexion */}
          <div className="sidebar-footer">
            <button
              className="nav-item deconnexion-btn"
              onClick={handleDeconnexion}
            >
              <FiLogOut />
              Se déconnecter
            </button>
          </div>
        </div>

        {/* Section principale */}
        <div className="main-section">
          {message && (
            <div
              className={`message ${
                message.includes("succès") ? "success" : "error"
              }`}
            >
              {message}
              <button onClick={() => setMessage("")}>&times;</button>
            </div>
          )}

          {loading && (
            <div className="loading">
              <div className="spinner"></div>
              Chargement...
            </div>
          )}

          {/* Tableau de bord */}
          {activeTab === "dashboard" && (
            <div className="dashboard-content">
              <h2>Tableau de bord</h2>

              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon">
                    <FiFileText />
                  </div>
                  <div className="stat-info">
                    <h3>{demandesRecues}</h3>
                    <p>Demandes reçues</p>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">
                    <FiSend />
                  </div>
                  <div className="stat-info">
                    <h3>{demandesTransmises}</h3>
                    <p>Demandes transmises</p>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">
                    <FiCheckCircle />
                  </div>
                  <div className="stat-info">
                    <h3>{demandesApprouvees}</h3>
                    <p>Demandes approuvées</p>
                  </div>
                </div>
              </div>

              <div className="recent-demandes">
                <h3>Demandes récentes</h3>
                <div className="demandes-list">
                  {demandes.slice(0, 5).map((demande) => (
                    <div key={demande.id} className="demande-item">
                      <div className="demande-info">
                        <span className="demande-reference">
                          {demande.reference}
                        </span>
                        <span
                          className={`statut-badge ${getStatutBadgeClass(
                            demande.statut
                          )}`}
                        >
                          {demande.statut}
                        </span>
                      </div>
                      <div className="demande-date">
                        {formatDate(
                          demande.date_demande ||
                            demande.date ||
                            demande.created_at
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Liste des demandes */}
          {activeTab === "demandes" && (
            <div className="demandes-content">
              <h2>Demandes à traiter</h2>

              <div className="demandes-filters">
                <select
                  onChange={(e) => {
                    filtrerDemandes(e.target.value);
                  }}
                >
                  <option value="all">Tous les statuts</option>
                  <option value="RECEPTIONNEE">Reçues</option>
                  <option value="TRANSMISE">Transmises</option>
                  <option value="APPROUVEE">Approuvées</option>
                </select>
              </div>

              <div className="demandes-table">
                <table>
                  <thead>
                    <tr>
                      <th>Référence</th>
                      <th>Demandeur</th>
                      <th>Date</th>
                      <th>Statut</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDemandes.map((demande) => (
                      <tr key={demande.id}>
                        <td>{demande.reference}</td>
                        <td>
                          {demande.nom_demandeur ||
                            demande.nom ||
                            demande.demandeur_nom}
                        </td>
                        <td>{formatDate(demande.date_demande)}</td>
                        <td>
                          <span
                            className={`statut-badge ${getStatutBadgeClass(
                              demande.statut
                            )}`}
                          >
                            {demande.statut}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button
                              className="btn btn-primary"
                              onClick={() => chargerDemandeDetails(demande.id)}
                            >
                              Voir détails
                            </button>
                            <button
                              className="btn btn-info"
                              onClick={() => ouvrirDocuments(demande)}
                            >
                              <FiEye /> Documents
                            </button>
                            {[
                              "RECEPTIONNEE",
                              "DEPOSEE",
                              "RETOURNEE",
                              "RETOURNEE_SG",
                              "TRANSMISE_AU_SG",
                              "TRANSMISE",
                              "TRANSMISE_AU_DGI",
                            ].includes(demande.statut) && (
                              <button
                                className="btn btn-success"
                                onClick={() =>
                                  transmettreAuMinistre(demande.id)
                                }
                                title="Transmettre au Ministre"
                              >
                                <FiSend /> Ministre
                              </button>
                            )}
                            {[
                              "RECEPTIONNEE",
                              "DEPOSEE",
                              "RETOURNEE",
                              "RETOURNEE_SG",
                              "TRANSMISE_AU_SG",
                              "TRANSMISE",
                            ].includes(demande.statut) && (
                              <button
                                className="btn btn-warning"
                                onClick={() => transmettreAuDGI(demande.id)}
                                title="Transmettre à la DGI"
                              >
                                <FiSend /> DGI
                              </button>
                            )}
                            {demande.statut === "RETOURNEE" && (
                              <button
                                className="btn btn-success"
                                onClick={() =>
                                  transmettreAuMinistre(demande.id)
                                }
                                title="Transmettre à nouveau au Ministre"
                              >
                                <FiSend /> Ministre
                              </button>
                            )}
                            {demande.statut === "RETOURNEE" && (
                              <button
                                className="btn btn-warning"
                                onClick={() => transmettreAuDGI(demande.id)}
                                title="Transmettre à nouveau à la DGI"
                              >
                                <FiSend /> DGI
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Détails d'une demande */}
          {activeTab === "details" && selectedDemande && (
            <div className="demande-details">
              <div className="details-header">
                <h2>Détails de la demande {selectedDemande.reference}</h2>
                <button
                  className="btn btn-secondary"
                  onClick={() => setActiveTab("demandes")}
                >
                  <FiArrowLeft /> Retour à la liste
                </button>
              </div>

              <div className="details-section">
                <h3>Informations générales</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <label>Référence:</label>
                    <span>{selectedDemande.reference}</span>
                  </div>
                  <div className="info-item">
                    <label>Statut:</label>
                    <span
                      className={`statut-badge ${getStatutBadgeClass(
                        selectedDemande.statut
                      )}`}
                    >
                      {selectedDemande.statut}
                    </span>
                  </div>
                  <div className="info-item">
                    <label>Date de demande:</label>
                    <span>{formatDate(selectedDemande.date_demande)}</span>
                  </div>
                  <div className="info-item">
                    <label>Demandeur:</label>
                    <span>{selectedDemande.nom_demandeur}</span>
                  </div>
                </div>
              </div>

              <div className="details-section">
                <h3>Fichiers joints</h3>
                <div className="fichiers-list">
                  {selectedDemande.fichiers &&
                  Array.isArray(selectedDemande.fichiers) &&
                  selectedDemande.fichiers.length > 0 ? (
                    selectedDemande.fichiers.map((fichier, index) => (
                      <div key={index} className="fichier-item">
                        <FiFileText />
                        <span>{fichier.nom || fichier}</span>
                        <button className="btn btn-small">
                          <FiDownload /> Télécharger
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="fichier-item no-files">
                      <FiFileText />
                      <span>Aucun fichier joint</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="details-section">
                <h3>Actions</h3>
                <div className="actions-buttons">
                  {selectedDemande.statut === "RECEPTIONNEE" && (
                    <>
                      <button
                        className="btn btn-success"
                        onClick={() =>
                          transmettreAuMinistre(selectedDemande.id)
                        }
                      >
                        <FiSend /> Transmettre au Ministre
                      </button>
                      <button
                        className="btn btn-info"
                        onClick={() => transmettreAuDGI(selectedDemande.id)}
                      >
                        <FiSend /> Transmettre à la DGI
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="details-section">
                <h3>Ajouter une annotation</h3>
                <form
                  className="annotation-form"
                  onSubmit={(e) => {
                    e.preventDefault();
                    const annotation = e.target.annotation.value;
                    if (annotation.trim()) {
                      ajouterAnnotation(selectedDemande.id, annotation);
                      e.target.annotation.value = "";
                    }
                  }}
                >
                  <textarea
                    name="annotation"
                    placeholder="Saisissez votre annotation..."
                    rows="4"
                    required
                  ></textarea>
                  <button type="submit" className="btn btn-primary">
                    Ajouter l'annotation
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Historique global */}
          {activeTab === "historique" && (
            <div className="historique-content">
              <h2>Historique global des transmissions</h2>

              <div className="historique-table">
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Demande</th>
                      <th>Action</th>
                      <th>Destinataire</th>
                      <th>Utilisateur</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historique.map((item, index) => (
                      <tr key={index}>
                        <td>{formatDate(item.date_action)}</td>
                        <td>{item.reference_demande}</td>
                        <td>{item.action}</td>
                        <td>{item.destinataire}</td>
                        <td>{item.nom_utilisateur}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Page de visualisation des documents */}
          {activeTab === "documents" && (
            <div className="documents-content">
              <div className="documents-header">
                <h2>Inspection des Documents</h2>
                {selectedDemandeForDocs ? (
                  <div className="demande-info-header">
                    <h3>Demande : {selectedDemandeForDocs.reference}</h3>
                    <p>
                      Demandeur :{" "}
                      {selectedDemandeForDocs.nom_demandeur ||
                        selectedDemandeForDocs.demandeur_nom}
                    </p>
                    <p>
                      Date : {formatDate(selectedDemandeForDocs.date_demande)}
                    </p>
                  </div>
                ) : (
                  <div className="select-demande">
                    <h3>Sélectionner une demande pour voir ses documents</h3>
                    <div className="demandes-list-docs">
                      {demandes.map((demande) => (
                        <div key={demande.id} className="demande-card-docs">
                          <div className="demande-info-docs">
                            <span className="demande-reference">
                              {demande.reference}
                            </span>
                            <span
                              className={`statut-badge ${getStatutBadgeClass(
                                demande.statut
                              )}`}
                            >
                              {demande.statut}
                            </span>
                          </div>
                          <div className="demande-meta">
                            <span>{demande.nom_demandeur}</span>
                            <span>{formatDate(demande.date_demande)}</span>
                          </div>
                          <button
                            className="btn btn-primary"
                            onClick={() => ouvrirDocuments(demande)}
                          >
                            <FiEye /> Inspecter Documents
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {selectedDemandeForDocs && (
                <div className="documents-section">
                  <div className="documents-actions">
                    <button
                      className="btn btn-secondary"
                      onClick={() => {
                        setSelectedDemandeForDocs(null);
                        setActiveTab("documents");
                      }}
                    >
                      <FiArrowLeft /> Retour à la liste
                    </button>
                    {selectedDemandeForDocs.statut === "RECEPTIONNEE" && (
                      <>
                        <button
                          className="btn btn-success"
                          onClick={() =>
                            transmettreAuMinistre(selectedDemandeForDocs.id)
                          }
                        >
                          <FiSend /> Transmettre au Ministre
                        </button>
                        <button
                          className="btn btn-warning"
                          onClick={() =>
                            transmettreAuDGI(selectedDemandeForDocs.id)
                          }
                        >
                          <FiSend /> Transmettre à la DGI
                        </button>
                      </>
                    )}
                  </div>

                  <div className="documents-list documents-list--flat">
                    {selectedDemandeForDocs.documents &&
                    selectedDemandeForDocs.documents.length > 0 ? (
                      selectedDemandeForDocs.documents.map((doc, idx) => (
                        <div key={idx} className="document-item">
                          <FiFileText />
                          <div className="document-info">
                            <span className="document-name">{doc.name}</span>
                          </div>
                          <div className="document-actions">
                            <a
                              className="btn btn-small btn-primary"
                              href={doc.url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <FiEye /> Voir
                            </a>
                            <a
                              className="btn btn-small btn-info"
                              href={doc.url}
                              download
                            >
                              <FiDownload /> Télécharger
                            </a>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="document-item no-files">
                        <FiFileText />
                        <span>Aucun document trouvé dans les uploads</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default DashboardSecretaireGeneral;
