import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import SuccessPopup from '../components/SuccessPopup';
import Footer from '../components/Footer';
import LocationGuideModal from '../components/LocationGuideModal';
import '../Styles/FormBoulangerie.css';
import '../Styles/LocationStyles.css';

function FormBoulangerie({ user, setNotif, setError }) {
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
    
    // Documents spécifiques à la boulangerie
    demande_ministere_file: null,
    carte_identite_proprietaire_file: null,
    coordonnees_file: null,
    titre_foncier_file: null,
    etude_faisabilite_file: null,
    cahier_charges_file: null
  });
  const [loading, setLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [showLocationGuide, setShowLocationGuide] = useState(false);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });
  const handleFileChange = e => setFiles({ ...files, [e.target.name]: e.target.files[0] });

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setNotif('');
    setLoading(true);

    // Vérifier les champs texte
    if (!form.telephone_proprietaire || !form.activite_principale || !form.longitude || !form.latitude) {
      setError(t('boulangerie.error_required_text'));
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
        setError(t('boulangerie.error_required_file'));
        setLoading(false);
        return;
      }
    }

    // Vérifier les autres fichiers
    const otherFiles = [
      'demande_ministere_file',
      'carte_identite_proprietaire_file',
      'coordonnees_file',
      'titre_foncier_file',
      'etude_faisabilite_file',
      'cahier_charges_file'
    ];

    for (const fileKey of otherFiles) {
      if (!files[fileKey]) {
        setError(t('boulangerie.error_required_file'));
        setLoading(false);
        return;
      }
    }

    const baseUrl = window.__APP_CONFIG__.API_BASE;

    const formData = new FormData();
    Object.entries(form).forEach(([k, v]) => formData.append(k, v));
    Object.entries(files).forEach(([k, v]) => formData.append(k, v));
    formData.append('typeDemande', 'boulangerie');
    formData.append('utilisateur_id', user.id);

    try {
      const response = await fetch(`${baseUrl}/api/nouvelle-demande`, {
        method: 'POST',
        body: formData
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setNotif('Demande soumise avec succès');
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
          
          // Documents boulangerie
          demande_ministere_file: null,
          carte_identite_proprietaire_file: null,
          coordonnees_file: null,
          titre_foncier_file: null,
          etude_faisabilite_file: null,
          cahier_charges_file: null,
          quitus_file: null
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
    <div className="form-boulangerie-container">
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
        className="nouvelle-demande-form form-boulangerie"
        onSubmit={handleSubmit}
        encType="multipart/form-data"
      >
        <h3>🥖 Demande d'Autorisation - Boulangerie</h3>
        
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
              placeholder="Ex: Exploitation de boulangerie"
              required 
            />
          </div>

        </div>
        
        {/* Section Dossier juridique complet */}
        <div className="form-section-juridique">
          <h4 className="section-title">📋 {t('boulangerie.dossier_juridique')}</h4>
          
          <div className="form-group">
            <label>📄 {t('boulangerie.statut_certifie_notaire')}</label>
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
            <label>🏢 {t('boulangerie.registre_commerce_local')}</label>
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
            <label>🆔 {t('boulangerie.numero_identification_fiscale')}</label>
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
            <label>📋 {t('boulangerie.certificat_enregistrement_cnss')}</label>
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

        {/* Section Documents spécifiques à la boulangerie */}
        <div className="form-section-boulangerie">
          <h4 className="section-title">🥖 Documents spécifiques à la boulangerie</h4>
          
          <div className="form-group">
            <label>📝 Une demande adressée au Ministre chargé de l'Industrie pour l'autorisation</label>
            <input type="file" name="demande_ministere_file" accept=".pdf" onChange={handleFileChange} required />
            <small className="file-help">Format accepté: PDF uniquement</small>
          </div>

          <div className="form-group">
            <label>🆔 Une copie de la carte d'identité et des numéros de téléphone du propriétaire</label>
            <input type="file" name="carte_identite_proprietaire_file" accept=".pdf,.jpg,.png" onChange={handleFileChange} required />
            <small className="file-help">Format accepté: PDF, JPG, PNG</small>
          </div>

          <div className="form-group">
            <label>📍 Les coordonnées de l'emplacement de la boulangerie avec pâtisserie, ou de la boulangerie ou de la pâtisserie en construction, selon le System GPS</label>
            <input type="file" name="coordonnees_file" accept=".pdf,.jpg,.png" onChange={handleFileChange} required />
            <small className="file-help">Format accepté: PDF, JPG, PNG</small>
          </div>

          <div className="form-group">
            <label>🏠 Le titre de propriété foncière ou un contrat de bail d'une durée d'au moins cinq ans</label>
            <input type="file" name="titre_foncier_file" accept=".pdf" onChange={handleFileChange} required />
            <small className="file-help">Format accepté: PDF uniquement</small>
          </div>

          <div className="form-group">
            <label>📊 L'étude de faisabilité économique du projet (Boulangerie avec Pâtisserie ou Boulangerie ou Pâtisserie)</label>
            <input type="file" name="etude_faisabilite_file" accept=".pdf" onChange={handleFileChange} required />
            <small className="file-help">Format accepté: PDF uniquement</small>
          </div>

          <div className="form-group">
            <label>📋 Une copie du cahier des charges des Boulangeries-Pâtisserie, signée par l'intéressé</label>
            <input type="file" name="cahier_charges_file" accept=".pdf" onChange={handleFileChange} required />
            <small className="file-help">Format accepté: PDF uniquement</small>
          </div>

          {/* Section Localisation GPS */}
          <div className="form-section-localisation">
            <div className="localisation-header">
              <h4 className="section-title">📍 Coordonnées GPS de l'établissement</h4>
              <button 
                type="button" 
                className="btn-guide-location"
                onClick={() => setShowLocationGuide(true)}
              >
                ❓ Comment obtenir mes coordonnées ?
              </button>
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
          </div>

        </div>

        <button type="submit" className="btn-form-boulangerie" disabled={loading}>
          {loading ? t('boulangerie.sending') : t('boulangerie.send')}
        </button>
      </form>
      
      <SuccessPopup 
        visible={showPopup}
        onClose={() => setShowPopup(false)}
        type="boulangerie"
      />
      
      <LocationGuideModal 
        isOpen={showLocationGuide} 
        onClose={() => setShowLocationGuide(false)} 
      />
      
      <div className="footer-boulangerie">
        <Footer />
      </div>
    </div>
  );
}

export default FormBoulangerie;