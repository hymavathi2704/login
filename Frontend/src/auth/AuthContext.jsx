import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMe, logoutUser } from './authApi'; 

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [currentRole, setCurrentRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  // isRefreshing state removed
  const navigate = useNavigate();

  // Use the one from authApi to clear both local storage items
  const logout = useCallback(() => {
    logoutUser(); // Clears localStorage items
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
    // Refreshing logic simplified to just re-fetch user data
    try {
      const response = await getMe();
      const userData = response.data.user;
      setUser(userData);
      console.log("User data refreshed successfully.");
    } catch (error) {
      console.error("Failed to refresh user data (Access Token Expired). Forcing logout:", error);
      // If getMe fails now, it means the Access Token is expired/invalid, so we log out.
      logout();
    }
  }, [logout]); 

  useEffect(() => {
    const initializeSession = async () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        try {
          // Check session. If Access Token is expired, this will throw a 401 and go to catch block.
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
          // If the Access Token is expired, we log out and force a re-login.
          console.error("Session check failed (Token Expired). Logging out.", error);
          logout();
        }
      }
      setIsLoading(false);
    };
    initializeSession();
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