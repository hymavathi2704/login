import axios from "axios";

// Load backend URL from .env (fallback to localhost)
const API = import.meta.env.VITE_BACKEND_URL || "http://localhost:4028";

// Create an Axios instance for authentication-related requests
const axiosInstance = axios.create({
  baseURL: API,
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Request interceptor (attach token automatically if present)
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken"); // ✅ MATCHES AuthContext & Auth0Callback
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ✅ Response interceptor (basic error handling)
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error?.response?.data?.error ||
      error?.response?.data?.message ||
      error?.message ||
      "Something went wrong!";
    return Promise.reject({ ...error, message });
  }
);

// ✅ User Registration
export const registerUser = async (userData) => {
  return axiosInstance.post("/api/auth/register", userData);
};

// ✅ User Login
export const loginUser = async (credentials) => {
  return axiosInstance.post("/api/auth/login", credentials);
};

// ✅ Get Current User Profile
export const getMe = async () => {
  return axiosInstance.get("/api/auth/me");
};

// ✅ Email Verification (Updated for OTP system)
export const verifyEmail = async (payload) => {
  return axiosInstance.post(`/api/auth/verify-email`, payload);
};

// ✅ Resend Verification Email
export const resendVerificationEmail = async (email) => {
  return axiosInstance.post("/api/auth/send-verification", { email });
};

// ✅ Forgot Password
export const forgotPassword = async (email) => {
  return axiosInstance.post('/api/auth/forgot-password', email);
};

// ✅ Reset Password
export const resetPassword = async (data) => {
  return axiosInstance.post('/api/auth/reset-password', data);
};

// ✅ Update user profile
export const updateProfile = async (profileData) => {
  return axiosInstance.put('/api/auth/profile', profileData);
};

// ✅ Logout function
export const logoutUser = () => {
  localStorage.removeItem("accessToken"); // ✅ MATCHES AuthContext
  localStorage.removeItem("user");
  localStorage.removeItem("rememberMe");
};

const authApi = {
  registerUser,
  loginUser,
  getMe,
  verifyEmail,
  resendVerificationEmail,
  logoutUser,
  forgotPassword,
  resetPassword,
  updateProfile,
};

export default authApi;