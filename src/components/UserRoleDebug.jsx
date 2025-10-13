import React from 'react';

const UserRoleDebug = ({ user }) => {
  if (!user) {
    return (
      <div style={{ 
        padding: '20px', 
        background: '#f8d7da', 
        border: '1px solid #f5c6cb', 
        borderRadius: '8px',
        margin: '20px 0'
      }}>
        <h3>🔍 Debug: Aucun utilisateur connecté</h3>
        <p>Vérifiez que vous êtes bien connecté</p>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: '20px', 
      background: '#d1ecf1', 
      border: '1px solid #bee5eb', 
      borderRadius: '8px',
      margin: '20px 0',
      fontFamily: 'monospace'
    }}>
      <h3>🔍 Debug: Informations Utilisateur</h3>
      
      <div style={{ marginBottom: '15px' }}>
        <strong>ID:</strong> {user.id || 'Non défini'}<br/>
        <strong>Nom:</strong> {user.nom || 'Non défini'}<br/>
        <strong>Prénom:</strong> {user.prenom || 'Non défini'}<br/>
        <strong>Email:</strong> {user.email || 'Non défini'}<br/>
        <strong>Rôle ID:</strong> {user.role_id !== undefined ? user.role_id : 'undefined'} 
        <span style={{ color: user.role_id === null || user.role_id === 0 ? '#28a745' : '#dc3545' }}>
          {user.role_id === null ? ' (NULL - Demandeur)' : 
           user.role_id === 0 ? ' (0 - Demandeur)' : 
           user.role_id === 1 ? ' (1 - SuperAdmin)' :
           user.role_id === 2 ? ' (2 - Secrétaire Central)' :
           user.role_id === 3 ? ' (3 - Secrétaire Général)' :
           user.role_id === 5 ? ' (5 - DDPI)' :
           user.role_id === 6 ? ' (6 - DGI)' :
           user.role_id === 7 ? ' (7 - Commission)' :
           user.role_id === 8 ? ' (8 - Comité)' :
           user.role_id === 9 ? ' (9 - Ministre)' :
           user.role_id === 11 ? ' (11 - DRMNE)' :
           user.role_id === 12 ? ' (12 - Secrétaire DGI)' :
           ' (Rôle inconnu)'}
        </span>
      </div>

      <div style={{ marginBottom: '15px' }}>
        <strong>Type de role_id:</strong> {typeof user.role_id}<br/>
        <strong>role_id === null:</strong> {user.role_id === null ? 'true' : 'false'}<br/>
        <strong>role_id === 0:</strong> {user.role_id === 0 ? 'true' : 'false'}<br/>
        <strong>role_id === undefined:</strong> {user.role_id === undefined ? 'true' : 'false'}<br/>
        <strong>!user.role_id:</strong> {!user.role_id ? 'true' : 'false'}<br/>
      </div>

      <div style={{ marginBottom: '15px' }}>
        <strong>Est un demandeur?</strong> 
        <span style={{ 
          color: (!user.role_id || user.role_id === 0 || user.role_id === null || user.role_id === undefined) ? '#28a745' : '#dc3545',
          fontWeight: 'bold'
        }}>
          {(!user.role_id || user.role_id === 0 || user.role_id === null || user.role_id === undefined) ? ' OUI' : ' NON'}
        </span>
      </div>

      <div style={{ marginBottom: '15px' }}>
        <strong>Rôle dans la liste des rôles connus?</strong> 
        <span style={{ 
          color: [1, 2, 3, 5, 6, 7, 8, 9, 11, 12].includes(user.role_id) ? '#28a745' : '#dc3545',
          fontWeight: 'bold'
        }}>
          {[1, 2, 3, 5, 6, 7, 8, 9, 11, 12].includes(user.role_id) ? ' OUI' : ' NON'}
        </span>
      </div>

      <div style={{ 
        padding: '10px', 
        background: '#fff3cd', 
        border: '1px solid #ffeaa7', 
        borderRadius: '4px',
        fontSize: '12px'
      }}>
        <strong>💡 Conseil:</strong> Si vous êtes un demandeur mais que ce composant affiche "NON", 
        vérifiez la valeur de role_id dans la base de données. Les demandeurs doivent avoir role_id = NULL ou role_id = 0.
      </div>
    </div>
  );
};

export default UserRoleDebug;



