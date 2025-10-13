import React from 'react';
import '../Styles/SuccessPopup.css';

function SuccessPopup({ visible, onClose, type }) {
  if (!visible) return null;

  const getMessage = () => {
    switch (type) {
      case 'extension':
        return 'Votre demande d\'extension a été soumise avec succès !';
      case 'usine':
        return 'Votre demande d\'autorisation usine a été soumise avec succès !';
      case 'boulangerie':
        return 'Votre demande d\'autorisation boulangerie a été soumise avec succès !';
      case 'eaux':
        return 'Votre demande d\'autorisation eaux minérales a été soumise avec succès !';
      case 'pnme':
        return 'Votre demande d\'autorisation PMNE a été soumise avec succès !';
      default:
        return 'Votre demande a été soumise avec succès !';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'extension':
        return '📈';
      case 'usine':
        return '🏭';
      case 'boulangerie':
        return '🥖';
      case 'eaux':
        return '💧';
      case 'pnme':
        return '🏢';
      default:
        return '✅';
    }
  };

  return (
    <div className="success-popup-overlay">
      <div className="success-popup">
        <div className="success-popup-header">
          <span className="success-icon">{getIcon()}</span>
          <h3>Succès !</h3>
        </div>
        <div className="success-popup-content">
          <p>{getMessage()}</p>
          <p className="success-note">
            Vous recevrez une confirmation par email et pourrez suivre l'état de votre demande dans votre espace personnel.
          </p>
        </div>
        <div className="success-popup-footer">
          <button 
            className="success-popup-close"
            onClick={onClose}
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}

export default SuccessPopup;





