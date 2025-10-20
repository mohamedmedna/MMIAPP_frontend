import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import banniereMinistere from "../assets/banniere-ministere.jpg";
import "../Styles/Login.css";
import "../Styles/ForgotPassword.css";
import "../Styles/Inscription.css";
import { useTranslation } from "react-i18next";

function LoginForm({ setUser }) {
  const { t } = useTranslation();
  const [form, setForm] = useState({ email: "", mot_de_passe: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const API_BASE = window.__APP_CONFIG__?.API_BASE;

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();

      if (response.ok && data.token && data.user) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        setUser(data.user);
        navigate("/dashboard");
      } else {
        setError(data.error || t("loginform.error_login"));
      }
    } catch (err) {
      setError(t("loginform.error_network"));
    }
    setLoading(false);
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
        <div className="login-form-wrapper">
          <h2 className="login-title">{t("loginform.title")}</h2>
          <form onSubmit={handleSubmit} className="login-form">
            <div className="login-field">
              <label className="login-label">{t("loginform.email")}</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                className="login-input"
                autoComplete="username"
              />
            </div>
            <div className="login-field">
              <label className="login-label">{t("loginform.password")}</label>
              <input
                type="password"
                name="mot_de_passe"
                value={form.mot_de_passe}
                onChange={handleChange}
                required
                className="login-input"
                autoComplete="current-password"
              />
            </div>
            <button type="submit" className="login-button" disabled={loading}>
              {loading ? "Chargement..." : t("loginform.submit")}
            </button>
          </form>
          {error && <div className="login-error">{error}</div>}

          <p className="login-link">
            <Link to="/forgot-password" className="login-link">
              {t("loginform.forgot_password")}
            </Link>
            <span> | </span>
            <Link to="/inscription" className="login-link">
              {t("loginform.create_account")}
            </Link>
          </p>

          <Link to="/mmiapp" className="login-back-home">
            ← {t("loginform.back_home")}
          </Link>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default LoginForm;
