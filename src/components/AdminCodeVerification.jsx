import React, { useState } from "react";
import { Form, Input, Button, Alert, Typography, Divider, message } from "antd";
import {
  LockOutlined,
  EyeInvisibleOutlined,
  EyeTwoTone,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "../Styles/AdminCodeVerification.css";

const { Title, Text } = Typography;
const API_BASE = window.__APP_CONFIG__?.API_BASE;

export default function AdminCodeVerification() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showCode, setShowCode] = useState(false);

  // Récupérer la destination depuis l'état de navigation
  const destination = location.state?.destination || "/admin-space";

  const handleSubmit = async (values) => {
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/api/verify-admin-code`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          accessCode: values.accessCode,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        message.success(
          t("adminCodeVerification.success", "Code d'accès vérifié avec succès")
        );
        // Stocker le code vérifié dans le localStorage pour cette session
        localStorage.setItem("adminCodeVerified", "true");
        localStorage.setItem("adminCode", values.accessCode);
        navigate(destination);
      } else {
        setError(
          data.error ||
            t("adminCodeVerification.error_invalid", "Code d'accès incorrect")
        );
      }
    } catch (error) {
      setError(
        t("adminCodeVerification.error_network", "Erreur réseau ou serveur")
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCodeChange = (e) => {
    const value = e.target.value;
    // Limiter à 8 caractères
    if (value.length <= 8) {
      form.setFieldsValue({ accessCode: value });
    }
  };

  return (
    <div className="admin-code-verification-page">
      <div className="admin-code-verification-container">
        {/* Bloc d'introduction */}
        <div className="admin-code-verification-intro">
          <Title level={2} className="app-title">
            MMIAPP
          </Title>
          <Title level={4} className="app-subtitle">
            {t(
              "adminCodeVerification.subtitle",
              "Système Intégré de Suivi et Traitement"
            )}
          </Title>
          <Text className="app-description">
            {t(
              "adminCodeVerification.description",
              "Accès sécurisé aux services en ligne"
            )}
          </Text>
          <Divider className="intro-divider" />
          <Title level={3} className="access-title">
            {t("adminCodeVerification.title", "Code d'Accès Administration")}
          </Title>
        </div>

        {/* Formulaire */}
        <div className="admin-code-verification-form">
          {error && (
            <Alert
              message={error}
              type="error"
              showIcon
              className="error-alert"
            />
          )}

          <Form
            form={form}
            name="adminCodeVerification"
            onFinish={handleSubmit}
            layout="vertical"
            size="large"
          >
            <Form.Item
              name="accessCode"
              rules={[
                {
                  required: true,
                  message: t(
                    "adminCodeVerification.error_required",
                    "Veuillez saisir le code d'accès !"
                  ),
                },
                {
                  min: 8,
                  message: t(
                    "adminCodeVerification.error_length",
                    "Le code doit contenir 8 caractères !"
                  ),
                },
                {
                  max: 8,
                  message: t(
                    "adminCodeVerification.error_length",
                    "Le code doit contenir 8 caractères !"
                  ),
                },
              ]}
            >
              <Input.Password
                placeholder={t(
                  "adminCodeVerification.placeholder",
                  "Code d'accès (8 caractères)"
                )}
                prefix={<LockOutlined />}
                onChange={handleCodeChange}
                maxLength={8}
                className="access-code-input"
                iconRender={(visible) =>
                  visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                }
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                className="access-button"
                block
              >
                {loading
                  ? t("adminCodeVerification.loading", "Vérification...")
                  : t(
                      "adminCodeVerification.submit",
                      "ACCÉDER À L'ADMINISTRATION"
                    )}
              </Button>
            </Form.Item>
          </Form>

          <div className="access-instruction">
            <Text>
              {t(
                "adminCodeVerification.instruction",
                "Le code d'accès est requis pour accéder à l'espace administration."
              )}
            </Text>
          </div>
        </div>

        {/* Lien de retour */}
        <div className="back-home">
          <Button
            type="link"
            onClick={() => navigate("/")}
            className="back-link"
          >
            ← {t("adminCodeVerification.back_home", "Retour à l'accueil")}
          </Button>
        </div>
      </div>
    </div>
  );
}
