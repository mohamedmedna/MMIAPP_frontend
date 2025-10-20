import React, { useState, useEffect } from "react";
import {
  AppstoreOutlined,
  FileDoneOutlined,
  HistoryOutlined,
  BarChartOutlined,
  LineChartOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import Header from "../components/Header";
import Footer from "../components/Footer";
import BanniereMinistereCoupee from "../components/BanniereMinistereCoupee";
import "../Styles/DashboardPNME.css";

const baseUrl = window.__APP_CONFIG__?.API_BASE;

function SidebarPNME({ user, onLogout, activeMenu, setActiveMenu }) {
  const links = [
    {
      key: "a_traiter",
      label: "Dossiers à traiter",
      icon: <FileDoneOutlined />,
    },
    { key: "historique", label: "Historique", icon: <HistoryOutlined /> },
    { key: "stats", label: "Statistiques", icon: <BarChartOutlined /> },
    { key: "reporting", label: "Reporting", icon: <LineChartOutlined /> },
  ];
  return (
    <nav className="dashboard-sidebar">
      <div className="sidebar-title">Espace PNME</div>
      <div className="sidebar-user">
        <div className="user-name">
          {user.nom} {user.prenom}
        </div>
        <div className="user-role">Administrateur PNME</div>
      </div>
      <div className="sidebar-menu">
        {links.map((link) => (
          <button
            key={link.key}
            onClick={() => setActiveMenu(link.key)}
            className={`sidebar-link ${
              activeMenu === link.key ? "active" : ""
            }`}
          >
            {link.icon}
            <span>{link.label}</span>
          </button>
        ))}
      </div>
      <button onClick={onLogout} className="sidebar-logout">
        <LogoutOutlined />
        <span>Déconnexion</span>
      </button>
    </nav>
  );
}

function StatsPNME({ stats }) {
  const statItems = [
    { label: "Total demandes", value: stats.total, color: "#34495e" },
    { label: "Validées", value: stats.validees, color: "#27ae60" },
    { label: "En attente", value: stats.en_attente, color: "#f39c12" },
    { label: "Rejetées", value: stats.rejetees, color: "#e74c3c" },
    { label: "En cours", value: stats.en_cours, color: "#3498db" },
  ];

  return (
    <div className="stats-container">
      <h2 className="content-title">Tableau de bord</h2>
      <div className="stats-horizontal-container">
        {statItems.map(({ label, value, color }) => (
          <div key={label} className="stat-item">
            <div className="stat-item-label">{label}</div>
            <div className="stat-item-value" style={{ color }}>
              {value ?? 0}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ReportingPNME() {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${baseUrl}/api/drmne/demandes?statut=TOUTES&format=csv`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("pnme_token")}`,
          },
        }
      );
      if (!response.ok) throw new Error("Erreur réseau");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = `rapport_pnme_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Erreur téléchargement:", error);
      alert("Le téléchargement du rapport a échoué.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reporting-container">
      <h2 className="content-title">Reporting PNME</h2>
      <div className="reporting-card">
        <p>
          Générez un rapport complet de toutes les demandes PNME au format CSV.
        </p>
        <button
          onClick={handleDownload}
          disabled={loading}
          className="reporting-btn"
        >
          {loading ? "Génération..." : "Télécharger le rapport CSV"}
        </button>
      </div>
    </div>
  );
}

function TableDemandesPNME({
  demandes,
  onVoirDetails,
  onValider,
  onRejeter,
  onDemanderPieces,
}) {
  return (
    <div className="table-container">
      <table className="demandes-table">
        <thead>
          <tr>
            <th>Référence</th>
            <th>Date dépôt</th>
            <th>Statut</th>
            <th>Pièces jointes</th>
            <th>Motif de rejet</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {demandes.length === 0 ? (
            <tr>
              <td colSpan="6" className="no-demandes-row">
                Aucune demande disponible
              </td>
            </tr>
          ) : (
            demandes.map((demande) => (
              <tr key={demande.id}>
                <td>{demande.reference}</td>
                <td>
                  {new Date(demande.created_at).toLocaleDateString("fr-FR")}
                </td>
                <td>
                  <span
                    className={`statut-badge statut-${demande.statut?.toLowerCase()}`}
                  >
                    {demande.statut?.replace(/_/g, " ").toLowerCase()}
                  </span>
                </td>
                <td className="files-cell">
                  {demande.fichiers &&
                    Object.entries(demande.fichiers).map(([k, file]) => (
                      <a
                        key={k}
                        href={`${baseUrl}/uploads/${file}`}
                        target="_blank"
                        rel="noreferrer"
                        className="piece-link"
                      >
                        {k.replace("_file", "").replace(/_/g, " ")}
                      </a>
                    ))}
                </td>
                <td>{demande.motif_rejet || "-"}</td>
                <td className="actions-cell">
                  <button
                    onClick={() => onVoirDetails(demande)}
                    className="action-btn view"
                  >
                    Voir
                  </button>
                  <button
                    onClick={() => onValider(demande)}
                    className="action-btn validate"
                  >
                    Valider
                  </button>
                  <button
                    onClick={() => onRejeter(demande)}
                    className="action-btn reject"
                  >
                    Rejeter
                  </button>
                  <button
                    onClick={() => onDemanderPieces(demande)}
                    className="action-btn request-pieces"
                  >
                    Demander pièces
                  </button>
                  {demande.fichier_accuse && (
                    <a
                      href={`${baseUrl}/uploads/${demande.fichier_accuse}`}
                      target="_blank"
                      rel="noreferrer"
                      className="action-btn-link"
                    >
                      Accusé
                    </a>
                  )}
                  {demande.lien_autorisation && (
                    <a
                      href={`${baseUrl}/uploads/${demande.lien_autorisation}`}
                      target="_blank"
                      rel="noreferrer"
                      className="action-btn-link blue"
                    >
                      Attestation
                    </a>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function PopupDetailsPNME({ demande, onClose }) {
  const [historique, setHistorique] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (demande) {
      setLoading(true);
      fetch(`${baseUrl}/api/drmne/demandes/${demande.id}/historique`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("pnme_token")}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          setHistorique(data.historique || []);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [demande]);

  if (!demande) return null;
  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-content" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="popup-close">
          &times;
        </button>
        <h2>Détail de la demande {demande.reference}</h2>
        <p>
          <b>Date:</b>{" "}
          {new Date(demande.created_at).toLocaleDateString("fr-FR")}
        </p>
        <p>
          <b>Statut:</b> {demande.statut}
        </p>
        <p>
          <b>Motif rejet:</b> {demande.motif_rejet || "-"}
        </p>
        <p>
          <b>Pièces jointes:</b>
          {demande.fichiers &&
            Object.entries(demande.fichiers).map(([k, f]) => (
              <a
                key={k}
                href={`${baseUrl}/uploads/${f}`}
                target="_blank"
                rel="noreferrer"
                style={{
                  marginLeft: 8,
                  color: "#229954",
                  textDecoration: "underline",
                }}
              >
                {k.replace("_file", "").replace(/_/g, " ")}
              </a>
            ))}
        </p>
        {demande.fichier_accuse && (
          <a
            href={`${baseUrl}/uploads/${demande.fichier_accuse}`}
            target="_blank"
            rel="noreferrer"
            style={{
              display: "inline-block",
              marginTop: 10,
              background: "#229954",
              color: "#fff",
              padding: "6px 12px",
              borderRadius: 6,
              fontWeight: "700",
              textDecoration: "none",
            }}
          >
            Télécharger accusé
          </a>
        )}
        {demande.lien_autorisation && (
          <a
            href={`${baseUrl}/uploads/${demande.lien_autorisation}`}
            target="_blank"
            rel="noreferrer"
            style={{
              display: "inline-block",
              marginTop: 10,
              background: "#007bff",
              color: "#fff",
              padding: "6px 12px",
              borderRadius: 6,
              fontWeight: "700",
              textDecoration: "none",
            }}
          >
            Télécharger l'Attestation
          </a>
        )}

        <h3 style={{ marginTop: 24, color: "#229954" }}>
          Historique des actions
        </h3>
        {loading ? (
          <p>Chargement de l'historique...</p>
        ) : (
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              maxHeight: 150,
              overflowY: "auto",
            }}
          >
            {historique.map((h) => (
              <li
                key={h.id}
                style={{ borderBottom: "1px solid #eee", padding: "8px 0" }}
              >
                <b>{h.action.replace(/_/g, " ")}</b> par{" "}
                <i>{h.utilisateur || "Système"}</i>
                <div style={{ fontSize: "0.9rem", color: "#666" }}>
                  {h.message}
                </div>
                <div
                  style={{
                    fontSize: "0.8rem",
                    color: "#999",
                    textAlign: "right",
                  }}
                >
                  {new Date(h.date_action).toLocaleString("fr-FR")}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function DashboardPNME({ user }) {
  const [demandes, setDemandes] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [popup, setPopup] = useState(null);
  const [showRejet, setShowRejet] = useState(false);
  const [showPieces, setShowPieces] = useState(false);
  const [demandeAction, setDemandeAction] = useState(null);
  const [motifRejet, setMotifRejet] = useState("");
  const [messagePieces, setMessagePieces] = useState("");
  const [notif, setNotif] = useState("");
  const [error, setError] = useState("");
  const [activeMenu, setActiveMenu] = useState("a_traiter");
  const [demandesATraiter, setDemandesATraiter] = useState([]);
  const [demandesHistorique, setDemandesHistorique] = useState([]);

  useEffect(() => {
    if (!user) return;
    setLoading(true);

    const endpoints = {
      a_traiter: `${baseUrl}/api/drmne/demandes?statut=DEPOSEE,EN_COURS_TRAITEMENT,PIECES_MANQUANTES`,
      historique: `${baseUrl}/api/drmne/demandes?statut=EN_ATTENTE_SIGNATURE,REJETEE,AUTORISATION_SIGNEE`,
      stats: `${baseUrl}/api/drmne/demandes?statut=TOUTES`,
    };

    const fetchDemandes = async (endpoint, setter) => {
      const res = await fetch(endpoint, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("pnme_token")}`,
        },
      });
      const json = await res.json();
      setter(json.demandes || []);
    };

    Promise.all([
      fetchDemandes(endpoints.a_traiter, setDemandesATraiter),
      fetchDemandes(endpoints.historique, setDemandesHistorique),
      fetch(endpoints.stats, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("pnme_token")}`,
        },
      }).then((res) => res.json()),
    ])
      .then(([, , statsJson]) => {
        setStats(statsJson.stats || {});
      })
      .catch((e) => {
        setError("Erreur chargement données");
      })
      .finally(() => setLoading(false));
  }, [user, notif]);

  const handleLogout = () => {
    localStorage.removeItem("pnme_token");
    localStorage.removeItem("pnme_user");
    window.location.href = "/login-pnme";
  };

  const handleValider = async (demande) => {
    if (!window.confirm("Confirmer la validation ?")) return;
    try {
      const res = await fetch(
        `${baseUrl}/api/drmne/demandes/${demande.id}/valider`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("pnme_token")}`,
          },
          body: JSON.stringify({ commentaire: "Validé par PNME" }),
        }
      );
      if (res.ok) setNotif("Demande validée");
      else setError("Erreur validation");
    } catch {
      setError("Erreur requête");
    }
  };

  const handleRejeter = (demande) => {
    setDemandeAction(demande);
    setMotifRejet("");
    setShowRejet(true);
  };

  const submitRejet = async () => {
    if (!motifRejet.trim()) return alert("Motif requis");
    try {
      const res = await fetch(
        `${baseUrl}/api/drmne/demandes/${demandeAction.id}/rejeter`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("pnme_token")}`,
          },
          body: JSON.stringify({ motif: motifRejet }),
        }
      );
      if (res.ok) {
        setNotif("Demande rejetée");
        setShowRejet(false);
      } else setError("Erreur rejection");
    } catch {
      setError("Erreur requête");
    }
  };

  const handleDemanderPieces = (demande) => {
    setDemandeAction(demande);
    setMessagePieces("");
    setShowPieces(true);
  };
  const submitPieces = async () => {
    if (!messagePieces.trim()) return alert("Message requis");
    try {
      const res = await fetch(
        `${baseUrl}/api/drmne/demandes/${demandeAction.id}/demander-complement`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("pnme_token")}`,
          },
          body: JSON.stringify({ message: messagePieces }),
        }
      );
      if (res.ok) {
        setNotif("Demande de pièces envoyée");
        setShowPieces(false);
      } else setError("Erreur demande pièces");
    } catch {
      setError("Erreur requête");
    }
  };

  if (!user) return <div className="loading-container">Accès non autorisé</div>;

  return (
    <div className="dashboard-pnme-page">
      <Header />
      <div className="dashboard-container">
        <SidebarPNME
          user={user}
          onLogout={handleLogout}
          activeMenu={activeMenu}
          setActiveMenu={setActiveMenu}
        />
        <main className="dashboard-main">
          <Header />
          <div className="dashboard-content">
            {error && <div className="error-message">{error}</div>}
            {notif && <div className="success-message">{notif}</div>}

            {loading ? (
              <div className="loading-container">Chargement...</div>
            ) : (
              <>
                {activeMenu === "a_traiter" && (
                  <>
                    <h2 className="content-title">Dossiers à traiter</h2>
                    <TableDemandesPNME
                      demandes={demandesATraiter}
                      onVoirDetails={setPopup}
                      onValider={handleValider}
                      onRejeter={handleRejeter}
                      onDemanderPieces={handleDemanderPieces}
                    />
                  </>
                )}
                {activeMenu === "historique" && (
                  <>
                    <h2 className="content-title">Historique des demandes</h2>
                    <TableDemandesPNME
                      demandes={demandesHistorique}
                      onVoirDetails={setPopup}
                      onValider={() => {}}
                      onRejeter={() => {}}
                      onDemanderPieces={() => {}}
                    />
                  </>
                )}
                {activeMenu === "stats" && <StatsPNME stats={stats} />}
                {activeMenu === "reporting" && <ReportingPNME />}
              </>
            )}
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}

export default DashboardPNME;
