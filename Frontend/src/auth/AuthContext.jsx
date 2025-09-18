import { createContext, useContext, useState, useEffect } from "react";
import { getMe } from "./authApi";

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(() => localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

  // Fetch user info whenever accessToken changes
  useEffect(() => {
    const fetchUser = async () => {
      if (!accessToken) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const res = await getMe(accessToken);
        setUser(res.data);
      } catch (err) {
        console.error("Failed to fetch user from /me:", err);
        setUser(null);
        setAccessToken(null);
        localStorage.removeItem("token");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [accessToken]);

  // Keep token in localStorage in sync
  useEffect(() => {
    if (accessToken) {
      localStorage.setItem("token", accessToken);
    } else {
      localStorage.removeItem("token");
    }
  }, [accessToken]);

  const logout = () => {
    setUser(null);
    setAccessToken(null);
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ user, setUser, accessToken, setAccessToken, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
