// Frontend/src/auth/authApi.js

import axios from 'axios';

// Define API Base URL (using environment variable with fallback)
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:4028";

// Create Axios instance for API requests
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Send cookies (important for session/refresh tokens if used)
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor: Attach Authorization token from localStorage if it exists
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: Basic error message extraction
axiosInstance.interceptors.response.use(
  (response) => response, // Pass through successful responses
  (error) => {
    // Note: The automatic token removal on 401 is currently commented out.
    // AuthContext handles logout based on API call failures.
    if (error.response && error.response.status === 401) {
       // console.warn("Unauthorized (401) detected by interceptor.");
       // localStorage.removeItem("accessToken"); // Previously uncommented, now keeping commented as requested
       // localStorage.removeItem("user");        // Previously uncommented, now keeping commented as requested
    }

    // Extract a user-friendly error message from the response or error object
    const message =
      error?.response?.data?.error ||   // Prefer backend's specific 'error' field
      error?.response?.data?.message || // Or backend's 'message' field
      error?.message ||                 // Or Axios's error message
      "An unexpected error occurred.";  // Fallback

    // Reject with an enhanced error object containing the message
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

// Fetches the logged-in user's details
export const getMe = () => {
  return axiosInstance.get("/api/auth/me");
};

// Creates a secondary profile (e.g., coach profile after being a client)
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

// Uploads coach profile picture (uses separate instance for FormData)
export const uploadProfilePicture = (file) => {
  const formData = new FormData();
  formData.append('profilePicture', file);
  const token = localStorage.getItem("accessToken");

  return axios.create({ // Use plain axios instance for FormData
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: {
      'Content-Type': 'multipart/form-data', // Crucial for file uploads
      'Authorization': token ? `Bearer ${token}` : undefined,
    },
    // Ensure POST method is used
  }).post('/api/coach-profile/profile/upload-picture', formData); // Corrected Path
};


// Handles client-side logout (clears local storage)
export const logoutUser = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("user");
  localStorage.removeItem("rememberMe"); // If you use this flag
  // Consider redirecting or updating global state here as well
};


// --- BOOKINGS & SESSIONS API (Client Perspective) ---
// Fetches sessions the client has booked
export const getMyClientSessions = () => {
  return axiosInstance.get("/api/bookings/client-sessions");
};

// Client books a specific session (by Session ID)
export const bookSession = async (sessionId) => {
  // Use the dedicated booking route
  return axiosInstance.post(`/api/bookings/book/${sessionId}`);
};


// --- COACH PROFILE & DISCOVERY API (Public & Logged-in User) ---

// Fetches list of coaches (public, supports search/filter)
export const getAllCoaches = (searchTerm = '', audience = '') => {
  // Uses the public profiles route
  return axiosInstance.get(`/api/profiles/coaches`, { // Corrected Path
    params: { search: searchTerm, audience: audience }
  });
};

// Fetches public details of a specific coach (by User ID)
export const getCoachById = (coachId) => {
  // Uses the public profiles route
  return axiosInstance.get(`/api/profiles/coach/${coachId}`); // Corrected Path
};

// Fetches the logged-in coach's own detailed profile - Requires auth
export const getCoachProfile = () => {
  return axiosInstance.get("/api/coach-profile/profile"); // Uses the coach-specific route
};

// Updates the logged-in coach's profile - Requires auth
export const updateUserProfile = (profileData) => {
  const isFormData = profileData instanceof FormData;
  const config = isFormData ? { headers: { 'Content-Type': undefined } } : {};
  return axiosInstance.put('/api/coach-profile/profile', profileData, config); // Uses the coach-specific route
};

// Adds an item (e.g., certification) to coach profile - Requires auth
export const addProfileItem = (payload) => {
  return axiosInstance.post('/api/coach-profile/add-item', payload); // Uses the coach-specific route
};

// Removes an item from coach profile - Requires auth
export const removeProfileItem = (payload) => {
  return axiosInstance.post('/api/coach-profile/remove-item', payload); // Uses the coach-specific route
};


// --- CLIENT PROFILE API ---

// Updates the logged-in client's profile - Requires auth
export const updateClientProfile = (profileData) => {
  return axiosInstance.put('/api/client-profile/profile', profileData); // Corrected Path
};

// Uploads client profile picture - Requires auth (uses separate instance)
export const uploadClientProfilePicture = (file) => {
  const formData = new FormData();
  formData.append('profilePicture', file);
  const token = localStorage.getItem("accessToken");

  return axios.create({ // Use plain axios instance
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: {
      'Content-Type': 'multipart/form-data',
      'Authorization': token ? `Bearer ${token}` : undefined,
    },
  }).post('/api/client-profile/profile/upload-picture', formData); // Corrected Path
};

// Deletes the logged-in client's profile picture - Requires auth
export const deleteClientProfilePicture = () => {
  return axiosInstance.delete('/api/client-profile/profile/picture'); // Corrected Path
};


// --- SESSION MANAGEMENT API (Coach Perspective) ---
// Creates a new session type - Requires coach auth
export const createSession = async (sessionData) => {
    // Assumes sessions are managed under coach-profile route
    return axiosInstance.post(`/api/coach-profile/sessions`, sessionData);
};

// Updates a session type - Requires coach auth
export const updateSession = async (sessionId, sessionData) => {
    return axiosInstance.put(`/api/coach-profile/sessions/${sessionId}`, sessionData);
};

// Deletes a session type - Requires coach auth
export const deleteSession = async (sessionId) => {
    return axiosInstance.delete(`/api/coach-profile/sessions/${sessionId}`);
};


// --- COACH DASHBOARD API ---
// Fetches clients who booked the coach - Requires coach auth
export const getBookedClients = () => {
    return axiosInstance.get('/api/coach-profile/clients/booked');
};

// Fetches clients following the coach - Requires coach auth
export const getFollowedClients = () => {
    return axiosInstance.get('/api/coach-profile/clients/followed');
};

// Fetches overview stats for the coach dashboard - Requires coach auth
export const getCoachDashboardOverview = () => {
    return axiosInstance.get('/api/coach-profile/dashboard/overview');
};

// Fetches the coach's own bookings list - Requires coach auth
export const getMyCoachBookings = () => {
  return axiosInstance.get("/api/coach-profile/my-bookings");
};


// --- CLIENT DASHBOARD API ---
// Fetches overview stats for the client dashboard - Requires client auth
export const getClientDashboardOverview = () => {
    return axiosInstance.get('/api/client-profile/dashboard/overview'); // Corrected Path, Added Function
};

// Fetches coaches the client is following - Requires client auth
export const getFollowedCoachesClient = () => {
    // Needs matching backend route, e.g., in clientProfile routes
    return axiosInstance.get(`/api/client-profile/following`); // Example Path
};


// --- TESTIMONIALS API ---

// Submits a new testimonial or updates an existing one - Requires client auth
export const submitTestimonial = (coachId, data) => { // coachId is User ID
    return axiosInstance.post(`/api/testimonials/coach/${coachId}`, data); // Matches testimonial route
};

// Checks if client can review *any* session by a coach - Requires client auth
export const checkClientReviewEligibility = (coachId) => { // coachId is User ID
    return axiosInstance.get(`/api/testimonials/eligibility/${coachId}`); // Matches testimonial route
};

// Checks if client can review a *specific* booking - Requires client auth
export const checkBookingReviewEligibility = (bookingId) => {
    return axiosInstance.get(`/api/testimonials/check-booking/${bookingId}`); // Matches testimonial route
};

// Fetches approved testimonials for a specific coach (public)
export const getCoachTestimonials = (coachId) => { // coachId is User ID
    return axiosInstance.get(`/api/testimonials/coach/${coachId}`); // Matches testimonial route (public)
};

// Deletes the logged-in client's own testimonial - Requires client auth
export const deleteMyTestimonial = (testimonialId) => {
    return axiosInstance.delete(`/api/testimonials/${testimonialId}`); // Matches testimonial route
};

// Updates the logged-in client's own testimonial - Requires client auth
export const updateMyTestimonial = (testimonialId, data) => {
    return axiosInstance.put(`/api/testimonials/${testimonialId}`, data); // Matches testimonial route
};