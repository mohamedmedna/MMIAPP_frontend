import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Styles/FormUsine.css';
import { useTranslation } from 'react-i18next';

function FormUsine({ user, setNotif, setError }) {
  const { t } = useTranslation();
 const navigate = useNavigate();
  const [formKey, setFormKey] = useState(Date.now());
  const [form, setForm] = useState({
    telephone_proprietaire: '',
    selected_juridique_doc: ''
  });
  const [files, setFiles] = useState({
    // Dossier juridique de la société
    statut_juridique_file: null,
    registre_commerce_file: null,
    nif_file: null,
    cnss_file: null,
    
    // Documents spécifiques à l'usine
    etude_faisabilite_file: null,
    tdr_impact_file: null,
    gps_file: null,
    fiches_techniques_file: null,
    demande_ministere_file: null,
    titre_foncier_file: null,
    cahier_charges_file: null
  });
  const [loading, setLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });
  const handleFileChange = e => setFiles({ ...files, [e.target.name]: e.target.files[0] });

  // Options pour la liste déroulante du dossier juridique
  const juridiqueOptions = [
    { value: '', label: t('usine.dossier_juridique') },
    { value: 'statut_juridique_file', label: `📄 ${t('usine.statut_juridique')}` },
    { value: 'registre_commerce_file', label: `🏢 ${t('usine.registre_commerce')}` },
    { value: 'nif_file', label: `🆔 ${t('usine.nif')}` },
    { value: 'cnss_file', label: `📋 ${t('usine.cnss')}` }
  ];

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setNotif('');
    setLoading(true);

    // Vérifier les champs texte
    if (!form.telephone_proprietaire) {
      setError(t('usine.error_required_text'));
      setLoading(false);
      return;
    }

    // Vérifier que tous les documents juridiques sont uploadés
    const juridiqueFiles = [
      'statut_juridique_file',
      'registre_commerce_file',
      'nif_file',
      'cnss_file'
    ];
    
    for (const fileKey of juridiqueFiles) {
      if (!files[fileKey]) {
        setError(t('usine.error_required_file'));
        setLoading(false);
        return;
      }
    }

    // Vérifier les autres fichiers
    const otherFiles = [
      'etude_faisabilite_file',
      'tdr_impact_file',
      'gps_file',
      'fiches_techniques_file',
      'demande_ministere_file',
      'titre_foncier_file',
      'cahier_charges_file'
    ];

    for (const fileKey of otherFiles) {
      if (!files[fileKey]) {
        setError(t('usine.error_required_file'));
        setLoading(false);
        return;
      }
    }

    const formData = new FormData();
    Object.entries(form).forEach(([k, v]) => formData.append(k, v));
    Object.entries(files).forEach(([k, v]) => formData.append(k, v));
    formData.append('typeDemande', 'usine');
    formData.append('utilisateur_id', user.id);

    try {
      const response = await fetch('http://localhost:4000/api/nouvelle-demande', {
        method: 'POST',
        body: formData
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setNotif(t('usine.success'));
        setForm({
          telephone_proprietaire: ''
        });
        setFiles({
          statut_juridique_file: null, registre_commerce_file: null, nif_file: null, cnss_file: null,
          etude_faisabilite_file: null, tdr_impact_file: null, gps_file: null, fiches_techniques_file: null,
          demande_ministere_file: null, titre_foncier_file: null, cahier_charges_file: null
        });
        setFormKey(Date.now());
        setShowPopup(true);
      } else {
        setError(data.error || t('usine.error_submit'));
      }
    } catch (err) {
      setError(t('usine.error_network'));
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
        <i className="fa fa-arrow-left"></i> {t('usine.back_to_dashboard')}
      </button>
      <form
        key={formKey}
        className="nouvelle-demande-form form-usine"
        onSubmit={handleSubmit}
        encType="multipart/form-data"
      >
        <h3>{t('usine.title')}</h3>
        
        {/* Section Dossier juridique avec liste déroulante */}
        <div className="form-section-juridique">
          <h4 className="section-title">📋 {t('usine.dossier_juridique')}</h4>
          
          <div className="form-group">
            <label>📋 {t('usine.dossier_juridique')} :</label>
            <select 
              name="selected_juridique_doc" 
              value={form.selected_juridique_doc} 
              onChange={handleChange}
              className="juridique-select"
              required
            >
              {juridiqueOptions.map((option, index) => (
                <option key={index} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {form.selected_juridique_doc && (
            <div className="form-group">
              <label>📄 {t('usine.upload_document')} :</label>
              <input 
                type="file" 
                name={form.selected_juridique_doc} 
                accept=".pdf,.jpg,.png" 
                onChange={handleFileChange} 
                required 
              />
              <small className="file-help">Format accepté: PDF, JPG, PNG</small>
              
              {/* Afficher les documents déjà uploadés */}
              <div className="uploaded-files">
                <h5>{t('usine.documents_uploaded')} :</h5>
                <ul className="files-list">
                  {juridiqueOptions.slice(1).map((option, index) => (
                    <li key={index} className={files[option.value] ? 'uploaded' : 'not-uploaded'}>
                      {option.label} - {files[option.value] ? '✅ Uploadé' : '❌ Manquant'}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Section Documents spécifiques à l'usine */}
        <div className="form-section-usine">
          <h4 className="section-title">🏭 {t('usine.documents_specifiques')}</h4>
          
          <div className="form-group">
            <label>📝 {t('usine.demande_ministere')}</label>
            <input type="file" name="demande_ministere_file" accept=".pdf" onChange={handleFileChange} required />
            <small className="file-help">Format accepté: PDF uniquement</small>
          </div>

          <div className="form-group">
            <label>📊 {t('usine.etude_faisabilite')}</label>
            <input type="file" name="etude_faisabilite_file" accept=".pdf" onChange={handleFileChange} required />
            <small className="file-help">Format accepté: PDF uniquement</small>
          </div>

          <div className="form-group">
            <label>📋 {t('usine.tdr_impact')}</label>
            <input type="file" name="tdr_impact_file" accept=".pdf" onChange={handleFileChange} required />
            <small className="file-help">Format accepté: PDF uniquement</small>
          </div>

          <div className="form-group">
            <label>📍 {t('usine.gps')}</label>
            <input type="file" name="gps_file" accept=".pdf,.jpg,.png" onChange={handleFileChange} required />
            <small className="file-help">Format accepté: PDF, JPG, PNG</small>
          </div>

          <div className="form-group">
            <label>🔧 {t('usine.fiches_techniques')}</label>
            <input type="file" name="fiches_techniques_file" accept=".pdf" onChange={handleFileChange} required />
            <small className="file-help">Format accepté: PDF uniquement</small>
          </div>

          <div className="form-group">
            <label>🏠 {t('usine.titre_foncier')}</label>
            <input type="file" name="titre_foncier_file" accept=".pdf,.jpg,.png" onChange={handleFileChange} required />
            <small className="file-help">Format accepté: PDF, JPG, PNG</small>
          </div>

          <div className="form-group">
            <label>📋 {t('usine.cahier_charges')}</label>
            <input type="file" name="cahier_charges_file" accept=".pdf" onChange={handleFileChange} required />
            <small className="file-help">Format accepté: PDF uniquement</small>
          </div>

          <div className="form-group">
            <label>📞 {t('usine.telephone_proprietaire')}</label>
            <input 
              type="text" 
              name="telephone_proprietaire" 
              value={form.telephone_proprietaire} 
              onChange={handleChange} 
              placeholder={t('usine.telephone_placeholder')}
              required 
            />
          </div>


        </div>

        <button type="submit" className="btn-form-usine" disabled={loading}>
          {loading ? t('usine.sending') : t('usine.send')}
        </button>
      </form>
      {showPopup && (
        <div className="popup-success" onClick={() => setShowPopup(false)}>
          <div>
            <strong>{t('usine.thank_you')}</strong><br />
            {t('usine.success_message_1')}<br />
            {t('usine.success_message_2')}
          </div>
        </div>
      )}
    </div>
  );
}

export default FormUsine;
