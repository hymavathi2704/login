import axios from 'axios';

// 🚀 FIX: Define API_BASE_URL so it's accessible to all functions
// This uses the Vite environment variable (VITE_BACKEND_URL) or defaults to localhost:4028
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:4028";

// Create an Axios instance for API requests
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    // ⚠️ Base instance defaults to JSON, but this will be overridden/removed for FormData requests
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
// ⚠️ Note: This function is not used anymore if you implemented the staged file saving correctly.
// I will adjust the URL, but the logic in updateUserProfile is now the main path.
export const uploadProfilePicture = (file) => {
  const formData = new FormData();
  // 'profilePicture' must match the multer field name in the backend
  formData.append('profilePicture', file); 

  // Create a separate axios instance to correctly handle file headers
  return axios.create({
    baseURL: API_BASE_URL, // ⚠️ FIX: Use the constant API_BASE_URL instead of 'API'
    withCredentials: true,
    headers: {
      'Content-Type': 'multipart/form-data', 
      'Authorization': `Bearer ${localStorage.getItem("accessToken")}`,
    },
  }).post('/api/coach/profile/upload-picture', formData); // ⚠️ FIX: Updated route to the dedicated coach endpoint
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

// *** CRITICAL FIX APPLIED HERE: PATH CHANGED TO 'api/coach/profile/add-item' ***
export const addProfileItem = (payload) => {
  // Remove the leading slash to ensure correct path concatenation with baseURL
  return axiosInstance.post('api/coach/profile/add-item', payload); 
};

export const removeProfileItem = (payload) => {
  // Remove the leading slash to ensure correct path concatenation with baseURL
  return axiosInstance.post('api/coach/profile/remove-item', payload); 
};

// ✅ CRITICAL FIX: Conditionally remove Content-Type for FormData (file upload)
export const updateUserProfile = (profileData) => {
  // Check if the payload is FormData
  const isFormData = profileData instanceof FormData;
  
  const config = {};
  if (isFormData) {
    // When sending FormData, explicitly set Content-Type to undefined.
    // Axios/browser will correctly set it to 'multipart/form-data; boundary=...'
    config.headers = {
        'Content-Type': undefined 
    };
  }

  // Keep leading slash as it seems to work for dedicated routes
  // AxiosInstance already handles Authorization header via interceptor
  return axiosInstance.put('/api/coach/profile', profileData, config);
};

// FIX 2: ADD DEDICATED FETCH FUNCTION
export const getCoachProfile = () => {
  // Keep leading slash as it seems to work for dedicated routes
  return axiosInstance.get("/api/coach/profile");
};

// =========================================================
// SESSION MANAGEMENT FUNCTIONS
// =========================================================

export const createSession = async (sessionData) => {
    return axios.post(`${API_BASE_URL}/api/coach/sessions`, sessionData, {
        withCredentials: true, // <-- CRITICAL FIX
        // ⚠️ FIX: You should probably rely on the global interceptor or ensure Content-Type is set here.
        headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
    });
};

export const updateSession = async (sessionId, sessionData) => {
    return axios.put(`${API_BASE_URL}/api/coach/sessions/${sessionId}`, sessionData, {
        withCredentials: true, // <-- CRITICAL FIX
        headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
    });
};

export const deleteSession = async (sessionId) => {
    return axios.delete(`${API_BASE_URL}/api/coach/sessions/${sessionId}`, {
        withCredentials: true, // <-- CRITICAL FIX
        headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
    });
};