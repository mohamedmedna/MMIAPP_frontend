import React from 'react';
import ProtectedRoute from '../components/ProtectedRoute';
import DashSecrCentral from './DashSecrCentral';

// Composant wrapper protégé pour DashSecrCentral
const DashSecrCentralProtected = () => {
  return (
    <ProtectedRoute requiredRole={2} redirectTo="/login-secretaire">
      <DashSecrCentral />
    </ProtectedRoute>
  );
};

export default DashSecrCentralProtected;





