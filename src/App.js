import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navigate } from 'react-router-dom';

// Import du CSS global
import './Styles/global.css';

// Import des composants
import LoginForm from './pages/LoginForm';
import InscriptionForm from './pages/InscriptionForm';
import ForgotPasswordForm from './pages/ForgotPasswordForm';
import ResetPasswordForm from './pages/ResetPasswordForm';
import DashboardDemandeur from './pages/DashboardDemandeur';
import MesDemandes from './pages/MesDemandes';
import NouvelleDemande from './pages/NouvelleDemande';
import AdminSpace from './pages/AdminSpace';
import AdminCodeVerification from './pages/AdminCodeVerification';
import AdminAccessCode from './pages/AdminAccessCode';
import ProtectedRoute from './components/ProtectedRoute';
import RoleRoute from './components/RoleRoute';
import SmartRedirect from './components/SmartRedirect';

import SuperAdminLogin from './pages/SuperAdminLogin';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import SuperAdminResetPassword from './pages/SuperAdminResetPassword';

import LoginSecretaireCentral from './pages/LoginSecretaireCentral';
import DashSecrCentral from './pages/DashSecrCentral';
import DashSecrCentralProtected from './pages/DashSecrCentralProtected';
import SecrAccuses from './pages/SecrAccuses';

import LoginSecretaireGeneral from './pages/LoginSecretaireGeneral';
import DashboardSecretaireGeneral from './pages/DashboardSecretaireGeneral';
import SecretaireGeneralDemo from './components/SecretaireGeneralDemo';
import SecretaireGeneralTest from './components/SecretaireGeneralTest';
import AuthDebug from './components/AuthDebug';
import LoginSecretaireDGI from './pages/LoginSecretaireDGI';
import DashboardSecretaireDGI from './pages/DashboardSecretaireDGI';

import DashboardDGI from './pages/DashboardDGI';
import DashboardDDPI from './pages/DashboardDDPI';
import DashboardChefService from './pages/DashboardChefService';
import DashboardCommission from './pages/DashboardCommission';
import DashboardComite from './pages/DashboardComite';
import LoginMinistre from './pages/LoginMinistre';
import DashboardMinistre from './pages/DashboardMinistre';
import LoginDGI from './pages/LoginDGI';
import LoginDDPI from './pages/LoginDDPI';
import LoginChefService from './pages/LoginChefService';
import LoginCommission from './pages/LoginCommission';
import LoginComite from './pages/LoginComite';
import ProtectedRouteSG from './components/ProtectedRouteSG';
import ProtectedRouteMinistre from './components/ProtectedRouteMinistre';
import ProtectedRouteCommission from './components/ProtectedRouteCommission';
import LoginPNME from './components/LoginPNME';
import DashboardPNME from './pages/DashboardPNME';
import LoginDRMNE from './components/LoginDRMNE';
import DashboardDRMNE from './pages/DashboardDRMNE';
import VerifyEmail from './pages/VerifyEmail'; 
import PlateformeGestion from './pages/PlateformeGestion'; // Nouvelle page d'accueil principale
import HomePage from './pages/HomePage'; // Page avec espaces demandeur et admin
import NotificationsDemandeur from './pages/NotificationsDemandeur';
import SuiviDemandes from './pages/SuiviDemandes';
import Archive from './pages/Archive';


