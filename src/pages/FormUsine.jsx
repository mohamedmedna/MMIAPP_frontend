import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Styles/FormUsine.css';
import '../Styles/LocationStyles.css';
import { useTranslation } from 'react-i18next';
import LocationGuideModal from '../components/LocationGuideModal';

function FormUsine({ user, setNotif, setError }) {
  const { t } = useTranslation();
  const baseUrl = window.__APP_CONFIG__.API_BASE;
 const navigate = useNavigate();
  const [formKey, setFormKey] = useState(Date.now());
  const [form, setForm] = useState({
    telephone_proprietaire: '',
    longitude: '',
    latitude: '',
    nationalite: '',
    nni: '',
    passport_number: '',
    secteur: '',
    autre_secteur: '',
    sous_secteur: '',
    activite_principale: '',
    filieres: ''
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
    fiches_techniques_file: null,
    demande_ministere_file: null,
    titre_foncier_file: null,
    cahier_charges_file: null
  });
  const [loading, setLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [showLocationGuide, setShowLocationGuide] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'nationalite') {
      setForm((prev) => ({
        ...prev,
        nationalite: value,
        nni: value === 'mauritanienne' ? prev.nni : '',
        passport_number: value === 'autre' ? prev.passport_number : ''
      }));
      return;
    }
    setForm({ ...form, [name]: value });
  };
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

  // Options pour la liste déroulante du secteur
  const secteurOptions = [
    { value: '', label: 'Sélectionner un secteur' },
    { value: 'agroalimentaire', label: '🍎 Agroalimentaire' },
    { value: 'peche_halieutique', label: '🐟 Pêche / Halieutique' },
    { value: 'metallurgie_metallerie', label: '🔧 Métallurgie / Métallerie' },
    { value: 'materiaux_construction', label: '🏗️ Matériaux de construction' },
    { value: 'chimie_plastique', label: '🧪 Chimie / Plastique' },
    { value: 'pharma', label: '💊 Pharma' },
    { value: 'textile', label: '👕 Textile' },
    { value: 'papeterie_bois', label: '📄 Papeterie / Bois' },
    { value: 'recyclage', label: '♻️ Recyclage' },
    { value: 'autre', label: '📋 Autre' }
  ];

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setNotif('');
    setLoading(true);

    // Vérifier les champs texte
    if (!form.telephone_proprietaire || !form.longitude || !form.latitude || !form.nationalite || !form.secteur || !form.activite_principale) {
      setError('Tous les champs obligatoires doivent être remplis');
      setLoading(false);
      return;
    }

    if (form.nationalite === 'mauritanienne') {
      if (!/^\d{10}$/.test(form.nni)) {
        setError('Le NNI doit contenir exactement 10 chiffres.');
        setLoading(false);
        return;
      }
    } else if (!form.passport_number) {
      setError('Le numéro de passeport est obligatoire pour les non-mauritaniens.');
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
    const identityValue =
      form.nationalite === 'mauritanienne' ? form.nni : form.passport_number;
    // Keep API payload backward-compatible with existing backend fields.
    formData.append('telephone_proprietaire', form.telephone_proprietaire);
    formData.append('longitude', form.longitude);
    formData.append('latitude', form.latitude);
    formData.append('nni_passeport', identityValue);
    formData.append('secteur', form.secteur);
    formData.append('autre_secteur', form.autre_secteur);
    formData.append('sous_secteur', form.sous_secteur);
    formData.append('activite_principale', form.activite_principale);
    formData.append('filieres', form.filieres);
    Object.entries(files).forEach(([k, v]) => formData.append(k, v));
    formData.append('typeDemande', 'usine');
    formData.append('utilisateur_id', user.id);

    try {
      const response = await fetch(`${baseUrl}/api/nouvelle-demande`, {
        method: 'POST',
        body: formData
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setNotif(t('usine.success'));
        setForm({
          telephone_proprietaire: '',
          longitude: '',
          latitude: '',
          nationalite: '',
          nni: '',
          passport_number: '',
          secteur: '',
          autre_secteur: '',
          sous_secteur: '',
          activite_principale: '',
          filieres: ''
        });
        setFiles({
          statut_juridique_file: null, registre_commerce_file: null, nif_file: null, cnss_file: null,
          etude_faisabilite_file: null, tdr_impact_file: null, fiches_techniques_file: null,
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
        
        {/* Section Dossier juridique complet */}
        <div className="form-section-juridique">
          <h4 className="section-title">📋 {t('usine.dossier_juridique')}</h4>
          
          <div className="form-group">
            <label>📄 {t('usine.statut_juridique')}</label>
            <input 
              type="file" 
              name="statut_juridique_file" 
              accept=".pdf,.jpg,.png" 
              onChange={handleFileChange} 
              required 
            />
            <small className="file-help">Format accepté: PDF, JPG, PNG</small>
          </div>

          <div className="form-group">
            <label>🏢 {t('usine.registre_commerce')}</label>
            <input 
              type="file" 
              name="registre_commerce_file" 
              accept=".pdf,.jpg,.png" 
              onChange={handleFileChange} 
              required 
            />
            <small className="file-help">Format accepté: PDF, JPG, PNG</small>
          </div>

          <div className="form-group">
            <label>🆔 {t('usine.nif')}</label>
            <input 
              type="file" 
              name="nif_file" 
              accept=".pdf,.jpg,.png" 
              onChange={handleFileChange} 
              required 
            />
            <small className="file-help">Format accepté: PDF, JPG, PNG</small>
          </div>

          <div className="form-group">
            <label>📋 {t('usine.cnss')}</label>
            <input 
              type="file" 
              name="cnss_file" 
              accept=".pdf,.jpg,.png" 
              onChange={handleFileChange} 
              required 
            />
            <small className="file-help">Format accepté: PDF, JPG, PNG</small>
          </div>
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

          {/* Section Informations supplémentaires */}
          <div className="form-section-supplementaires">
            <h4 className="section-title">📋 Informations supplémentaires</h4>
            
            <div className="form-group">
              <label>🌍 Nationalité</label>
              <select
                name="nationalite"
                value={form.nationalite}
                onChange={handleChange}
                required
              >
                <option value="">Sélectionner la nationalité</option>
                <option value="mauritanienne">Mauritanienne</option>
                <option value="autre">Autre</option>
              </select>
            </div>

            {form.nationalite === 'mauritanienne' && (
              <div className="form-group">
                <label>🆔 NNI</label>
                <input
                  type="text"
                  name="nni"
                  value={form.nni}
                  onChange={handleChange}
                  placeholder="Ex: 1234567890"
                  pattern="\d{10}"
                  maxLength={10}
                  required
                />
                <small className="field-help">NNI obligatoire: exactement 10 chiffres</small>
              </div>
            )}

            {form.nationalite === 'autre' && (
              <div className="form-group">
                <label>🛂 Numéro de passeport</label>
                <input
                  type="text"
                  name="passport_number"
                  value={form.passport_number}
                  onChange={handleChange}
                  placeholder="Ex: P1234567"
                  required
                />
                <small className="field-help">Passeport obligatoire pour nationalité autre</small>
              </div>
            )}

            <div className="form-group">
              <small className="field-help">
                Le système enregistre automatiquement NNI ou passeport selon la nationalité choisie.
              </small>
            </div>

            <div className="form-group">
              <label>🏭 Secteur d'activité</label>
              <select 
                name="secteur" 
                value={form.secteur} 
                onChange={handleChange}
                className="secteur-select"
                required
              >
                {secteurOptions.map((option, index) => (
                  <option key={index} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

          {form.secteur === 'autre' && (
            <div className="form-group">
              <label>📝 Précisez le secteur</label>
              <input
                type="text"
                name="autre_secteur"
                value={form.autre_secteur}
                onChange={handleChange}
                placeholder="Ex: Secteur personnalisé"
              />
              <small className="field-help">Saisissez votre secteur si non listé</small>
            </div>
          )}

            <div className="form-group">
              <label>🔍 Sous-secteur</label>
              <input 
                type="text" 
                name="sous_secteur" 
                value={form.sous_secteur} 
                onChange={handleChange} 
                placeholder="Ex: Transformation de produits laitiers"
              />
              <small className="field-help">Précisez le sous-secteur d'activité</small>
            </div>

            <div className="form-group">
              <label>⚙️ Activité principale</label>
              <input 
                type="text" 
                name="activite_principale" 
                value={form.activite_principale} 
                onChange={handleChange} 
                placeholder="Ex: Production de yaourt et fromage"
                required 
              />
              <small className="field-help">Décrivez l'activité principale de l'usine</small>
            </div>

            <div className="form-group">
              <label>🔗 Filières</label>
              <input 
                type="text" 
                name="filieres" 
                value={form.filieres} 
                onChange={handleChange} 
                placeholder="Ex: Filière lait, Filière céréales"
              />
              <small className="field-help">Listez les filières concernées par votre activité</small>
            </div>
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
      
      <LocationGuideModal 
        isOpen={showLocationGuide} 
        onClose={() => setShowLocationGuide(false)} 
      />
    </div>
  );
}

export default FormUsine;
