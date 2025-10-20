import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Form,
  Input,
  Button,
  Alert,
  Typography,
  Card,
  Space,
  Divider,
} from "antd";
import {
  LockOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import "../Styles/AdminCodeManagement.css";

const { Title, Text } = Typography;

export default function AdminCodeManagement({ user, logout }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [currentCode, setCurrentCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [form] = Form.useForm();

  const API_BASE = window.__APP_CONFIG__?.API_BASE;

  useEffect(() => {
    loadCurrentCode();
  }, []);

  const loadCurrentCode = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE}/api/admin/get-access-code`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentCode(data.code || "Non défini");
      }
    } catch (error) {
      console.error("Erreur lors du chargement du code:", error);
    }
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE}/api/admin/update-access-code`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          newCode: values.newCode,
          confirmCode: values.confirmCode,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("Code d'accès mis à jour avec succès !");
        setCurrentCode(values.newCode);
        form.resetFields();
        // Masquer le code après mise à jour
        setShowPassword(false);
      } else {
        setError(data.error || "Erreur lors de la mise à jour du code.");
      }
    } catch (error) {
      console.error("Erreur:", error);
      setError("Erreur réseau ou serveur.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    logout();
    navigate("/");
  };

  const validateCode = (_, value) => {
    if (!value) {
      return Promise.reject(new Error("Le code est requis !"));
    }
    if (value.length !== 8) {
      return Promise.reject(
        new Error("Le code doit contenir exactement 8 caractères !")
      );
    }
    // Vérifier qu'il contient au moins une lettre, un chiffre et un caractère spécial
    const hasLetter = /[a-zA-Z]/.test(value);
    const hasNumber = /[0-9]/.test(value);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(value);

    if (!hasLetter || !hasNumber || !hasSpecial) {
      return Promise.reject(
        new Error(
          "Le code doit contenir au moins une lettre, un chiffre et un caractère spécial !"
        )
      );
    }
    return Promise.resolve();
  };

  const validateConfirmCode = (_, value) => {
    const newCode = form.getFieldValue("newCode");
    if (value && value !== newCode) {
      return Promise.reject(new Error("Les codes ne correspondent pas !"));
    }
    return Promise.resolve();
  };

  if (!user || user.role_id !== 1) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <h2>Accès refusé</h2>
        <p>Seul le SuperAdmin peut accéder à cette page.</p>
      </div>
    );
  }

  return (
    <div className="admin-code-management">
      <div className="header">
        <div className="header-left">
          <button
            onClick={() => navigate("/superadmin-dashboard")}
            className="back-btn"
            style={{
              background: "linear-gradient(135deg, #6c757d, #495057)",
              color: "white",
              border: "none",
              padding: "10px 20px",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "600",
              marginRight: "15px",
              transition: "all 0.3s ease",
            }}
          >
            ← Retour
          </button>
          <h1>Gestion du Code d'Accès Administration</h1>
        </div>
        <button onClick={handleLogout} className="logout-btn">
          Déconnexion
        </button>
      </div>

      <div className="content">
        <Card className="code-card">
          <Title level={3}>Code d'Accès Actuel</Title>
          <div className="current-code-section">
            <Text strong>Code actuel : </Text>
            <div className="code-display">
              {showPassword ? (
                <span className="code-text">{currentCode}</span>
              ) : (
                <span className="code-text">••••••••</span>
              )}
              <button
                onClick={() => setShowPassword(!showPassword)}
                className="toggle-btn"
              >
                {showPassword ? <EyeInvisibleOutlined /> : <EyeOutlined />}
              </button>
            </div>
          </div>
        </Card>

        <Card className="update-card">
          <Title level={3}>Modifier le Code d'Accès</Title>

          {error && (
            <Alert
              message={error}
              type="error"
              showIcon
              style={{ marginBottom: "20px" }}
            />
          )}

          {success && (
            <Alert
              message={success}
              type="success"
              showIcon
              style={{ marginBottom: "20px" }}
            />
          )}

          <Form
            form={form}
            name="updateCode"
            onFinish={handleSubmit}
            layout="vertical"
            size="large"
          >
            <Form.Item
              name="newCode"
              label="Nouveau Code d'Accès"
              rules={[{ validator: validateCode }]}
            >
              <Input.Password
                placeholder="Nouveau code (8 caractères)"
                prefix={<LockOutlined />}
                maxLength={8}
                style={{ fontFamily: "monospace", letterSpacing: "1px" }}
              />
            </Form.Item>

            <Form.Item
              name="confirmCode"
              label="Confirmer le Code"
              rules={[{ validator: validateConfirmCode }]}
            >
              <Input.Password
                placeholder="Confirmer le nouveau code"
                prefix={<LockOutlined />}
                maxLength={8}
                style={{ fontFamily: "monospace", letterSpacing: "1px" }}
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                icon={<SaveOutlined />}
                size="large"
                style={{
                  width: "100%",
                  height: "50px",
                  background: "linear-gradient(135deg, #229954, #145a32)",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "1.1rem",
                  fontWeight: "600",
                }}
              >
                {loading ? "Mise à jour..." : "Mettre à jour le Code"}
              </Button>
            </Form.Item>
          </Form>

          <Divider />

          <div className="requirements">
            <Title level={4}>Exigences du Code d'Accès :</Title>
            <ul>
              <li>✅ Exactement 8 caractères</li>
              <li>✅ Au moins une lettre (a-z, A-Z)</li>
              <li>✅ Au moins un chiffre (0-9)</li>
              <li>
                ✅ Au moins un caractère spécial (!@#$%^&*(),.?":{}|&lt;&gt;)
              </li>
            </ul>
            <div
              style={{
                marginTop: "20px",
                padding: "15px",
                backgroundColor: "#fff3cd",
                border: "1px solid #ffeaa7",
                borderRadius: "8px",
              }}
            >
              <Text strong style={{ color: "#856404" }}>
                🔒 Note de Sécurité :
              </Text>
              <br />
              <Text style={{ color: "#856404", fontSize: "0.9rem" }}>
                Le code d'accès est confidentiel. Ne le partagez qu'avec les
                personnes autorisées. Changez le code par défaut dès la première
                utilisation.
              </Text>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
