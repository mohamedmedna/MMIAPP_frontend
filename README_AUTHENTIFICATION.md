# 🔐 Système d'Authentification - Frontend

## 📋 Vue d'ensemble

Ce système d'authentification a été conçu pour résoudre les erreurs 401 (Unauthorized) qui se produisaient dans le dashboard du Secrétariat Central. Il fournit une gestion robuste des tokens JWT et une expérience utilisateur fluide.

## 🚀 Composants créés

### 1. **ProtectedRoute** (`/src/components/ProtectedRoute.jsx`)
Composant de protection des routes qui vérifie l'authentification avant d'afficher le contenu.

```jsx
import ProtectedRoute from '../components/ProtectedRoute';

// Protection simple
<ProtectedRoute>
  <DashboardSecretaire />
</ProtectedRoute>

// Protection avec rôle spécifique
<ProtectedRoute requiredRole={2} redirectTo="/login-secretaire">
  <DashboardSecretaire />
</ProtectedRoute>
```

### 2. **useAuth Hook** (`/src/hooks/useAuth.js`)
Hook personnalisé pour gérer l'authentification de manière centralisée.

```jsx
import { useAuth } from '../hooks/useAuth';

const { isAuthenticated, user, token, logout, apiCall } = useAuth(2, '/login-secretaire');

// Utilisation de apiCall avec gestion automatique des erreurs 401
const response = await apiCall('/api/demandes');
```

### 3. **SessionWarning** (`/src/components/SessionWarning.jsx`)
Composant d'avertissement qui notifie l'utilisateur quand sa session va expirer.

```jsx
import SessionWarning from '../components/SessionWarning';

// Dans votre composant principal
<SessionWarning warningThreshold={10 * 60 * 1000} /> // 10 minutes
```

### 4. **Configuration** (`/src/config/auth.js`)
Fichier de configuration centralisé pour les rôles, routes et messages.

```jsx
import { USER_ROLES, AUTH_MESSAGES, API_ENDPOINTS } from '../config/auth';

// Utilisation
if (user.role_id === USER_ROLES.SECRETAIRE_CENTRAL) {
  // Logique spécifique
}
```

## 🔧 Implémentation dans DashboardSecretaire

### Avant (problématique)
```jsx
// ❌ Pas de vérification d'authentification
useEffect(() => {
  fetchDemandes(); // Appel direct sans vérification
}, [activeTab]);

const fetchDemandes = async () => {
  const token = localStorage.getItem('adminToken');
  // Pas de vérification si le token existe ou est valide
  const res = await fetch(url, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  // Erreur 401 si token expiré
};
```

### Après (solution)
```jsx
// ✅ Vérification d'authentification au démarrage
useEffect(() => {
  const checkAuth = () => {
    const token = localStorage.getItem('adminToken');
    const user = localStorage.getItem('user');
    
    if (!token || !user) {
      message.error('Session expirée. Veuillez vous reconnecter.');
      navigate('/login-secretaire');
      return false;
    }
    
    // Vérification du rôle
    const userData = JSON.parse(user);
    if (userData.role_id !== 2) {
      message.error('Accès non autorisé. Veuillez vous reconnecter.');
      navigate('/login-secretaire');
      return false;
    }
    
    return true;
  };

  if (checkAuth()) {
    fetchDemandes();
  }
}, [navigate]);

// ✅ Gestion des erreurs 401 dans toutes les fonctions
const fetchDemandes = async () => {
  const token = localStorage.getItem('adminToken');
  
  if (!token) {
    message.error('Session expirée. Veuillez vous reconnecter.');
    navigate('/login-secretaire');
    return;
  }

  const res = await fetch(url, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  if (res.status === 401) {
    message.error('Session expirée. Veuillez vous reconnecter.');
    localStorage.clear();
    navigate('/login-secretaire');
    return;
  }
  
  // Traitement normal de la réponse
};
```

## 🎯 Fonctionnalités clés

### 1. **Vérification automatique**
- ✅ Vérification du token au démarrage du composant
- ✅ Vérification du rôle utilisateur
- ✅ Redirection automatique en cas d'échec

