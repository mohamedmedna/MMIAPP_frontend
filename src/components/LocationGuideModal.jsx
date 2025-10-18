import React from 'react';
import '../Styles/LocationGuideModal.css';

function LocationGuideModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="location-guide-overlay" onClick={onClose}>
      <div className="location-guide-modal" onClick={(e) => e.stopPropagation()}>
        <div className="location-guide-header">
          <h3>📍 Guide : Comment obtenir vos coordonnées GPS</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="location-guide-content">
          <div className="guide-step">
            <div className="step-number">1</div>
            <div className="step-content">
              <h4>Ouvrez Google Maps</h4>
              <p>Allez sur <a href="https://www.google.com/maps" target="_blank" rel="noopener noreferrer">Google Maps</a> dans votre navigateur</p>
            </div>
          </div>

          <div className="guide-step">
            <div className="step-number">2</div>
            <div className="step-content">
              <h4>Recherchez votre emplacement</h4>
              <p>Utilisez la barre de recherche pour trouver l'adresse de votre établissement ou naviguez manuellement sur la carte</p>
            </div>
          </div>

          <div className="guide-step">
            <div className="step-number">3</div>
            <div className="step-content">
              <h4>Cliquez sur l'emplacement exact</h4>
              <p>Faites un clic droit sur l'emplacement précis de votre établissement sur la carte</p>
            </div>
          </div>

          <div className="guide-step">
            <div className="step-number">4</div>
            <div className="step-content">
              <h4>Copiez les coordonnées</h4>
              <p>Dans le menu contextuel, cliquez sur les coordonnées qui apparaissent en haut (format: XX.XXXXX, YY.YYYYY)</p>
              <div className="coordinates-example">
                <strong>Exemple:</strong> 18.0735, -15.9582
                <br/>
                <span className="coordinate-label">Latitude: 18.0735</span>
                <br/>
                <span className="coordinate-label">Longitude: -15.9582</span>
              </div>
            </div>
          </div>

          <div className="guide-step">
            <div className="step-number">5</div>
            <div className="step-content">
              <h4>Collez les coordonnées dans les champs</h4>
              <p>Séparez la latitude et la longitude et collez-les dans les champs correspondants du formulaire</p>
            </div>
          </div>

          <div className="guide-note">
            <strong>📌 Note importante:</strong> Assurez-vous que les coordonnées correspondent exactement à l'emplacement de votre établissement pour éviter tout retard dans le traitement de votre demande.
          </div>
        </div>

        <div className="location-guide-footer">
          <button className="btn-close-guide" onClick={onClose}>Fermer</button>
        </div>
      </div>
    </div>
  );
}

export default LocationGuideModal;
