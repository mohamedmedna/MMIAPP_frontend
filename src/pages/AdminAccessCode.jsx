import React, { useState, useEffect } from "react";
import {
  Form,
  Input,
  Button,
  Card,
  Typography,
  Space,
  Divider,
  message,
} from "antd";
import {
  LockOutlined,
  EyeInvisibleOutlined,
  EyeTwoTone,
  KeyOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useTranslation } from "react-i18next";
import banniereMinistere from "../assets/banniere-ministere.jpg";
import "../Styles/AdminAccessCode.css";

const { Title, Text, Paragraph } = Typography;

export default function AdminAccessCode() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const [loading, setLoading] = useState(false);
  const [currentCode, setCurrentCode] = useState("");
  const [showCurrentCode, setShowCurrentCode] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  const API_BASE = window.__APP_CONFIG__?.API_BASE;

  const goBack = () => {
    // Go back if there is history, otherwise go to a safe route
    if (window.history.length > 1) navigate(-1);
    else navigate("/admin-portail");
  };

  useEffect(() => {
    // Vérifier si l'utilisateur est superadmin
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    setIsSuperAdmin(user.role_id === 1);

    // Charger le code d'accès actuel
    loadCurrentAccessCode();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadCurrentAccessCode = async () => {
    try {
      const adminToken =
        localStorage.getItem("adminToken") || localStorage.getItem("token");
      const response = await fetch(`${API_BASE}/api/admin/access-code`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${adminToken}`,
          "Content-Type": "application/json",
        },
      });

      if (response.status === 401) {
        message.error(
          "Session expirée. Veuillez vous reconnecter en tant que SuperAdmin."
        );
        setCurrentCode("");
        return;
      }

      if (response.ok) {
        const data = await response.json();
        setCurrentCode(data.accessCode || "");
      }
    } catch (error) {
      console.error("Erreur lors du chargement du code d'accès:", error);
    }
  };

  const onFinish = async (values) => {
    if (!isSuperAdmin) {
      message.error(
        t(
          "adminAccessCode.error_not_authorized",
          "Vous n'êtes pas autorisé à modifier le code d'accès"
        )
      );
      return;
    }

    setLoading(true);
    try {
      const adminToken =
        localStorage.getItem("adminToken") || localStorage.getItem("token");
      const response = await fetch(`${API_BASE}/api/admin/access-code`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${adminToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          accessCode: values.accessCode,
        }),
      });

      const data = await response.json();

      if (response.status === 401) {
        message.error(
          "Session expirée. Veuillez vous reconnecter en tant que SuperAdmin."
        );
        return;
      }

      if (response.ok) {
        message.success(
          t(
            "adminAccessCode.success_update",
            "Code d'accès mis à jour avec succès"
          )
        );
        setCurrentCode(values.accessCode);
        form.resetFields();
        loadCurrentAccessCode();
      } else {
        message.error(
          data.error ||
            t(
              "adminAccessCode.error_update",
              "Erreur lors de la mise à jour du code d'accès"
            )
        );
      }
    } catch (error) {
      message.error(
        t("adminAccessCode.error_network", "Erreur réseau ou serveur")
      );
    } finally {
      setLoading(false);
    }
  };

  const generateRandomCode = () => {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
    let result = "";
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    form.setFieldsValue({ accessCode: result });
  };

  const validateAccessCode = (_, value) => {
    if (!value) {
      return Promise.reject(
        t("adminAccessCode.error_required", "Le code d'accès est requis")
      );
    }
    if (value.length !== 8) {
      return Promise.reject(
        t(
          "adminAccessCode.error_length",
          "Le code d'accès doit contenir exactement 8 caractères"
        )
      );
    }
    const hasUpperCase = /[A-Z]/.test(value);
    const hasLowerCase = /[a-z]/.test(value);
    const hasNumber = /[0-9]/.test(value);
    const hasSpecialChar = /[!@#$%^&*]/.test(value);

    if (!hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar) {
      return Promise.reject(
        t(
          "adminAccessCode.error_complexity",
          "Le code doit contenir au moins une lettre majuscule, une minuscule, un chiffre et un caractère spécial"
        )
      );
    }
    return Promise.resolve();
  };

  if (!isSuperAdmin) {
    return (
      <>
        <Header />
        <div
          className="banniere-ministere"
          style={{ height: "120px", overflow: "hidden" }}
        >
          <img
            src={banniereMinistere}
            alt="Bannière Ministère"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
        <div className="admin-access-container">
          <Card className="access-denied-card">
            <Title level={3} style={{ color: "#ff4d4f", textAlign: "center" }}>
              {t("adminAccessCode.access_denied", "Accès Refusé")}
            </Title>
            <Paragraph style={{ textAlign: "center", fontSize: "16px" }}>
              {t(
                "adminAccessCode.access_denied_message",
                "Seul le SuperAdmin peut accéder à cette page et modifier le code d'accès de l'espace administration."
              )}
            </Paragraph>
            <div style={{ textAlign: "center", marginTop: "20px" }}>
              <Button type="primary" onClick={goBack}>
                {t("adminAccessCode.back", "Retour")}
              </Button>
            </div>
          </Card>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div
        className="banniere-ministere"
        style={{ height: "120px", overflow: "hidden" }}
      >
        <img
          src={banniereMinistere}
          alt="Bannière Ministère"
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </div>

      <div className="admin-access-container">
        <div className="admin-access-content">
          <Title
            level={2}
            style={{
              color: "#229954",
              textAlign: "center",
              marginBottom: "30px",
            }}
          >
            {t(
              "adminAccessCode.title",
              "Gestion du Code d'Accès Administration"
            )}
          </Title>

          {/* Bouton retour */}
          <div className="back-to-dashboard-section">
            <Button type="primary" onClick={goBack}>
              {t("adminAccessCode.back", "Retour")}
            </Button>
          </div>

          <div className="current-code-section">
            <Card
              title={t("adminAccessCode.current_code", "Code d'Accès Actuel")}
              className="current-code-card"
            >
              <Space direction="vertical" style={{ width: "100%" }}>
                <div className="code-display">
                  <Text strong style={{ fontSize: "18px" }}>
                    {showCurrentCode ? currentCode : "••••••••"}
                  </Text>
                  <Button
                    type="text"
                    icon={
                      showCurrentCode ? (
                        <EyeInvisibleOutlined />
                      ) : (
                        <EyeTwoTone />
                      )
                    }
                    onClick={() => setShowCurrentCode(!showCurrentCode)}
                    style={{ marginLeft: "10px" }}
                  />
                </div>
                <Text type="secondary">
                  {t(
                    "adminAccessCode.current_code_info",
                    "Ce code est requis pour accéder à l'espace administration"
                  )}
                </Text>
              </Space>
            </Card>
          </div>

          <Divider />

          <div className="update-code-section">
            <Card
              title={t(
                "adminAccessCode.update_code",
                "Modifier le Code d'Accès"
              )}
              className="update-code-card"
            >
              <Form
                form={form}
                name="access_code_form"
                onFinish={onFinish}
                layout="vertical"
                size="large"
              >
                <Form.Item
                  name="accessCode"
                  label={t("adminAccessCode.new_code", "Nouveau Code d'Accès")}
                  rules={[{ validator: validateAccessCode }]}
                >
                  <Input.Password
                    prefix={<KeyOutlined />}
                    placeholder={t(
                      "adminAccessCode.new_code_placeholder",
                      "Entrez le nouveau code (8 caractères)"
                    )}
                    maxLength={8}
                  />
                </Form.Item>

                <Form.Item>
                  <Space>
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={loading}
                      icon={<LockOutlined />}
                    >
                      {t("adminAccessCode.update_button", "Mettre à Jour")}
                    </Button>
                    <Button onClick={generateRandomCode} icon={<KeyOutlined />}>
                      {t("adminAccessCode.generate_button", "Générer")}
                    </Button>
                  </Space>
                </Form.Item>
              </Form>
            </Card>
          </div>

          <div className="requirements-section">
            <Card
              title={t(
                "adminAccessCode.requirements",
                "Exigences du Code d'Accès"
              )}
              className="requirements-card"
            >
              <ul className="requirements-list">
                <li>
                  {t("adminAccessCode.req_length", "Exactement 8 caractères")}
                </li>
                <li>
                  {t(
                    "adminAccessCode.req_uppercase",
                    "Au moins une lettre majuscule (A-Z)"
                  )}
                </li>
                <li>
                  {t(
                    "adminAccessCode.req_lowercase",
                    "Au moins une lettre minuscule (a-z)"
                  )}
                </li>
                <li>
                  {t("adminAccessCode.req_number", "Au moins un chiffre (0-9)")}
                </li>
                <li>
                  {t(
                    "adminAccessCode.req_special",
                    "Au moins un caractère spécial (!@#$%^&*)"
                  )}
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
