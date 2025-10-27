// Frontend/src/auth/authApi.js

import axios from 'axios';

// Define API_BASE_URL
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:4028";

// Create an Axios instance for API requests
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Send cookies with requests
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to automatically attach the auth token from localStorage
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling, including 401 Unauthorized
axiosInstance.interceptors.response.use(
  (response) => response, // Directly return successful responses
  (error) => {
    // Check if the error is due to a 401 Unauthorized response
    if (error.response && error.response.status === 401) {
      // 🛑 UNCOMMENTED: Immediately clear user/token data on 401 error
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      // Optional: Redirect to login page or trigger a logout event
      // This helps prevent further failed requests with the expired token.
      // Example: window.location.href = '/login';
      // Consider using a more robust method like a custom event or context update
      // if directly manipulating window.location is too abrupt.
      console.warn("Unauthorized (401) detected. Token cleared."); // Log for debugging
    }

    // Extract a user-friendly error message
    const message =
      error?.response?.data?.error ||   // Backend's custom error message
      error?.response?.data?.message || // Alternative backend message field
      error?.message ||                 // Axios's generic error message
      "Something went wrong!";          // Fallback message

    // Reject the promise with the error object enhanced with the message
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

// Function for uploading profile pictures (uses a separate Axios instance for FormData)
export const uploadProfilePicture = (file) => {
  const formData = new FormData();
  formData.append('profilePicture', file);
  const token = localStorage.getItem("accessToken"); // Get token manually

  // Create a temporary Axios instance configured for multipart/form-data
  return axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: {
      'Content-Type': 'multipart/form-data', // Important for file uploads
      'Authorization': token ? `Bearer ${token}` : undefined, // Attach token
    },
  }).post('/api/coach-profile/upload-picture', formData); // Ensure endpoint matches backend route
};

// Function to handle user logout (clears localStorage)
export const logoutUser = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("user");
  localStorage.removeItem("rememberMe"); // Clear rememberMe flag if used
  // Optionally: redirect or update app state after logout
};

// Fetch client's booked sessions
export const getMyClientSessions = () => {
  return axiosInstance.get("/api/bookings/client-sessions");
};

// Fetch coach's bookings (clients who booked them)
export const getMyCoachBookings = () => {
  return axiosInstance.get("/api/coach-profile/my-bookings");
};


// --- PROFILES & COACH DISCOVERY API ---

// Fetch list of all coaches (public, with optional search/filter)
export const getAllCoaches = (searchTerm = '', audience = '') => {
  return axiosInstance.get(`/api/coach-profile/coaches`, { // Match backend route
    params: {
      search: searchTerm,
      audience: audience,
    }
  });
};

// Fetch details for a specific coach (public)
export const getCoachById = (coachId) => {
  // Assuming coachId is the User ID, adjust if it's CoachProfile ID
  return axiosInstance.get(`/api/coach-profile/coach/${coachId}`); // Match backend route
};

// Add an item to coach profile (e.g., certification, education) - Requires auth
export const addProfileItem = (payload) => {
  return axiosInstance.post('/api/coach-profile/add-item', payload); // Match backend route
};

// Remove an item from coach profile - Requires auth
export const removeProfileItem = (payload) => {
  return axiosInstance.post('/api/coach-profile/remove-item', payload); // Match backend route
};

// Update coach profile data - Requires auth
export const updateUserProfile = (profileData) => {
  // Check if data is FormData (for file uploads alongside other data)
  const isFormData = profileData instanceof FormData;
  const config = {};
  if (isFormData) {
    // Let Axios set Content-Type automatically for FormData
    config.headers = { 'Content-Type': undefined };
  }
  return axiosInstance.put('/api/coach-profile/profile', profileData, config); // Match backend route
};

// Fetch the logged-in coach's own profile - Requires auth
export const getCoachProfile = () => {
  return axiosInstance.get("/api/coach-profile/profile"); // Match backend route
};

// --- CLIENT PROFILES API ---

// Update client profile data - Requires auth
export const updateClientProfile = (profileData) => {
  return axiosInstance.put('/api/client-profile/profile', profileData); // Match backend route
};

// Upload client profile picture - Requires auth (uses separate instance for FormData)
export const uploadClientProfilePicture = (file) => {
  const formData = new FormData();
  formData.append('profilePicture', file);
  const token = localStorage.getItem("accessToken");

  return axios.create({ // Use plain axios.create
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': token ? `Bearer ${token}` : undefined,
    },
  }).post('/api/client-profile/upload-picture', formData); // Match backend route
};

