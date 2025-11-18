import React, { useEffect, useState } from "react";
import {
  Layout,
  Menu,
  Table,
  Button,
  Modal,
  Tag,
  Spin,
  Input,
  notification,
  Tabs,
  Statistic,
  Row,
  Col,
} from "antd";
import {
  DashboardOutlined,
  FileTextOutlined,
  BellOutlined,
  SettingOutlined,
  LogoutOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SendOutlined,
  CommentOutlined,
} from "@ant-design/icons";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "../Styles/DashboardDDPI.css";
import { useTranslation } from "react-i18next";

const { Content, Sider } = Layout;
const { TextArea } = Input;

export default function DashboardDDPI() {
  const API_BASE = window.__APP_CONFIG__?.API_BASE;

  // Suppresseur d'erreur ResizeObserver
  useEffect(() => {
    const resizeObserverErrDiv = document.getElementById(
      "webpack-dev-server-client-overlay-div"
    );
    const resizeObserverErr = document.getElementById(
      "webpack-dev-server-client-overlay"
    );
    if (resizeObserverErrDiv) resizeObserverErrDiv.style.display = "none";
    if (resizeObserverErr) resizeObserverErr.style.display = "none";

    // Supprimer les erreurs ResizeObserver de la console
    const originalError = console.error;
    console.error = function (message) {
      if (
        typeof message === "string" &&
        message.includes("ResizeObserver loop completed")
      ) {
        return;
      }
      originalError.apply(console, arguments);
    };

    return () => {
      console.error = originalError;
    };
  }, []);

  const [stats, setStats] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [demandes, setDemandes] = useState([]);
  const [selectedDemande, setSelectedDemande] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [commentaire, setCommentaire] = useState("");
  const [historique, setHistorique] = useState([]);
  const [histLoading, setHistLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeSidebarLink, setActiveSidebarLink] = useState("dashboard");
  // Récupérer le token depuis toutes les sources possibles
  const getToken = () => {
    return (
      localStorage.getItem("adminToken") ||
      localStorage.getItem("token") ||
      null
    );
  };

  const token = getToken();
  const { t } = useTranslation();

  // Vérification du token au démarrage
  useEffect(() => {
    if (!token) {
      console.error("❌ [DDPI] Token manquant - redirection vers login");
      window.location.href = "/login-ddpi";
      return;
    }

    console.log("🔄 [DDPI] Initialisation du dashboard");
    console.log("🔑 [DDPI] Token présent:", token.substring(0, 20) + "...");

    // TEMPORAIRE: Charger directement les données sans vérification de token
    // pour identifier si le problème vient de la vérification
    console.log("⚠️ [DDPI] Mode temporaire: chargement direct des données");
    loadDataDirectly();

    // ORIGINAL: checkTokenValidity();
  }, [token]);

  // Fonction pour vérifier la validité du token
  const checkTokenValidity = async () => {
    try {
      const currentToken = getToken();
      if (!currentToken) {
        console.error("❌ [DDPI] Aucun token trouvé, redirection vers login");
        window.location.href = "/login-ddpi";
        return;
      }

      const res = await fetch(`${API_BASE}/api/ddpi/verify-token`, {
        headers: { Authorization: `Bearer ${currentToken}` },
      });

      if (res.ok) {
        console.log("✅ [DDPI] Token valide, chargement des données...");
        // Token valide, charger les données
        await Promise.all([
          fetchStats(),
          fetchNotifications(),
          fetchDemandes(),
        ]);
      } else {
        console.error("❌ [DDPI] Token invalide, redirection vers login");
        // Nettoyer tous les tokens possibles
        localStorage.removeItem("adminToken");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login-ddpi";
      }
    } catch (error) {
      console.error(
        "❌ [DDPI] Erreur lors de la vérification du token:",
        error
      );
      // Nettoyer tous les tokens possibles
      localStorage.removeItem("adminToken");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login-ddpi";
    }
  };

  // Fonction temporaire pour charger les données directement
  const loadDataDirectly = async () => {
    try {
      console.log("🔄 [DDPI] Chargement direct des données...");
      await Promise.all([fetchStats(), fetchNotifications(), fetchDemandes()]);
      console.log("✅ [DDPI] Données chargées avec succès");
    } catch (error) {
      console.error("❌ [DDPI] Erreur lors du chargement direct:", error);
    }
  };

  const fetchStats = async () => {
    try {
      console.log("🔄 [DDPI] Chargement des statistiques");
      const currentToken = getToken();
      if (!currentToken) {
        console.error("❌ [DDPI] Aucun token trouvé");
        return;
      }

      const res = await fetch(`${API_BASE}/api/ddpi/stats`, {
        headers: { Authorization: `Bearer ${currentToken}` },
      });

      console.log("📊 [DDPI] Réponse stats:", res.status, res.statusText);

      // TEMPORAIRE: Ne pas rediriger automatiquement en cas d'erreur 401
      // pour identifier le problème
      if (res.status === 401) {
        console.error(
          "❌ [DDPI] Token expiré (mode debug - pas de redirection)"
        );
        // Afficher des données factices pour le test
        setStats([
          {
            id: 1,
            label: t("dashboardDDPI.stats.pending"),
            value: 0,
            color: "#1890ff",
          },
          {
            id: 2,
            label: t("dashboardDDPI.stats.validated"),
            value: 0,
            color: "#52c41a",
          },
          {
            id: 3,
            label: t("dashboardDDPI.stats.rejected"),
            value: 0,
            color: "#ff4d4f",
          },
          {
            id: 4,
            label: t("dashboardDDPI.stats.total"),
            value: 0,
            color: "#722ed1",
          },
        ]);
        return;
      }

      if (!res.ok) {
        const errorText = await res.text();
        console.error("❌ [DDPI] Erreur stats:", errorText);
        throw new Error(`Erreur ${res.status}: ${errorText}`);
      }

      const data = await res.json();
      console.log("✅ [DDPI] Données stats reçues:", data);
      setStats(data.stats || []);
    } catch (err) {
      console.error(
        "❌ [DDPI] Erreur lors du chargement des statistiques:",
        err
      );
      // TEMPORAIRE: Ne pas afficher d'erreur pour le test
      console.log("⚠️ [DDPI] Mode debug: affichage de données factices");
      setStats([
        {
          id: 1,
          label: t("dashboardDDPI.stats.pending"),
          value: 0,
          color: "#1890ff",
        },
        {
          id: 2,
          label: t("dashboardDDPI.stats.validated"),
          value: 0,
          color: "#52c41a",
        },
        {
          id: 3,
          label: t("dashboardDDPI.stats.rejected"),
          value: 0,
          color: "#ff4d4f",
        },
        {
          id: 4,
          label: t("dashboardDDPI.stats.total"),
          value: 0,
          color: "#722ed1",
        },
      ]);
    }
  };

  const fetchNotifications = async () => {
    try {
      console.log("🔄 [DDPI] Chargement des notifications");
      const currentToken = getToken();
      if (!currentToken) {
        console.error("❌ [DDPI] Aucun token trouvé");
        return;
      }

      const res = await fetch(`${API_BASE}/api/ddpi/notifications`, {
        headers: { Authorization: `Bearer ${currentToken}` },
      });

      // TEMPORAIRE: Ne pas rediriger automatiquement en cas d'erreur 401
      if (res.status === 401) {
        console.error(
          "❌ [DDPI] Token expiré (mode debug - pas de redirection)"
        );
        // Afficher des notifications factices pour le test
        setNotifications([
          {
            id: 1,
            message: t("dashboardDDPI.notifications.noNotifications"),
            date: new Date().toISOString(),
            isNew: false,
          },
        ]);
        return;
      }

      if (!res.ok) {
        throw new Error(`Erreur ${res.status}`);
      }

      const data = await res.json();
      setNotifications(data.notifications || []);
      console.log(
        "✅ [DDPI] Notifications chargées:",
        data.notifications?.length || 0
      );
    } catch (err) {
      console.error(
        "❌ [DDPI] Erreur lors du chargement des notifications:",
        err
      );
      // TEMPORAIRE: Ne pas afficher d'erreur pour le test
      console.log("⚠️ [DDPI] Mode debug: affichage de notifications factices");
      setNotifications([
        {
          id: 1,
          message: t("dashboardDDPI.notifications.noNotifications"),
          date: new Date().toISOString(),
          isNew: false,
        },
      ]);
    }
  };

  const fetchDemandes = async () => {
    setLoading(true);
    try {
      console.log("🔄 [DDPI] Chargement des demandes");
      const currentToken = getToken();
      if (!currentToken) {
        console.error("❌ [DDPI] Aucun token trouvé");
        setLoading(false);
        return;
      }

      const res = await fetch(`${API_BASE}/api/ddpi/demandes`, {
        headers: { Authorization: `Bearer ${currentToken}` },
      });

      console.log("📋 [DDPI] Réponse demandes:", res.status, res.statusText);

      // TEMPORAIRE: Ne pas rediriger automatiquement en cas d'erreur 401
      if (res.status === 401) {
        console.error(
          "❌ [DDPI] Token expiré (mode debug - pas de redirection)"
        );
        // Afficher des demandes factices pour le test
        setDemandes([
          {
            id: 1,
            reference: "DEM-001",
            demandeur: "Test User",
            type: "Autorisation",
            created_at: new Date().toISOString(),
            statut: "EN_COURS_DDPI",
          },
        ]);
        return;
      }

      if (!res.ok) {
        const errorText = await res.text();
        console.error("❌ [DDPI] Erreur demandes:", errorText);
        throw new Error(`Erreur ${res.status}: ${errorText}`);
      }

      const data = await res.json();
      console.log("✅ [DDPI] Données demandes reçues:", data);
      console.log("📊 [DDPI] Nombre de demandes:", data.demandes?.length || 0);

      if (data.demandes) {
        console.log("📋 [DDPI] Première demande:", data.demandes[0]);
      }

      setDemandes(data.demandes || []);
    } catch (err) {
      console.error("❌ [DDPI] Erreur lors du chargement des demandes:", err);
      notification.error({
        message: t("dashboardDDPI.messages.error"),
        description:
          t("dashboardDDPI.messages.validationError") + ": " + err.message,
        duration: 6,
      });
      setDemandes([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistorique = async (demandeId) => {
    setHistLoading(true);
    try {
      console.log(
        `🔄 [DDPI] Chargement de l'historique pour la demande ${demandeId}`
      );
      const res = await fetch(
        `${API_BASE}/api/ddpi/demandes/${demandeId}/historique`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) {
        throw new Error(`Erreur ${res.status}`);
      }

      const data = await res.json();
      setHistorique(data.historique || []);
      console.log(
        "✅ [DDPI] Historique chargé:",
        data.historique?.length || 0,
        "entrées"
      );
    } catch (err) {
      console.error(
        "❌ [DDPI] Erreur lors du chargement de l'historique:",
        err
      );
      notification.error({
        message: t("dashboardDDPI.messages.error"),
        description: t("dashboardDDPI.messages.validationError"),
        duration: 4,
      });
      setHistorique([]);
    } finally {
      setHistLoading(false);
    }
  };

  const handleConsulter = (demande) => {
    setSelectedDemande(demande);
    fetchHistorique(demande.id);
    setShowModal(true);
  };

  const handleCommenter = (demande) => {
    setSelectedDemande(demande);
    setCommentaire("");
    setShowCommentModal(true);
  };

  const submitCommentaire = async () => {
    if (!commentaire.trim()) {
      notification.warning({
        message: t("dashboardDDPI.messages.warning"),
        description: t("dashboardDDPI.messages.enterComment"),
        duration: 3,
      });
      return;
    }

    try {
      console.log(
        `🔄 [DDPI] Ajout de commentaire pour la demande ${selectedDemande.id}`
      );

      const res = await fetch(
        `${API_BASE}/api/ddpi/demandes/${selectedDemande.id}/commentaire`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ commentaire }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        notification.success({
          message: t("dashboardDDPI.messages.success"),
          description: data.message || t("dashboardDDPI.messages.commentAdded"),
          duration: 3,
        });
        console.log(
          "✅ [DDPI] Commentaire ajouté pour:",
          selectedDemande.reference
        );
        setShowCommentModal(false);
        setCommentaire("");
        fetchDemandes();
        if (showModal) fetchHistorique(selectedDemande.id);
      } else {
        throw new Error(data.error || `Erreur ${res.status}`);
      }
    } catch (err) {
      console.error("❌ [DDPI] Erreur lors de l'ajout du commentaire:", err);
      notification.error({
        message: t("dashboardDDPI.messages.error"),
        description: err.message || t("dashboardDDPI.messages.commentError"),
        duration: 5,
      });
    }
  };

  const handleValider = (demande) => {
    Modal.confirm({
      title: t("dashboardDDPI.confirm.validateTitle"),
      width: 500,
      content: (
        <div>
          <p style={{ marginBottom: "16px" }}>
            <strong>{t("dashboardDDPI.confirm.demand")}:</strong>{" "}
            {demande.reference}
          </p>
          <p style={{ marginBottom: "16px" }}>
            <strong>{t("dashboardDDPI.confirm.applicant")}:</strong>{" "}
            {demande.demandeur}
          </p>
          <p style={{ marginBottom: "16px" }}>
            {t("dashboardDDPI.confirm.validateMessage")}
          </p>
        </div>
      ),
      okText: t("dashboardDDPI.confirm.validate"),
      cancelText: t("dashboardDDPI.confirm.cancel"),
      okType: "primary",
      onOk: async () => {
        try {
          console.log(
            `🔄 [DDPI] Validation de la demande ${demande.id} - ${demande.reference}`
          );

          const res = await fetch(
            `${API_BASE}/api/ddpi/demandes/${demande.id}/valider`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                commentaire: t("dashboardDDPI.validation.comment"),
              }),
            }
          );

          console.log(
            "📊 [DDPI] Réponse validation:",
            res.status,
            res.statusText
          );

          if (!res.ok) {
            const errorText = await res.text();
            console.error("❌ [DDPI] Erreur validation:", errorText);
            throw new Error(`Erreur ${res.status}: ${errorText}`);
          }

          const data = await res.json();
          console.log("✅ [DDPI] Réponse validation reçue:", data);

          notification.success({
            message: t("dashboardDDPI.messages.success"),
            description:
              data.message ||
              t("dashboardDDPI.messages.demandValidated", {
                reference: demande.reference,
              }),
            duration: 4,
          });

          console.log("✅ [DDPI] Demande validée:", demande.reference);

          // Recharger les données
          await Promise.all([fetchDemandes(), fetchStats()]);
        } catch (err) {
          console.error("❌ [DDPI] Erreur lors de la validation:", err);
          notification.error({
            message: t("dashboardDDPI.messages.error"),
            description:
              err.message || t("dashboardDDPI.messages.validationError"),
            duration: 6,
          });
          return Promise.reject();
        }
      },
    });
  };

  const handleRetourner = (demande) => {
    let commentaireRetour = "";

    Modal.confirm({
      title: t("dashboardDDPI.confirm.returnTitle"),
      width: 500,
      content: (
        <div>
          <p style={{ marginBottom: "16px" }}>
            <strong>{t("dashboardDDPI.confirm.demand")}:</strong>{" "}
            {demande.reference}
          </p>
          <p style={{ marginBottom: "16px" }}>
            {t("dashboardDDPI.confirm.returnMessage")}
          </p>
          <TextArea
            rows={4}
            onChange={(e) => (commentaireRetour = e.target.value)}
            placeholder={t("dashboardDDPI.confirm.returnPlaceholder")}
            style={{ marginBottom: "8px" }}
          />
        </div>
      ),
      okText: t("dashboardDDPI.confirm.return"),
      cancelText: t("dashboardDDPI.confirm.cancel"),
      okType: "danger",
      onOk: async () => {
        if (!commentaireRetour?.trim()) {
          notification.warning({
            message: t("dashboardDDPI.messages.warning"),
            description: t("dashboardDDPI.messages.enterReturnComment"),
            duration: 4,
          });
          return Promise.reject();
        }

        try {
          console.log(`🔄 [DDPI] Retour de la demande ${demande.id}`);

          const res = await fetch(
            `${API_BASE}/api/ddpi/demandes/${demande.id}/retour`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ commentaire: commentaireRetour }),
            }
          );

          const data = await res.json();

          if (res.ok) {
            notification.success({
              message: t("dashboardDDPI.messages.success"),
              description:
                data.message || t("dashboardDDPI.messages.demandReturned"),
              duration: 4,
            });
            console.log("✅ [DDPI] Demande retournée:", demande.reference);
            await Promise.all([fetchDemandes(), fetchStats()]);
          } else {
            throw new Error(data.error || `Erreur ${res.status}`);
          }
        } catch (err) {
          console.error("❌ [DDPI] Erreur lors du retour:", err);
          notification.error({
            message: t("dashboardDDPI.messages.error"),
            description: err.message || t("dashboardDDPI.messages.returnError"),
            duration: 6,
          });
          return Promise.reject();
        }
      },
    });
  };

  const handleTransmettre = (demande) => {
    Modal.confirm({
      title: t("dashboardDDPI.confirm.transmitTitle"),
      width: 500,
      content: (
        <div>
          <p style={{ marginBottom: "16px" }}>
            <strong>{t("dashboardDDPI.confirm.demand")}:</strong>{" "}
            {demande.reference}
          </p>
          <p style={{ marginBottom: "16px" }}>
            <strong>{t("dashboardDDPI.confirm.applicant")}:</strong>{" "}
            {demande.demandeur}
          </p>
          <p style={{ marginBottom: "16px" }}>
            {t("dashboardDDPI.confirm.transmitMessage")}
          </p>
        </div>
      ),
      okText: t("dashboardDDPI.confirm.transmit"),
      cancelText: t("dashboardDDPI.confirm.cancel"),
      okType: "primary",
      onOk: async () => {
        try {
          console.log(
            `🔄 [DDPI] Transmission de la demande ${demande.id} - ${demande.reference} vers DGI`
          );

          const res = await fetch(
            `${API_BASE}/api/ddpi/demandes/${demande.id}/transmettre`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }
          );

          console.log(
            "📊 [DDPI] Réponse transmission:",
            res.status,
            res.statusText
          );

          if (!res.ok) {
            const errorText = await res.text();
            console.error("❌ [DDPI] Erreur transmission:", errorText);
            throw new Error(`Erreur ${res.status}: ${errorText}`);
          }

          const data = await res.json();
          console.log("✅ [DDPI] Réponse transmission reçue:", data);

          notification.success({
            message: t("dashboardDDPI.messages.success"),
            description:
              data.message ||
              t("dashboardDDPI.messages.demandTransmitted", {
                reference: demande.reference,
              }),
            duration: 4,
          });

          console.log("✅ [DDPI] Demande transmise à DGI:", demande.reference);

          // Recharger les données
          await Promise.all([fetchDemandes(), fetchStats()]);
        } catch (err) {
          console.error("❌ [DDPI] Erreur lors de la transmission:", err);
          notification.error({
            message: t("dashboardDDPI.messages.error"),
            description:
              err.message || t("dashboardDDPI.messages.transmitError"),
            duration: 6,
          });
          return Promise.reject();
        }
      },
    });
  };

  const handleLogout = () => {
    // Nettoyer tous les tokens possibles
    localStorage.removeItem("adminToken");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "mmiapp/login-ddpi";
  };

  // Colonnes du tableau
  const columns = [
    {
      title: t("dashboardDDPI.demands.reference"),
      dataIndex: "reference",
      key: "reference",
      render: (ref) =>
        ref || <Tag color="default">{t("dashboardDDPI.demands.none")}</Tag>,
    },
    {
      title: t("dashboardDDPI.demands.applicant"),
      dataIndex: "demandeur",
      key: "demandeur",
    },
    {
      title: t("dashboardDDPI.demands.type"),
      dataIndex: "type",
      key: "type",
    },
    {
      title: t("dashboardDDPI.demands.date"),
      dataIndex: "created_at",
      key: "created_at",
      render: (d) => new Date(d).toLocaleDateString(),
    },
    {
      title: t("dashboardDDPI.demands.status"),
      dataIndex: "statut",
      key: "statut",
      render: (statut) => {
        let color = "default";
        let text = statut;

        if (statut === "TRANSMISE_A_DDPI") {
          color = "gold";
          text = t("dashboardDDPI.statuses.TRANSMISE_A_DDPI");
        } else if (statut === "VALIDEE_DDPI") {
          color = "green";
          text = t("dashboardDDPI.statuses.VALIDEE_DDPI");
        } else if (statut === "RETOURNEE") {
          color = "red";
          text = t("dashboardDDPI.statuses.RETOURNEE");
        } else if (statut === "EN_COURS_DDPI") {
          color = "blue";
          text = t("dashboardDDPI.statuses.EN_COURS_DDPI");
        }

        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: t("dashboardDDPI.demands.actions"),
      key: "actions",
      render: (_, demande) => (
        <>
          <Button
            icon={<FileTextOutlined />}
            onClick={() => handleConsulter(demande)}
            style={{ marginRight: 8 }}
          >
            {t("dashboardDDPI.actions.view")}
          </Button>
          <Button
            icon={<CommentOutlined />}
            onClick={() => handleCommenter(demande)}
            style={{ marginRight: 8 }}
          >
            {t("dashboardDDPI.actions.comment")}
          </Button>
          {demande.statut === "TRANSMISE_A_DDPI" && (
            <>
              <Button
                icon={<CheckCircleOutlined />}
                type="primary"
                onClick={() => handleValider(demande)}
                style={{ marginRight: 8 }}
              >
                {t("dashboardDDPI.actions.validate")}
              </Button>
              <Button
                icon={<CloseCircleOutlined />}
                danger
                onClick={() => handleRetourner(demande)}
                style={{ marginRight: 8 }}
              >
                {t("dashboardDDPI.actions.return")}
              </Button>
            </>
          )}
          {demande.statut === "VALIDEE_DDPI" && (
            <Button
              icon={<SendOutlined />}
              type="primary"
              onClick={() => handleTransmettre(demande)}
            >
              {t("dashboardDDPI.actions.transmitDGI")}
            </Button>
          )}
        </>
      ),
    },
  ];

  // Debug: Afficher les tokens dans la console
  useEffect(() => {
    console.log("🔍 [DDPI Debug] Tokens dans localStorage:");
    console.log(
      "adminToken:",
      localStorage.getItem("adminToken") ? "Présent" : "Absent"
    );
    console.log("token:", localStorage.getItem("token") ? "Présent" : "Absent");
    console.log("user:", localStorage.getItem("user") ? "Présent" : "Absent");
    console.log("Token actuel utilisé:", getToken());
  }, []);

  return (
    <>
      <Header />

      <div className="dashboard-ddpi-container">
        {/* Left Panel - Sidebar */}
        <div className="left-panel">
          <div className="sidebar-header">
            <h3>{t("dashboardDDPI.sidebar.title")}</h3>
            <p>{t("dashboardDDPI.sidebar.subtitle")}</p>
          </div>

          <nav className="sidebar-nav">
            <button
              className={`nav-item ${
                activeSidebarLink === "dashboard" ? "active" : ""
              }`}
              onClick={() => setActiveSidebarLink("dashboard")}
            >
              <DashboardOutlined />
              {t("dashboardDDPI.sidebar.dashboard")}
            </button>

            <button
              className={`nav-item ${
                activeSidebarLink === "demandes" ? "active" : ""
              }`}
              onClick={() => setActiveSidebarLink("demandes")}
            >
              <FileTextOutlined />
              {t("dashboardDDPI.sidebar.demands")}
            </button>

            <button
              className={`nav-item ${
                activeSidebarLink === "notifications" ? "active" : ""
              }`}
              onClick={() => setActiveSidebarLink("notifications")}
            >
              <BellOutlined />
              {t("dashboardDDPI.sidebar.notifications")}
            </button>

            <button
              className={`nav-item ${
                activeSidebarLink === "settings" ? "active" : ""
              }`}
              onClick={() => setActiveSidebarLink("settings")}
            >
              <SettingOutlined />
              {t("dashboardDDPI.sidebar.settings")}
            </button>
          </nav>

          {/* Bouton de déconnexion */}
          <div className="sidebar-footer">
            <button className="nav-item deconnexion-btn" onClick={handleLogout}>
              <LogoutOutlined />
              {t("dashboardDDPI.sidebar.logout")}
            </button>
          </div>
        </div>

        {/* Main Section - Contenu principal */}
        <div className="main-section">
          <div className="dashboard-header">
            <h1 className="dashboard-title">🏢 {t("dashboardDDPI.title")}</h1>
          </div>

          {activeSidebarLink === "dashboard" && (
            <>
              <Row gutter={16} style={{ marginBottom: 24 }}>
                {stats.map((stat) => (
                  <Col span={6} key={stat.id}>
                    <Statistic
                      title={stat.label}
                      value={stat.value}
                      valueStyle={{ color: stat.color }}
                    />
                  </Col>
                ))}
              </Row>
            </>
          )}

          {activeSidebarLink === "demandes" && (
            <>
              <h2>{t("dashboardDDPI.sidebar.demands")}</h2>
              {loading ? (
                <Spin />
              ) : (
                <Table
                  dataSource={demandes}
                  columns={columns}
                  rowKey="id"
                  pagination={{ pageSize: 10 }}
                />
              )}
            </>
          )}

          {activeSidebarLink === "notifications" && (
            <>
              <h2>{t("dashboardDDPI.sidebar.notifications")}</h2>
              <Table
                dataSource={notifications}
                columns={[
                  {
                    title: t("dashboardDDPI.notifications.message"),
                    dataIndex: "message",
                    key: "message",
                  },
                  {
                    title: t("dashboardDDPI.notifications.date"),
                    dataIndex: "date",
                    key: "date",
                    render: (d) => new Date(d).toLocaleString(),
                  },
                  {
                    title: t("dashboardDDPI.notifications.status"),
                    dataIndex: "isNew",
                    key: "isNew",
                    render: (isNew) =>
                      isNew ? (
                        <Tag color="red">
                          {t("dashboardDDPI.notifications.new")}
                        </Tag>
                      ) : (
                        <Tag color="green">
                          {t("dashboardDDPI.notifications.read")}
                        </Tag>
                      ),
                  },
                ]}
                rowKey="id"
                pagination={{ pageSize: 10 }}
              />
            </>
          )}

          {activeSidebarLink === "settings" && (
            <>
              <h2>{t("dashboardDDPI.sidebar.settings")}</h2>
              <p>{t("dashboardDDPI.settings.development")}</p>
            </>
          )}

          {/* Modals */}
          <Modal
            title={t("dashboardDDPI.modals.demandDetails")}
            open={showModal}
            onCancel={() => setShowModal(false)}
            footer={null}
            width={800}
          >
            {selectedDemande && (
              <div>
                <h3>
                  {t("dashboardDDPI.demandDetails.reference")}:{" "}
                  {selectedDemande.reference}
                </h3>
                <p>
                  <strong>{t("dashboardDDPI.demandDetails.applicant")}:</strong>{" "}
                  {selectedDemande.demandeur}
                </p>
                <p>
                  <strong>{t("dashboardDDPI.demandDetails.type")}:</strong>{" "}
                  {selectedDemande.type}
                </p>
                <p>
                  <strong>{t("dashboardDDPI.demandDetails.date")}:</strong>{" "}
                  {new Date(selectedDemande.created_at).toLocaleString()}
                </p>
                <p>
                  <strong>{t("dashboardDDPI.demandDetails.status")}:</strong>{" "}
                  {selectedDemande.statut}
                </p>
                <h4>{t("dashboardDDPI.demandDetails.demandData")}</h4>
                <pre
                  style={{
                    background: "#f5f5f5",
                    padding: 16,
                    borderRadius: 4,
                  }}
                >
                  {JSON.stringify(selectedDemande.donnees, null, 2)}
                </pre>
                <h4>{t("dashboardDDPI.demandDetails.actionHistory")}</h4>
                {histLoading ? (
                  <Spin />
                ) : (
                  <Table
                    dataSource={historique}
                    columns={[
                      {
                        title: t("dashboardDDPI.history.action"),
                        dataIndex: "action",
                        key: "action",
                      },
                      {
                        title: t("dashboardDDPI.history.message"),
                        dataIndex: "message",
                        key: "message",
                      },
                      {
                        title: t("dashboardDDPI.history.date"),
                        dataIndex: "date_action",
                        key: "date_action",
                        render: (d) => new Date(d).toLocaleString(),
                      },
                      {
                        title: t("dashboardDDPI.history.previousStatus"),
                        dataIndex: "statut_precedent",
                        key: "statut_precedent",
                      },
                      {
                        title: t("dashboardDDPI.history.newStatus"),
                        dataIndex: "nouveau_statut",
                        key: "nouveau_statut",
                      },
                    ]}
                    rowKey="id"
                    pagination={false}
                    size="small"
                  />
                )}
              </div>
            )}
          </Modal>

          <Modal
            title={t("dashboardDDPI.modals.addComment")}
            open={showCommentModal}
            onOk={submitCommentaire}
            onCancel={() => setShowCommentModal(false)}
          >
            <TextArea
              rows={4}
              value={commentaire}
              onChange={(e) => setCommentaire(e.target.value)}
              placeholder={t("dashboardDDPI.modals.commentPlaceholder")}
            />
          </Modal>
        </div>
      </div>

      <Footer />
    </>
  );
}
