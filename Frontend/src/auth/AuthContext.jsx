import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMe, logoutUser } from './authApi';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [currentRole, setCurrentRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const logout = useCallback(() => {
    logoutUser(); 
    setUser(null);
    setCurrentRole(null);
    navigate('/');
    console.log("Frontend logout completed (AuthContext).");
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
      navigate('/login'); 
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

  // 1. Initial Session Check Logic
  useEffect(() => {
    const initializeSession = async () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        try {
          // Attempt to get user data. The authApi interceptor will handle token refresh and retry this call.
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
          console.log("AuthContext: Session successfully initialized.");

        } catch (error) {
          // If the attempt fails even after the interceptor's retry (e.g., refresh token expired)
          console.error("AuthContext: Failed to initialize session (token or network issue).", error);
          logout(); 
        }
      }
      setIsLoading(false);
    };

    initializeSession();
  }, [logout]);
 
  // 2. Manual Refresh Function (used after profile updates)
  const refreshUserData = useCallback(async () => {
    try {
      const response = await getMe();
      setUser(response.data.user);
      console.log("User data refreshed successfully.");
    } catch (error) {
      console.error("Failed to refresh user data:", error);
      logout();
    }
  }, [logout]);


  const value = {
    user,
    setUser,
    roles: user?.roles || [],
    currentRole,
    isLoading,
    login,
    logout,
    switchRole,
    refreshUserData
  };

  return (
    <AuthContext.Provider value={value}>
      {/* Render children only when loading is complete */}
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