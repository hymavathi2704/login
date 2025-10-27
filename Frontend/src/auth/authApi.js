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
    // 🔑 THE FIX:
    // We COMMENT OUT the token removal.
    // This allows the expired token to remain in localStorage
    // so it can be sent to our 'authenticateAllowExpired' middleware.
    // The AuthContext will still handle logging the user out on navigation.
    if (error.response && error.response.status === 401) {
        // Clear expired tokens from local storage
        // localStorage.removeItem("accessToken");  // 👈 COMMENTED OUT
        // localStorage.removeItem("user");         // 👈 COMMENTED OUT
        
        // We no longer automatically delete the token here.
        // This stops the "Authentication Required" error loop.
    }
    
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
  }).post('/api/coach-profile/upload-picture', formData); // Note: Kept coach-profile route
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
    return axiosInstance.get("/api/coach-profile/my-bookings"); // Note: Kept coach-profile route
};


// --- PROFILES & COACH DISCOVERY API ---

export const getAllCoaches = (searchTerm = '', audience = '') => {
  return axiosInstance.get(`/api/coach-profile/coaches`, { // Note: Kept coach-profile route
    params: {
      search: searchTerm,
      audience: audience,
    }
  });
};

export const getCoachById = (coachId) => {
  return axiosInstance.get(`/api/coach-profile/coach/${coachId}`); // Note: Kept coach-profile route
};

export const addProfileItem = (payload) => {
  return axiosInstance.post('api/coach-profile/add-item', payload); // Note: Kept coach-profile route
};

export const removeProfileItem = (payload) => {
  return axiosInstance.post('api/coach-profile/remove-item', payload); // Note: Kept coach-profile route
};

export const updateUserProfile = (profileData) => {
  const isFormData = profileData instanceof FormData;
 
  const config = {};
  if (isFormData) {
    config.headers = {
        'Content-Type': undefined
    };
  }
  return axiosInstance.put('/api/coach-profile/profile', profileData); // Note: Kept coach-profile route
};

export const getCoachProfile = () => {
  return axiosInstance.get("/api/coach-profile/profile"); // Note: Kept coach-profile route
};

// --- CLIENT PROFILES API ---

export const updateClientProfile = (profileData) => {
  return axiosInstance.put('/api/client-profile/profile', profileData); // Note: Kept client-profile route
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
  }).post('/api/client-profile/upload-picture', formData); // Note: Kept client-profile route
};

export const deleteClientProfilePicture = () => {
    // Calls the DELETE /api/client/profile/picture endpoint
    return axiosInstance.delete('/api/client-profile/picture'); // Note: Kept client-profile route
};


// =========================================================
// SESSION MANAGEMENT FUNCTIONS
// =========================================================
export const createSession = async (sessionData) => {
    return axiosInstance.post(`/api/coach-profile/sessions`, sessionData);
};

export const updateSession = async (sessionId, sessionData) => {
    return axiosInstance.put(`/api/coach-profile/sessions/${sessionId}`, sessionData); // Note: Kept coach-profile route
};

export const deleteSession = async (sessionId) => {
    return axiosInstance.delete(`/api/coach-profile/sessions/${sessionId}`); // Note: Kept coach-profile route
};

// Client books a session
export const bookSession = async (sessionId) => {
    return axiosInstance.post(`/api/coach-profile/public/${sessionId}/book`); // Note: Kept coach-profile route
};



// --- COACH DASHBOARD CLIENT MANAGEMENT API (FIXED ENDPOINTS) ---
export const getBookedClients = () => {
    return axiosInstance.get('/api/coach-profile/clients/booked'); // Note: Kept coach-profile route
};

export const getFollowedClients = () => {
    return axiosInstance.get('/api/coach-profile/clients/followed'); // Note: Kept coach-profile route
};

// =========================================================
// ✅ NEW: Client gets list of followed coaches (to determine count)
export const getFollowedCoachesClient = () => {
    // This calls the GET /api/profiles/followed endpoint
    return axiosInstance.get(`/api/coach-profile/followed`); // Note: Kept coach-profile route
};

export const getCoachDashboardOverview = () => {
    return axiosInstance.get('/api/coach-profile/dashboard/overview'); // Note: Kept coach-profile route
};


// 🔑 NEW: Client submits a testimonial
// 🛑 UPDATED ROUTE
export const submitTestimonial = (coachId, data) => { 
    return axiosInstance.post(`/api/testimonials/coach/${coachId}`, data); 
};


// 🔑 Check if the logged-in client has booked a session with this coach
// 🛑 UPDATED ROUTE
export const checkClientReviewEligibility = (coachId) => {
    // This endpoint will return true if the client has a confirmed booking history with this coach.
    return axiosInstance.get(`/api/testimonials/eligibility/${coachId}`);
};

// 🔑 NEW: Check eligibility for one specific booking
export const checkBookingReviewEligibility = (bookingId) => {
    return axiosInstance.get(`/api/testimonials/check-booking/${bookingId}`);
};