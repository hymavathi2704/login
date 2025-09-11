import { createContext, useContext, useState, useEffect } from "react";
import { getMe } from "./authApi";

// 1. Create context
const AuthContext = createContext(null);

// 2. Hook for consuming context
export const useAuth = () => useContext(AuthContext);

// 3. Provider
export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(localStorage.getItem("token"));

  // Auto fetch user if token exists
  useEffect(() => {
    if (accessToken) {
      getMe(accessToken)
        .then((res) => setUser(res.data))
        .catch(() => {
          setUser(null);
          setAccessToken(null);
          localStorage.removeItem("token");
        });
    }
  }, [accessToken]);

  // Save token to localStorage whenever it changes
  useEffect(() => {
    if (accessToken) {
      localStorage.setItem("token", accessToken);
    }
  }, [accessToken]);

  const logout = () => {
    setUser(null);
    setAccessToken(null);
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ user, setUser, accessToken, setAccessToken, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
