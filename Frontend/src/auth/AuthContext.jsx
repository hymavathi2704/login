import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMe, logoutUser } from './authApi'; 

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [currentRole, setCurrentRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const navigate = useNavigate();

  // Use the one from authApi to clear local storage items (now only user/rememberMe)
  const logout = useCallback(() => {
    logoutUser(); 
    setUser(null);
    setCurrentRole(null);
    navigate('/');
  }, [navigate]);

  const login = (data) => {
    // ✅ FIX: Only destructure user data, token is handled by HTTP-only cookie on backend
    const { user: userData } = data;
    // ❌ REMOVED: localStorage.setItem('accessToken', accessToken);
    setUser(userData);

    const roles = userData.roles || [];
    const defaultRole = roles.length > 0 ? roles[0] : null;
    
    setCurrentRole(defaultRole);
    localStorage.setItem('currentRole', defaultRole); // Keep role in LS for persistence

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
    try {
      const response = await getMe(); // Implicitly relies on the cookie
      const userData = response.data.user;
      setUser(userData);
      console.log("User data refreshed successfully.");
    } catch (error) {
      console.error("Failed to refresh user data. Forcing logout:", error);
      logout();
    }
  }, [logout]); 

  useEffect(() => {
    const initializeSession = async () => {
      // ❌ REMOVED: Check for token in localStorage. Now we always try to fetch /me.
      try {
        // This call succeeds only if the browser sends a valid JWT cookie.
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
        // If the cookie is missing or expired (401), fetch fails and we log out.
        console.error("Session check failed. Logging out.", error);
        logout();
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