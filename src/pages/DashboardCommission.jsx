import React, { useState, useEffect, useRef } from "react";
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
  Card,
  Typography,
  Space,
  Divider,
} from "antd";
import {
  DashboardOutlined,
  FileTextOutlined,
  BellOutlined,
  SettingOutlined,
  LogoutOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  CommentOutlined,
  HistoryOutlined,
  EyeOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import Header from "../components/Header";
import Footer from "../components/Footer";
import BanniereMinistereCoupee from "../components/BanniereMinistereCoupee";
import "../Styles/DashboardCommission.css";

const { Content, Sider } = Layout;
const { TextArea } = Input;
const { Title, Text } = Typography;

export default function DashboardCommission() {
  const { t } = useTranslation();
  const [stats, setStats] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [dossiers, setDossiers] = useState([]);
  const [dossiersTraites, setDossiersTraites] = useState([]);
  const [selectedDossier, setSelectedDossier] = useState(null);
  const [avis, setAvis] = useState("");
  const [historique, setHistorique] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingTraites, setLoadingTraites] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [commentaire, setCommentaire] = useState("");
  const [histLoading, setHistLoading] = useState(false);
  const [activeMenuKey, setActiveMenuKey] = useState("dossiers");
  const [avisLoading, setAvisLoading] = useState(false);
  const canvasRef = useRef(null);

  const token = localStorage.getItem("adminToken");

  const API_BASE = window.__APP_CONFIG__?.API_BASE;

  useEffect(() => {
    fetchStats();
    fetchNotifications();
    fetchDossiers();
    fetchDossiersTraites();
  }, []);

  const handleMenuClick = (e) => {
    setActiveMenuKey(e.key);
  };

  useEffect(() => {
    if (canvasRef.current && stats && stats.length) {
      const ctx = canvasRef.current.getContext("2d");
      const data = stats.map((s) => s.value);
      const colors = ["#016b5b", "#43a047", "#ffb300", "#d32f2f"];
      const total = data.reduce((a, b) => a + b, 0) || 1;
      let currentAngle = -Math.PI / 2;
      ctx.clearRect(0, 0, 140, 140);
      data.forEach((value, i) => {
        const sliceAngle = (value / total) * 2 * Math.PI;
        ctx.beginPath();
        ctx.arc(70, 70, 50, currentAngle, currentAngle + sliceAngle);
        ctx.arc(70, 70, 35, currentAngle + sliceAngle, currentAngle, true);
        ctx.closePath();
        ctx.fillStyle = colors[i];
        ctx.fill();
        currentAngle += sliceAngle;
      });
    }
  }, [stats]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/commission/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setStats(data.stats || []);
    } catch (err) {
      notification.error({
        message: t("dashboardCommission.messages.error"),
        description: t("dashboardCommission.messages.errorStats"),
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/commission/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setNotifications(data.notifications || []);
    } catch (err) {
      notification.error({
        message: t("dashboardCommission.messages.error"),
        description: t("dashboardCommission.messages.errorNotifications"),
      });
    }
  };

  const fetchDossiers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/commission/dossiers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setDossiers(data.dossiers || []);
    } catch (err) {
      notification.error({
        message: t("dashboardCommission.messages.error"),
        description: t("dashboardCommission.messages.errorDossiers"),
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchDossiersTraites = async () => {
    setLoadingTraites(true);
    try {
      const res = await fetch(`${API_BASE}/api/commission/dossiers-traites`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setDossiersTraites(data.dossiers || []);
    } catch (err) {
      notification.error({
        message: t("dashboardCommission.messages.error"),
        description: t("dashboardCommission.messages.errorHistorique"),
      });
    } finally {
      setLoadingTraites(false);
    }
  };

  const fetchHistorique = async (id) => {
    setHistLoading(true);
    try {
      const res = await fetch(
        `${API_BASE}/api/commission/dossiers/${id}/historique`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      setHistorique(data.historique || []);
    } catch (err) {
      notification.error({
        message: t("dashboardCommission.messages.error"),
        description: t("dashboardCommission.messages.errorHistorique"),
      });
    } finally {
      setHistLoading(false);
    }
  };

  const handleVoir = (dossier) => {
    setSelectedDossier(dossier);
    fetchHistorique(dossier.id);
    setShowModal(true);
  };

  const handleAvis = async (type_avis) => {
    if (!selectedDossier) return;
    setAvisLoading(true);
    try {
      console.log("📋 [frontend] Envoi avis:", {
        dossierId: selectedDossier.id,
        type_avis,
        observations: avis,
      });

      const res = await fetch(
        `${API_BASE}/api/commission/dossiers/${selectedDossier.id}/avis`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ type_avis, observations: avis }),
        }
      );

      const data = await res.json();
      console.log("📋 [frontend] Réponse serveur:", data);

      if (res.ok && data.success) {
        notification.success({
          message: t("dashboardCommission.messages.success"),
          description: data.message || t("dashboardCommission.avis.success"),
        });
        setSelectedDossier(null);
        setAvis("");
        fetchDossiers();
        fetchStats();
        setShowModal(false);
      } else {
        console.error("❌ [frontend] Erreur serveur:", data);
        notification.error({
          message: t("dashboardCommission.messages.error"),
          description:
            data.error || data.details || t("dashboardCommission.avis.error"),
        });
      }
    } catch (error) {
      console.error("❌ [frontend] Erreur réseau:", error);
      notification.error({
        message: t("dashboardCommission.messages.error"),
        description: t("dashboardCommission.avis.error"),
      });
    } finally {
      setAvisLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("user");
    window.location.href = "/login/commission";
  };

  const getStatusColor = (statut) => {
    if (statut.includes("EN_ATTENTE")) return "gold";
    if (statut.includes("VALIDE") || statut.includes("FAVORABLE"))
      return "green";
    if (statut.includes("RESERVE")) return "orange";
    if (statut.includes("REJETE") || statut.includes("DEFAVORABLE"))
      return "red";
    return "default";
  };

  const getStatusText = (statut) => {
    return t(`dashboardCommission.statuses.${statut}`) || statut;
  };

  const columns = [
    {
      title: t("dashboardCommission.dossiers.reference"),
      dataIndex: "reference",
      key: "reference",
      width: 150,
    },
    {
      title: t("dashboardCommission.dossiers.type"),
      dataIndex: "type",
      key: "type",
      width: 120,
    },
    {
      title: t("dashboardCommission.dossiers.demandeur"),
      dataIndex: "demandeur",
      key: "demandeur",
      width: 200,
    },
    {
      title: t("dashboardCommission.dossiers.statut"),
      dataIndex: "statut",
      key: "statut",
      width: 180,
      render: (statut) => (
        <Tag color={getStatusColor(statut)}>{getStatusText(statut)}</Tag>
      ),
    },
    {
      title: t("dashboardCommission.dossiers.actions"),
      key: "actions",
      width: 100,
      render: (_, dossier) => (
        <Button
          type="primary"
          icon={<EyeOutlined />}
          size="small"
          onClick={() => handleVoir(dossier)}
        >
          {t("dashboardCommission.dossiers.voir")}
        </Button>
      ),
    },
  ];

  const menuItems = [
    {
      key: "dashboard",
      icon: <DashboardOutlined />,
      label: t("dashboardCommission.sidebar.dashboard"),
    },
    {
      key: "dossiers",
      icon: <FileTextOutlined />,
      label: t("dashboardCommission.sidebar.dossiers"),
    },
    {
      key: "notifications",
      icon: <BellOutlined />,
      label: t("dashboardCommission.sidebar.notifications"),
    },
    {
      key: "parametres",
      icon: <SettingOutlined />,
      label: t("dashboardCommission.sidebar.parametres"),
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: t("dashboardCommission.sidebar.logout"),
      onClick: handleLogout,
    },
  ];

  return (
    <>
      <Header />

      <div className="dashboard-commission-container">
        {/* Left Panel - Sidebar */}
        <div className="left-panel">
          <div className="sidebar-header">
            <h3>{t("dashboardCommission.title")}</h3>
            <p>Commission/Comité</p>
          </div>

          <nav className="sidebar-nav">
            <button
              className={`nav-item ${
                activeMenuKey === "dashboard" ? "active" : ""
              }`}
              onClick={() => setActiveMenuKey("dashboard")}
            >
              <DashboardOutlined />
              {t("dashboardCommission.sidebar.dashboard")}
            </button>

            <button
              className={`nav-item ${
                activeMenuKey === "dossiers" ? "active" : ""
              }`}
              onClick={() => setActiveMenuKey("dossiers")}
            >
              <FileTextOutlined />
              {t("dashboardCommission.sidebar.dossiers")}
            </button>

            <button
              className={`nav-item ${
                activeMenuKey === "dossiers-traites" ? "active" : ""
              }`}
              onClick={() => setActiveMenuKey("dossiers-traites")}
            >
              <HistoryOutlined />
              {t("dashboardCommission.sidebar.historique")}
            </button>

            <button
              className={`nav-item ${
                activeMenuKey === "notifications" ? "active" : ""
              }`}
              onClick={() => setActiveMenuKey("notifications")}
            >
              <BellOutlined />
              {t("dashboardCommission.sidebar.notifications")}
            </button>

            <button
              className={`nav-item ${
                activeMenuKey === "parametres" ? "active" : ""
              }`}
              onClick={() => setActiveMenuKey("parametres")}
            >
              <SettingOutlined />
              {t("dashboardCommission.sidebar.parametres")}
            </button>
          </nav>

          {/* Bouton de déconnexion */}
          <div className="sidebar-footer">
            <button className="nav-item deconnexion-btn" onClick={handleLogout}>
              <LogoutOutlined />
              {t("dashboardCommission.sidebar.logout")}
            </button>
          </div>
        </div>

        {/* Main Section - Contenu principal */}
        <div className="main-section">
          <div className="dashboard-header">
            <h1 className="dashboard-title">
              🏢 {t("dashboardCommission.title")}
            </h1>
          </div>
          {activeMenuKey === "dashboard" && (
            <>
              <Title level={2}>{t("dashboardCommission.title")}</Title>
              {loading || !stats ? (
                <div style={{ textAlign: "center", padding: "50px" }}>
                  <Spin
                    size="large"
                    tip={t("dashboardCommission.messages.loadingStats")}
                  />
                </div>
              ) : (
                <>
                  <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                    {stats.map((stat) => (
                      <Col xs={24} sm={12} md={6} key={stat.id}>
                        <Card>
                          <Statistic
                            title={t(
                              `dashboardCommission.statistics.${
                                stat.id === "1"
                                  ? "aExaminer"
                                  : stat.id === "2"
                                  ? "valides"
                                  : stat.id === "3"
                                  ? "reserves"
                                  : "rejetes"
                              }`
                            )}
                            value={stat.value}
                            valueStyle={{ color: stat.color }}
                            prefix={
                              stat.id === "1" ? (
                                <ClockCircleOutlined />
                              ) : stat.id === "2" ? (
                                <CheckCircleOutlined />
                              ) : stat.id === "3" ? (
                                <ExclamationCircleOutlined />
                              ) : (
                                <CloseCircleOutlined />
                              )
                            }
                          />
                        </Card>
                      </Col>
                    ))}
                  </Row>
                  <Card
                    title={t("dashboardCommission.statistics.title")}
                    style={{ textAlign: "center" }}
                  >
                    <canvas ref={canvasRef} width={140} height={140} />
                  </Card>
                </>
              )}
            </>
          )}

          {activeMenuKey === "dossiers" && (
            <>
              <Title level={2}>{t("dashboardCommission.dossiers.title")}</Title>
              <Table
                dataSource={dossiers}
                columns={columns}
                rowKey="id"
                loading={loading}
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total, range) =>
                    `${range[0]}-${range[1]} sur ${total} dossiers`,
                }}
                scroll={{ x: 800 }}
                locale={{
                  emptyText: t("dashboardCommission.dossiers.noDossiers"),
                }}
              />
            </>
          )}

          {activeMenuKey === "dossiers-traites" && (
            <>
              <Title level={2}>
                {t("dashboardCommission.historique.title")}
              </Title>
              <Table
                dataSource={dossiersTraites}
                columns={columns}
                rowKey="id"
                loading={loadingTraites}
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total, range) =>
                    `${range[0]}-${range[1]} sur ${total} dossiers dans l'historique`,
                }}
                scroll={{ x: 800 }}
                locale={{
                  emptyText: t("dashboardCommission.historique.noDossiers"),
                }}
              />
            </>
          )}

          {activeMenuKey === "notifications" && (
            <>
              <Title level={2}>
                {t("dashboardCommission.notifications.title")}
              </Title>
              <Table
                dataSource={notifications}
                columns={[
                  {
                    title: t("dashboardCommission.notifications.message"),
                    dataIndex: "title",
                    key: "title",
                    width: 300,
                  },
                  {
                    title: t("dashboardCommission.notifications.date"),
                    dataIndex: "date",
                    key: "date",
                    width: 150,
                    render: (d) => new Date(d).toLocaleString(),
                  },
                  {
                    title: t("dashboardCommission.notifications.statut"),
                    dataIndex: "isNew",
                    key: "isNew",
                    width: 100,
                    render: (isNew) =>
                      isNew ? (
                        <Tag color="red">
                          {t("dashboardCommission.notifications.nouveau")}
                        </Tag>
                      ) : (
                        <Tag color="green">
                          {t("dashboardCommission.notifications.lu")}
                        </Tag>
                      ),
                  },
                ]}
                rowKey="id"
                pagination={{ pageSize: 10 }}
                locale={{
                  emptyText: t(
                    "dashboardCommission.notifications.noNotifications"
                  ),
                }}
              />
            </>
          )}

          {activeMenuKey === "parametres" && (
            <div>
              <Title level={2}>
                {t("dashboardCommission.sidebar.parametres")}
              </Title>
              <Card>
                <Text>Fonctionnalités à venir...</Text>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Modal détail dossier */}
      <Modal
        title={`${t("dashboardCommission.modal.detailTitle")} ${
          selectedDossier?.reference || ""
        }`}
        open={showModal}
        onCancel={() => setShowModal(false)}
        footer={null}
        width={900}
        destroyOnHidden
      >
        {selectedDossier && (
          <Space direction="vertical" style={{ width: "100%" }} size="large">
            <Row gutter={16}>
              <Col span={8}>
                <Text strong>{t("dashboardCommission.modal.type")}:</Text>
                <br />
                <Text>{selectedDossier.type}</Text>
              </Col>
              <Col span={8}>
                <Text strong>{t("dashboardCommission.modal.demandeur")}:</Text>
                <br />
                <Text>{selectedDossier.demandeur}</Text>
              </Col>
              <Col span={8}>
                <Text strong>{t("dashboardCommission.modal.statut")}:</Text>
                <br />
                <Tag color={getStatusColor(selectedDossier.statut)}>
                  {getStatusText(selectedDossier.statut)}
                </Tag>
              </Col>
            </Row>

            <Divider />

            <div>
              <Text strong>{t("dashboardCommission.modal.observations")}:</Text>
              <TextArea
                rows={4}
                value={avis}
                onChange={(e) => setAvis(e.target.value)}
                placeholder={t(
                  "dashboardCommission.avis.observationsPlaceholder"
                )}
                style={{ marginTop: 8 }}
              />
            </div>

            <Space>
              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                loading={avisLoading}
                onClick={() => handleAvis("FAVORABLE")}
              >
                {t("dashboardCommission.modal.avisFavorable")}
              </Button>
              <Button
                danger
                icon={<CloseCircleOutlined />}
                loading={avisLoading}
                onClick={() => handleAvis("DEFAVORABLE")}
              >
                {t("dashboardCommission.modal.avisDefavorable")}
              </Button>
              <Button
                icon={<ExclamationCircleOutlined />}
                loading={avisLoading}
                onClick={() => handleAvis("RESERVE")}
              >
                {t("dashboardCommission.modal.reserve")}
              </Button>
              <Button onClick={() => setShowModal(false)}>
                {t("dashboardCommission.modal.fermer")}
              </Button>
            </Space>

            <Divider />

            <div>
              <Title level={4}>
                {t("dashboardCommission.modal.historique")}
              </Title>
              {histLoading ? (
                <Spin />
              ) : (
                <Table
                  dataSource={historique}
                  columns={[
                    {
                      title: t("dashboardCommission.modal.action"),
                      dataIndex: "action",
                      key: "action",
                      width: 150,
                    },
                    {
                      title: t("dashboardCommission.modal.message"),
                      dataIndex: "message",
                      key: "message",
                      width: 200,
                    },
                    {
                      title: t("dashboardCommission.modal.dateAction"),
                      dataIndex: "date_action",
                      key: "date_action",
                      width: 150,
                      render: (d) => new Date(d).toLocaleString(),
                    },
                    {
                      title: t("dashboardCommission.modal.statutPrecedent"),
                      dataIndex: "statut_precedent",
                      key: "statut_precedent",
                      width: 150,
                    },
                    {
                      title: t("dashboardCommission.modal.nouveauStatut"),
                      dataIndex: "nouveau_statut",
                      key: "nouveau_statut",
                      width: 150,
                    },
                  ]}
                  rowKey="id"
                  pagination={false}
                  size="small"
                  scroll={{ x: 800 }}
                />
              )}
            </div>
          </Space>
        )}
      </Modal>

      <Footer />
    </>
  );
}
