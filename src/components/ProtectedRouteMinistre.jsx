// src/components/ProtectedRouteMinistre.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';

export default function ProtectedRouteMinistre({ children }) {
  // Accepter soit adminToken soit token normal
  const adminToken = localStorage.getItem('adminToken');
  const normalToken = localStorage.getItem('token');
  const token = adminToken || normalToken;
  
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  console.log('🔒 ProtectedRouteMinistre - Vérification:', {
    hasAdminToken: !!adminToken,
    hasNormalToken: !!normalToken,
    hasToken: !!token,
    userRole: user.role_id,
    expectedRole: 9
  });
  
  if (!token || user.role_id !== 9) {
    console.log('❌ Accès refusé - Token ou rôle incorrect');
    return <Navigate to="/login-ministre" replace />;
  }
  
  console.log('✅ Accès autorisé pour le Ministre');
  return children;
}
