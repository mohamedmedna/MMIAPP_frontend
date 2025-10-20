import React, { useState } from "react";
import { Form, Input, Button, Typography, Alert, Divider } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import banniereMinistere from "../assets/banniere-ministere.jpg";
import "../Styles/LoginAntd.css";
import { useTranslation } from "react-i18next";

const { Title, Text } = Typography;

export default function LoginSuperAdminAntd() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const baseUrl = window.__APP_CONFIG__?.API_BASE;

  const onFinish = async (values) => {
    setError("");
    setLoading(true);
    try {
      const response = await fetch(`${baseUrl}/api/admin-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: values.email,
          mot_de_passe: values.password,
        }),
      });

      const data = await response.json();

      // role_id = 1 pour SuperAdmin
      if (response.ok && data.token && data.user && data.user.role_id === 1) {
        localStorage.setItem("adminToken", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        // ✅ SPA navigation (respects basename)
        navigate("/superadmin-dashboard");
      } else if (response.ok && data.user && data.user.role_id !== 1) {
        setError(t("superAdminLogin.accessDenied"));
      } else if (response.status === 403) {
        setError(
          <>
            <div>{data.error || "Votre compte n'est pas encore activé."}</div>
            <div style={{ marginTop: "8px", fontSize: "12px", color: "#666" }}>
              Contactez l'administrateur système pour activer votre compte.
            </div>
          </>
        );
      } else {
        setError(data.error || t("superAdminLogin.loginError"));
      }
    } catch {
      setError(t("superAdminLogin.networkError"));
    } finally {
      setLoading(false);
    }
  };

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

      <div className="login-container">
        {/* Bloc d'introduction */}
        <div className="login-intro">
          <Title level={2} style={{ color: "#229954", fontWeight: "bold" }}>
            MMIAPP
          </Title>
          <Title level={4} style={{ color: "#145a32" }}>
            {t("superAdminLogin.platformTitle")}
          </Title>
          <Text style={{ fontSize: 18, fontWeight: 500, color: "#333" }}>
            {t("superAdminLogin.platformTitleAr")}
          </Text>
          <br />
          <Text style={{ fontSize: 14, fontWeight: 400, color: "#666" }}>
            {t("superAdminLogin.platformSubtitle")}
          </Text>
          <Divider style={{ borderColor: "#229954", margin: "24px 0" }} />
          <Title level={3} style={{ color: "#229954" }}>
            {t("superAdminLogin.loginSpace")}
          </Title>
        </div>

        {/* Formulaire */}
        <div className="login-antd-form-container">
          {error && (
            <Alert
              message={error}
              type="error"
              showIcon
              style={{ marginBottom: 16 }}
            />
          )}

          <Form
            name="login_superadmin_form"
            initialValues={{ remember: true }}
            onFinish={onFinish}
            layout="vertical"
            size="large"
          >
            <Form.Item
              label={t("superAdminLogin.emailLabel")}
              name="email"
              rules={[
                { required: true, message: t("superAdminLogin.emailRequired") },
                { type: "email", message: t("superAdminLogin.emailInvalid") },
              ]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder={t("superAdminLogin.emailPlaceholder")}
              />
            </Form.Item>

            <Form.Item
              label={t("superAdminLogin.passwordLabel")}
              name="password"
              rules={[
                {
                  required: true,
                  message: t("superAdminLogin.passwordRequired"),
                },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder={t("superAdminLogin.passwordPlaceholder")}
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                block
                loading={loading}
                className="login-antd-button"
              >
                {t("superAdminLogin.loginButton")}
              </Button>
            </Form.Item>
          </Form>

          {/* ✅ Use Link instead of <a href> to respect basename */}
          <div className="login-antd-links">
            <Link to="/forgot-password" className="login-antd-link">
              {t("superAdminLogin.forgotPassword")}
            </Link>
          </div>

          <Link to="/" className="login-antd-back-home">
            ← {t("superAdminLogin.backHome")}
          </Link>
        </div>
      </div>

      <Footer />
    </>
  );
}
