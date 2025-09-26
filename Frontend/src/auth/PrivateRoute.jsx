import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

const PrivateRoute = ({ children, allowedRoles }) => {
  // 1. GET isRefreshing FROM THE CONTEXT
  const { user, isLoading, isRefreshing } = useAuth();
  const location = useLocation();

  // 2. CHECK BOTH LOADING AND REFRESHING STATES
  if (isLoading || isRefreshing) {
    return <div>Loading...</div>; // Or a spinner component
  }

  // If there's no user object, they are not logged in.
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // This is the special case for the /welcome-setup page.
  if (allowedRoles && allowedRoles.length === 0) {
    return children;
  }

  // For all other private routes, check if the user's roles array contains at least one of the allowed roles.
  const userHasRequiredRole = user.roles && user.roles.some(role => allowedRoles.includes(role));

  if (!userHasRequiredRole) {
    // If they don't have the role, send them to an unauthorized page.
    return <Navigate to="/unauthorized" replace />;
  }

  // If they are logged in and have the role, show the page.
  return children;
};

export default PrivateRoute;