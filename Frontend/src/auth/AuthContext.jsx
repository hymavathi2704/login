import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMe } from './authApi';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [currentRole, setCurrentRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false); // 1. ADD REFRESHING STATE
  const navigate = useNavigate();

  const logout = useCallback(() => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('currentRole');
    setUser(null);
    setCurrentRole(null);
    navigate('/');
  }, [navigate]);

  const login = (data) => {
    const { accessToken, user: userData } = data;
    localStorage.setItem('accessToken', accessToken);
    setUser(userData);

    const roles = userData.roles || [];
    const defaultRole = roles.length > 0 ? roles[0] : null;
    
    setCurrentRole(defaultRole);
    localStorage.setItem('currentRole', defaultRole);

    if (!defaultRole) {
      navigate('/welcome-setup');
    } else {
      navigate(`/dashboard/${defaultRole}`);
    }
  };

  const switchRole = (newRole) => {
    if (user && user.roles.includes(newRole)) {
      setCurrentRole(newRole);
      localStorage.setItem('currentRole', newRole);
      navigate(`/dashboard/${newRole}`);
    }
  };

  const refreshUserData = useCallback(async () => {
    setIsRefreshing(true); // 2. SET REFRESHING TO TRUE
    try {
      const response = await getMe();
      const userData = response.data.user;
      setUser(userData);
    } catch (error) {
      console.error("Failed to refresh user data:", error);
      logout();
    } finally {
      setIsRefreshing(false); // 3. ALWAYS SET TO FALSE WHEN DONE
    }
  }, [logout]);

  useEffect(() => {
    const initializeSession = async () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        try {
          const response = await getMe();
          const userData = response.data.user;
          setUser(userData);
          const storedRole = localStorage.getItem('currentRole');
          const userRoles = userData.roles || [];
          if (storedRole && userRoles.includes(storedRole)) {
            setCurrentRole(storedRole);
          } else if (userRoles.length > 0) {
            setCurrentRole(userRoles[0]);
          } else {
            setCurrentRole(null);
          }
        } catch (error) {
          console.error("Session verification failed, logging out:", error);
          logout();
        }
      }
      setIsLoading(false);
    };
    initializeSession();
  }, [logout]);
  
  const value = { 
    user, 
    roles: user?.roles || [],
    currentRole, 
    isLoading,
    isRefreshing, // 4. EXPORT REFRESHING STATE
    login, 
    logout, 
    switchRole, 
    refreshUserData 
  };

  return (
    <AuthContext.Provider value={value}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};