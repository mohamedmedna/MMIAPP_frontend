import React, { useState, useEffect } from "react";
import {
  Layout,
  Menu,
  Table,
  Button,
  Modal,
  Input,
  Statistic,
  Row,
  Col,
  Spin,
  Tag,
  Alert,
  Tabs,
  Divider,
  notification,
  Dropdown,
} from "antd";
import {
  DashboardOutlined,
  FileTextOutlined,
  HistoryOutlined,
  BellOutlined,
  LogoutOutlined,
  UserOutlined,
  DownloadOutlined,
  CommentOutlined,
  SendOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  ReloadOutlined,
  ApartmentOutlined,
  MoreOutlined,
} from "@ant-design/icons";
import { Bar, Pie, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { saveAs } from "file-saver";
import { useTranslation } from "react-i18next";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "../Styles/DashboardDGI.css";
import "../Styles/Dashboard.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const { Content, Sider } = Layout;
const { TextArea } = Input;

const chartColors = [
  "#229954",
  "#1a237e",
  "#faad14",
  "#f5222d",
  "#1890ff",
  "#7fa22b",
  "#e67e22",
  "#8e44ad",
];

export default function DashboardDGI() {
  const { t } = useTranslation();
  const [statsGraph, setStatsGraph] = useState({
    byType: [],
    bySecteur: [],
    byEmplacement: [],
    signed: 0,
  });
  const [exportLoading, setExportLoading] = useState(false);
  const [activeSidebarLink, setActiveSidebarLink] = useState("dashboard");
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
  const [historiqueDGI, setHistoriqueDGI] = useState([]);
  const [loadingHist, setLoadingHist] = useState(false);
  const token = localStorage.getItem("adminToken");

  const API_BASE = window.__APP_CONFIG__?.API_BASE;

  // Auth check
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    console.log("🔍 [DGI Dashboard] Auth check:", {
      hasToken: !!token,
      userRole: user.role_id,
      expectedRole: 6,
      user: user,
    });
    if (!token || user.role_id !== 6) {
      console.log("❌ [DGI Dashboard] Auth failed, redirecting to login");
      window.location.href = "/login-dgi";
    } else {
      console.log("✅ [DGI Dashboard] Auth successful");
    }
  }, [token]);

  // Statistiques graphiques
  const fetchStatsGraph = async () => {
    try {
      console.log("🔄 [DGI Dashboard] Fetching stats graph...");
      const res = await fetch(`${API_BASE}/api/dgi/stats-graph`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      const data = await res.json();
      console.log("✅ [DGI Dashboard] Stats graph loaded:", data);
      setStatsGraph(data);
    } catch (error) {
      console.error("❌ [DGI Dashboard] Error fetching stats graph:", error);
    }
  };

  useEffect(() => {
    fetchStatsGraph();
    fetchStats();
    fetchNotifications();
    fetchDemandes();
    // eslint-disable-next-line
  }, [token]);

  // Export CSV/PDF
  const exportCSV = async () => {
    setExportLoading(true);
    const res = await fetch(`${API_BASE}/api/dgi/export/csv`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const blob = await res.blob();
    saveAs(blob, "demandes.csv");
    setExportLoading(false);
  };

  const exportPDF = async () => {
    setExportLoading(true);
    const res = await fetch(`${API_BASE}/api/dgi/export/pdf`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const blob = await res.blob();
    saveAs(blob, "statistiques_dgi.pdf");
    setExportLoading(false);
  };

  // Anciennes stats (cartes)
  const fetchStats = async () => {
    try {
      console.log("🔄 [DGI Dashboard] Fetching stats...");
      const res = await fetch(`${API_BASE}/api/dgi/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      const data = await res.json();
      console.log("✅ [DGI Dashboard] Stats loaded:", data);
      setStats(data.stats || []);
    } catch (error) {
      console.error("❌ [DGI Dashboard] Error fetching stats:", error);
    }
  };

  // Notifications
  const fetchNotifications = async () => {
    const res = await fetch(`${API_BASE}/api/dgi/notifications`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setNotifications(data.notifications || []);
  };

  // Demandes
  const fetchDemandes = async () => {
    setLoading(true);
    const res = await fetch(`${API_BASE}/api/dgi/demandes`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setDemandes(data.demandes || []);
    setLoading(false);
  };

  // Historique
  const fetchHistorique = async (demandeId) => {
    setHistLoading(true);
    const res = await fetch(
      `${API_BASE}/api/dgi/demandes/${demandeId}/historique`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    const data = await res.json();
    setHistorique(data.historique || []);
    setHistLoading(false);
  };

  const fetchHistoriqueDGI = async () => {
    setLoadingHist(true);
    const res = await fetch(`${API_BASE}/api/dgi/historique`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setHistoriqueDGI(data.historique || []);
    setLoadingHist(false);
  };

  useEffect(() => {
    if (activeSidebarLink === "historique") fetchHistoriqueDGI();
    // eslint-disable-next-line
  }, [activeSidebarLink]);

  // Actions
  const handleConsulter = async (demande) => {
    setSelectedDemande(demande);
    const res = await fetch(`${API_BASE}/api/dgi/demandes/${demande.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (res.ok) {
      setSelectedDemande(data.demande);
      fetchHistorique(demande.id);
      setShowModal(true);
    } else {
      notification.error({
        message: t("dashboardDGI.messages.error"),
        description: t("dashboardDGI.messages.loadDetailsError"),
      });
    }
  };

  const handleCommenter = (demande) => {
    setSelectedDemande(demande);
    setCommentaire("");
    setShowCommentModal(true);
  };

  const submitCommentaire = async () => {
    if (!commentaire.trim()) {
      notification.warning({
        message: t("dashboardDGI.messages.warning"),
        description: t("dashboardDGI.messages.enterComment"),
      });
      return;
    }
    const res = await fetch(
      `${API_BASE}/api/dgi/demandes/${selectedDemande.id}/commentaire`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ commentaire }),
      }
    );
    if (res.ok) {
      notification.success({
        message: t("dashboardDGI.messages.success"),
        description: t("dashboardDGI.messages.commentAdded"),
      });
      setShowCommentModal(false);
      fetchDemandes();
      if (showModal) fetchHistorique(selectedDemande.id);
    } else {
      notification.error({
        message: t("dashboardDGI.messages.error"),
        description: t("dashboardDGI.messages.commentError"),
      });
    }
  };

  const handleValider = async (demande) => {
    Modal.confirm({
      title: t("dashboardDGI.modals.confirmValidation"),
      content: t("dashboardDGI.modals.confirmValidationMessage"),
      onOk: async () => {
        const res = await fetch(
          `${API_BASE}/api/dgi/demandes/${demande.id}/valider`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ commentaire: "Validation technique DGI" }),
          }
        );
        if (res.ok) {
          notification.success({
            message: t("dashboardDGI.messages.success"),
            description: t("dashboardDGI.messages.demandValidated"),
          });
          fetchDemandes();
          fetchStats();
          fetchStatsGraph();
        } else {
          notification.error({
            message: t("dashboardDGI.messages.error"),
            description: t("dashboardDGI.messages.validationError"),
          });
        }
      },
    });
  };

  const handleRetourner = (demande) => {
    let raisonRetour = "";
    Modal.confirm({
      title: t("dashboardDGI.modals.returnDemand"),
      content: (
        <TextArea
          rows={4}
          onChange={(e) => (raisonRetour = e.target.value)}
          placeholder={t("dashboardDGI.modals.returnReason")}
        />
      ),
      onOk: async () => {
        if (!raisonRetour.trim()) {
          notification.warning({
            message: t("dashboardDGI.messages.warning"),
            description: t("dashboardDGI.messages.enterReturnReason"),
          });
          return Promise.reject(new Error("Raison manquante"));
        }
        const res = await fetch(
          `${API_BASE}/api/dgi/demandes/${demande.id}/retour`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ commentaire: raisonRetour }),
          }
        );
        if (res.ok) {
          notification.success({
            message: t("dashboardDGI.messages.success"),
            description: t("dashboardDGI.messages.demandReturned"),
          });
          fetchDemandes();
          fetchStats();
          fetchStatsGraph();
        } else {
          notification.error({
            message: t("dashboardDGI.messages.error"),
            description: t("dashboardDGI.messages.returnError"),
          });
        }
      },
    });
  };

  const handleRejeter = (demande) => {
    Modal.confirm({
      title: t("dashboardDGI.modals.rejectDemand"),
      content: (
        <TextArea
          rows={3}
          placeholder={t("dashboardDGI.modals.rejectReason")}
          onChange={(e) => (demande.motif = e.target.value)}
        />
      ),
      onOk: async () => {
        if (!demande.motif)
          return notification.warning({
            message: t("dashboardDGI.messages.enterRejectReason"),
          });
        const res = await fetch(
          `${API_BASE}/api/demandes/${demande.id}/rejeter`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ motif: demande.motif }),
          }
        );
        if (res.ok) {
          notification.success({
            message: t("dashboardDGI.messages.demandRejected"),
          });
          fetchDemandes();
        }
      },
    });
  };

  const handleTransmettreMinistre = (demande) => {
    let commentaire = "";

    Modal.confirm({
      title: "📤 Transmettre au Ministre",
      width: 500,
      content: (
        <div>
          <p style={{ marginBottom: "16px" }}>
            <strong>Demande :</strong> {demande.reference}
          </p>
          <p style={{ marginBottom: "16px" }}>
            <strong>Demandeur :</strong> {demande.demandeur}
          </p>
          <p style={{ marginBottom: "16px" }}>
            Voulez-vous transmettre cette demande au Ministre pour signature ?
          </p>
          <TextArea
            rows={3}
            placeholder="Commentaire de transmission (optionnel)..."
            onChange={(e) => (commentaire = e.target.value)}
            style={{ marginBottom: "8px" }}
          />
        </div>
      ),
      okText: "Transmettre au Ministre",
      cancelText: "Annuler",
      okType: "primary",
      onOk: async () => {
        try {
          console.log(
            `🔄 [DGI] Transmission de la demande ${demande.id} au Ministre`
          );

          const res = await fetch(
            `${API_BASE}/api/dgi/demandes/${demande.id}/transmettre-ministre`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                commentaire:
                  commentaire || "Transmise au Ministre pour signature",
              }),
            }
          );

          const data = await res.json();

          if (res.ok && data.success) {
            notification.success({
              message: "Succès",
              description: data.message,
              duration: 4,
            });
            console.log(
              "✅ [DGI] Demande transmise au Ministre:",
              demande.reference
            );
            fetchDemandes();
          } else {
            throw new Error(data.error || `Erreur ${res.status}`);
          }
        } catch (err) {
          console.error("❌ [DGI] Erreur lors de la transmission:", err);
          notification.error({
            message: "Erreur",
            description:
              err.message || "Erreur lors de la transmission au Ministre",
            duration: 6,
          });
          return Promise.reject();
        }
      },
    });
  };

  const handleAffecterDDPI = (demande) => {
    let commentaire = "";

    Modal.confirm({
      title: "🏢 Affecter au DDPI",
      width: 500,
      content: (
        <div>
          <p style={{ marginBottom: "16px" }}>
            <strong>Demande :</strong> {demande.reference}
          </p>
          <p style={{ marginBottom: "16px" }}>
            <strong>Demandeur :</strong> {demande.demandeur}
          </p>
          <p style={{ marginBottom: "16px" }}>
            Voulez-vous affecter cette demande au DDPI pour instruction
            technique ?
          </p>
          <TextArea
            rows={3}
            placeholder="Commentaire d'affectation (optionnel)..."
            onChange={(e) => (commentaire = e.target.value)}
            style={{ marginBottom: "8px" }}
          />
        </div>
      ),
      okText: "Affecter au DDPI",
      cancelText: "Annuler",
      okType: "primary",
      onOk: async () => {
        try {
          console.log(
            `🔄 [DGI] Affectation de la demande ${demande.id} au DDPI`
          );

          const res = await fetch(
            `${API_BASE}/api/dgi/demandes/${demande.id}/affecter-ddpi`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                commentaire:
                  commentaire || "Affectée au DDPI pour instruction technique",
              }),
            }
          );

          const data = await res.json();

          if (res.ok && data.success) {
            notification.success({
              message: "Succès",
              description: data.message,
              duration: 4,
            });
            console.log(
              "✅ [DGI] Demande affectée au DDPI:",
              demande.reference
            );
            fetchDemandes();
          } else {
            throw new Error(data.error || `Erreur ${res.status}`);
          }
        } catch (err) {
          console.error("❌ [DGI] Erreur lors de l'affectation:", err);
          notification.error({
            message: "Erreur",
            description: err.message || "Erreur lors de l'affectation au DDPI",
            duration: 6,
          });
          return Promise.reject();
        }
      },
    });
  };

  const handleRetourSG = (demande) => {
    let motif = "";
    Modal.confirm({
      title: t("dashboardDGI.modals.returnSG"),
      content: (
        <TextArea
          rows={3}
          placeholder={t("dashboardDGI.modals.returnSGReason")}
          onChange={(e) => (motif = e.target.value)}
        />
      ),
      onOk: async () => {
        if (!motif)
          return notification.warning({
            message: t("dashboardDGI.messages.enterReturnReason"),
          });
        const res = await fetch(
          `${API_BASE}/api/demandes/${demande.id}/retour-sg`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ motif }),
          }
        );
        if (res.ok) {
          notification.success({
            message: t("dashboardDGI.messages.transmittedToSG"),
          });
          fetchDemandes();
        }
      },
    });
  };

  const handleSolliciterAvis = (demande) => {
    let commission_id = null,
      message = "";
    Modal.confirm({
      title: t("dashboardDGI.modals.solicitCommission"),
      content: (
        <div>
          <Input
            placeholder={t("dashboardDGI.modals.commissionId")}
            onChange={(e) => (commission_id = e.target.value)}
            style={{ marginBottom: 8 }}
          />
          <TextArea
            rows={3}
            placeholder={t("dashboardDGI.modals.message")}
            onChange={(e) => (message = e.target.value)}
          />
        </div>
      ),
      onOk: async () => {
        if (!commission_id)
          return notification.warning({
            message: t("dashboardDGI.messages.enterCommission"),
          });
        const res = await fetch(
          `${API_BASE}/api/demandes/${demande.id}/solliciter-avis`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ commission_id, message }),
          }
        );
        if (res.ok) {
          notification.success({
            message: t("dashboardDGI.messages.commissionSolicited"),
          });
          fetchDemandes();
        }
      },
    });
  };

  // Ré-attribution
  const handleReattribuer = (demande) => {
    let nouvelAgent = "";
    Modal.confirm({
      title: t("dashboardDGI.modals.reassignDemand"),
      content: (
        <Input
          placeholder={t("dashboardDGI.modals.newAgent")}
          onChange={(e) => (nouvelAgent = e.target.value)}
        />
      ),
      onOk: async () => {
        if (!nouvelAgent)
          return notification.warning({
            message: t("dashboardDGI.messages.enterNewAgent"),
          });
        const res = await fetch(
          `${API_BASE}/api/demandes/${demande.id}/reattribuer`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ nouvel_agent: nouvelAgent }),
          }
        );
        if (res.ok) {
          notification.success({
            message: t("dashboardDGI.messages.demandReassigned"),
          });
          fetchDemandes();
        } else {
          notification.error({
            message: t("dashboardDGI.messages.reassignmentError"),
          });
        }
      },
    });
  };

  // Complément
  const handleComplement = (demande) => {
    let message = "";
    Modal.confirm({
      title: t("dashboardDGI.modals.requestComplement"),
      content: (
        <Input.TextArea
          rows={3}
          placeholder={t("dashboardDGI.modals.complementMessage")}
          onChange={(e) => (message = e.target.value)}
        />
      ),
      onOk: async () => {
        if (!message)
          return notification.warning({
            message: t("dashboardDGI.messages.enterComplementMessage"),
          });
        const res = await fetch(
          `${API_BASE}/api/demandes/${demande.id}/complement`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ message }),
          }
        );
        if (res.ok) {
          notification.success({
            message: t("dashboardDGI.messages.complementRequested"),
          });
          fetchDemandes();
        } else {
          notification.error({
            message: t("dashboardDGI.messages.complementError"),
          });
        }
      },
    });
  };

  // Clôture
  const handleCloturer = (demande) => {
    Modal.confirm({
      title: t("dashboardDGI.modals.closeDemand"),
      content: t("dashboardDGI.modals.closeDemandMessage"),
      onOk: async () => {
        const res = await fetch(
          `${API_BASE}/api/demandes/${demande.id}/cloturer`,
          {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (res.ok) {
          notification.success({
            message: t("dashboardDGI.messages.demandClosed"),
          });
          fetchDemandes();
        } else {
          notification.error({
            message: t("dashboardDGI.messages.closeError"),
          });
        }
      },
    });
  };

  // Relance
  const handleRelancer = (demande) => {
    let typeRelance = "",
      message = "";
    Modal.confirm({
      title: t("dashboardDGI.modals.remindDemand"),
      content: (
        <div>
          <Input
            placeholder={t("dashboardDGI.modals.remindType")}
            onChange={(e) => (typeRelance = e.target.value)}
            style={{ marginBottom: 8 }}
          />
          <Input.TextArea
            rows={3}
            placeholder={t("dashboardDGI.modals.remindMessage")}
            onChange={(e) => (message = e.target.value)}
          />
        </div>
      ),
      onOk: async () => {
        if (!typeRelance || !message)
          return notification.warning({
            message: t("dashboardDGI.messages.enterRemindType"),
          });
        const res = await fetch(
          `${API_BASE}/api/demandes/${demande.id}/relancer`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ type_relance: typeRelance, message }),
          }
        );
        if (res.ok) {
          notification.success({
            message: t("dashboardDGI.messages.reminderSent"),
          });
          fetchDemandes();
        } else {
          notification.error({
            message: t("dashboardDGI.messages.reminderError"),
          });
        }
      },
    });
  };

  const handleTransmettre = async (demande) => {
    Modal.confirm({
      title: t("dashboardDGI.modals.confirmValidation"),
      content: t("dashboardDGI.modals.confirmValidationMessage"),
      onOk: async () => {
        const res = await fetch(
          `${API_BASE}/api/dgi/demandes/${demande.id}/transmettre`,
          {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (res.ok) {
          notification.success({
            message: t("dashboardDGI.messages.success"),
            description: t("dashboardDGI.messages.transmittedToSGSuccess"),
          });
          fetchDemandes();
          fetchStats();
          fetchStatsGraph();
        } else {
          notification.error({
            message: t("dashboardDGI.messages.error"),
            description: t("dashboardDGI.messages.transmissionError"),
          });
        }
      },
    });
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("user");
    window.location.href = "/login-dgi";
  };

  // Colonnes du tableau
  const columns = [
    {
      title: t("dashboardDGI.demands.reference"),
      dataIndex: "reference",
      key: "reference",
      render: (ref) => ref || <Tag color="default">N/A</Tag>,
    },
    {
      title: t("dashboardDGI.demands.applicant"),
      dataIndex: "demandeur",
      key: "demandeur",
    },
    {
      title: t("dashboardDGI.demands.type"),
      dataIndex: "type",
      key: "type",
    },
    {
      title: t("dashboardDGI.demands.creationDate"),
      dataIndex: "created_at",
      key: "created_at",
      render: (d) => new Date(d).toLocaleDateString(),
    },
    {
      title: t("dashboardDGI.demands.status"),
      dataIndex: "statut",
      key: "statut",
      render: (statut) => {
        let color = "default";
        let text = statut;

        if (statut === "TRANSMISE_AU_DGI") {
          color = "gold";
          text = "📥 À traiter";
        } else if (statut === "EN_COURS_DGI") {
          color = "processing";
          text = "⚙️ En cours";
        } else if (statut === "VALIDEE_DGI") {
          color = "green";
          text = "✅ Validée";
        } else if (statut === "TRANSMISE_A_DDPI") {
          color = "cyan";
          text = "🏢 Chez DDPI";
        } else if (statut === "VALIDEE_DDPI") {
          color = "blue";
          text = "🔙 Retour DDPI";
        } else if (statut === "RETOURNEE") {
          color = "orange";
          text = "↩️ Retournée";
        } else if (statut === "TRANSMISE_AU_SG") {
          color = "blue";
          text = "📤 Chez SG";
        } else if (statut === "RETOURNEE_DGI") {
          color = "red";
          text = "❌ Rejetée";
        }

        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: t("dashboardDGI.demands.actions"),
      key: "actions",
      render: (_, demande) => {
        // Créer le menu des actions selon le statut de la demande
        const getActionMenu = (demande) => {
          const items = [
            {
              key: "view",
              label: t("dashboardDGI.actions.view"),
              icon: <FileTextOutlined />,
              onClick: () => handleConsulter(demande),
            },
            {
              key: "comment",
              label: t("dashboardDGI.actions.comment"),
              icon: <CommentOutlined />,
              onClick: () => handleCommenter(demande),
            },
          ];

          // Actions selon le statut
          if (["TRANSMISE_AU_DGI", "EN_COURS_DGI"].includes(demande.statut)) {
            items.push(
              {
                key: "validate",
                label: t("dashboardDGI.actions.validate"),
                icon: <CheckCircleOutlined />,
                onClick: () => handleValider(demande),
                style: { color: "#52c41a" },
              },
              {
                key: "reject",
                label: t("dashboardDGI.actions.reject"),
                icon: <CloseCircleOutlined />,
                onClick: () => handleRejeter(demande),
                style: { color: "#ff4d4f" },
              },
              {
                key: "affecter-dppi",
                label: "🏢 Affecter DDPI",
                icon: <SendOutlined />,
                onClick: () => handleAffecterDDPI(demande),
                style: { color: "#1e40af" },
              }
            );
          }

          if (
            [
              "VALIDEE_DGI",
              "RETOURNEE_DGI",
              "TRANSMISE_A_DGI",
              "EN_COURS_DGI",
            ].includes(demande.statut)
          ) {
            items.push({
              key: "transmit-minister",
              label: t("dashboardDGI.actions.transmitMinister"),
              icon: <SendOutlined />,
              onClick: () => handleTransmettreMinistre(demande),
              style: { color: "#1890ff" },
            });
          }

          if (
            ["TRANSMISE_AU_DGI", "EN_COURS_DGI", "VALIDEE_DGI"].includes(
              demande.statut
            )
          ) {
            items.push(
              {
                key: "return-sg",
                label: t("dashboardDGI.actions.returnSG"),
                icon: <SendOutlined />,
                onClick: () => handleRetourSG(demande),
                style: { color: "#fa8c16" },
              },
              {
                key: "solicit-commission",
                label: t("dashboardDGI.actions.solicitCommission"),
                icon: <SendOutlined />,
                onClick: () => handleSolliciterAvis(demande),
                style: { color: "#722ed1" },
              }
            );
          }

          // Actions générales
          items.push(
            {
              key: "reassign",
              label: t("dashboardDGI.actions.reassign"),
              icon: <UserOutlined />,
              onClick: () => handleReattribuer(demande),
              style: { color: "#13c2c2" },
            },
            {
              key: "complement",
              label: t("dashboardDGI.actions.complement"),
              icon: <CommentOutlined />,
              onClick: () => handleComplement(demande),
              style: { color: "#eb2f96" },
            },
            {
              key: "close",
              label: t("dashboardDGI.actions.close"),
              icon: <CheckCircleOutlined />,
              onClick: () => handleCloturer(demande),
              style: { color: "#52c41a" },
            },
            {
              key: "remind",
              label: t("dashboardDGI.actions.remind"),
              icon: <ReloadOutlined />,
              onClick: () => handleRelancer(demande),
              style: { color: "#faad14" },
            }
          );

          return items;
        };

        return (
          <Dropdown
            menu={{ items: getActionMenu(demande) }}
            trigger={["click"]}
            placement="bottomRight"
          >
            <Button
              icon={<MoreOutlined />}
              size="small"
              type="default"
              className="actions-dropdown-button"
            >
              Actions
            </Button>
          </Dropdown>
        );
      },
    },
  ];

  return (
    <>
      <Header />

      <div className="dashboard-dgi-container">
        {/* Left Panel - Sidebar */}
        <div className="left-panel">
          <div className="sidebar-header">
            <h3>Direction Générale de l'industrie</h3>
            <p>Dashboard DGI</p>
          </div>

          <nav className="sidebar-nav">
            <button
              className={`nav-item ${
                activeSidebarLink === "dashboard" ? "active" : ""
              }`}
              onClick={() => setActiveSidebarLink("dashboard")}
            >
              <DashboardOutlined />
              Tableau de bord
            </button>

            <button
              className={`nav-item ${
                activeSidebarLink === "demandes" ? "active" : ""
              }`}
              onClick={() => setActiveSidebarLink("demandes")}
            >
              <FileTextOutlined />
              Demandes
            </button>

            <button
              className={`nav-item ${
                activeSidebarLink === "notifications" ? "active" : ""
              }`}
              onClick={() => setActiveSidebarLink("notifications")}
            >
              <BellOutlined />
              Notifications
            </button>

            <button
              className={`nav-item ${
                activeSidebarLink === "historique" ? "active" : ""
              }`}
              onClick={() => setActiveSidebarLink("historique")}
            >
              <HistoryOutlined />
              Historique
            </button>
          </nav>

          {/* Bouton de déconnexion */}
          <div className="sidebar-footer">
            <button className="nav-item deconnexion-btn" onClick={handleLogout}>
              <LogoutOutlined />
              Se déconnecter
            </button>
          </div>
        </div>

        {/* Main Section - Contenu principal */}
        <div className="main-section">
          {activeSidebarLink === "dashboard" && (
            <>
              <h1>{t("dashboardDGI.title")}</h1>
              <Row gutter={24}>
                <Col span={12}>
                  <h3>{t("dashboardDGI.statistics.byType")}</h3>
                  <Bar
                    data={{
                      labels: statsGraph.byType.map((x) => x.type),
                      datasets: [
                        {
                          label: "Nombre de demandes",
                          data: statsGraph.byType.map((x) => x.count),
                          backgroundColor: chartColors,
                        },
                      ],
                    }}
                  />
                </Col>
                <Col span={12}>
                  <h3>{t("dashboardDGI.statistics.bySector")}</h3>
                  <Pie
                    data={{
                      labels: statsGraph.bySecteur.map(
                        (x) => x.secteur || "Non précisé"
                      ),
                      datasets: [
                        {
                          data: statsGraph.bySecteur.map((x) => x.count),
                          backgroundColor: chartColors,
                        },
                      ],
                    }}
                  />
                </Col>
              </Row>
              <Row gutter={24} style={{ marginTop: 32 }}>
                <Col span={12}>
                  <h3>{t("dashboardDGI.statistics.byLocation")}</h3>
                  <Doughnut
                    data={{
                      labels: statsGraph.byEmplacement.map(
                        (x) => x.emplacement || "Non précisé"
                      ),
                      datasets: [
                        {
                          data: statsGraph.byEmplacement.map((x) => x.count),
                          backgroundColor: chartColors,
                        },
                      ],
                    }}
                  />
                </Col>
                <Col span={12}>
                  <h3>{t("dashboardDGI.statistics.signedAuthorizations")}</h3>
                  <Statistic
                    title={t("dashboardDGI.statistics.signedCount")}
                    value={statsGraph.signed}
                  />
                </Col>
              </Row>
              <div style={{ marginTop: 32 }}>
                <Button
                  type="primary"
                  onClick={exportCSV}
                  loading={exportLoading}
                  style={{ marginRight: 16 }}
                >
                  {t("dashboardDGI.statistics.exportCSV")}
                </Button>
                <Button onClick={exportPDF} loading={exportLoading}>
                  {t("dashboardDGI.statistics.exportPDF")}
                </Button>
              </div>
            </>
          )}

          {activeSidebarLink === "demandes" && (
            <>
              <h2>{t("dashboardDGI.demands.title")}</h2>
              {loading ? (
                <Spin size="large" />
              ) : (
                <Table
                  columns={columns}
                  dataSource={demandes}
                  rowKey="id"
                  pagination={{ pageSize: 10 }}
                  locale={{ emptyText: t("dashboardDGI.demands.noDemands") }}
                />
              )}
            </>
          )}

          {activeSidebarLink === "notifications" && (
            <div>
              <h2>{t("dashboardDGI.notifications.title")}</h2>
              {notifications.length > 0 ? (
                <ul className="notification-list">
                  {notifications.map((n) => (
                    <li
                      key={n.id}
                      style={{
                        fontWeight: n.lu ? "normal" : "bold",
                        marginBottom: "8px",
                        padding: "10px",
                        borderBottom: "1px solid #eee",
                      }}
                    >
                      <BellOutlined
                        style={{
                          marginRight: "8px",
                          color: n.lu ? "#aaa" : "#1890ff",
                        }}
                      />
                      {n.message} ({t("dashboardDGI.notifications.receivedOn")}:{" "}
                      {new Date(n.date).toLocaleString()})
                    </li>
                  ))}
                </ul>
              ) : (
                <p>{t("dashboardDGI.notifications.noNotifications")}</p>
              )}
            </div>
          )}

          {activeSidebarLink === "historique" && (
            <div>
              <h2>{t("dashboardDGI.history.title")}</h2>
              {loadingHist ? (
                <Spin />
              ) : (
                <Table
                  columns={[
                    {
                      title: t("dashboardDGI.history.date"),
                      dataIndex: "date_action",
                      key: "date_action",
                      render: (d) => new Date(d).toLocaleString(),
                    },
                    {
                      title: t("dashboardDGI.history.reference"),
                      dataIndex: "reference",
                      key: "reference",
                    },
                    {
                      title: t("dashboardDGI.history.type"),
                      dataIndex: "type",
                      key: "type",
                    },
                    {
                      title: t("dashboardDGI.history.action"),
                      dataIndex: "action",
                      key: "action",
                    },
                    {
                      title: t("dashboardDGI.history.message"),
                      dataIndex: "message",
                      key: "message",
                    },
                    {
                      title: t("dashboardDGI.history.previousStatus"),
                      dataIndex: "statut_precedent",
                      key: "statut_precedent",
                    },
                    {
                      title: t("dashboardDGI.history.newStatus"),
                      dataIndex: "nouveau_statut",
                      key: "nouveau_statut",
                    },
                  ]}
                  dataSource={historiqueDGI}
                  rowKey="id"
                  pagination={{ pageSize: 10 }}
                  locale={{ emptyText: t("dashboardDGI.history.noActions") }}
                />
              )}
            </div>
          )}

          {/* Modal de détail de la demande (Consulter) */}
          <Modal
            title={`${t("dashboardDGI.modals.demandDetails")} ${
              selectedDemande?.reference || ""
            }`}
            open={showModal}
            onCancel={() => setShowModal(false)}
            footer={null}
            width={800}
          >
            {selectedDemande ? (
              <>
                <p>
                  <strong>{t("dashboardDGI.demandDetails.type")}:</strong>{" "}
                  {selectedDemande.type}
                </p>
                <p>
                  <strong>{t("dashboardDGI.demandDetails.applicant")}:</strong>{" "}
                  {selectedDemande.demandeur_nom}{" "}
                  {selectedDemande.demandeur_prenom}
                </p>
                <p>
                  <strong>
                    {t("dashboardDGI.demandDetails.applicantEmail")}:
                  </strong>{" "}
                  {selectedDemande.demandeur_email}
                </p>
                <p>
                  <strong>
                    {t("dashboardDGI.demandDetails.applicantPhone")}:
                  </strong>{" "}
                  {selectedDemande.demandeur_telephone}
                </p>
                <p>
                  <strong>
                    {t("dashboardDGI.demandDetails.currentStatus")}:
                  </strong>{" "}
                  <Tag
                    color={
                      selectedDemande.statut === "TRANSMISE_AU_DGI"
                        ? "gold"
                        : selectedDemande.statut === "VALIDEE_DGI"
                        ? "green"
                        : selectedDemande.statut === "TRANSMISE_AU_SG"
                        ? "blue"
                        : selectedDemande.statut === "RETOURNEE_DGI"
                        ? "red"
                        : "default"
                    }
                  >
                    {selectedDemande.statut}
                  </Tag>
                </p>
                <p>
                  <strong>
                    {t("dashboardDGI.demandDetails.creationDate")}:
                  </strong>{" "}
                  {new Date(selectedDemande.created_at).toLocaleString()}
                </p>

                <h4>{t("dashboardDGI.demandDetails.demandData")}</h4>
                {selectedDemande.donnees &&
                Object.keys(selectedDemande.donnees).length > 0 ? (
                  <ul>
                    {Object.entries(selectedDemande.donnees).map(
                      ([key, value]) => (
                        <li key={key}>
                          <strong>
                            {key
                              .replace(/_/g, " ")
                              .replace(/\b\w/g, (l) => l.toUpperCase())}
                            :
                          </strong>{" "}
                          {value}
                        </li>
                      )
                    )}
                  </ul>
                ) : (
                  <p>{t("dashboardDGI.demandDetails.noSpecificData")}</p>
                )}

                <h4>{t("dashboardDGI.demandDetails.attachments")}</h4>
                {selectedDemande.fichiers &&
                Object.keys(selectedDemande.fichiers).length > 0 ? (
                  <ul>
                    {Object.entries(selectedDemande.fichiers).map(
                      ([key, value]) => (
                        <li key={key}>
                          <a
                            href={`$${API_BASE}/uploads/${value}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <DownloadOutlined />{" "}
                            {key
                              .replace(/_/g, " ")
                              .replace(/\b\w/g, (l) => l.toUpperCase())}
                          </a>
                        </li>
                      )
                    )}
                  </ul>
                ) : (
                  <p>{t("dashboardDGI.demandDetails.noAttachments")}</p>
                )}

                <h4>{t("dashboardDGI.demandDetails.actionHistory")}</h4>
                {histLoading ? (
                  <Spin />
                ) : (
                  <ul>
                    {historique.length > 0 ? (
                      historique.map((h, i) => (
                        <li key={i}>
                          <strong>{h.action}</strong>{" "}
                          {t("dashboardDGI.demandDetails.by")}{" "}
                          {h.utilisateur_nom} {h.utilisateur_prenom}{" "}
                          {t("dashboardDGI.demandDetails.on")}{" "}
                          {new Date(h.date_action).toLocaleString()}
                          <br />
                          <em>{h.message}</em>
                          {h.statut_precedent && h.nouveau_statut && (
                            <p>
                              {t("dashboardDGI.demandDetails.statusChange")} :{" "}
                              <Tag>{h.statut_precedent}</Tag> {"->"}{" "}
                              <Tag color="blue">{h.nouveau_statut}</Tag>
                            </p>
                          )}
                        </li>
                      ))
                    ) : (
                      <li>{t("dashboardDGI.demandDetails.noHistory")}</li>
                    )}
                  </ul>
                )}
              </>
            ) : (
              <Spin />
            )}
          </Modal>

          {/* Modal de commentaire */}
          <Modal
            title={`${t("dashboardDGI.modals.addComment")} ${
              selectedDemande?.reference || ""
            }`}
            open={showCommentModal}
            onCancel={() => setShowCommentModal(false)}
            onOk={submitCommentaire}
          >
            <TextArea
              rows={4}
              value={commentaire}
              onChange={(e) => setCommentaire(e.target.value)}
              placeholder={t("dashboardDGI.modals.commentPlaceholder")}
            />
          </Modal>
        </div>
      </div>

      <Footer />
    </>
  );
}
