// Script de test pour le composant DashSecrCentral
// À exécuter dans la console du navigateur sur la page du dashboard

console.log('🧪 Test du composant DashSecrCentral...');

// Test 1: Vérification du localStorage
console.log('\n📋 Test 1: Vérification du localStorage');
const token = localStorage.getItem('adminToken');
const user = localStorage.getItem('user');

console.log('Token présent:', !!token);
console.log('User présent:', !!user);

if (token) {
  console.log('Token (premiers caractères):', token.substring(0, 20) + '...');
  
  try {
    // Décoder le token JWT
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expiryTime = new Date(payload.exp * 1000);
    const currentTime = new Date();
    const timeUntilExpiry = expiryTime - currentTime;
    
    console.log('Expiration du token:', expiryTime.toLocaleString());
    console.log('Temps restant:', Math.ceil(timeUntilExpiry / 1000 / 60), 'minutes');
    
    if (timeUntilExpiry <= 0) {
      console.log('❌ Token expiré !');
    } else if (timeUntilExpiry <= 10 * 60 * 1000) {
      console.log('⚠️ Token expire bientôt (< 10 min)');
    } else {
      console.log('✅ Token valide');
    }
  } catch (error) {
    console.log('❌ Erreur lors du décodage du token:', error);
  }
}

if (user) {
  try {
    const userData = JSON.parse(user);
    console.log('Rôle utilisateur:', userData.role_id);
    console.log('Nom:', userData.nom);
    console.log('Email:', userData.email);
    
    // Vérification du rôle
    if (userData.role_id === 2) {
      console.log('✅ Rôle correct pour le Secrétariat Central');
    } else {
      console.log('❌ Rôle incorrect, attendu: 2, reçu:', userData.role_id);
    }
  } catch (error) {
    console.log('❌ Erreur lors du parsing des données utilisateur:', error);
  }
}

// Test 2: Simulation d'un appel API
console.log('\n🌐 Test 2: Simulation d\'un appel API');
if (token) {
  fetch('http://localhost:4000/api/demandes', {
    headers: { 'Authorization': `Bearer ${token}` }
  })
  .then(response => {
    console.log('Status de la réponse:', response.status);
    if (response.ok) {
      console.log('✅ Appel API réussi');
      return response.json();
    } else if (response.status === 401) {
      console.log('❌ Token expiré ou invalide (401)');
      throw new Error('Unauthorized');
    } else {
      console.log('❌ Erreur API:', response.status);
      throw new Error(`HTTP ${response.status}`);
    }
  })
  .then(data => {
    console.log('Données reçues:', data);
    if (Array.isArray(data)) {
      console.log('Nombre de demandes:', data.length);
    }
  })
  .catch(error => {
    console.log('❌ Erreur lors de l\'appel API:', error.message);
  });
} else {
  console.log('❌ Pas de token pour tester l\'API');
}

// Test 3: Vérification des composants
console.log('\n🔧 Test 3: Vérification des composants');
console.log('ProtectedRoute disponible:', typeof ProtectedRoute !== 'undefined');
console.log('SessionWarning disponible:', typeof SessionWarning !== 'undefined');
console.log('DashSecrCentral disponible:', typeof DashSecrCentral !== 'undefined');

// Test 4: Vérification des fonctions
console.log('\n⚙️ Test 4: Vérification des fonctions');
console.log('fetchDemandes disponible:', typeof fetchDemandes !== 'undefined');
console.log('accuserReception disponible:', typeof accuserReception !== 'undefined');
console.log('transmettreSG disponible:', typeof transmettreSG !== 'undefined');
console.log('showDetails disponible:', typeof showDetails !== 'undefined');
console.log('handleLogout disponible:', typeof handleLogout !== 'undefined');

// Test 5: Vérification des états
console.log('\n📊 Test 5: Vérification des états');
console.log('activeTab:', activeTab);
console.log('loading:', loading);
console.log('error:', error);
console.log('demandes (longueur):', Array.isArray(demandes) ? demandes.length : 'Non défini');

// Test 6: Nettoyage du localStorage (optionnel)
console.log('\n🧹 Test 6: Nettoyage du localStorage (optionnel)');
console.log('Pour nettoyer le localStorage, exécutez: localStorage.clear()');
console.log('Pour rediriger vers la page de connexion, exécutez: window.location.href = "/login-secretaire"');

// Test 7: Vérification des routes
console.log('\n🛣️ Test 7: Vérification des routes');
console.log('Route actuelle:', window.location.pathname);
console.log('Paramètres URL:', window.location.search);
console.log('Hash:', window.location.hash);

console.log('\n✅ Tests terminés pour DashSecrCentral !');
console.log('📖 Consultez le README_AUTHENTIFICATION.md pour plus d\'informations');
console.log('🔍 Vérifiez la console pour les logs d\'authentification');





