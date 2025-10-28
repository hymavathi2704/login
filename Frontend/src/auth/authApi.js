// Frontend/src/auth/authApi.js

import axios from 'axios';

// Define API_BASE_URL
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:4028";

// Create an Axios instance for API requests
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Crucial for sending/receiving HttpOnly cookies
  headers: {
    "Content-Type": "application/json",
  },
});

// --- Refresh Token Logic Setup ---
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request interceptor to automatically attach the auth token from localStorage
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling, including 401 Unauthorized and token refresh
axiosInstance.interceptors.response.use(
  (response) => response, // Directly return successful responses
  async (error) => {
    const originalRequest = error.config;

    // Check if it's a 401 error and not a retry attempt already
    if (error.response?.status === 401 && !originalRequest._retry) {

      // Prevent refresh loops if the refresh endpoint itself fails
      if (originalRequest.url.includes('/api/auth/refresh-token')) {
          console.error("Refresh token failed or is invalid. Logging out.");
          logoutUser(); // Force logout
          return Promise.reject({ ...error, message: 'Session expired. Please log in again.'});
      }

      if (isRefreshing) {
        // If refresh is already happening, queue the request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers['Authorization'] = 'Bearer ' + token;
          return axiosInstance(originalRequest); // Retry with new token
        }).catch(err => {
            return Promise.reject(err); // Propagate refresh error
        });
      }

      // Mark that we are refreshing and prevent further retries on this specific request
      originalRequest._retry = true;
      isRefreshing = true;

      try {
        console.log("Attempting token refresh...");
        const refreshResponse = await axiosInstance.post('/api/auth/refresh-token'); // Call refresh endpoint (no body needed if using cookie)
        const newAccessToken = refreshResponse.data.accessToken;

        if (!newAccessToken) {
            throw new Error("No access token received from refresh endpoint.");
        }

        console.log("Token refresh successful.");
        localStorage.setItem('accessToken', newAccessToken);
        axiosInstance.defaults.headers.common['Authorization'] = 'Bearer ' + newAccessToken;

        // Process the queue with the new token
        processQueue(null, newAccessToken);

        // Retry the original request with the new token
        originalRequest.headers['Authorization'] = 'Bearer ' + newAccessToken;
        return axiosInstance(originalRequest);

      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError?.response?.data || refreshError.message);
        processQueue(refreshError, null); // Reject queue
        logoutUser(); // Force logout on refresh failure
        return Promise.reject({ ...refreshError, message: 'Your session has expired. Please log in again.' });
      } finally {
        isRefreshing = false;
      }
    }

    // --- Original Error Handling for non-401 errors ---
    const message =
      error?.response?.data?.error ||
      error?.response?.data?.message ||
      error?.message ||
      "Something went wrong!";

    return Promise.reject({ ...error, message });
  }
);


// 1. Function to handle user logout (clears localStorage AND calls backend)
export const logoutUser = async () => {
  try {
      // Call backend logout to clear HttpOnly cookies (use the instance here)
      await axiosInstance.post('/api/auth/logout');
  } catch (error) {
      // FIX: Use console.warn/log and handle the error gracefully as it's expected if token is already expired
      console.warn("Backend logout attempted, might have failed due to expired token (expected):", error.message); 
  } finally {
      // Always clear frontend storage regardless of backend response
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      localStorage.removeItem("currentRole");
      localStorage.removeItem("rememberMe");
      console.log("Frontend storage cleared.");
  }
};

// --- AUTHENTICATION API ---
export const registerUser = (userData) => { return axiosInstance.post("/api/auth/register", userData); };
export const loginUser = (credentials) => { return axiosInstance.post("/api/auth/login", credentials); };
export const getMe = () => { return axiosInstance.get("/api/auth/me"); };
export const refreshToken = () => { return axiosInstance.post('/api/auth/refresh-token'); };

export const createProfile = (profileData) => { return axiosInstance.post('/api/auth/create-profile', profileData); };
export const verifyEmail = (payload) => { return axiosInstance.post(`/api/auth/verify-email`, payload); };
export const resendVerificationEmail = (email) => { return axiosInstance.post("/api/auth/send-verification", { email }); };
export const forgotPassword = (payload) => { return axiosInstance.post('/api/auth/forgot-password', payload); };
export const resetPassword = (data) => { return axiosInstance.post('/api/auth/reset-password', data); };

