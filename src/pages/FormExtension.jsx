import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import SuccessPopup from '../components/SuccessPopup';
import LocationGuideModal from '../components/LocationGuideModal';
import '../Styles/FormExtension.css';
import '../Styles/LocationStyles.css';

function FormExtension({ user, setNotif, setError }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [formKey, setFormKey] = useState(Date.now());
  const [form, setForm] = useState({
    telephone_proprietaire: '',
    activite_principale: '',
    longitude: '',
    latitude: ''
  });
  const [files, setFiles] = useState({
    // Dossier juridique de la société ou ETS
    statut_certifie_notaire_file: null,
    registre_commerce_local_file: null,
    numero_identification_fiscale_file: null,
    certificat_enregistrement_cnss_file: null,
    
    // Documents spécifiques à l'extension
    etude_faisabilite_file: null,
    fiche_technique_machines_file: null,
    lettre_demande_extension_file: null,
    titre_foncier_file: null,
    copie_certificat_enregistrement_file: null
  });
  const [loading, setLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [showLocationGuide, setShowLocationGuide] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState("");

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });
  const handleFileChange = e => setFiles({ ...files, [e.target.name]: e.target.files[0] });
  const handleUseCurrentLocation = () => {
    setLocationError("");
    if (!navigator.geolocation) {
      setLocationError(
        "La géolocalisation n'est pas supportée par votre navigateur."
      );
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setForm((prev) => ({
          ...prev,
          latitude: latitude.toFixed(6),
          longitude: longitude.toFixed(6)
        }));
        setIsLocating(false);
      },
      (error) => {
        let message = "Impossible d'obtenir la position.";
        if (error.code === 1) {
          message =
            "Autorisation refusée. Activez la géolocalisation et réessayez.";
        } else if (error.code === 2) {
          message =
            "Position indisponible. Vérifiez votre connexion ou votre GPS.";
        } else if (error.code === 3) {
          message = "Délai dépassé. Réessayez.";
        }
        setLocationError(message);
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setNotif('');
    setLoading(true);

    // Vérifier les champs texte
    if (!form.telephone_proprietaire || !form.activite_principale || !form.longitude || !form.latitude) {
      setError(t('extension.error_required_text'));
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
        setError(t('extension.error_required_juridique'));
        setLoading(false);
        return;
      }
    }

    // Vérifier les autres fichiers
    const otherFiles = [
      'etude_faisabilite_file',
      'fiche_technique_machines_file',
      'lettre_demande_extension_file',
      'titre_foncier_file',
      'copie_certificat_enregistrement_file'
    ];

    for (const fileKey of otherFiles) {
      if (!files[fileKey]) {
        setError(t('extension.error_required_file'));
        setLoading(false);
        return;
      }
    }

    const baseUrl = window.__APP_CONFIG__.API_BASE;


    const formData = new FormData();
    Object.entries(form).forEach(([k, v]) => formData.append(k, v));
    Object.entries(files).forEach(([k, v]) => formData.append(k, v));
    formData.append('typeDemande', 'extension');
    formData.append('utilisateur_id', user.id);

    try {
      const response = await fetch(`${baseUrl}/api/nouvelle-demande`, {
        method: 'POST',
        body: formData
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setNotif(t('extension.success'));
        setForm({
          telephone_proprietaire: '',
          activite_principale: '',
          longitude: '',
          latitude: ''
        });
        setFiles({
          // Dossier juridique
          statut_certifie_notaire_file: null,
          registre_commerce_local_file: null,
          numero_identification_fiscale_file: null,
          certificat_enregistrement_cnss_file: null,
          
          // Documents extension
          etude_faisabilite_file: null,
          fiche_technique_machines_file: null,
          lettre_demande_extension_file: null,
          titre_foncier_file: null,
          copie_certificat_enregistrement_file: null
        });
        setFormKey(Date.now());
        setShowPopup(true);
      } else {
        setError(data.error || t('extension.error_submit'));
      }
    } catch {
      setError(t('extension.error_network'));
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
        {t('extension.back_to_dashboard')}
      </button>
      <form
        key={formKey}
        className="nouvelle-demande-form form-extension"
        onSubmit={handleSubmit}
        encType="multipart/form-data">
        <h3>📈 {t('extension.title')}</h3>
        
        {/* Section Informations générales */}
        <div className="form-section-info">
          <h4 className="section-title">📋 Informations générales</h4>
          
          <div className="form-group">
            <label>📞 {t('extension.telephone_proprietaire')}</label>
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
            <label>🏭 {t('extension.activite_principale')}</label>
            <input 
              type="text" 
              name="activite_principale" 
              value={form.activite_principale} 
              onChange={handleChange} 
              placeholder="Ex: Extension de production industrielle"
              required 
            />
          </div>
        </div>
        
        {/* Section Dossier juridique complet */}
        <div className="form-section-juridique">
          <h4 className="section-title">📋 Dossier juridique de la société ou ETS</h4>
          
          <div className="form-group">
            <label>📄 Statut certifié par Notaire</label>
            <input 
              type="file" 
              name="statut_certifie_notaire_file" 
              accept=".pdf,.jpg,.png" 
              onChange={handleFileChange} 
              required 
            />
            <small className="file-help">Format accepté: PDF, JPG, PNG</small>
          </div>

          <div className="form-group">
            <label>🏢 Registre du Commerce Local (RC)</label>
            <input 
              type="file" 
              name="registre_commerce_local_file" 
              accept=".pdf,.jpg,.png" 
              onChange={handleFileChange} 
              required 
            />
            <small className="file-help">Format accepté: PDF, JPG, PNG</small>
          </div>

          <div className="form-group">
            <label>🆔 Numéro d'identification fiscale (NIF)</label>
            <input 
              type="file" 
              name="numero_identification_fiscale_file" 
              accept=".pdf,.jpg,.png" 
              onChange={handleFileChange} 
              required 
            />
            <small className="file-help">Format accepté: PDF, JPG, PNG</small>
          </div>

          <div className="form-group">
            <label>📋 Certificat d'enregistrement à la CNSS</label>
            <input 
              type="file" 
              name="certificat_enregistrement_cnss_file" 
              accept=".pdf,.jpg,.png" 
              onChange={handleFileChange} 
              required 
            />
            <small className="file-help">Format accepté: PDF, JPG, PNG</small>
          </div>
        </div>

        {/* Section Documents spécifiques à l'extension */}
        <div className="form-section-extension">
          <h4 className="section-title">📈 Documents spécifiques à l'extension</h4>
          
          <div className="form-group">
            <label>📊 {t('extension.etude_faisabilite')}</label>
            <input 
              type="file" 
              name="etude_faisabilite_file" 
              accept=".pdf" 
              onChange={handleFileChange} 
              required 
            />
            <small className="file-help">Format accepté: PDF uniquement</small>
          </div>

          <div className="form-group">
            <label>⚙️ {t('extension.fiche_technique_machines')}</label>
            <input 
              type="file" 
              name="fiche_technique_machines_file" 
              accept=".pdf" 
              onChange={handleFileChange} 
              required 
            />
            <small className="file-help">Format accepté: PDF uniquement</small>
          </div>

          <div className="form-group">
            <label>📝 {t('extension.lettre_demande_extension')}</label>
            <input 
              type="file" 
              name="lettre_demande_extension_file" 
              accept=".pdf" 
              onChange={handleFileChange} 
              required 
            />
            <small className="file-help">Format accepté: PDF uniquement</small>
          </div>

          <div className="form-group">
            <label>🏠 {t('extension.titre_foncier')}</label>
            <input 
              type="file" 
              name="titre_foncier_file" 
              accept=".pdf,.jpg,.png" 
              onChange={handleFileChange} 
              required 
            />
            <small className="file-help">Format accepté: PDF, JPG, PNG</small>
          </div>

          <div className="form-group">
            <label>📋 {t('extension.copie_certificat_enregistrement')}</label>
            <input 
              type="file" 
              name="copie_certificat_enregistrement_file" 
              accept=".pdf,.jpg,.png" 
              onChange={handleFileChange} 
              required 
            />
            <small className="file-help">Format accepté: PDF, JPG, PNG</small>
          </div>

          {/* Section Localisation GPS */}
          <div className="form-section-localisation">
            <div className="localisation-header">
              <h4 className="section-title">📍 Coordonnées GPS de l'établissement</h4>
              <div className="location-actions">
                <button 
                  type="button" 
                  className="btn-current-location"
                  onClick={handleUseCurrentLocation}
                  disabled={isLocating}
                >
                  {isLocating ? "Localisation..." : "📍 Utiliser ma position"}
                </button>
                <button 
                  type="button" 
                  className="btn-guide-location"
                  onClick={() => setShowLocationGuide(true)}
                >
                  ❓ Comment obtenir mes coordonnées ?
                </button>
              </div>
            </div>
            
            <div className="coordinates-inputs">
              <div className="form-group">
                <label>🌐 Longitude</label>
                <input 
                  type="text" 
                  name="longitude" 
                  value={form.longitude} 
                  onChange={handleChange} 
                  placeholder="Ex: -15.9582"
                  required 
                />
                <small className="field-help">Format: nombre décimal (ex: -15.9582)</small>
              </div>

              <div className="form-group">
                <label>🌐 Latitude</label>
                <input 
                  type="text" 
                  name="latitude" 
                  value={form.latitude} 
                  onChange={handleChange} 
                  placeholder="Ex: 18.0735"
                  required 
                />
                <small className="field-help">Format: nombre décimal (ex: 18.0735)</small>
              </div>
            </div>
            {locationError && (
              <small className="field-help location-error" role="alert">
                {locationError}
              </small>
            )}
          </div>
        </div>

        <button type="submit" className="btn-form-extension" disabled={loading}>
          {loading ? t('extension.sending') : t('extension.send')}
        </button>
      </form>
      <SuccessPopup 
        visible={showPopup}
        onClose={() => setShowPopup(false)}
        type="extension"
      />
      
      <LocationGuideModal 
        isOpen={showLocationGuide} 
        onClose={() => setShowLocationGuide(false)} 
      />
    </div>
  );
}

export default FormExtension;
