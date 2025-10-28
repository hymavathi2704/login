import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
// VITAL: Import refreshToken function
import { getMe, logoutUser, refreshToken } from './authApi';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [currentRole, setCurrentRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false); // Add refreshing state
  const navigate = useNavigate();

  // Updated logout to ensure consistency
  const logout = useCallback(() => {
    logoutUser(); // Calls API to clear cookies and clears localStorage
    setUser(null);
    setCurrentRole(null);
    navigate('/'); // Redirect to homepage after logout
    console.log("User logged out.");
  }, [navigate]);

  // Login remains mostly the same, relies on backend setting cookies
  const login = (data) => {
    const { accessToken, user: userData } = data;
    localStorage.setItem('accessToken', accessToken); // Still useful for immediate UI updates
    setUser(userData);

    const roles = userData.roles || [];
    const defaultRole = roles.length > 0 ? roles[0] : null;

    setCurrentRole(defaultRole);
    localStorage.setItem('currentRole', defaultRole || ''); // Store even if null/empty string

    // Redirect logic remains the same
    if (!defaultRole) {
        // If user has NO roles after login (shouldn't happen with default client role), maybe go to profile setup or homepage
        navigate('/'); // Redirect to homepage if no role
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

  // refreshUserData is less critical now as interceptor handles it, but keep for manual refresh
   const refreshUserData = useCallback(async () => {
      console.log("Attempting manual user data refresh...");
      try {
        const response = await getMe(); // This will trigger interceptor if needed
        const userData = response.data.user;
        setUser(userData);
        // Ensure current role is still valid
        const storedRole = localStorage.getItem('currentRole');
        const userRoles = userData.roles || [];
          if (storedRole && userRoles.includes(storedRole)) {
            setCurrentRole(storedRole);
          } else if (userRoles.length > 0) {
            const newRole = userRoles[0];
            setCurrentRole(newRole);
            localStorage.setItem('currentRole', newRole);
          } else {
             setCurrentRole(null);
             localStorage.setItem('currentRole', '');
          }
        console.log("Manual user data refresh successful.");
      } catch (error) {
        // If getMe fails even after potential refresh by interceptor, logout
        console.error("Manual refresh failed, likely session expired. Logging out.", error.message);
        logout();
      }
   }, [logout]);


  // VITAL: Updated Session Initialization with Refresh Logic
  useEffect(() => {
    const initializeSession = async () => {
      const token = localStorage.getItem('accessToken');

      if (token) {
        try {
          // Attempt to get user data with existing token
          console.log("Initializing session: Checking existing token...");
          const response = await getMe();
          const userData = response.data.user;
          setUser(userData);
          // Set current role based on user data and localStorage
          const storedRole = localStorage.getItem('currentRole');
          const userRoles = userData.roles || [];
            if (storedRole && userRoles.includes(storedRole)) {
              setCurrentRole(storedRole);
            } else if (userRoles.length > 0) {
              const newRole = userRoles[0];
              setCurrentRole(newRole);
              localStorage.setItem('currentRole', newRole);
            } else {
               setCurrentRole(null);
               localStorage.setItem('currentRole', '');
            }
          console.log("Initializing session: Token valid, user set.");

        } catch (error) {
          // If getMe fails (likely 401), try to refresh
          if (error.response?.status === 401) {
             console.log("Initializing session: Access token expired or invalid, attempting refresh...");
             setIsRefreshing(true);
             try {
                // Call the refreshToken function from authApi
                const refreshResponse = await refreshToken(); // Already handled by interceptor, but good to have explicit call contextually
                const userData = refreshResponse.data.user; // Assuming refresh returns user data
                setUser(userData);
                 // Reset current role after refresh
                 const storedRole = localStorage.getItem('currentRole');
                 const userRoles = userData.roles || [];
                 if (storedRole && userRoles.includes(storedRole)) {
                     setCurrentRole(storedRole);
                 } else if (userRoles.length > 0) {
                     const newRole = userRoles[0];
                     setCurrentRole(newRole);
                     localStorage.setItem('currentRole', newRole);
                 } else {
                     setCurrentRole(null);
                     localStorage.setItem('currentRole', '');
                 }
                console.log("Initializing session: Refresh successful, user set.");
             } catch (refreshError) {
                 // If refresh also fails, log out
                 console.error("Initializing session: Refresh token failed. Logging out.", refreshError.message);
                 logout();
             } finally {
                 setIsRefreshing(false);
             }
          } else {
              // Handle other errors during initial getMe (e.g., network error)
              console.error("Initializing session: Error fetching user data (not 401). Logging out.", error);
              logout(); // Logout on other critical errors during init
          }
        }
      } else {
          console.log("Initializing session: No token found.");
          // No token found, ensure user is null
          setUser(null);
          setCurrentRole(null);
      }
      setIsLoading(false); // Loading is complete after checks/refresh attempts
    };

    initializeSession();
  }, [logout]); // logout is a stable function due to useCallback


  const value = {
    user,
    setUser, // Keep setUser for direct updates (e.g., after profile edit)
    roles: user?.roles || [],
    currentRole,
    isLoading: isLoading || isRefreshing, // Consider loading if initial check OR refresh is happening
    login,
    logout,
    switchRole,
    refreshUserData // Keep manual refresh available if needed
  };

  return (
    <AuthContext.Provider value={value}>
      {/* Render children only when initial loading (including potential refresh) is complete */}
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
