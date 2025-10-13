import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';

export const useAuth = (requiredRole = null, redirectTo = '/login-secretaire') => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = useCallback(() => {
    try {
      const storedToken = localStorage.getItem('adminToken');
      const storedUser = localStorage.getItem('user');

      if (!storedToken || !storedUser) {
        console.error('❌ [useAuth] Token ou utilisateur manquant');
        return false;
      }

      const userData = JSON.parse(storedUser);
      
      // Vérifier le rôle si requis
      if (requiredRole && userData.role_id !== requiredRole) {
        console.error('❌ [useAuth] Rôle incorrect:', userData.role_id, 'attendu:', requiredRole);
        return false;
      }

      setToken(storedToken);
      setUser(userData);
      setIsAuthenticated(true);
      console.log('✅ [useAuth] Authentification validée pour le rôle:', userData.role_id);
      return true;
    } catch (err) {
      console.error('❌ [useAuth] Erreur lors de la validation:', err);
      return false;
    }
  }, [requiredRole]);

  const logout = useCallback(() => {
    console.log('🔓 [useAuth] Déconnexion');
    localStorage.clear();
    setIsAuthenticated(false);
    setUser(null);
    setToken(null);
    message.success('Déconnexion réussie');
    navigate(redirectTo);
  }, [navigate, redirectTo]);

  const refreshAuth = useCallback(() => {
    if (!checkAuth()) {
      message.error('Session expirée. Veuillez vous reconnecter.');
      logout();
    }
  }, [checkAuth, logout]);

  useEffect(() => {
    if (checkAuth()) {
      setIsLoading(false);
    } else {
      message.error('Session expirée. Veuillez vous reconnecter.');
      logout();
    }
  }, [checkAuth, logout]);

  // Fonction pour faire des appels API avec gestion automatique des erreurs 401
  const apiCall = useCallback(async (url, options = {}) => {
    if (!token) {
      console.error('❌ [useAuth] Pas de token pour l\'appel API');
      logout();
      return null;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (response.status === 401) {
        console.error('❌ [useAuth] Token expiré lors de l\'appel API');
        message.error('Session expirée. Veuillez vous reconnecter.');
        logout();
        return null;
      }

      return response;
    } catch (error) {
      console.error('❌ [useAuth] Erreur lors de l\'appel API:', error);
      throw error;
    }
  }, [token, logout]);

  return {
    isAuthenticated,
    user,
    token,
    isLoading,
    logout,
    refreshAuth,
    apiCall,
  };
};





