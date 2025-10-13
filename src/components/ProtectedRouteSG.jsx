import React from 'react';
import { Navigate } from 'react-router-dom';

export default function ProtectedRouteSG({ children }) {
  // Accepter soit adminToken soit token normal
  const adminToken = localStorage.getItem('adminToken');
  const normalToken = localStorage.getItem('token');
  const token = adminToken || normalToken;
  
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  console.log('🔒 ProtectedRouteSG - Vérification:', {
    hasAdminToken: !!adminToken,
    hasNormalToken: !!normalToken,
    hasToken: !!token,
    userRole: user.role_id,
    expectedRole: 3
  });

  // Vérifie la présence du token et du bon rôle
  if (!token || user.role_id !== 3) {
    console.log('❌ Accès refusé - Token ou rôle incorrect');
    return <Navigate to="/login-secretaire-general" replace />;
  }

  console.log('✅ Accès autorisé pour le Secrétaire Général');
  return children;
}
