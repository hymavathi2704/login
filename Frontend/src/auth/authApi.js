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

// Request interceptor (attach token automatically if present)
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor (basic error handling)
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

// User Registration
export const registerUser = (userData) => {
  return axiosInstance.post("/api/auth/register", userData);
};

// User Login
export const loginUser = (credentials) => {
  return axiosInstance.post("/api/auth/login", credentials);
};

// Get Current User Profile
export const getMe = () => {
  return axiosInstance.get("/api/auth/me");
};

// Creates a new profile (role) for the currently authenticated user.
export const createProfile = (profileData) => {
  return axiosInstance.post('/api/auth/create-profile', profileData);
};

// Email Verification (Updated for OTP system)
export const verifyEmail = (payload) => {
  return axiosInstance.post(`/api/auth/verify-email`, payload);
};

// Resend Verification Email
export const resendVerificationEmail = (email) => {
  return axiosInstance.post("/api/auth/send-verification", { email });
};

// Forgot Password
export const forgotPassword = (payload) => {
  return axiosInstance.post('/api/auth/forgot-password', payload);
};

// Reset Password
export const resetPassword = (data) => {
  return axiosInstance.post('/api/auth/reset-password', data);
};

// --- RENAMED FUNCTION ---
// Update user profile
export const updateUserProfile = (profileData) => {
  return axiosInstance.put('/api/auth/profile', profileData);
};
// --------------------

// Logout function
export const logoutUser = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("user");
  localStorage.removeItem("rememberMe");
};

// Removed the redundant default export to stick with named exports
// Fetch all published events for clients
export const getEvents = () => {
  return axiosInstance.get("/api/events");
};

// Fetch events for the logged-in coach
export const getMyEvents = () => {
  return axiosInstance.get("/api/events/my-events");
};

// Create a new event
export const createEvent = (eventData) => {
  return axiosInstance.post("/api/events", eventData);
};

// Book an event
export const bookEvent = (eventId) => {
  return axiosInstance.post(`/api/events/${eventId}/book`);
};

// Fetch bookings for the logged-in coach
export const getMyBookings = () => {
  return axiosInstance.get("/api/events/my-bookings");
};