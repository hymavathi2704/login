import axios from "axios";

// Load backend URL from .env
const API = import.meta.env.VITE_BACKEND_URL || "http://localhost:4028";

// User registration
export const registerUser = async (userData) => {
  return await axios.post(`${API}/api/auth/register`, userData);
};

// User login
export const loginUser = async (credentials) => {
  return await axios.post(`${API}/api/auth/login`, credentials);
};

// Get current user profile
export const getMe = async (token) => {
  return await axios.get(`${API}/api/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};
