import React from 'react';
import logo from '../assets/Logo.png';
import './BanniereMinistereCoupee.css';

const BanniereMinistereCoupee = () => {
  return (
    <div className="banniere-coupee">
      <div className="banniere-content">
        <div className="banniere-text">
          <h1 className="banniere-title-fr" style={{fontSize: '2.2rem', margin: '0 0 10px 0'}}>MINISTÈRE DES MINES ET DE L'INDUSTRIE</h1>
          <h2 className="banniere-title-fr">Direction Générale de l'Industrie</h2>
        </div>
        <div className="banniere-logo">
          <img src={logo} alt="Logo Ministère de l'Industrie" className="logo-image" />
        </div>
      </div>
      <div className="banniere-pattern"></div>
    </div>
  );
};

export default BanniereMinistereCoupee; 