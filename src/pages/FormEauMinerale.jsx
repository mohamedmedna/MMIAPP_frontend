import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import SuccessPopup from '../components/SuccessPopup';
import '../Styles/FormEauMinerale.css';

function FormEauMinerale({ user, setNotif, setError }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [formKey, setFormKey] = useState(Date.now());
  const [form, setForm] = useState({
    telephone_proprietaire: '',
    activite_principale: '',
    selected_juridique_doc: ''
  });
  const [files, setFiles] = useState({
    // Dossier juridique de la société ou ETS
    statut_certifie_notaire_file: null,
    registre_commerce_local_file: null,
    numero_identification_fiscale_file: null,
    certificat_enregistrement_cnss_file: null,
    
    // Documents spécifiques aux eaux minérales
    autorisation_ministere_eau_file: null,
    analyses_eau_laboratoire_file: null,
    etude_faisabilite_projet_file: null,
    declaration_conformite_emballage_file: null,
    cahier_charges_signe_file: null,
    demande_autorisation_ministre_file: null,
    copie_identite_proprietaire_file: null
  });
  const [loading, setLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });
  const handleFileChange = e => setFiles({ ...files, [e.target.name]: e.target.files[0] });

  // Options pour la liste déroulante du dossier juridique
  const juridiqueOptions = [
    { value: '', label: t('eau.selectJuridiqueDoc') },
    { value: 'statut_certifie_notaire_file', label: `📄 ${t('eau.statut_certifie_notaire')}` },
    { value: 'registre_commerce_local_file', label: `🏢 ${t('eau.registre_commerce_local')}` },
    { value: 'numero_identification_fiscale_file', label: `🆔 ${t('eau.numero_identification_fiscale')}` },
    { value: 'certificat_enregistrement_cnss_file', label: `📋 ${t('eau.certificat_enregistrement_cnss')}` }
  ];

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setNotif('');
    setLoading(true);

    // Vérifier les champs texte
    if (!form.telephone_proprietaire || !form.activite_principale) {
      setError(t('eau.error_required_text'));
      setLoading(false);
      return;
    }

    // Vérifier que tous les documents juridiques sont uploadés
    const juridiqueFiles = [
      'statut_certifie_notaire_file',
      'registre_commerce_local_file', 
      'numero_identification_fiscale_file',
      'certificat_enregistrement_cnss_file'
    ];
    
    for (const fileKey of juridiqueFiles) {
      if (!files[fileKey]) {
        setError(t('eau.error_required_file'));
        setLoading(false);
        return;
      }
    }

    // Vérifier les autres fichiers
    const otherFiles = [
      'autorisation_ministere_eau_file',
      'analyses_eau_laboratoire_file',
      'etude_faisabilite_projet_file',
      'declaration_conformite_emballage_file',
      'cahier_charges_signe_file',
      'demande_autorisation_ministre_file',
      'copie_identite_proprietaire_file'
    ];

    for (const fileKey of otherFiles) {
      if (!files[fileKey]) {
        setError(t('eau.error_required_file'));
        setLoading(false);
        return;
      }
    }

    const formData = new FormData();
    Object.entries(form).forEach(([k, v]) => formData.append(k, v));
    Object.entries(files).forEach(([k, v]) => formData.append(k, v));
    formData.append('typeDemande', 'eaux');
    formData.append('utilisateur_id', user.id);

    try {
      const response = await fetch('http://localhost:4000/api/nouvelle-demande', {
        method: 'POST',
        body: formData
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setNotif('Demande soumise avec succès');
        setForm({
          telephone_proprietaire: '',
          activite_principale: '',
          selected_juridique_doc: ''
        });
        setFiles({
          // Dossier juridique
          statut_certifie_notaire_file: null,
          registre_commerce_local_file: null,
          numero_identification_fiscale_file: null,
          certificat_enregistrement_cnss_file: null,
          
          // Documents eaux minérales
          autorisation_ministere_eau_file: null,
          analyses_eau_laboratoire_file: null,
          etude_faisabilite_projet_file: null,
          declaration_conformite_emballage_file: null,
          cahier_charges_signe_file: null,
          demande_autorisation_ministre_file: null,
          copie_identite_proprietaire_file: null
        });
        setFormKey(Date.now());
        setShowPopup(true);
      } else {
        setError(data.error || 'Erreur lors de la soumission');
      }
    } catch {
      setError('Erreur de connexion');
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
        Retour au Dashboard
      </button>
      
      <form
        key={formKey}
        className="nouvelle-demande-form form-eaux"
        onSubmit={handleSubmit}
        encType="multipart/form-data">
        <h3>💧 Demande d'Autorisation - Eaux Minérales</h3>
        
        {/* Section Informations générales */}
        <div className="form-section-info">
          <h4 className="section-title">📋 Informations générales</h4>
          
          <div className="form-group">
            <label>📞 Téléphone du propriétaire</label>
            <input 
              type="text" 
              name="telephone_proprietaire" 
              value={form.telephone_proprietaire} 
              onChange={handleChange} 
              placeholder="Ex: +222 45454545"
              required 
            />
          </div>

          <div className="form-group">
            <label>🏭 Activité principale</label>
            <input 
              type="text" 
              name="activite_principale" 
              value={form.activite_principale} 
              onChange={handleChange} 
              placeholder="Ex: Exploitation d'eaux minérales naturelles"
              required 
            />
          </div>
        </div>
        
        {/* Section Dossier juridique avec liste déroulante */}
        <div className="form-section-juridique">
          <h4 className="section-title">📋 Dossier juridique de la société ou ETS</h4>
          
          <div className="form-group">
            <label>📋 Sélectionnez le document à uploader :</label>
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
              <label>📄 Upload du document sélectionné :</label>
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
                <h5>Documents déjà uploadés :</h5>
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

        {/* Section Documents spécifiques aux eaux minérales */}
        <div className="form-section-eaux">
          <h4 className="section-title">💧 Documents spécifiques aux eaux minérales</h4>
          
          <div className="form-group">
            <label>🏛️ Autorisation du ministère de l'Eau pour le forage du puits et l'utilisation des matériaux et équipements nécessaires</label>
            <input 
              type="file" 
              name="autorisation_ministere_eau_file" 
              accept=".pdf,.jpg,.png" 
              onChange={handleFileChange} 
              required 
            />
            <small className="file-help">Format accepté: PDF, JPG, PNG</small>
          </div>

          <div className="form-group">
            <label>🔬 Analyses des échantillons d'eau prélevés sur le site dans un laboratoire agréé, attestant de leur qualité et de leur conformité aux normes des eaux minérales naturelles</label>
            <input 
              type="file" 
              name="analyses_eau_laboratoire_file" 
              accept=".pdf" 
              onChange={handleFileChange} 
              required 
            />
            <small className="file-help">Format accepté: PDF uniquement</small>
          </div>

          <div className="form-group">
            <label>📊 Étude de faisabilité du projet qui comprend</label>
            <input 
              type="file" 
              name="etude_faisabilite_projet_file" 
              accept=".pdf" 
              onChange={handleFileChange} 
              required 
            />
            <small className="file-help">Format accepté: PDF uniquement</small>
          </div>

          <div className="form-group">
            <label>📦 Une déclaration attestant la conformité de l'emballage par les services compétents des ministères chargés de l'industrie et de la santé</label>
            <input 
              type="file" 
              name="declaration_conformite_emballage_file" 
              accept=".pdf" 
              onChange={handleFileChange} 
              required 
            />
            <small className="file-help">Format accepté: PDF uniquement</small>
          </div>

          <div className="form-group">
            <label>📋 Copie du cahier des charges signé, précisant les conditions d'extraction et de commercialisation de l'eau minérale naturelle</label>
            <input 
              type="file" 
              name="cahier_charges_signe_file" 
              accept=".pdf" 
              onChange={handleFileChange} 
              required 
            />
            <small className="file-help">Format accepté: PDF uniquement</small>
          </div>

          <div className="form-group">
            <label>📝 Une demande d'autorisation adressée au Ministre chargé de l'industrie</label>
            <input 
              type="file" 
              name="demande_autorisation_ministre_file" 
              accept=".pdf" 
              onChange={handleFileChange} 
              required 
            />
            <small className="file-help">Format accepté: PDF uniquement</small>
          </div>

          <div className="form-group">
            <label>🆔 Une copie d'identité du propriétaire</label>
            <input 
              type="file" 
              name="copie_identite_proprietaire_file" 
              accept=".pdf,.jpg,.png" 
              onChange={handleFileChange} 
              required 
            />
            <small className="file-help">Format accepté: PDF, JPG, PNG</small>
          </div>
        </div>

        <button type="submit" className="btn-form-eaux" disabled={loading}>
          {loading ? 'Envoi en cours...' : 'Envoyer la demande'}
        </button>
      </form>
      
      <SuccessPopup 
        visible={showPopup}
        onClose={() => setShowPopup(false)}
        type="eaux"
      />
    </div>
  );
}

export default FormEauMinerale;
