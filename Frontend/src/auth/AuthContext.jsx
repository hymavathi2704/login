import { createContext, useContext, useState, useEffect } from "react";
import { getMe } from "./authApi";

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  // ✅ Use consistent key name: "accessToken"
  const [accessToken, setAccessToken] = useState(() => localStorage.getItem("accessToken"));
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
        setUser(res.data.user); // ✅ make sure we set res.data.user, not res.data
        localStorage.setItem("user", JSON.stringify(res.data.user));
      } catch (err) {
        console.error("Failed to fetch user from /me:", err);
        setUser(null);
        setAccessToken(null);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [accessToken]);

  // Keep token in localStorage in sync
  useEffect(() => {
    if (accessToken) {
      localStorage.setItem("accessToken", accessToken);
    } else {
      localStorage.removeItem("accessToken");
    }
  }, [accessToken]);

  const logout = () => {
    setUser(null);
    setAccessToken(null);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, setUser, accessToken, setAccessToken, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