function App() {
  const [user, setUser] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    console.log('🔄 App.js - Vérification des utilisateurs stockés...');
    
    const storedUser = localStorage.getItem('user');
    const storedPnmeUser = localStorage.getItem('pnme_user');
    const storedToken = localStorage.getItem('token');
    
    console.log('📦 Données stockées:', {
      storedUser: storedUser ? 'présent' : 'absent',
      storedPnmeUser: storedPnmeUser ? 'présent' : 'absent',
      storedToken: storedToken ? 'présent' : 'absent'
    });
    
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        console.log('👤 Utilisateur trouvé:', parsedUser);
        
        // Vérifier que l'utilisateur a les propriétés essentielles
        if (parsedUser.id && (parsedUser.email || parsedUser.identifiant_unique)) {
          setUser(parsedUser);
          console.log('✅ Utilisateur défini dans l\'état');
        } else {
          console.warn('⚠️ Utilisateur incomplet, suppression...');
          localStorage.removeItem('user');
          localStorage.removeItem('token');
        }
      } catch (error) {
        console.error('❌ Erreur parsing utilisateur:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    } else if (storedPnmeUser) {
      try {
        const parsedPnmeUser = JSON.parse(storedPnmeUser);
        console.log('👤 Utilisateur PNME trouvé:', parsedPnmeUser);
        setUser(parsedPnmeUser);
      } catch (error) {
        console.error('❌ Erreur parsing utilisateur PNME:', error);
        localStorage.removeItem('pnme_user');
      }
    }
    
    const token = localStorage.getItem('adminToken');
    if (token) {
      console.log('🔑 Token admin trouvé');
      setAdmin({ token });
    }
    
    setLoadingUser(false);
    console.log('🏁 Chargement utilisateur terminé');
  }, []);

  const logoutUser = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  const logoutAdmin = () => {
    setAdmin(null);
    localStorage.removeItem('adminToken');
  };

  if (loadingUser) {
    return <div>Chargement utilisateur...</div>;
  }


  return (
    <Router>
      <Routes>
        {/* Public */}
        <Route path="/" element={<PlateformeGestion />} />
        <Route path="/plateforme" element={<PlateformeGestion />} />
        <Route path="/gestion" element={<HomePage />} />
        

        <Route path="/login" element={<LoginForm setUser={setUser} />} />
        <Route path="/inscription" element={<InscriptionForm />} />
        <Route path="/forgot-password" element={<ForgotPasswordForm />} />
        <Route path="/reset-password/:token" element={<ResetPasswordForm />} />
        <Route path="/login-pnme" element={<LoginPNME />} />
        <Route path="/login-drmne" element={<LoginDRMNE />} />

        <Route path="/activation/:token" element={<VerifyEmail />} />

           {/* Demandeur */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute user={user} logout={logoutUser}>
              <DashboardDemandeur user={user} logout={logoutUser} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/nouvelle-demande"
          element={
            user ? (
              <NouvelleDemande user={user} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/mes-demandes"
          element={
            user ? (
              <MesDemandes user={user} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/notifications"
          element={
            user ? (
              <NotificationsDemandeur user={user} logout={logoutUser} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
                <Route 
          path="/suivi-demandes" 
          element={
            user ? (
              <SuiviDemandes user={user} logout={logoutUser} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        {/* Archive des Demandes Clôturées */}
        <Route 
          path="/archive" 
          element={
            user ? (
              <Archive user={user} logout={logoutUser} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        {/* Admin classique */}
        <Route path="/adminspace" element={<AdminSpace />} />
        <Route path="/admin-code-verification" element={<AdminCodeVerification />} />
        <Route path="/admin-access-code" element={<AdminAccessCode />} />

        {/* SuperAdmin */}
        <Route path="/superadmin-login" element={<SuperAdminLogin />} />
        <Route path="/superadmin-dashboard" element={<SuperAdminDashboard admin={admin} logout={logoutAdmin} />} />
        <Route path="/admin-reset-password/:token" element={<SuperAdminResetPassword />} />

        {/* Secrétaire Central */}
        <Route path="/login-secretaire" element={<LoginSecretaireCentral />} />
        <Route
          path="/dashboard-secretaire"
          element={
            <RoleRoute allowedRoles={[2]} loginPath="/login-secretaire">
              <DashSecrCentral />
            </RoleRoute>
          }
        />
        <Route path="/dashboard-secretaire/accuses" element={<SecrAccuses />} />

        {/* Secrétaire DGI */}
        <Route path="/login-secretaire-dgi" element={<LoginSecretaireDGI />} />
        <Route
          path="/dashboard-secretaire-dgi"
          element={
            <RoleRoute allowedRoles={[12]} loginPath="/login-secretaire-dgi">
              <DashboardSecretaireDGI />
            </RoleRoute>
          }
        />

        {/* Secrétaire Général */}
        <Route path="/login-secretaire-general" element={<LoginSecretaireGeneral />} />
        <Route
          path="/dashboard-sg2"
          element={
            <RoleRoute allowedRoles={[3]} loginPath="/login-secretaire-general">
              <DashboardSecretaireGeneral user={user} logout={logoutUser} />
            </RoleRoute>
          }
        />

        {/* DGI / DDPI / Chef Service */}
        <Route path="/login-dgi" element={<LoginDGI />} />
        <Route
          path="/dashboard-dgi"
          element={
            <RoleRoute allowedRoles={[6]} loginPath="/login-dgi">
              <DashboardDGI user={user} logout={logoutUser} />
            </RoleRoute>
          }
        />

        <Route path="/login-ddpi" element={<LoginDDPI />} />
        <Route
          path="/dashboard-ddpi"
          element={
            <RoleRoute allowedRoles={[5]} loginPath="/login-ddpi">
              <DashboardDDPI user={user} logout={logoutUser} />
            </RoleRoute>
          }
        />

        <Route path="/login-chef-service" element={<LoginChefService />} />
        <Route
          path="/dashboard-chef-service"
          element={
            <RoleRoute allowedRoles={[4]} loginPath="/login-chef-service">
              <DashboardChefService user={user} logout={logoutUser} />
            </RoleRoute>
          }
        />

        {/* Commission / Comité */}
        <Route path="/login/commission" element={<LoginCommission />} />
        <Route path="/login/comite" element={<LoginComite />} />
        <Route 
          path="/dashboard/commission" 
          element={
            <RoleRoute allowedRoles={[7,8]} loginPath="/login/commission">
              <DashboardCommission />
            </RoleRoute>
          } 
        />
        <Route 
          path="/dashboard/comite" 
          element={
            <RoleRoute allowedRoles={[7,8]} loginPath="/login/commission">
              <DashboardCommission />
            </RoleRoute>
          } 
        />

        {/* Ministre */}
         <Route path="/login-ministre" element={<LoginMinistre />} />
  <Route
    path="/dashboard-ministre"
    element={
            <RoleRoute allowedRoles={[9]} loginPath="/login-ministre">
        <DashboardMinistre user={user} logout={logoutUser} />
            </RoleRoute>
          }
        />

        {/* PNME */}
        <Route path="/dashboard-pnme" element={ user ? <DashboardPNME user={user} /> : <Navigate to="/login-pnme" /> } />
        <Route path="/dashboard-drmne" element={ user ? <DashboardDRMNE user={user} /> : <Navigate to="/login-drmne" /> } />

        {/* Catch-all propre: si déjà connecté, redirection en fonction du rôle; sinon login demandeur */}
        <Route 
          path="*" 
          element={(() => {
            const uRaw = localStorage.getItem('user');
            if (!uRaw) return <Navigate to="/login" />;
            try {
              const u = JSON.parse(uRaw);
              const role = u.role_id;
              if (role === 7 || role === 8) return <Navigate to="/dashboard/commission" />;
              if (role === 2) return <Navigate to="/dashboard-secretaire" />;
              if (role === 3) return <Navigate to="/dashboard-sg2" />;
              if (role === 4) return <Navigate to="/dashboard-chef-service" />;
              if (role === 5) return <Navigate to="/dashboard-ddpi" />;
              if (role === 6) return <Navigate to="/dashboard-dgi" />;
              if (role === 12) return <Navigate to="/dashboard-secretaire-dgi" />;
              if (role === 9) return <Navigate to="/dashboard-ministre" />;
              if (role === 11) return <Navigate to="/dashboard-pnme" />;
              if (role === 1) return <Navigate to="/superadmin-dashboard" />;
              return <Navigate to="/dashboard" />; // Demandeur par défaut
            } catch {
              return <Navigate to="/login" />;
            }
          })()} 
        />
      </Routes>
    </Router>
  );
}

export default App;
