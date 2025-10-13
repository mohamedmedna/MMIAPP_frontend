// Configuration des URLs d'API
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

// Fonction utilitaire pour les appels API
export const apiCall = async (endpoint, options = {}) => {
  try {
    // Essayer d'abord adminToken, puis token comme fallback
    const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
    
    if (!token) {
      throw new Error('Aucun token d\'authentification trouvé');
    }
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers
      },
      ...options
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    // Vérifier si la réponse est OK
    if (!response.ok) {
      if (response.status === 401) {
        // Token expiré ou invalide
        localStorage.removeItem('adminToken');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login-secretaire-general';
        throw new Error('Session expirée. Veuillez vous reconnecter.');
      }
      
      if (response.status === 403) {
        throw new Error('Accès refusé. Vous n\'avez pas les permissions nécessaires.');
      }
      
      throw new Error(`Erreur HTTP: ${response.status}`);
    }

    // Vérifier le type de contenu
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    } else {
      throw new Error('La réponse n\'est pas au format JSON');
    }
    
  } catch (error) {
    console.error('Erreur API:', error);
    throw error;
  }
};

// URLs des endpoints
export const API_ENDPOINTS = {
  DEMANDES_A_TRAITER: '/api/demandes-a-traiter',
  DEMANDE_DETAILS: (id) => `/api/demande/${id}`,
  DEMANDE_DOCUMENTS: (id) => `/api/demande/${id}/documents`,
  DEMANDE_ANNOTER: (id) => `/api/demande/${id}/annoter`,
  DEMANDE_TRANSMETTRE: (id) => `/api/demande/${id}/transmettre`,
  DEMANDE_TRANSMETTRE_DGI: (id) => `/api/demande/${id}/transmettre-dgi`,
  DEMANDE_HISTORIQUE: (id) => `/api/demande/${id}/historique`,
  HISTORIQUE_TRANSMISSIONS: '/api/historique-transmissions'
};

export default apiCall;
