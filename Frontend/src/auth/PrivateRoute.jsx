// src/auth/PrivateRoute.jsx

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

const PrivateRoute = ({ children, allowedRoles }) => {
  const auth = useAuth();
  const location = useLocation();

  if (auth.loading) {
    // You can return a loading spinner here
    return <div>Loading...</div>;
  }

  if (!auth.isAuthenticated) {
    // Redirect them to the /login page, but save the current location they were
    // trying to go to. This allows us to send them along to that page after they login.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // **MODIFIED: Check the currentRole from AuthContext**
  const isAllowed = allowedRoles.includes(auth.currentRole);

  if (!isAllowed) {
    // User is authenticated but does not have the required role for this route
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default PrivateRoute;