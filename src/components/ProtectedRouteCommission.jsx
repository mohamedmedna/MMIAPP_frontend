import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRouteCommission = ({ children }) => {
  // Accepter soit adminToken soit token normal
  const adminToken = localStorage.getItem('adminToken');
  const normalToken = localStorage.getItem('token');
  const token = adminToken || normalToken;
  
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  console.log('🔒 ProtectedRouteCommission - Vérification:', {
    hasAdminToken: !!adminToken,
    hasNormalToken: !!normalToken,
    hasToken: !!token,
    userRole: user.role_id,
    expectedRoles: [7, 8]
  });

  // Vérifier si l'utilisateur est connecté et a le bon rôle (Commission/Comité = role_id 7 ou 8)
  if (!token || !user.role_id || ![7, 8].includes(user.role_id)) {
    console.log('❌ Accès refusé - Token ou rôle incorrect');
    return <Navigate to="/login/commission" replace />;
  }

  console.log('✅ Accès autorisé pour la Commission/Comité');
  return children;
};

export default ProtectedRouteCommission; 