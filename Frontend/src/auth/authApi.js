import axios from "axios";

// Load backend URL from .env (fallback to localhost)
const API = import.meta.env.VITE_BACKEND_URL || "http://localhost:4028";

// Create an Axios instance for API requests
const axiosInstance = axios.create({
  baseURL: API,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to automatically attach the auth token
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");

  // --- 🚀 DIAGNOSTIC LOGGING ---
  console.log(`[Frontend] Intercepting request to: ${config.url}`);
  if (token) {
    console.log('[Frontend] Token found in localStorage. Attaching to headers.');
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    console.log('[Frontend] No token found in localStorage.');
  }
  // --- END LOGGING ---
  
  return config;
});

// Response interceptor for basic error handling
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

// --- AUTHENTICATION API ---

export const registerUser = (userData) => {
  return axiosInstance.post("/api/auth/register", userData);
};

export const loginUser = (credentials) => {
  return axiosInstance.post("/api/auth/login", credentials);
};

export const getMe = () => {
  return axiosInstance.get("/api/auth/me");
};

export const createProfile = (profileData) => {
  return axiosInstance.post('/api/auth/create-profile', profileData);
};

export const verifyEmail = (payload) => {
  return axiosInstance.post(`/api/auth/verify-email`, payload);
};

export const resendVerificationEmail = (email) => {
  return axiosInstance.post("/api/auth/send-verification", { email });
};

export const forgotPassword = (payload) => {
  return axiosInstance.post('/api/auth/forgot-password', payload);
};

export const resetPassword = (data) => {
  return axiosInstance.post('/api/auth/reset-password', data);
};

export const updateUserProfile = (profileData) => {
  return axiosInstance.put('/api/auth/profile', profileData);
};

export const logoutUser = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("user");
  localStorage.removeItem("rememberMe");
};


// --- EVENTS & BOOKINGS API ---

export const getEvents = () => {
  return axiosInstance.get("/api/events");
};

export const getMyEvents = () => {
  return axiosInstance.get("/api/events/my-events");
};

export const createEvent = (eventData) => {
  return axiosInstance.post("/api/events", eventData);
};

export const updateEvent = (eventId, eventData) => {
  return axiosInstance.put(`/api/events/${eventId}`, eventData);
};

export const deleteEvent = (eventId) => {
  return axiosInstance.delete(`/api/events/${eventId}`);
};

export const bookEvent = (eventId) => {
  return axiosInstance.post(`/api/events/${eventId}/book`);
};

export const getMyBookings = () => {
  return axiosInstance.get("/api/events/my-bookings");
};


// --- PROFILES API ---

export const getAllCoaches = (searchTerm = '', audience = '') => {
  return axiosInstance.get(`/api/profiles/coaches`, {
    params: {
      search: searchTerm,
      audience: audience,
    }
  });
};

export const getCoachById = (coachId) => {
  return axiosInstance.get(`/api/profiles/coaches/${coachId}`);
};

export const getMyClients = () => {
  return axiosInstance.get('/api/profiles/my-clients');
};

