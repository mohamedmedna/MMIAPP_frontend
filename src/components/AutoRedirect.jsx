import React, { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';

const AutoRedirect = ({ user }) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      console.log('❌ [AutoRedirect] Aucun utilisateur connecté - redirection vers login');
      navigate('/login', { replace: true });
      return;
    }

    console.log('🔍 [AutoRedirect] Vérification du rôle utilisateur:', user.role_id);

    // Redirection automatique basée sur le rôle
    switch (user.role_id) {
      case 1: // SuperAdmin
        console.log('👑 [AutoRedirect] Redirection vers SuperAdmin Dashboard');
        navigate('/superadmin-dashboard', { replace: true });
        break;
      
      case 2: // Secrétaire Central
        console.log('📋 [AutoRedirect] Redirection vers Dashboard Secrétaire Central');
        navigate('/dashboard-secretaire', { replace: true });
        break;
      
      case 3: // Secrétaire Général
        console.log('📋 [AutoRedirect] Redirection vers Dashboard Secrétaire Général');
        navigate('/dashboard-sg2', { replace: true });
        break;
      
      case 5: // DDPI
        console.log('🏢 [AutoRedirect] Redirection vers Dashboard DDPI');
        navigate('/dashboard-dppi', { replace: true });
        break;
      
      case 6: // DGI
        console.log('🏭 [AutoRedirect] Redirection vers Dashboard DGI');
        navigate('/dashboard-dgi', { replace: true });
        break;
      
      case 7: // Commission
        console.log('👥 [AutoRedirect] Redirection vers Dashboard Commission');
        navigate('/dashboard-commission', { replace: true });
        break;
      
      case 8: // Comité
        console.log('👥 [AutoRedirect] Redirection vers Dashboard Comité');
        navigate('/dashboard-comite', { replace: true });
        break;
      
      case 9: // Ministre
        console.log('🏛️ [AutoRedirect] Redirection vers Dashboard Ministre');
        navigate('/dashboard-ministre', { replace: true });
        break;
      
      case 11: // DRMNE
        console.log('🌍 [AutoRedirect] Redirection vers Dashboard DRMNE');
        navigate('/dashboard-drmne', { replace: true });
        break;
      
      case 12: // Secrétaire DGI
        console.log('📋 [AutoRedirect] Redirection vers Dashboard Secrétaire DGI');
        navigate('/dashboard-secretaire-dgi', { replace: true });
        break;
      
      default:
        // Rôle non reconnu ou demandeur (role_id = null ou autre)
        console.log('👤 [AutoRedirect] Utilisateur demandeur - redirection vers dashboard demandeur');
        navigate('/dashboard', { replace: true });
        break;
    }
  }, [user, navigate]);

  // Pendant la redirection, afficher un message de chargement
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      flexDirection: 'column',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
    }}>
      <div style={{ 
        fontSize: '28px', 
        color: '#1e6a8e', 
        marginBottom: '20px',
        textAlign: 'center'
      }}>
        <i className="fa fa-spinner fa-spin" style={{ marginRight: '15px' }}></i>
        Redirection automatique...
      </div>
      <div style={{ 
        color: '#666', 
        fontSize: '16px',
        textAlign: 'center',
        maxWidth: '400px'
      }}>
        Vous allez être automatiquement redirigé vers votre espace de travail approprié
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

export default AutoRedirect;



