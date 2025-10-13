import React from 'react';
import { Navigate } from 'react-router-dom';

// RoleRoute: protège une route par rôle(s)
// Props:
// - children
// - allowedRoles: number[] (ex: [2] pour Secrétariat Central)
// - loginPath: string (ex: '/login-secretaire')
export default function RoleRoute({ children, allowedRoles = [], loginPath = '/login' }) {
  const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
  const userRaw = localStorage.getItem('user');

  if (!token || !userRaw) {
    return <Navigate to={loginPath} replace />;
  }

  try {
    const user = JSON.parse(userRaw);
    if (!user?.role_id || (allowedRoles.length > 0 && !allowedRoles.includes(user.role_id))) {
      return <Navigate to={loginPath} replace />;
    }
    return children;
  } catch {
    return <Navigate to={loginPath} replace />;
  }
}




