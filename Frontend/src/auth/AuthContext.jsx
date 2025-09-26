import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMe } from './authApi'; // We need this to verify the session

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

  useEffect(() => {
    const initializeSession = async () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        try {
          // ✅ This is the most reliable way to check login status
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
          console.error("Session verification failed, logging out.", error);
          logout(); // If token is bad, logout cleanly
        }
      }
      setIsLoading(false);
    };
    initializeSession();
  }, [logout]);

  const value = { user, currentRole, isLoading, login, logout, switchRole };

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