import React, { useState } from "react";
import { useTranslation } from "react-i18next";

function FormEauMinerale({ user, setNotif, setError }) {
  const { t } = useTranslation();
  const [formKey, setFormKey] = useState(Date.now());
  const [form, setForm] = useState({
    statut_juridique: "",
    capacite_financiere: "",
    etude_faisabilite: "",
    analyse_eau: "",
    autorisation_eau: "",
    cahier_charges: "",
    demande_ministere: "",
    identite_proprietaire: "",
  });
  const [files, setFiles] = useState({
    statut_juridique_file: null,
    capacite_financiere_file: null,
    etude_faisabilite_file: null,
    analyse_eau_file: null,
    autorisation_eau_file: null,
    cahier_charges_file: null,
    demande_ministere_file: null,
    identite_proprietaire_file: null,
  });
  const [loading, setLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });
  const handleFileChange = (e) =>
    setFiles({ ...files, [e.target.name]: e.target.files[0] });

  const API_BASE = window.__APP_CONFIG__?.API_BASE;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setNotif("");
    setLoading(true);

    for (const key in form) {
      if (!form[key]) {
        setError(t("eau.error_required_text"));
        setLoading(false);
        return;
      }
    }
    for (const key in files) {
      if (!files[key]) {
        setError(t("eau.error_required_file"));
        setLoading(false);
        return;
      }
    }

    const formData = new FormData();
    Object.entries(form).forEach(([k, v]) => formData.append(k, v));
    Object.entries(files).forEach(([k, v]) => formData.append(k, v));
    formData.append("typeDemande", "eaux");
    formData.append("utilisateur_id", user.id);

    try {
      const response = await fetch(`${API_BASE}/api/nouvelle-demande`, {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setNotif(t("eau.success"));
        setForm({
          statut_juridique: "",
          capacite_financiere: "",
          etude_faisabilite: "",
          analyse_eau: "",
          autorisation_eau: "",
          cahier_charges: "",
          demande_ministere: "",
          identite_proprietaire: "",
        });
        setFiles({
          statut_juridique_file: null,
          capacite_financiere_file: null,
          etude_faisabilite_file: null,
          analyse_eau_file: null,
          autorisation_eau_file: null,
          cahier_charges_file: null,
          demande_ministere_file: null,
          identite_proprietaire_file: null,
        });
        setFormKey(Date.now());
        setShowPopup(true);
      } else {
        setError(data.error || t("eau.error_submit"));
      }
    } catch {
      setError(t("eau.error_network"));
    }
    setLoading(false);
  };

  React.useEffect(() => {
    if (showPopup) {
      const timer = setTimeout(() => setShowPopup(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [showPopup]);

  return (
    <div style={{ position: "relative" }}>
      <form
        key={formKey}
        className="nouvelle-demande-form form-eaux"
        onSubmit={handleSubmit}
        encType="multipart/form-data"
      >
        <h3>{t("eau.title")}</h3>
        <label>{t("eau.statut_juridique")}</label>
        <input
          name="statut_juridique"
          value={form.statut_juridique}
          onChange={handleChange}
          required
        />
        <input
          type="file"
          name="statut_juridique_file"
          accept=".pdf,.jpg,.png"
          onChange={handleFileChange}
          required
        />

        <label>{t("eau.capacite_financiere")}</label>
        <input
          name="capacite_financiere"
          value={form.capacite_financiere}
          onChange={handleChange}
          required
        />
        <input
          type="file"
          name="capacite_financiere_file"
          accept=".pdf"
          onChange={handleFileChange}
          required
        />

        <label>{t("eau.etude_faisabilite")}</label>
        <textarea
          name="etude_faisabilite"
          value={form.etude_faisabilite}
          onChange={handleChange}
          required
        />
        <input
          type="file"
          name="etude_faisabilite_file"
          accept=".pdf"
          onChange={handleFileChange}
          required
        />

        <label>{t("eau.analyse_eau")}</label>
        <textarea
          name="analyse_eau"
          value={form.analyse_eau}
          onChange={handleChange}
          required
        />
        <input
          type="file"
          name="analyse_eau_file"
          accept=".pdf"
          onChange={handleFileChange}
          required
        />

        <label>{t("eau.autorisation_eau")}</label>
        <input
          name="autorisation_eau"
          value={form.autorisation_eau}
          onChange={handleChange}
          required
        />
        <input
          type="file"
          name="autorisation_eau_file"
          accept=".pdf"
          onChange={handleFileChange}
          required
        />

        <label>{t("eau.cahier_charges")}</label>
        <input
          name="cahier_charges"
          value={form.cahier_charges}
          onChange={handleChange}
          required
        />
        <input
          type="file"
          name="cahier_charges_file"
          accept=".pdf"
          onChange={handleFileChange}
          required
        />

        <label>{t("eau.demande_ministere")}</label>
        <textarea
          name="demande_ministere"
          value={form.demande_ministere}
          onChange={handleChange}
          required
        />
        <input
          type="file"
          name="demande_ministere_file"
          accept=".pdf"
          onChange={handleFileChange}
          required
        />

        <label>{t("eau.identite_proprietaire")}</label>
        <input
          name="identite_proprietaire"
          value={form.identite_proprietaire}
          onChange={handleChange}
          required
        />
        <input
          type="file"
          name="identite_proprietaire_file"
          accept=".pdf,.jpg,.png"
          onChange={handleFileChange}
          required
        />

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? t("eau.sending") : t("eau.send")}
        </button>
      </form>
      {showPopup && (
        <div className="popup-success" onClick={() => setShowPopup(false)}>
          <div>
            <strong>{t("eau.thank_you")}</strong>
            <br />
            {t("eau.success_message_1")}
            <br />
            {t("eau.success_message_2")}
          </div>
        </div>
      )}
    </div>
  );
}

export default FormEauMinerale;
