// Script de test pour le système d'authentification
// À exécuter dans la console du navigateur

console.log('🧪 Test du système d\'authentification...');

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
console.log('useAuth disponible:', typeof useAuth !== 'undefined');
console.log('SessionWarning disponible:', typeof SessionWarning !== 'undefined');

// Test 4: Nettoyage du localStorage (optionnel)
console.log('\n🧹 Test 4: Nettoyage du localStorage (optionnel)');
console.log('Pour nettoyer le localStorage, exécutez: localStorage.clear()');
console.log('Pour rediriger vers la page de connexion, exécutez: window.location.href = "/login-secretaire"');

console.log('\n✅ Tests terminés !');
console.log('📖 Consultez le README_AUTHENTIFICATION.md pour plus d\'informations');





