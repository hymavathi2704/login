// Frontend/src/auth/authApi.js

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

// ✅ FIX: Reverted to manual Axios instance for reliable token transmission with FormData
export const uploadProfilePicture = (file) => {
  const formData = new FormData();
  formData.append('profilePicture', file);
  const token = localStorage.getItem("accessToken");

  return axios.create({ // Use plain axios.create
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: {
      'Content-Type': 'multipart/form-data', // Explicitly setting this ensures proper handling
      'Authorization': token ? `Bearer ${token}` : undefined, // Explicitly force the token
    },
  }).post('/api/coach/profile/upload-picture', formData);
};

export const logoutUser = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("user");
  localStorage.removeItem("rememberMe");
};

export const getMyClientSessions = () => {
  return axiosInstance.get("/api/bookings/client-sessions")
};

export const getMyCoachBookings = () => {
    return axiosInstance.get("/api/coach/my-bookings");
};


// --- PROFILES & COACH DISCOVERY API ---

export const getAllCoaches = (searchTerm = '', audience = '') => {
  return axiosInstance.get(`/api/profiles/coaches`, {
    params: {
      search: searchTerm,
      audience: audience,
    }
  });
};

export const getCoachById = (coachId) => {
  return axiosInstance.get(`/api/profiles/coach/${coachId}`);
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

// --- CLIENT PROFILES API ---

export const updateClientProfile = (profileData) => {
  return axiosInstance.put('/api/client/profile', profileData);
};

// ✅ FIX: Reverted to manual Axios instance for reliable token transmission with FormData
export const uploadClientProfilePicture = (file) => {
  const formData = new FormData();
  formData.append('profilePicture', file);
  const token = localStorage.getItem("accessToken"); // Explicitly fetch token

  return axios.create({ // Use plain axios.create
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': token ? `Bearer ${token}` : undefined, // Explicitly set auth token
    },
  }).post('/api/client/profile/upload-picture', formData);
};

export const deleteClientProfilePicture = () => {
    // Calls the DELETE /api/client/profile/picture endpoint
    return axiosInstance.delete('/api/client/profile/picture');
};


// =========================================================
// SESSION MANAGEMENT FUNCTIONS
// =========================================================
export const createSession = async (sessionData) => {
    return axiosInstance.post(`/api/coach/sessions`, sessionData);
};

export const updateSession = async (sessionId, sessionData) => {
    return axiosInstance.put(`/api/coach/sessions/${sessionId}`, sessionData);
};

export const deleteSession = async (sessionId) => {
    return axiosInstance.delete(`/api/coach/sessions/${sessionId}`);
};

// Client books a session
export const bookSession = async (sessionId) => {
    return axiosInstance.post(`/api/coach/public/${sessionId}/book`);
};



// --- COACH DASHBOARD CLIENT MANAGEMENT API (FIXED ENDPOINTS) ---
export const getBookedClients = () => {
    return axiosInstance.get('/api/coach/clients/booked');
};

export const getFollowedClients = () => {
    return axiosInstance.get('/api/coach/clients/followed');
};

// =========================================================
// ✅ NEW: Client gets list of followed coaches (to determine count)
export const getFollowedCoachesClient = () => {
    // This calls the GET /api/profiles/followed endpoint
    return axiosInstance.get(`/api/profiles/followed`); 
};

export const getCoachDashboardOverview = () => {
    return axiosInstance.get('/api/coach/dashboard/overview');
};


// 🔑 NEW: Client submits a testimonial
export const submitTestimonial = (coachId, data) => { 
    return axiosInstance.post(`/api/coach/public/${coachId}/testimonials`, data); 
};


// 🔑 Check if the logged-in client has booked a session with this coach
export const checkClientReviewEligibility = (coachId) => {
    // This endpoint will return true if the client has a confirmed booking history with this coach.
    return axiosInstance.get(`/api/coach/public/${coachId}/review-eligibility`);
};
