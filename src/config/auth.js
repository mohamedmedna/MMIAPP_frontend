// Configuration des rôles utilisateur
export const USER_ROLES = {
  SUPER_ADMIN: 1,
  SECRETAIRE_CENTRAL: 2,
  SECRETAIRE_GENERAL: 3,
  CHEF_SERVICE: 4,
  DGI: 5,
  DDPI: 6,
  PNME: 7,
  DEMANDEUR: 8,
};

// Configuration des routes de redirection par rôle
export const LOGIN_ROUTES = {
  [USER_ROLES.SUPER_ADMIN]: '/login-admin',
  [USER_ROLES.SECRETAIRE_CENTRAL]: '/login-secretaire',
  [USER_ROLES.SECRETAIRE_GENERAL]: '/login-secretaire-general',
  [USER_ROLES.CHEF_SERVICE]: '/login-chef-service',
  [USER_ROLES.DGI]: '/login-dgi',
  [USER_ROLES.DDPI]: '/login-ddpi',
  [USER_ROLES.PNME]: '/login-pnme',
  [USER_ROLES.DEMANDEUR]: '/login',
};

// Configuration des tokens localStorage
export const STORAGE_KEYS = {
  TOKEN: 'adminToken',
  USER: 'user',
  LAST_ACTIVITY: 'lastActivity',
};

// Configuration de l'expiration des tokens (en millisecondes)
export const TOKEN_EXPIRY = {
  WARNING_THRESHOLD: 10 * 60 * 1000, // 10 minutes avant expiration
  CHECK_INTERVAL: 60 * 1000, // Vérifier toutes les minutes
};

// Messages d'erreur d'authentification
export const AUTH_MESSAGES = {
  TOKEN_MISSING: 'Token d\'authentification manquant',
  TOKEN_EXPIRED: 'Session expirée. Veuillez vous reconnecter.',
  UNAUTHORIZED: 'Accès non autorisé',
  ROLE_MISMATCH: 'Rôle utilisateur incorrect',
  SESSION_EXPIRED: 'Votre session a expiré. Veuillez vous reconnecter.',
  LOGOUT_SUCCESS: 'Déconnexion réussie',
};

// Configuration des endpoints API
export const API_ENDPOINTS = {
  LOGIN: {
    SECRETAIRE_CENTRAL: '/api/login/secretaire',
    SECRETAIRE_GENERAL: '/api/login/secretaire-general',
    DGI: '/api/login/dgi',
    DDPI: '/api/login/ddpi',
    CHEF_SERVICE: '/api/login/chef-service',
    PNME: '/api/login/pnme',
  },
  DEMANDES: {
    LIST: '/api/demandes',
    ACCUSES: '/api/demandes/accuses-reception',
    HISTORIQUE: (id) => `/api/demandes/${id}/historique`,
    ACCUSER_RECEPTION: (id) => `/api/demandes/${id}/accuser-reception`,
    TRANSMETTRE_SG: (id) => `/api/demandes/${id}/transmettre-sg`,
    TRANSMETTRE_DGI: (id) => `/api/demandes/${id}/transmettre-dgi`,
  },
};





