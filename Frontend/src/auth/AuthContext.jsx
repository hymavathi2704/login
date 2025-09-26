import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMe } from './authApi';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [currentRole, setCurrentRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const logout = useCallback(() => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('currentRole');
    setUser(null);
    setCurrentRole(null);
    navigate('/');
  }, [navigate]);

  const login = (data) => {
    // ... (this function is correct and does not need changes)
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
    // ... (this function is correct and does not need changes)
    if (user && user.roles.includes(newRole)) {
      setCurrentRole(newRole);
      localStorage.setItem('currentRole', newRole);
      navigate(`/dashboard/${newRole}`);
    }
  };

  // ✅ NEW FUNCTION TO REFRESH USER DATA
  const refreshUserData = useCallback(async () => {
    try {
      const response = await getMe();
      const userData = response.data.user;
      setUser(userData);
      // You can also update the currentRole if needed, but it's often better
      // to let the user switch manually if they just added a new role.
    } catch (error) {
      console.error("Failed to refresh user data:", error);
      // If refreshing fails, it might mean the token is invalid, so log out
      logout();
    }
  }, [logout]);

  useEffect(() => {
    // ... (this useEffect for session initialization is correct and does not need changes)
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
  
  // ✅ ADD `refreshUserData` AND `roles` TO THE EXPORTED VALUE
  const value = { 
    user, 
    roles: user?.roles || [], // Provide a convenient roles array
    currentRole, 
    isLoading, 
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