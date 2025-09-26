// src/auth/AuthContext.jsx

import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import * as authApi from './authApi';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // --- NEW STATE FOR MULTI-ROLE ---
  const [roles, setRoles] = useState([]);
  const [currentRole, setCurrentRole] = useState(null);
  // ---------------------------------

  const navigate = useNavigate();

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        try {
          // You might need to decode the token here or fetch user data
          // For now, we assume user data is stored in localStorage
          const storedUser = JSON.parse(localStorage.getItem('user'));
          if (storedUser) {
            setUser(storedUser);
            // --- NEW: Set roles from stored user data ---
            setRoles(storedUser.roles || []);
            const defaultRole = (storedUser.roles && storedUser.roles[0]) || null;
            setCurrentRole(defaultRole);
            // -------------------------------------------
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

  const login = async (userData) => {
    setUser(userData.user);
    // --- NEW: Set roles and currentRole on login ---
    const userRoles = userData.user.roles || [];
    setRoles(userRoles);
    const defaultRole = userRoles.length > 0 ? userRoles[0] : null;
    setCurrentRole(defaultRole);
    // ---------------------------------------------
    setIsAuthenticated(true);
    localStorage.setItem('accessToken', userData.accessToken);
    localStorage.setItem('user', JSON.stringify(userData.user));

    // Redirect to the dashboard of the default role
    if (defaultRole) {
      navigate(`/dashboard/${defaultRole}`);
    } else {
      // Handle case where user has no roles (e.g., redirect to a setup page)
      navigate('/onboarding'); 
    }
  };

  const logout = () => {
    setUser(null);
    setRoles([]); // Clear roles
    setCurrentRole(null); // Clear current role
    setIsAuthenticated(false);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    navigate('/login');
  };
  
  // --- NEW FUNCTION TO SWITCH ROLES ---
  const switchRole = (newRole) => {
    if (roles.includes(newRole)) {
      setCurrentRole(newRole);
      navigate(`/dashboard/${newRole}`);
    } else {
      console.error(`Attempted to switch to an invalid role: ${newRole}`);
    }
  };
  // ------------------------------------

  const value = {
    user,
    isAuthenticated,
    loading,
    roles, // Expose roles
    currentRole, // Expose current role
    login,
    logout,
    switchRole, // Expose switchRole function
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};