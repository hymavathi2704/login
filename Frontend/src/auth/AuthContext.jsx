import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import * as authApi from './authApi';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState([]);
  const [currentRole, setCurrentRole] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const initializeAuth = () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        try {
          const storedUser = JSON.parse(localStorage.getItem('user'));
          if (storedUser) {
            setUser(storedUser);
            setRoles(storedUser.roles || []);
            const defaultRole = (storedUser.roles && storedUser.roles[0]) || null;
            setCurrentRole(defaultRole);
            setIsAuthenticated(true);
          }
        } catch (error) {
          console.error('Failed to initialize auth:', error);
          logout();
        }
      }
      setLoading(false);
    };
    initializeAuth();
  }, []);

  const login = (userData) => {
    setUser(userData.user);
    const userRoles = userData.user.roles || [];
    setRoles(userRoles);
    const defaultRole = userRoles.length > 0 ? userRoles[0] : null;
    setCurrentRole(defaultRole);
    setIsAuthenticated(true);
    localStorage.setItem('accessToken', userData.accessToken);
    localStorage.setItem('user', JSON.stringify(userData.user));

    if (defaultRole) {
      navigate(`/dashboard/${defaultRole}`);
    } else {
      navigate('/onboarding'); 
    }
  };

  const logout = () => {
    authApi.logoutUser(); // Use the logout function from authApi
    setUser(null);
    setRoles([]);
    setCurrentRole(null);
    setIsAuthenticated(false);
    navigate('/user-login');
  };
  
  const switchRole = (newRole) => {
    if (roles.includes(newRole)) {
      setCurrentRole(newRole);
      navigate(`/dashboard/${newRole}`);
    } else {
      console.error(`Attempted to switch to an invalid role: ${newRole}`);
    }
  };

  // --- NEW FUNCTION TO REFRESH USER DATA ---
  const refreshUserData = async () => {
    try {
      const response = await authApi.getMe();
      const updatedUser = response.data.user;
      
      if (updatedUser) {
        const userRoles = [];
        if (updatedUser.ClientProfile) userRoles.push('client');
        if (updatedUser.CoachProfile) userRoles.push('coach');
        
        const fullUser = { ...updatedUser, roles: userRoles };
        setUser(fullUser);
        setRoles(userRoles);
        localStorage.setItem('user', JSON.stringify(fullUser));
      }
    } catch (error) {
      console.error("Failed to refresh user data:", error);
      logout();
    }
  };
  // ------------------------------------------

  const value = {
    user,
    isAuthenticated,
    loading,
    roles,
    currentRole,
    login,
    logout,
    switchRole,
    refreshUserData, // Expose the new function
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};