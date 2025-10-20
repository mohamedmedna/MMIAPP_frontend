import React, { useState } from "react";
import { Form, Input, Button, Alert, Typography, Divider } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { useNavigate, Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useTranslation } from "react-i18next";
import banniereMinistere from "../assets/banniere-ministere.jpg";
import "../Styles/LoginAntd.css";

const { Title, Text } = Typography;

export default function LoginFormAntd({ setUser }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const baseUrl = window.__APP_CONFIG__?.API_BASE;

  const onFinish = async (values) => {
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${baseUrl}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: values.email,
          mot_de_passe: values.password,
        }),
      });

      const data = await response.json();

      if (response.ok && data.token && data.user) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        setUser(data.user);
        // With BrowserRouter basename="/mmiapp", this becomes /mmiapp/dashboard
        navigate("/dashboard");
      } else {
        setError(
          data.error || t("loginform.error_login", "Erreur de connexion")
        );
      }
    } catch (error) {
      setError(t("loginform.error_network", "Erreur réseau ou serveur"));
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
        {/* Intro */}
        <div className="login-intro">
          <Title level={2} style={{ color: "#229954", fontWeight: "bold" }}>
            MMIAPP
          </Title>
          <Title level={4} style={{ color: "#145a32" }}>
            {t("homepage.subtitle")}
          </Title>
          <Text style={{ fontSize: 18, fontWeight: 500, color: "#333" }}>
            {t("homepage.title_ar")}
          </Text>
          <br />
          <Text style={{ fontSize: 14, fontWeight: 400, color: "#666" }}>
            {t("homepage.sous_titre")}
          </Text>
          <Divider style={{ borderColor: "#229954", margin: "24px 0" }} />
          <Title level={3} style={{ color: "#229954" }}>
            {t("loginform.title", "Connexion")}
          </Title>
        </div>

        {/* Form */}
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
            name="login_form"
            initialValues={{ remember: true }}
            onFinish={onFinish}
            layout="vertical"
            size="large"
          >
            <Form.Item
              label={t("loginform.identifiant", "Identifiant")}
              name="email"
              rules={[
                {
                  required: true,
                  message: t(
                    "loginform.error_identifiant",
                    "Veuillez saisir votre identifiant !"
                  ),
                },
                {
                  validator: (_, value) => {
                    if (!value) {
                      return Promise.reject(
                        new Error(
                          t(
                            "loginform.error_identifiant",
                            "Veuillez saisir votre identifiant !"
                          )
                        )
                      );
                    }
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    const identifiantRegex = /^\d{8}$/;
                    return emailRegex.test(value) ||
                      identifiantRegex.test(value)
                      ? Promise.resolve()
                      : Promise.reject(
                          new Error(
                            t(
                              "loginform.error_identifiant_invalid",
                              "Veuillez saisir un email valide ou votre identifiant de 8 chiffres"
                            )
                          )
                        );
                  },
                },
              ]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder={t(
                  "loginform.identifiant_placeholder",
                  "Email ou Identifiant"
                )}
              />
            </Form.Item>

            <Form.Item
              label={t("loginform.password", "Mot de passe")}
              name="password"
              rules={[
                {
                  required: true,
                  message: t(
                    "loginform.error_password",
                    "Veuillez saisir votre mot de passe !"
                  ),
                },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder={t("loginform.password", "Mot de passe")}
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                className="login-antd-button"
                loading={loading}
                block
              >
                {t("loginform.submit", "Se connecter")}
              </Button>
            </Form.Item>
          </Form>

          {/* Use Link (SPA) instead of <a href> (full reload) */}
          <div className="login-antd-links">
            <Link to="/forgot-password" className="login-antd-link">
              {t("loginform.forgot_password", "Mot de passe oublié")}
            </Link>
            <span style={{ margin: "0 8px", color: "#666" }}>|</span>
            <Link to="/inscription" className="login-antd-link">
              {t("loginform.create_account", "Créer un compte")}
            </Link>
          </div>

          <Link to="/" className="login-antd-back-home">
            ← {t("loginform.back_home", "Retour à l'accueil")}
          </Link>
        </div>
      </div>

      <Footer />
    </>
  );
}
