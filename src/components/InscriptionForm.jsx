import React, { useState } from "react";
import Header from "./Header";
import Footer from "./Footer";
import banniereMinistere from "../assets/banniere-ministere.jpg";
import "../Styles/Inscription.css";
import { useTranslation } from "react-i18next";

function InscriptionForm() {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    nom_entreprise: "",
    nom_responsable: "",
    prenom_responsable: "",
    email: "",
    mot_de_passe: "",
    confirmation_mot_de_passe: "",
    forme_juridique: "",
    forme_juridique_autre: "",
    nif: "",
    telephone: "",
    adresse_siege: "",
    email_recuperation: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Vérifier que tous les champs requis sont remplis
    for (const key in form) {
      if (!form[key]) {
        setError(t("inscription.error_required"));
        return;
      }
    }

    // Vérifier que les mots de passe correspondent
    if (form.mot_de_passe !== form.confirmation_mot_de_passe) {
      setError(t("inscription.error_mots_de_passe_differents"));
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/inscription`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setSuccess(t("inscription.success"));
        setForm({
          nom_entreprise: "",
          nom_responsable: "",
          prenom_responsable: "",
          email: "",
          mot_de_passe: "",
          confirmation_mot_de_passe: "",
          forme_juridique: "",
          forme_juridique_autre: "",
          nif: "",
          telephone: "",
          adresse_siege: "",
          email_recuperation: "",
        });
      } else {
        setError(data.error || t("inscription.error_submit"));
      }
    } catch (err) {
      setError(t("inscription.error_network"));
    }
  };

  return (
    <>
      <Header />
      <div className="inscription-container">
        <div className="inscription-banner">
          <img src={banniereMinistere} alt="Bannière Ministère" />
        </div>
        <div className="inscription-content">
          <div className="inscription-form-container">
            <h1 className="inscription-title">
              {t("inscription.platformTitle")}
            </h1>
            <p className="inscription-subtitle">
              {t("inscription.platformSubtitle")}
            </p>

            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            <form className="inscription-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="nom_entreprise" className="form-label">
                  {t("inscription.nom_entreprise")}
                </label>
                <input
                  id="nom_entreprise"
                  name="nom_entreprise"
                  className="form-input"
                  value={form.nom_entreprise}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="nom_responsable" className="form-label">
                  {t("inscription.nom_responsable")}
                </label>
                <input
                  id="nom_responsable"
                  name="nom_responsable"
                  className="form-input"
                  value={form.nom_responsable}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="prenom_responsable" className="form-label">
                  {t("inscription.prenom_responsable")}
                </label>
                <input
                  id="prenom_responsable"
                  name="prenom_responsable"
                  className="form-input"
                  value={form.prenom_responsable}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  {t("inscription.email")}
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className="form-input"
                  value={form.email}
                  onChange={handleChange}
                  required
                  autoComplete="email"
                />
              </div>
              <div className="form-group">
                <label htmlFor="mot_de_passe" className="form-label">
                  {t("inscription.password")}
                </label>
                <input
                  id="mot_de_passe"
                  name="mot_de_passe"
                  type="password"
                  className="form-input"
                  value={form.mot_de_passe}
                  onChange={handleChange}
                  required
                  autoComplete="new-password"
                />
              </div>

              <div className="form-group">
                <label
                  htmlFor="confirmation_mot_de_passe"
                  className="form-label"
                >
                  {t("inscription.confirmation_mot_de_passe")}
                </label>
                <input
                  id="confirmation_mot_de_passe"
                  name="confirmation_mot_de_passe"
                  type="password"
                  className="form-input"
                  value={form.confirmation_mot_de_passe}
                  onChange={handleChange}
                  required
                  autoComplete="new-password"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email_recuperation" className="form-label">
                  {t("inscription.email_recuperation")}
                </label>
                <input
                  id="email_recuperation"
                  name="email_recuperation"
                  type="email"
                  className="form-input"
                  value={form.email_recuperation}
                  onChange={handleChange}
                  required
                  autoComplete="email"
                />
              </div>

              <div className="form-group">
                <label htmlFor="telephone" className="form-label">
                  {t("inscription.telephone")}
                </label>
                <input
                  id="telephone"
                  name="telephone"
                  className="form-input"
                  value={form.telephone}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="nif" className="form-label">
                  {t("inscription.nif")}
                </label>
                <input
                  id="nif"
                  name="nif"
                  className="form-input"
                  value={form.nif}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="forme_juridique" className="form-label">
                  {t("inscription.forme_juridique")}
                </label>
                <select
                  id="forme_juridique"
                  name="forme_juridique"
                  className="form-input"
                  value={form.forme_juridique}
                  onChange={handleChange}
                  required
                >
                  <option value="">
                    {t("inscription.select_forme_juridique")}
                  </option>
                  <option value="SA">SA</option>
                  <option value="SARL">SARL</option>
                  <option value="SUARL">SUARL</option>
                  <option value="AUTRES">AUTRES</option>
                </select>
              </div>

              {form.forme_juridique === "AUTRES" && (
                <div className="form-group">
                  <label htmlFor="forme_juridique_autre" className="form-label">
                    {t("inscription.forme_juridique_autre")}
                  </label>
                  <input
                    id="forme_juridique_autre"
                    name="forme_juridique_autre"
                    className="form-input"
                    value={form.forme_juridique_autre}
                    onChange={handleChange}
                    required
                    placeholder={t(
                      "inscription.forme_juridique_autre_placeholder"
                    )}
                  />
                </div>
              )}
              <div className="form-group">
                <label htmlFor="adresse_siege" className="form-label">
                  {t("inscription.adresse_siege")}
                </label>
                <input
                  id="adresse_siege"
                  name="adresse_siege"
                  className="form-input"
                  value={form.adresse_siege}
                  onChange={handleChange}
                  required
                />
              </div>
              <button
                type="submit"
                className="submit-button"
                disabled={
                  !form.nom_entreprise ||
                  !form.nom_responsable ||
                  !form.prenom_responsable ||
                  !form.email ||
                  !form.mot_de_passe ||
                  !form.confirmation_mot_de_passe ||
                  !form.email_recuperation ||
                  !form.nif ||
                  !form.forme_juridique ||
                  !form.telephone ||
                  !form.adresse_siege
                }
              >
                {t("inscription.create_account")}
              </button>
            </form>
            <div className="inscription-links">
              <a href="/login" className="inscription-link">
                {t("inscription.already_account")}
              </a>
              <span> | </span>
              <a href="/" className="inscription-link home">
                {t("inscription.back_home")}
              </a>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default InscriptionForm;