// --- FILE UPLOADS ---
export const uploadProfilePicture = (file, userType = 'coach') => {
  const formData = new FormData();
  formData.append('profilePicture', file);
  const endpoint = userType === 'coach' ? '/api/coach/profile/upload-picture' : '/api/client/profile/upload-picture';
  return axiosInstance.post(endpoint, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
};

// --- CLIENT DATA ---
export const getMyClientSessions = () => { return axiosInstance.get("/api/bookings/client-sessions"); };
export const updateClientProfile = (profileData) => { return axiosInstance.put('/api/client/profile', profileData); };
export const uploadClientProfilePicture = (file) => { return uploadProfilePicture(file, 'client'); };
export const deleteClientProfilePicture = () => { return axiosInstance.delete('/api/client/profile/picture'); };


// --- COACH DATA ---
export const getMyCoachBookings = () => { return axiosInstance.get("/api/coach/my-bookings"); };
export const getCoachProfile = () => { return axiosInstance.get("/api/coach/profile"); };
export const updateUserProfile = (profileData) => {
    const isFormData = profileData instanceof FormData;
    const config = isFormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};
    return axiosInstance.put('/api/coach/profile', profileData, config);
};
export const addProfileItem = (payload) => { return axiosInstance.post('/api/coach/profile/add-item', payload); };
export const removeProfileItem = (payload) => { return axiosInstance.post('/api/coach/profile/remove-item', payload); };
export const createSession = async (sessionData) => { return axiosInstance.post(`/api/coach/sessions`, sessionData); };
export const updateSession = async (sessionId, sessionData) => { return axiosInstance.put(`/api/coach/sessions/${sessionId}`, sessionData); };
export const deleteSession = async (sessionId) => { return axiosInstance.delete(`/api/coach/sessions/${sessionId}`); };
export const getBookedClients = () => { return axiosInstance.get('/api/coach/clients/booked'); };
export const getFollowedClients = () => { return axiosInstance.get('/api/coach/clients/followed'); };
export const getCoachDashboardOverview = () => { return axiosInstance.get('/api/coach/dashboard/overview'); };
export const bookSession = async (sessionId) => { return axiosInstance.post(`/api/coach/public/${sessionId}/book`); };
export const getClientDashboardOverview = () => { return axiosInstance.get('/api/client/dashboard/overview'); }; // Route might be missing on backend


// --- DISCOVERY & TESTIMONIALS ---
export const getAllCoaches = (searchTerm = '', audience = '') => { 
    return axiosInstance.get(`/api/profiles/coaches`, { params: { search: searchTerm, audience: audience } });
};
export const getCoachById = (coachId) => { return axiosInstance.get(`/api/profiles/coach/${coachId}`); };
export const getFollowedCoachesClient = () => { return axiosInstance.get(`/api/profiles/followed`); };
export const submitTestimonial = (coachId, data) => { return axiosInstance.post(`/api/profiles/public/${coachId}/testimonials`, data); };
export const checkClientReviewEligibility = (coachId) => { return axiosInstance.get(`/api/profiles/public/${coachId}/review-eligibility`); };
export const checkBookingReviewEligibility = (bookingId) => { return axiosInstance.get(`/api/testimonials/check-booking/${bookingId}`); };
export const getCoachTestimonials = (coachId) => { return axiosInstance.get(`/api/testimonials/coach/${coachId}`); };
export const deleteMyTestimonial = (testimonialId) => { return axiosInstance.delete(`/api/testimonials/${testimonialId}`); };
export const updateMyTestimonial = (testimonialId, data) => { return axiosInstance.put(`/api/testimonials/${testimonialId}`, data); };
export const followCoach = (coachId) => { return axiosInstance.post(`/api/profiles/public/${coachId}/follow`); };
export const unfollowCoach = (coachId) => { return axiosInstance.delete(`/api/profiles/public/${coachId}/follow`); };
export const getFollowStatus = (coachId) => { return axiosInstance.get(`/api/profiles/public/${coachId}/follow-status`); };