import React, { useState, useEffect } from 'react';

const AuthDebug = () => {
  const [authState, setAuthState] = useState({});
  const [refreshCount, setRefreshCount] = useState(0);

  const refreshAuthState = () => {
    const state = {
      adminToken: localStorage.getItem('adminToken'),
      token: localStorage.getItem('token'),
      user: localStorage.getItem('user'),
      userParsed: null,
      timestamp: new Date().toISOString()
    };

    try {
      if (state.user) {
        state.userParsed = JSON.parse(state.user);
      }
    } catch (error) {
      state.userParsed = { error: 'Erreur de parsing JSON' };
    }

    setAuthState(state);
    setRefreshCount(prev => prev + 1);
  };

  const clearAllTokens = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    refreshAuthState();
  };

  const testTokenValidity = async () => {
    const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
    if (!token) {
      alert('Aucun token trouvé');
      return;
    }

    try {
      const response = await fetch('/api/test', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        alert('Token valide !');
      } else {
        alert(`Token invalide: ${response.status}`);
      }
    } catch (error) {
      alert(`Erreur de test: ${error.message}`);
    }
  };

  useEffect(() => {
    refreshAuthState();
    // Rafraîchir toutes les 5 secondes
    const interval = setInterval(refreshAuthState, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ 
      padding: '20px', 
      maxWidth: '800px', 
      margin: '20px auto',
      backgroundColor: '#f8f9fa',
      borderRadius: '8px',
      border: '1px solid #dee2e6'
    }}>
      <h2>🔍 Débogage de l'Authentification</h2>
      <p>Ce composant surveille l'état de l'authentification en temps réel.</p>
      
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={refreshAuthState}
          style={{
            padding: '8px 16px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            marginRight: '10px'
          }}
        >
          🔄 Rafraîchir ({refreshCount})
        </button>
        
        <button 
          onClick={testTokenValidity}
          style={{
            padding: '8px 16px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            marginRight: '10px'
          }}
        >
          🧪 Tester Token
        </button>
        
        <button 
          onClick={clearAllTokens}
          style={{
            padding: '8px 16px',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '4px'
          }}
        >
          🗑️ Effacer Tokens
        </button>
      </div>

      <div style={{ 
        backgroundColor: 'white', 
        padding: '15px', 
        borderRadius: '4px',
        border: '1px solid #ced4da'
      }}>
        <h3>État actuel de l'authentification :</h3>
        
        <div style={{ marginBottom: '10px' }}>
          <strong>adminToken :</strong> 
          <span style={{ 
            color: authState.adminToken ? '#28a745' : '#dc3545',
            fontFamily: 'monospace',
            marginLeft: '10px'
          }}>
            {authState.adminToken ? `${authState.adminToken.substring(0, 20)}...` : 'Non trouvé'}
          </span>
        </div>
        
        <div style={{ marginBottom: '10px' }}>
          <strong>token :</strong> 
          <span style={{ 
            color: authState.token ? '#28a745' : '#dc3545',
            fontFamily: 'monospace',
            marginLeft: '10px'
          }}>
            {authState.token ? `${authState.token.substring(0, 20)}...` : 'Non trouvé'}
          </span>
        </div>
        
        <div style={{ marginBottom: '10px' }}>
          <strong>user :</strong> 
          <span style={{ 
            color: authState.user ? '#28a745' : '#dc3545',
            fontFamily: 'monospace',
            marginLeft: '10px'
          }}>
            {authState.user ? 'Trouvé' : 'Non trouvé'}
          </span>
        </div>
        
        <div style={{ marginBottom: '10px' }}>
          <strong>Dernière mise à jour :</strong> 
          <span style={{ fontFamily: 'monospace', marginLeft: '10px' }}>
            {authState.timestamp}
          </span>
        </div>
      </div>

      {authState.userParsed && (
        <div style={{ 
          backgroundColor: 'white', 
          padding: '15px', 
          borderRadius: '4px',
          border: '1px solid #ced4da',
          marginTop: '15px'
        }}>
          <h3>Détails de l'utilisateur :</h3>
          <pre style={{ 
            backgroundColor: '#f8f9fa', 
            padding: '10px', 
            borderRadius: '4px',
            overflow: 'auto',
            fontSize: '12px'
          }}>
            {JSON.stringify(authState.userParsed, null, 2)}
          </pre>
        </div>
      )}

      <div style={{ 
        backgroundColor: '#fff3cd', 
        padding: '15px', 
        borderRadius: '4px',
        border: '1px solid #ffeaa7',
        marginTop: '15px'
      }}>
        <h4>⚠️ Problèmes courants :</h4>
        <ul>
          <li><strong>adminToken manquant :</strong> Le login n'a pas fonctionné correctement</li>
          <li><strong>Token expiré :</strong> Le token a dépassé sa durée de vie</li>
          <li><strong>User manquant :</strong> Les informations utilisateur ont été effacées</li>
          <li><strong>Déconnexion automatique :</strong> Vérifier les erreurs dans la console</li>
        </ul>
      </div>

      <div style={{ 
        backgroundColor: '#d1ecf1', 
        padding: '15px', 
        borderRadius: '4px',
        border: '1px solid #bee5eb',
        marginTop: '15px'
      }}>
        <h4>💡 Solutions :</h4>
        <ol>
          <li>Vérifier que le login fonctionne et stocke bien les tokens</li>
          <li>Vérifier que le backend valide correctement les tokens</li>
          <li>Vérifier la configuration CORS et des routes</li>
          <li>Utiliser le composant ApiTest pour diagnostiquer les problèmes API</li>
        </ol>
      </div>
    </div>
  );
};

export default AuthDebug;
