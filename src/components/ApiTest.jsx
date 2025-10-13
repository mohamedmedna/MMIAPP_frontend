import React, { useState } from 'react';
import { apiCall, API_ENDPOINTS } from '../config/api';

const ApiTest = () => {
  const [testResults, setTestResults] = useState({});
  const [loading, setLoading] = useState(false);

  const testApiConnection = async () => {
    setLoading(true);
    const results = {};

    try {
      // Test 1: Connexion de base
      console.log('Test 1: Test de connexion de base...');
      const response = await fetch('http://localhost:4000/api/test');
      results.baseConnection = response.ok ? '✅ OK' : `❌ Erreur ${response.status}`;
    } catch (error) {
      results.baseConnection = `❌ Erreur: ${error.message}`;
    }

    try {
      // Test 2: Test avec proxy
      console.log('Test 2: Test avec proxy...');
      const response = await fetch('/api/test');
      results.proxyConnection = response.ok ? '✅ OK' : `❌ Erreur ${response.status}`;
    } catch (error) {
      results.proxyConnection = `❌ Erreur: ${error.message}`;
    }

    try {
      // Test 3: Test de notre fonction apiCall
      console.log('Test 3: Test avec apiCall...');
      await apiCall('/api/test');
      results.apiCallTest = '✅ OK';
    } catch (error) {
      results.apiCallTest = `❌ Erreur: ${error.message}`;
    }

    setTestResults(results);
    setLoading(false);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h2>🧪 Test de Connexion API</h2>
      <p>Ce composant teste la connexion entre le frontend et le backend.</p>
      
      <button 
        onClick={testApiConnection} 
        disabled={loading}
        style={{
          padding: '10px 20px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: loading ? 'not-allowed' : 'pointer',
          marginBottom: '20px'
        }}
      >
        {loading ? 'Test en cours...' : 'Tester la connexion API'}
      </button>

      {Object.keys(testResults).length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <h3>Résultats des tests :</h3>
          <div style={{ backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '5px' }}>
            <p><strong>Connexion directe (port 4000):</strong> {testResults.baseConnection}</p>
            <p><strong>Connexion via proxy:</strong> {testResults.proxyConnection}</p>
            <p><strong>Test avec apiCall:</strong> {testResults.apiCallTest}</p>
          </div>
          
          <div style={{ marginTop: '15px', padding: '15px', backgroundColor: '#e9ecef', borderRadius: '5px' }}>
            <h4>Instructions de résolution :</h4>
            <ul>
              <li>Si tous les tests échouent : Le backend n'est pas démarré</li>
              <li>Si seul le proxy échoue : Problème de configuration proxy</li>
              <li>Si seul apiCall échoue : Problème dans la fonction apiCall</li>
            </ul>
          </div>
        </div>
      )}

      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#fff3cd', borderRadius: '5px', border: '1px solid #ffeaa7' }}>
        <h4>⚠️ Vérifications à faire :</h4>
        <ol>
          <li>Le backend est-il démarré sur le port 4000 ?</li>
          <li>Le fichier package.json contient-il "proxy": "http://localhost:4000" ?</li>
          <li>Y a-t-il des erreurs CORS dans la console du navigateur ?</li>
          <li>Le serveur backend affiche-t-il des erreurs ?</li>
        </ol>
      </div>
    </div>
  );
};

export default ApiTest;
