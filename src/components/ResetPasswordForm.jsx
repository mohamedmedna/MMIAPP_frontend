import React, { useState, useEffect } from "react";
import {
  useSearchParams,
  Link,
  useParams,
  useNavigate,
} from "react-router-dom";
import { useTranslation } from "react-i18next";
import Header from "./Header";
import Footer from "./Footer";
import banniereMinistere from "../assets/banniere-ministere.jpg";
import "../Styles/ForgotPassword.css";
import "../App.css";

function ResetPasswordForm() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [mot_de_passe, setMotDePasse] = useState("");
  const [mot_de_passe2, setMotDePasse2] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const API_BASE = window.__APP_CONFIG__?.API_BASE;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!mot_de_passe || !mot_de_passe2) {
      setError(t("resetPassword.error_required"));
      return;
    }
    if (mot_de_passe !== mot_de_passe2) {
      setError(t("resetPassword.error_passwords_not_match"));
      return;
    }
    try {
      const response = await fetch(`${API_BASE}/api/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, mot_de_passe }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setSuccess(t("resetPassword.success"));
      } else {
        setError(data.error || t("resetPassword.error_submit"));
      }
    } catch {
      setError(t("resetPassword.error_network"));
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
      <div className="reset-password-container">
        <div className="ministere-titres">
          <div className="project-title">
            <h1 className="titre-fr">MMIAPP</h1>
            <div className="project-subtitle">{t("homepage.subtitle")}</div>
          </div>
          <div className="titre-ar">{t("homepage.title_ar")}</div>
          <div className="sous-titre-fr">{t("homepage.sous_titre")}</div>
        </div>
        <div className="auth-container">
          <div className="auth-box">
            <form className="auth-form" onSubmit={handleSubmit}>
              <h2 className="auth-title">{t("resetPassword.title")}</h2>
              {!token && (
                <div className="form-error">
                  <i className="fa fa-exclamation-circle"></i>
                  {t("resetPassword.invalid_link")}
                </div>
              )}
              {token && (
                <>
                  <div className="form-group">
                    <label htmlFor="mot_de_passe" className="auth-label">
                      {t("resetPassword.newPassword")}
                    </label>
                    <input
                      id="mot_de_passe"
                      name="mot_de_passe"
                      type="password"
                      className="auth-input"
                      placeholder={t("resetPassword.newPassword")}
                      value={mot_de_passe}
                      onChange={(e) => setMotDePasse(e.target.value)}
                      required
                      autoComplete="new-password"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="mot_de_passe2" className="auth-label">
                      {t("resetPassword.confirmPassword")}
                    </label>
                    <input
                      id="mot_de_passe2"
                      name="mot_de_passe2"
                      type="password"
                      className="auth-input"
                      placeholder={t("resetPassword.confirmPassword")}
                      value={mot_de_passe2}
                      onChange={(e) => setMotDePasse2(e.target.value)}
                      required
                      autoComplete="new-password"
                    />
                  </div>
                  <button type="submit" className="auth-button">
                    {t("resetPassword.submit")}
                  </button>
                </>
              )}
              {error && (
                <div className="form-error">
                  <i className="fa fa-exclamation-circle"></i>
                  {error}
                </div>
              )}
              {success && (
                <div className="form-success">
                  <i className="fa fa-check-circle"></i>
                  {success}
                </div>
              )}
              <div className="auth-links">
                <Link to="/login" className="register-link">
                  {t("resetPassword.backToLogin")}
                </Link>
              </div>
            </form>
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
}

export default ResetPasswordForm;