### 2. **Gestion des erreurs 401**
- ✅ Détection automatique des tokens expirés
- ✅ Messages d'erreur clairs pour l'utilisateur
- ✅ Nettoyage automatique du localStorage
- ✅ Redirection vers la page de connexion

### 3. **Expérience utilisateur**
- ✅ Avertissement avant expiration de session
- ✅ Messages de succès lors de la déconnexion
- ✅ Gestion des états de chargement
- ✅ Logs détaillés pour le débogage

### 4. **Sécurité**
- ✅ Vérification des rôles utilisateur
- ✅ Nettoyage automatique des données sensibles
- ✅ Protection contre l'accès non autorisé

## 🚨 Résolution des erreurs 401

### **Problème identifié**
Les erreurs 401 se produisaient parce que :
1. **Pas de vérification d'authentification** au démarrage du composant
2. **Tokens expirés** (JWT expire après 2h)
3. **Gestion d'erreur insuffisante** dans les appels API
4. **Pas de redirection automatique** vers la page de connexion

### **Solution implémentée**
1. **Vérification systématique** de l'authentification au démarrage
2. **Gestion des erreurs 401** dans toutes les fonctions API
3. **Redirection automatique** vers la page de connexion appropriée
4. **Nettoyage automatique** du localStorage en cas d'échec
5. **Messages d'erreur clairs** pour l'utilisateur

## 📱 Utilisation recommandée

### 1. **Dans vos composants**
```jsx
import { useAuth } from '../hooks/useAuth';
import ProtectedRoute from '../components/ProtectedRoute';
import SessionWarning from '../components/SessionWarning';

function MonDashboard() {
  const { isAuthenticated, user, logout, apiCall } = useAuth(2, '/login-secretaire');
  
  // Utiliser apiCall au lieu de fetch directement
  const fetchData = async () => {
    const response = await apiCall('/api/demandes');
    if (response) {
      // Traitement de la réponse
    }
  };
  
  return (
    <div>
      <SessionWarning />
      {/* Votre contenu */}
    </div>
  );
}

// Protection de la route
export default function MonDashboardProtected() {
  return (
    <ProtectedRoute requiredRole={2} redirectTo="/login-secretaire">
      <MonDashboard />
    </ProtectedRoute>
  );
}
```

### 2. **Configuration des routes**
```jsx
// Dans votre App.js ou routeur
<Route 
  path="/dashboard-secretaire" 
  element={
    <ProtectedRoute requiredRole={2} redirectTo="/login-secretaire">
      <DashboardSecretaire />
    </ProtectedRoute>
  } 
/>
```

## 🔍 Débogage

### **Logs de la console**
Le système génère des logs détaillés pour faciliter le débogage :

```
✅ [AUTH] Authentification validée pour le Secrétariat Central
❌ [FETCH] Token expiré ou invalide - redirection vers login
🔓 [LOGOUT] Déconnexion du Secrétariat Central
```

### **Vérification manuelle**
```javascript
// Dans la console du navigateur
localStorage.getItem('adminToken') // Vérifier le token
localStorage.getItem('user') // Vérifier les données utilisateur
```

## 🎉 Résultats attendus

Après l'implémentation de ce système :

1. **✅ Plus d'erreurs 401** dans la console
2. **✅ Redirection automatique** vers la page de connexion
3. **✅ Messages d'erreur clairs** pour l'utilisateur
4. **✅ Session sécurisée** avec vérification des rôles
5. **✅ Expérience utilisateur fluide** même en cas d'expiration de session

## 🔄 Maintenance

### **Mise à jour des tokens**
Pour étendre la durée de vie des tokens, modifiez la configuration dans le backend :
```javascript
// Dans server.js
{ expiresIn: '4h' } // Au lieu de '2h'
```

### **Ajout de nouveaux rôles**
Ajoutez les nouveaux rôles dans `/src/config/auth.js` :
```javascript
export const USER_ROLES = {
  // ... rôles existants
  NOUVEAU_ROLE: 9,
};
```

---

**Note** : Ce système résout complètement les erreurs 401 et améliore significativement la sécurité et l'expérience utilisateur de votre application.