// Delete client profile picture - Requires auth
export const deleteClientProfilePicture = () => {
    return axiosInstance.delete('/api/client-profile/picture'); // Match backend route
};


// =========================================================
// SESSION MANAGEMENT FUNCTIONS (Coach perspective)
// =========================================================
// Create a new session type - Requires coach auth
export const createSession = async (sessionData) => {
    return axiosInstance.post(`/api/coach-profile/sessions`, sessionData); // Match backend route
};

// Update an existing session type - Requires coach auth
export const updateSession = async (sessionId, sessionData) => {
    return axiosInstance.put(`/api/coach-profile/sessions/${sessionId}`, sessionData); // Match backend route
};

// Delete a session type - Requires coach auth
export const deleteSession = async (sessionId) => {
    return axiosInstance.delete(`/api/coach-profile/sessions/${sessionId}`); // Match backend route
};

// =========================================================
// BOOKING FUNCTION (Client perspective)
// =========================================================
// Client books a specific session - Requires client auth
export const bookSession = async (sessionId) => {
    // Assuming this endpoint handles booking creation based on session ID
    return axiosInstance.post(`/api/bookings/book/${sessionId}`); // Example route, adjust to match backend
    // Or if using the old public route (less ideal if auth is needed):
    // return axiosInstance.post(`/api/coach-profile/public/${sessionId}/book`);
};


// --- COACH DASHBOARD CLIENT MANAGEMENT API ---
// Get clients who have booked sessions with the coach - Requires coach auth
export const getBookedClients = () => {
    return axiosInstance.get('/api/coach-profile/clients/booked'); // Match backend route
};

// Get clients who follow the coach - Requires coach auth
export const getFollowedClients = () => {
    return axiosInstance.get('/api/coach-profile/clients/followed'); // Match backend route
};

// --- CLIENT DASHBOARD: FOLLOWING ---
// Client gets list of coaches they follow - Requires client auth
export const getFollowedCoachesClient = () => {
    // Needs a dedicated backend route, e.g., GET /api/client-profile/following
    return axiosInstance.get(`/api/client-profile/following`); // Example route, adjust to match backend
};

// --- DASHBOARD OVERVIEWS ---
// Fetch overview stats for coach dashboard - Requires coach auth
export const getCoachDashboardOverview = () => {
    return axiosInstance.get('/api/coach-profile/dashboard/overview'); // Match backend route
};
// Fetch overview stats for client dashboard - Requires client auth
export const getClientDashboardOverview = () => {
    // Needs a dedicated backend route, e.g., GET /api/client-profile/dashboard/overview
    return axiosInstance.get('/api/client-profile/dashboard/overview'); // Example route, adjust to match backend
}


// --- TESTIMONIALS API ---

// Client submits a testimonial for a coach - Requires client auth
export const submitTestimonial = (coachId, data) => { // coachId is User ID
    return axiosInstance.post(`/api/testimonials/coach/${coachId}`, data); // Matches new route
};

// Client checks general eligibility to review ANY session by a coach - Requires client auth
export const checkClientReviewEligibility = (coachId) => { // coachId is User ID
    // Calls GET /api/testimonials/eligibility/:coachId
    return axiosInstance.get(`/api/testimonials/eligibility/${coachId}`); // Matches new route
};

// Client checks eligibility to review a SPECIFIC booking - Requires client auth
export const checkBookingReviewEligibility = (bookingId) => {
    // Calls GET /api/testimonials/check-booking/:bookingId
    return axiosInstance.get(`/api/testimonials/check-booking/${bookingId}`); // Matches new route
};

// Fetch approved testimonials for a specific coach (public)
export const getCoachTestimonials = (coachId) => { // coachId is User ID
    // Calls GET /api/testimonials/coach/:coachId
    return axiosInstance.get(`/api/testimonials/coach/${coachId}`); // Matches new route (public endpoint)
}

// Client deletes their own testimonial - Requires client auth
export const deleteMyTestimonial = (testimonialId) => {
    // Calls DELETE /api/testimonials/:testimonialId
    return axiosInstance.delete(`/api/testimonials/${testimonialId}`); // Matches new route
}

// Client updates their own testimonial - Requires client auth
export const updateMyTestimonial = (testimonialId, data) => {
     // Calls PUT /api/testimonials/:testimonialId
    return axiosInstance.put(`/api/testimonials/${testimonialId}`, data); // Matches new route
}