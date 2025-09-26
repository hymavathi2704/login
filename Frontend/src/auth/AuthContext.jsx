import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [currentRole, setCurrentRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const clearSession = useCallback(() => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('currentRole');
    setUser(null);
    setCurrentRole(null);
  }, []);

  const setSession = useCallback((data) => {
    setIsLoading(true);
    try {
      if (data && data.accessToken) {
        const decodedToken = jwtDecode(data.accessToken);
        localStorage.setItem('accessToken', data.accessToken);
        
        const userData = { ...data.user, roles: decodedToken.roles || [] };
        setUser(userData);
        
        const defaultRole = userData.roles.length > 0 ? userData.roles[0] : null;
        setCurrentRole(defaultRole);
        localStorage.setItem('currentRole', defaultRole);

        if (userData.roles.length === 0) {
          navigate('/welcome-setup'); // Redirect new users to a setup page
        } else {
          navigate(`/dashboard/${defaultRole}`);
        }
      } else {
        throw new Error("No access token provided.");
      }
    } catch (error) {
      console.error("Failed to set session:", error);
      clearSession();
      navigate('/login'); // Redirect to login on error
    } finally {
      setIsLoading(false);
    }
  }, [navigate, clearSession]);

  const login = (data) => {
    setSession(data);
  };

  const logout = () => {
    clearSession();
    navigate('/');
  };
  
  const switchRole = (newRole) => {
    if (user && user.roles.includes(newRole)) {
      setCurrentRole(newRole);
      localStorage.setItem('currentRole', newRole);
      navigate(`/dashboard/${newRole}`);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        
        if (decoded.exp < currentTime) {
          // Token is expired
          throw new Error("Token expired.");
        }
        
        // In a real app, you'd fetch fresh user data here using the token
        setUser({ email: decoded.email, id: decoded.userId, roles: decoded.roles });
        
        const storedRole = localStorage.getItem('currentRole');
        if (storedRole && decoded.roles.includes(storedRole)) {
          setCurrentRole(storedRole);
        } else if (decoded.roles.length > 0) {
          const defaultRole = decoded.roles[0];
          setCurrentRole(defaultRole);
          localStorage.setItem('currentRole', defaultRole);
        }

      } catch (e) {
        console.error("Session re-hydration failed:", e);
        clearSession(); // Clear bad token
      }
    }
    setIsLoading(false);
  }, [clearSession]);

  const value = { user, currentRole, isLoading, login, logout, switchRole, setSession };

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