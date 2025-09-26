import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMe } from './authApi'; // ✅ IMPORT getMe to verify the session

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
    // This function handles setting the session after a successful login
    const { accessToken, user: userData } = data;
    localStorage.setItem('accessToken', accessToken);
    setUser(userData);

    const defaultRole = userData.roles && userData.roles.length > 0 ? userData.roles[0] : null;
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

  // ✅ This useEffect is now the single source of truth for checking if a user is logged in
  useEffect(() => {
    const initializeSession = async () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        try {
          // We use getMe() to ask the backend if our token is still valid
          const response = await getMe();
          const userData = response.data.user; // The user data from the backend
          setUser(userData);

          const storedRole = localStorage.getItem('currentRole');
          if (storedRole && userData.roles.includes(storedRole)) {
            setCurrentRole(storedRole);
          } else if (userData.roles && userData.roles.length > 0) {
            setCurrentRole(userData.roles[0]);
          }
        } catch (error) {
          console.error("Session verification failed, logging out:", error);
          logout(); // If the token is bad, we log the user out
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