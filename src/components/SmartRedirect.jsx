import React, { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';

const SmartRedirect = ({ user, children }) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      console.log('❌ [SmartRedirect] Aucun utilisateur connecté');
      return;
    }

    console.log('🔍 [SmartRedirect] Vérification du rôle utilisateur:', user.role_id);

    // Redirection basée sur le rôle
    switch (user.role_id) {
      case 1: // SuperAdmin
        console.log('👑 [SmartRedirect] Redirection vers SuperAdmin Dashboard');
        navigate('/superadmin-dashboard', { replace: true });
        break;
      
      case 2: // Secrétaire Central
        console.log('📋 [SmartRedirect] Redirection vers Dashboard Secrétaire Central');
        navigate('/dashboard-secretaire', { replace: true });
        break;
      
      case 3: // Secrétaire Général
        console.log('📋 [SmartRedirect] Redirection vers Dashboard Secrétaire Général');
        navigate('/dashboard-sg2', { replace: true });
        break;
      
      case 5: // DDPI
        console.log('🏢 [SmartRedirect] Redirection vers Dashboard DDPI');
        navigate('/dashboard-dppi', { replace: true });
        break;
      
      case 6: // DGI
        console.log('🏭 [SmartRedirect] Redirection vers Dashboard DGI');
        navigate('/dashboard-dgi', { replace: true });
        break;
      
      case 7: // Commission
        console.log('👥 [SmartRedirect] Redirection vers Dashboard Commission');
        navigate('/dashboard-commission', { replace: true });
        break;
      
      case 8: // Comité
        console.log('👥 [SmartRedirect] Redirection vers Dashboard Comité');
        navigate('/dashboard-comite', { replace: true });
        break;
      
      case 9: // Ministre
        console.log('🏛️ [SmartRedirect] Redirection vers Dashboard Ministre');
        navigate('/dashboard-ministre', { replace: true });
        break;
      
      case 11: // DRMNE
        console.log('🌍 [SmartRedirect] Redirection vers Dashboard DRMNE');
        navigate('/dashboard-drmne', { replace: true });
        break;
      
      case 12: // Secrétaire DGI
        console.log('📋 [SmartRedirect] Redirection vers Dashboard Secrétaire DGI');
        navigate('/dashboard-secretaire-dgi', { replace: true });
        break;
      
      default:
        // Rôle non reconnu ou demandeur (role_id = null ou autre)
        console.log('👤 [SmartRedirect] Utilisateur demandeur - Accès autorisé au dashboard demandeur');
        break;
    }
  }, [user, navigate]);

  // Si l'utilisateur n'est pas connecté, rediriger vers login
  if (!user) {
    console.log('🚫 [SmartRedirect] Redirection vers login');
    return <Navigate to="/login" replace />;
  }

  // Si l'utilisateur est un demandeur (pas de redirection), afficher le contenu
  if (!user.role_id || user.role_id === 0 || user.role_id === null || user.role_id === undefined) {
    console.log('✅ [SmartRedirect] Accès autorisé pour le demandeur (role_id:', user.role_id, ')');
    return children;
  }

  // Si l'utilisateur a un rôle défini mais n'est pas dans la liste des rôles connus, 
  // le considérer comme un demandeur
  if (user.role_id && ![1, 2, 3, 5, 6, 7, 8, 9, 11, 12].includes(user.role_id)) {
    console.log('✅ [SmartRedirect] Rôle non reconnu, accès autorisé pour le demandeur (role_id:', user.role_id, ')');
    return children;
  }

  // Pendant la redirection, afficher un message de chargement
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
        Redirection en cours...
      </div>
      <div style={{ color: '#666' }}>
        Vous allez être redirigé vers votre espace de travail
      </div>
      <div style={{ 
        marginTop: '20px',
        padding: '15px',
        background: 'rgba(30, 106, 142, 0.1)',
        borderRadius: '8px',
        border: '1px solid rgba(30, 106, 142, 0.2)'
      }}>
        <div style={{ color: '#1e6a8e', fontWeight: 'bold', marginBottom: '5px' }}>
          Rôle détecté : {user?.role_id ? `ID ${user.role_id}` : 'Demandeur'}
        </div>
        <div style={{ color: '#666', fontSize: '14px' }}>
          {user?.nom && user?.prenom ? `${user.prenom} ${user.nom}` : 'Utilisateur'}
        </div>
      </div>
    </div>
  );
};

export default SmartRedirect;
