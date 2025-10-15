import axios from 'axios';

// 🚀 FIX: Define API_BASE_URL so it's accessible to all functions
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:4028";

// Create an Axios instance for API requests
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to automatically attach the auth token
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
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

export const uploadProfilePicture = (file) => {
  const formData = new FormData();
  formData.append('profilePicture', file); 

  return axios.create({
    baseURL: API_BASE_URL, 
    withCredentials: true,
    headers: {
      'Content-Type': 'multipart/form-data', 
      'Authorization': `Bearer ${localStorage.getItem("accessToken")}`,
    },
  }).post('/api/coach/profile/upload-picture', formData); 
};

export const logoutUser = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("user");
  localStorage.removeItem("rememberMe");
};

export const getMyClientSessions = () => {
  // This corresponds to the backend route /api/events/my-bookings which is now session-only for clients
  return axiosInstance.get("/api/bookings/client-sessions")
};

// FIX: Coach's Bookings (NEW Export - Fixes the error in BookingManagement.jsx)
export const getMyCoachBookings = () => {
    // This corresponds to the backend route /api/coach/my-bookings
    return axiosInstance.get("/api/coach/my-bookings"); 
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
  return axiosInstance.get(`/api/coach/public/${coachId}`); 
};

export const getMyClients = () => {
  return axiosInstance.get('/api/profiles/my-clients');
};

export const addProfileItem = (payload) => {
  return axiosInstance.post('api/coach/profile/add-item', payload); 
};

export const removeProfileItem = (payload) => {
  return axiosInstance.post('api/coach/profile/remove-item', payload); 
};

export const updateUserProfile = (profileData) => {
  const isFormData = profileData instanceof FormData;
  
  const config = {};
  if (isFormData) {
    config.headers = {
        'Content-Type': undefined 
    };
  }
  return axiosInstance.put('/api/coach/profile', profileData, config);
};

export const getCoachProfile = () => {
  return axiosInstance.get("/api/coach/profile");
};

// --- CLIENT PROFILES API (NEW) ---

export const updateClientProfile = (profileData) => {
  // Sends JSON data to the PUT /api/client/profile endpoint
  return axiosInstance.put('/api/client/profile', profileData);
};

export const uploadClientProfilePicture = (file) => {
  const formData = new FormData();
  formData.append('profilePicture', file); 

  // Use custom Axios instance for multipart/form-data upload
  return axios.create({
    baseURL: API_BASE_URL, 
    withCredentials: true,
    headers: {
      'Content-Type': 'multipart/form-data', 
      'Authorization': `Bearer ${localStorage.getItem("accessToken")}`,
    },
  }).post('/api/client/profile/upload-picture', formData); 
};


// =========================================================
// SESSION MANAGEMENT FUNCTIONS (Fixed to use axiosInstance)
// =========================================================

export const createSession = async (sessionData) => {
    // FIX: Using axiosInstance and relying on the request interceptor for auth
    return axiosInstance.post(`/api/coach/sessions`, sessionData);
};

export const updateSession = async (sessionId, sessionData) => {
    // FIX: Using axiosInstance
    return axiosInstance.put(`/api/coach/sessions/${sessionId}`, sessionData);
};

export const deleteSession = async (sessionId) => {
    // FIX: Using axiosInstance
    return axiosInstance.delete(`/api/coach/sessions/${sessionId}`);
};

// Client books a session
export const bookSession = async (sessionId) => {
    return axiosInstance.post(`/api/coach/public/${sessionId}/book`);
};

// Get clients who follow the logged-in coach
export const getClientsWhoFollow = () => {
    return axiosInstance.get('/api/coach/clients-who-follow');
};