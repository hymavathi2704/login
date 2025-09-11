import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function PrivateRoute({ children }) {
  const { accessToken } = useAuth();

  if (!accessToken) {
    // if not logged in, redirect to login
    return <Navigate to="/user-login" replace />;
  }

  return children;
}
