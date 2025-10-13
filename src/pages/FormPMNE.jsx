import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import '../Styles/FormPMNE.css';

function FormPMNE({ user, setNotif, setError }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [formKey, setFormKey] = useState(Date.now());
  const [form, setForm] = useState({
    telephone_proprietaire: ''
  });
  const [files, setFiles] = useState({
    raison_sociale_file: null,
    rc_file: null,
    nif_file: null,
    statuts_file: null,
    adresse_file: null
  });
  const [loading, setLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });
  const handleFileChange = e => setFiles({ ...files, [e.target.name]: e.target.files[0] });

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setNotif('');
    setLoading(true);

    for (const key in form) {
      if (!form[key]) {
        setError(t('pnme.error_required_text'));
        setLoading(false);
        return;
      }
    }

    for (const key in files) {
      if (!files[key]) {
        setError(t('pnme.error_required_file'));
        setLoading(false);
        return;
      }
    }

    const formData = new FormData();
    Object.entries(form).forEach(([k, v]) => formData.append(k, v));
    Object.entries(files).forEach(([k, v]) => formData.append(k, v));
    formData.append('typeDemande', 'pnme');
    formData.append('utilisateur_id', user.id);

    try {
      const response = await fetch('http://localhost:4000/api/nouvelle-demande', {
        method: 'POST',
        body: formData
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setNotif(t('pnme.success'));
        setForm({
          telephone_proprietaire: ''
        });
        setFiles({ raison_sociale_file: null, rc_file: null, nif_file: null, statuts_file: null, adresse_file: null });
        setFormKey(Date.now());
        setShowPopup(true);
      } else {
        setError(data.error || t('pnme.error_submit'));
      }
    } catch {
      setError(t('pnme.error_network'));
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
      <button
        type="button"
        className="btn-retour-dashboard"
        onClick={() => navigate('/dashboard')}
      >
        <span className="btn-retour-icon">
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <path d="M14 18L8 12L14 6" stroke="#1e6a8e" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
        {t('pnme.back_to_dashboard')}
      </button>
      <form
        key={formKey}
        className="nouvelle-demande-form form-pnme"
        onSubmit={handleSubmit}
        encType="multipart/form-data">
        <h3>{t('pnme.title')}</h3>
        <label>{t('pnme.raison_sociale')}</label>
        <input type="file" name="raison_sociale_file" accept=".pdf,.jpg,.png" onChange={handleFileChange} required />

        <label>{t('pnme.rc')}</label>
        <input type="file" name="rc_file" accept=".pdf" onChange={handleFileChange} required />

        <label>{t('pnme.nif')}</label>
        <input type="file" name="nif_file" accept=".pdf" onChange={handleFileChange} required />

        <label>{t('pnme.statuts')}</label>
        <input type="file" name="statuts_file" accept=".pdf" onChange={handleFileChange} required />

        <label>{t('pnme.adresse')}</label>
        <input type="file" name="adresse_file" accept=".pdf,.jpg,.png" onChange={handleFileChange} required />

        <label>{t('pnme.telephone_proprietaire')}</label>
        <input name="telephone_proprietaire" value={form.telephone_proprietaire} onChange={handleChange} required />

        <button type="submit" className="btn-form-pnme" disabled={loading}>
          {loading ? t('pnme.sending') : t('pnme.send')}
        </button>
      </form>
      {showPopup && (
        <div className="popup-success" onClick={() => setShowPopup(false)}>
          <div>
            <strong>{t('pnme.thank_you')}</strong><br />
            {t('pnme.success_message_1')}<br />
            {t('pnme.success_message_2')}
          </div>
        </div>
      )}
    </div>
  );
}

export default FormPMNE;
