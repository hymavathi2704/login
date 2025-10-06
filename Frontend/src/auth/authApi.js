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

// Response interceptor for basic error handling (REFRESH LOGIC REMOVED)
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // If a 401 now occurs, it leads directly to logout/error state
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

// <<< NEW STABLE IMAGE UPLOAD FUNCTION >>>
export const uploadProfilePicture = (file) => {
  const formData = new FormData();
  // 'profilePicture' must match the multer field name in the backend
  formData.append('profilePicture', file); 

  // Create a separate axios instance to correctly handle file headers
  return axios.create({
    baseURL: API,
    withCredentials: true,
    headers: {
      'Content-Type': 'multipart/form-data', 
      'Authorization': `Bearer ${localStorage.getItem("accessToken")}`,
    },
  }).post('/api/auth/profile/upload-picture', formData);
};
// <<< END NEW FUNCTION >>>

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
  // We established the route /api/coach/public/:coachId for public profiles
  return axiosInstance.get(`/api/coach/public/${coachId}`); 
};


export const getMyClients = () => {
  return axiosInstance.get('/api/profiles/my-clients');
};

// FIX 1: UPDATE PROFILE TO USE DEDICATED COACH ROUTE
export const updateUserProfile = (profileData) => {
  // MUST use the dedicated coach endpoint to save data
  return axiosInstance.put('/api/coach/profile', profileData);
};

// FIX 2: ADD DEDICATED FETCH FUNCTION
export const getCoachProfile = () => {
  return axiosInstance.get("/api/coach/profile");
};