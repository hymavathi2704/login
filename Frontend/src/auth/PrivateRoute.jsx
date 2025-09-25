// Frontend/src/auth/PrivateRoute.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function PrivateRoute({ children, allowedRoles }) {
  const { accessToken, user } = useAuth();

  if (!accessToken) {
    // If not logged in, redirect to login page
    return <Navigate to="/user-login" replace />;
  }

  // Check if the user's role is in the list of allowed roles
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // If the role is not allowed, redirect to the unauthorized page
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}