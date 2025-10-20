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
  Statistic,
  Row,
  Col,
  Card,
  Descriptions,
  Steps,
  Form,
  Select,
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
  ExclamationCircleOutlined,
  EyeOutlined,
  SendOutlined,
} from "@ant-design/icons";
import Header from "../components/Header";
import Footer from "../components/Footer";
import BanniereMinistereCoupee from "../components/BanniereMinistereCoupee";
import "../Styles/DashboardComite.css";
const { Content, Sider } = Layout;
const { TextArea } = Input;
const { Option } = Select;

export default function DashboardComite() {
  const [stats, setStats] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [dossiers, setDossiers] = useState([]);
  const [selectedDossier, setSelectedDossier] = useState(null);
  const [avis, setAvis] = useState("");
  const [historique, setHistorique] = useState([]);
  const [criteresTechniques, setCriteresTechniques] = useState({});
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [histLoading, setHistLoading] = useState(false);
  const [criteresLoading, setCriteresLoading] = useState(false);
  const [activeMenuKey, setActiveMenuKey] = useState("dashboard");
  const [currentStep, setCurrentStep] = useState(0);
  const [form] = Form.useForm();
  const canvasRef = useRef(null);

  const token = localStorage.getItem("adminToken");

  const API_BASE = window.__APP_CONFIG__?.API_BASE;

  useEffect(() => {
    fetchStats();
    fetchNotifications();
    fetchDossiers();
  }, []);

  useEffect(() => {
    if (canvasRef.current && stats && stats.length) {
      const ctx = canvasRef.current.getContext("2d");
      const data = stats.map((s) => s.value);
      const colors = ["#3b7a57", "#e6ffe6", "#ffb300", "#d32f2f"];
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
        message: "Erreur",
        description: "Impossible de charger les statistiques",
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
        message: "Erreur",
        description: "Impossible de charger les notifications",
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
        message: "Erreur",
        description: "Impossible de charger les dossiers",
      });
    } finally {
      setLoading(false);
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
        message: "Erreur",
        description: "Impossible de charger l'historique",
      });
    } finally {
      setHistLoading(false);
    }
  };

  const fetchCriteresTechniques = async (id) => {
    setCriteresLoading(true);
    try {
      const res = await fetch(
        `${API_BASE}/api/commission/dossiers/${id}/criteres`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      setCriteresTechniques(data.criteres || {});
    } catch (err) {
      notification.error({
        message: "Erreur",
        description: "Impossible de charger les critères techniques",
      });
    } finally {
      setCriteresLoading(false);
    }
  };

  const handleVoir = (dossier) => {
    setSelectedDossier(dossier);
    setCurrentStep(0);
    fetchHistorique(dossier.id);
    fetchCriteresTechniques(dossier.id);
    setShowModal(true);
  };

  const handleAvis = async (type_avis) => {
    if (!selectedDossier) return;

    try {
      const values = await form.validateFields();
      const criteres_techniques = values.criteres_techniques || {};

      const res = await fetch(
        `${API_BASE}/api/commission/dossiers/${selectedDossier.id}/avis`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            type_avis,
            observations: avis,
            criteres_techniques,
          }),
        }
      );

      if (res.ok) {
        const result = await res.json();
        notification.success({
          message: "Succès",
          description: `Avis enregistré. ${
            result.prochaineEtape !== "REJETE"
              ? `Transmission à ${result.prochaineEtape} en cours.`
              : "Demande rejetée."
          }`,
        });
        setSelectedDossier(null);
        setAvis("");
        form.resetFields();
        fetchDossiers();
        fetchStats();
        setShowModal(false);
      } else {
        notification.error({
          message: "Erreur",
          description: "Erreur lors de l'enregistrement de l'avis",
        });
      }
    } catch (error) {
      if (error.errorFields) {
        notification.error({
          message: "Erreur",
          description: "Veuillez remplir tous les champs requis",
        });
      } else {
        notification.error({
          message: "Erreur",
          description: "Erreur réseau ou serveur",
        });
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("user");
    window.location.href = "/login/comite";
  };

  const getStatutColor = (statut) => {
    if (statut.includes("EN_ATTENTE")) return "gold";
    if (statut.includes("FAVORABLE")) return "green";
    if (statut.includes("DEFAVORABLE")) return "red";
    if (statut.includes("RESERVE")) return "orange";
    return "default";
  };

  const getStatutText = (statut) => {
    if (statut.includes("EN_ATTENTE_AVIS_COMMISSION"))
      return "En attente d'avis";
    if (statut.includes("AVIS_FAVORABLE_COMMISSION")) return "Avis favorable";
    if (statut.includes("AVIS_DEFAVORABLE_COMMISSION"))
      return "Avis défavorable";
    if (statut.includes("RESERVE_COMMISSION")) return "Avec réserves";
    return statut;
  };

  const columns = [
    {
      title: "Référence",
      dataIndex: "reference",
      key: "reference",
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      render: (type) => {
        const typeLabels = {
          BOULANGERIE: "Boulangerie",
          EAU_MINERALE: "Eau Minérale",
          PMNE: "PMNE",
        };
        return typeLabels[type] || type;
      },
    },
    {
      title: "Demandeur",
      dataIndex: "demandeur",
      key: "demandeur",
    },
    {
      title: "Statut",
      dataIndex: "statut",
      key: "statut",
      render: (statut) => (
        <Tag color={getStatutColor(statut)}>{getStatutText(statut)}</Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, dossier) => (
        <Button
          type="primary"
          icon={<EyeOutlined />}
          onClick={() => handleVoir(dossier)}
        >
          Examiner
        </Button>
      ),
    },
  ];

  const workflowSteps = [
    {
      title: "Consultation",
      description: "Examen du dossier",
      icon: <FileTextOutlined />,
    },
    {
      title: "Vérification",
      description: "Critères techniques",
      icon: <CheckCircleOutlined />,
    },
    {
      title: "Validation",
      description: "Émission d'avis",
      icon: <SendOutlined />,
    },
  ];

  const renderCriteresTechniques = () => {
    if (criteresLoading) return <Spin />;

    return Object.entries(criteresTechniques).map(([key, critere]) => (
      <Card key={key} size="small" style={{ marginBottom: 8 }}>
        <Descriptions column={1} size="small">
          <Descriptions.Item label="Critère">{critere.label}</Descriptions.Item>
          <Descriptions.Item label="Valeur actuelle">
            {critere.valeur}
          </Descriptions.Item>
          <Descriptions.Item label="Statut">
            <Tag color={critere.statut === "Conforme" ? "green" : "orange"}>
              {critere.statut}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Commentaire">
            {critere.commentaire}
          </Descriptions.Item>
        </Descriptions>
      </Card>
    ));
  };

  return (
    <>
      <Header />

      <div className="dashboard-comite-container">
        {/* Left Panel - Sidebar */}
        <div className="left-panel">
          <div className="sidebar-header">
            <h3>Comité Technique</h3>
            <p>Dashboard Comité</p>
          </div>

          <nav className="sidebar-nav">
            <button
              className={`nav-item ${
                activeMenuKey === "dashboard" ? "active" : ""
              }`}
              onClick={() => setActiveMenuKey("dashboard")}
            >
              <DashboardOutlined />
              Tableau de bord
            </button>

            <button
              className={`nav-item ${
                activeMenuKey === "dossiers" ? "active" : ""
              }`}
              onClick={() => setActiveMenuKey("dossiers")}
            >
              <FileTextOutlined />
              Dossiers à traiter
            </button>

            <button
              className={`nav-item ${
                activeMenuKey === "notifications" ? "active" : ""
              }`}
              onClick={() => setActiveMenuKey("notifications")}
            >
              <BellOutlined />
              Notifications
            </button>

            <button
              className={`nav-item ${
                activeMenuKey === "parametres" ? "active" : ""
              }`}
              onClick={() => setActiveMenuKey("parametres")}
            >
              <SettingOutlined />
              Paramètres
            </button>
          </nav>

          {/* Bouton de déconnexion */}
          <div className="sidebar-footer">
            <button className="nav-item deconnexion-btn" onClick={handleLogout}>
              <LogoutOutlined />
              Déconnexion
            </button>
          </div>
        </div>

        {/* Main Section - Contenu principal */}
        <div className="main-section">
          <div className="dashboard-header">
            <h1 className="dashboard-title">
              🏢 Tableau de bord Comité Technique
            </h1>
          </div>
          {activeMenuKey === "dashboard" && (
            <>
              <h1>Tableau de bord Comité Technique</h1>
              {loading || !stats ? (
                <Spin tip="Chargement des statistiques..." />
              ) : (
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
                  <div style={{ textAlign: "center" }}>
                    <canvas ref={canvasRef} width={140} height={140} />
                  </div>
                </>
              )}
            </>
          )}
          {activeMenuKey === "dossiers" && (
            <>
              <h2>Dossiers à traiter</h2>
              <Table
                dataSource={dossiers}
                columns={columns}
                rowKey="id"
                loading={loading}
                pagination={{ pageSize: 10 }}
              />
            </>
          )}
          {activeMenuKey === "notifications" && (
            <>
              <h2>Notifications</h2>
              <Table
                dataSource={notifications}
                columns={[
                  { title: "Message", dataIndex: "title", key: "title" },
                  {
                    title: "Date",
                    dataIndex: "date",
                    key: "date",
                    render: (d) => new Date(d).toLocaleString(),
                  },
                  {
                    title: "Statut",
                    dataIndex: "isNew",
                    key: "isNew",
                    render: (isNew) =>
                      isNew ? (
                        <Tag color="red">Nouveau</Tag>
                      ) : (
                        <Tag color="green">Lu</Tag>
                      ),
                  },
                ]}
                rowKey="id"
                pagination={{ pageSize: 10 }}
              />
            </>
          )}
          {activeMenuKey === "parametres" && (
            <div>
              <h2>Paramètres</h2>
              <p>Fonctionnalités à venir...</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal détail dossier avec workflow */}
      <Modal
        title={
          <div>
            <h3>Examen du dossier {selectedDossier?.reference || ""}</h3>
            <Steps current={currentStep} size="small" style={{ marginTop: 16 }}>
              {workflowSteps.map((step, index) => (
                <Steps.Step
                  key={index}
                  title={step.title}
                  description={step.description}
                  icon={step.icon}
                />
              ))}
            </Steps>
          </div>
        }
        open={showModal}
        onCancel={() => setShowModal(false)}
        footer={null}
        width={1000}
      >
        {selectedDossier && (
          <div>
            {/* Étape 1: Consultation */}
            {currentStep === 0 && (
              <div>
                <Card
                  title="Informations du dossier"
                  style={{ marginBottom: 16 }}
                >
                  <Descriptions column={2}>
                    <Descriptions.Item label="Référence">
                      {selectedDossier.reference}
                    </Descriptions.Item>
                    <Descriptions.Item label="Type">
                      {selectedDossier.type}
                    </Descriptions.Item>
                    <Descriptions.Item label="Demandeur">
                      {selectedDossier.demandeur}
                    </Descriptions.Item>
                    <Descriptions.Item label="Date de création">
                      {new Date(
                        selectedDossier.created_at
                      ).toLocaleDateString()}
                    </Descriptions.Item>
                    <Descriptions.Item label="Statut">
                      <Tag color={getStatutColor(selectedDossier.statut)}>
                        {getStatutText(selectedDossier.statut)}
                      </Tag>
                    </Descriptions.Item>
                  </Descriptions>
                </Card>

                <Card
                  title="Données de la demande"
                  style={{ marginBottom: 16 }}
                >
                  <pre
                    style={{
                      background: "#f5f5f5",
                      padding: 16,
                      borderRadius: 4,
                    }}
                  >
                    {JSON.stringify(selectedDossier.donnees, null, 2)}
                  </pre>
                </Card>

                <div style={{ textAlign: "center", marginTop: 16 }}>
                  <Button type="primary" onClick={() => setCurrentStep(1)}>
                    Passer à la vérification des critères techniques
                  </Button>
                </div>
              </div>
            )}

            {/* Étape 2: Vérification des critères techniques */}
            {currentStep === 1 && (
              <div>
                <Card
                  title="Critères techniques à vérifier"
                  style={{ marginBottom: 16 }}
                >
                  {renderCriteresTechniques()}
                </Card>

                <div style={{ textAlign: "center", marginTop: 16 }}>
                  <Space>
                    <Button onClick={() => setCurrentStep(0)}>Retour</Button>
                    <Button type="primary" onClick={() => setCurrentStep(2)}>
                      Passer à l'émission d'avis
                    </Button>
                  </Space>
                </div>
              </div>
            )}

            {/* Étape 3: Émission d'avis */}
            {currentStep === 2 && (
              <div>
                <Card
                  title="Émission d'avis et transmission"
                  style={{ marginBottom: 16 }}
                >
                  <Form form={form} layout="vertical">
                    <Form.Item
                      name="criteres_techniques"
                      label="Évaluation des critères techniques"
                    >
                      <Select
                        mode="multiple"
                        placeholder="Sélectionner les critères conformes"
                      >
                        {Object.entries(criteresTechniques).map(
                          ([key, critere]) => (
                            <Option key={key} value={key}>
                              {critere.label} - {critere.statut}
                            </Option>
                          )
                        )}
                      </Select>
                    </Form.Item>
                  </Form>

                  <TextArea
                    rows={4}
                    value={avis}
                    onChange={(e) => setAvis(e.target.value)}
                    placeholder="Observations détaillées, réserves ou commentaires..."
                    style={{ marginBottom: 16 }}
                  />

                  <Divider />

                  <div
                    style={{
                      display: "flex",
                      gap: 8,
                      justifyContent: "center",
                    }}
                  >
                    <Button
                      type="primary"
                      icon={<CheckCircleOutlined />}
                      onClick={() => handleAvis("FAVORABLE")}
                      style={{
                        backgroundColor: "#52c41a",
                        borderColor: "#52c41a",
                      }}
                    >
                      Avis favorable → Transmission DGI
                    </Button>
                    <Button
                      danger
                      icon={<CloseCircleOutlined />}
                      onClick={() => handleAvis("DEFAVORABLE")}
                    >
                      Avis défavorable → Rejet
                    </Button>
                    <Button
                      icon={<ExclamationCircleOutlined />}
                      onClick={() => handleAvis("RESERVE")}
                      style={{
                        backgroundColor: "#fa8c16",
                        borderColor: "#fa8c16",
                        color: "white",
                      }}
                    >
                      Réserves → Transmission MMI
                    </Button>
                  </div>
                </Card>

                <div style={{ textAlign: "center", marginTop: 16 }}>
                  <Button onClick={() => setCurrentStep(1)}>Retour</Button>
                </div>
              </div>
            )}

            {/* Historique */}
            <Card title="Historique des actions" style={{ marginTop: 16 }}>
              {histLoading ? (
                <Spin />
              ) : (
                <Table
                  dataSource={historique}
                  columns={[
                    { title: "Action", dataIndex: "action", key: "action" },
                    { title: "Message", dataIndex: "message", key: "message" },
                    {
                      title: "Date",
                      dataIndex: "date_action",
                      key: "date_action",
                      render: (d) => new Date(d).toLocaleString(),
                    },
                    {
                      title: "Statut précédent",
                      dataIndex: "statut_precedent",
                      key: "statut_precedent",
                    },
                    {
                      title: "Nouveau statut",
                      dataIndex: "nouveau_statut",
                      key: "nouveau_statut",
                    },
                  ]}
                  rowKey="id"
                  pagination={false}
                  size="small"
                />
              )}
            </Card>
          </div>
        )}
      </Modal>

      <Footer />
    </>
  );
}
