import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, user, logout }) => {
  const [isValidating, setIsValidating] = useState(true);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    const validateUser = () => {
      console.log('🔒 ProtectedRoute - Validation de l\'utilisateur...');
      
      // Vérifier le token
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('❌ Aucun token trouvé');
        setIsValid(false);
        setIsValidating(false);
          return;
        }

      // Vérifier l'utilisateur - être moins strict
      if (!user) {
        console.log('❌ Utilisateur non défini');
        setIsValid(false);
        setIsValidating(false);
          return;
        }

      // Accepter l'utilisateur même s'il n'a pas d'ID (pour les nouveaux utilisateurs)
      console.log('✅ Validation réussie - Utilisateur accepté');
      setIsValid(true);
      setIsValidating(false);
    };

    // Délai pour éviter les validations trop rapides
    const timer = setTimeout(validateUser, 100);
    return () => clearTimeout(timer);
  }, [user]);

  if (isValidating) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        flexDirection: 'column'
      }}>
        <div style={{ fontSize: '24px', color: '#1e6a8e', marginBottom: '20px' }}>
          <i className="fa fa-spinner fa-spin" style={{ marginRight: '10px' }}></i>
          Vérification de l'authentification...
        </div>
        <div style={{ color: '#666' }}>
          Veuillez patienter pendant la validation de votre session
        </div>
      </div>
    );
  }

  if (!isValid) {
    console.log('🚫 Accès refusé, redirection vers login');
    return <Navigate to="/login" replace />;
  }

  console.log('✅ Accès autorisé au composant protégé');
  return children;
};

export default ProtectedRoute;

