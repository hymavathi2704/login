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

// --- Refresh Token Logic ---
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
      if (originalRequest.url === '/api/auth/refresh-token') {
          console.error("Refresh token failed or is invalid. Logging out.");
          logoutUser(); // Force logout
          // Optionally redirect: window.location.href = '/login';
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
        // Optionally redirect: window.location.href = '/login';
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


// --- AUTHENTICATION API ---
export const registerUser = (userData) => {
  return axiosInstance.post("/api/auth/register", userData);
};

export const loginUser = (credentials) => {
  // Login response now includes the token in the body AND sets HttpOnly cookies
  return axiosInstance.post("/api/auth/login", credentials);
};

export const getMe = () => {
  return axiosInstance.get("/api/auth/me");
};

// --- NEW REFRESH TOKEN FUNCTION ---
export const refreshToken = () => {
    // This is called by the interceptor.
    // Ensure the '/api/auth/refresh-token' endpoint is hit by the instance
    // so it sends the HttpOnly cookie automatically.
    return axiosInstance.post('/api/auth/refresh-token');
};
// ---------------------------------

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
// --- THIS REMAINS LARGELY THE SAME, BUT RELIES ON THE INTERCEPTOR OF axiosInstance ---
// --- It might be slightly cleaner to use axiosInstance directly if your backend handles ---
// --- Content-Type correctly for mixed FormData/JSON requests, but this separate ---
// --- instance method is safer. ---
export const uploadProfilePicture = (file, userType = 'coach') => { // Added userType param
  const formData = new FormData();
  formData.append('profilePicture', file);
  const token = localStorage.getItem("accessToken");

  // Determine the correct endpoint based on user type
  const endpoint = userType === 'coach'
    ? '/api/coach/profile/upload-picture' // Updated coach endpoint
    : '/api/client/profile/upload-picture'; // Client endpoint

  // Use axiosInstance - the interceptor will handle token refresh if needed
  return axiosInstance.post(endpoint, formData, {
      headers: {
          'Content-Type': 'multipart/form-data', // Let browser set boundary
      }
  });
};

// --- Function to handle user logout (clears localStorage AND calls backend) ---
export const logoutUser = async () => {
  try {
      // Call backend logout to invalidate refresh token (if backend supports it)
      // and clear HttpOnly cookies server-side.
      await axiosInstance.post('/api/auth/logout');
  } catch (error) {
      console.error("Backend logout failed (might be expected if token already invalid):", error.message);
      // Proceed with frontend cleanup even if backend call fails
  } finally {
      // Always clear frontend storage
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user"); // If you store user object
      localStorage.removeItem("currentRole"); // Clear role
      localStorage.removeItem("rememberMe");
      // Redirect or update app state after logout - handled in AuthContext
      console.log("Frontend logout completed.");
  }
};
// --- Client's booked sessions ---
export const getMyClientSessions = () => {
  return axiosInstance.get("/api/bookings/client-sessions");
};

// --- Coach's bookings (clients who booked them) ---
export const getMyCoachBookings = () => {
    // Corrected endpoint based on coachProfile.js routes
    return axiosInstance.get("/api/coach/my-bookings");
};


// --- PROFILES & COACH DISCOVERY API ---

// Fetch list of all coaches
export const getAllCoaches = (searchTerm = '', audience = '') => {
    // Corrected endpoint based on fetchCoachProfiles.js
    return axiosInstance.get(`/api/profiles/coaches`, {
    params: {
      search: searchTerm,
      audience: audience,
    }
  });
};

// Fetch details for a specific coach
export const getCoachById = (coachId) => {
    // Corrected endpoint based on fetchCoachProfiles.js
    return axiosInstance.get(`/api/profiles/coach/${coachId}`);
};

// Add item to coach profile
export const addProfileItem = (payload) => {
    // Corrected endpoint based on coachProfile.js routes
    return axiosInstance.post('/api/coach/profile/add-item', payload);
};

// Remove item from coach profile
export const removeProfileItem = (payload) => {
    // Corrected endpoint based on coachProfile.js routes
    return axiosInstance.post('/api/coach/profile/remove-item', payload);
};

// --- Update coach profile data ---
// Now uses FormData compatible setup
export const updateUserProfile = (profileData) => {
    const isFormData = profileData instanceof FormData;
    const config = isFormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};
    // Corrected endpoint based on coachProfile.js routes
    return axiosInstance.put('/api/coach/profile', profileData, config);
};


// Fetch the logged-in coach's own profile
export const getCoachProfile = () => {
    // Corrected endpoint based on coachProfile.js routes
    return axiosInstance.get("/api/coach/profile");
};

// --- CLIENT PROFILES API ---

// Update client profile data
export const updateClientProfile = (profileData) => {
    // Corrected endpoint based on clientProfile.js routes
    return axiosInstance.put('/api/client/profile', profileData);
};

// Upload client profile picture
export const uploadClientProfilePicture = (file) => {
    // Uses the generalized uploadProfilePicture function with type 'client'
    return uploadProfilePicture(file, 'client');
};

// Delete client profile picture
export const deleteClientProfilePicture = () => {
    // Corrected endpoint based on clientProfile.js routes
    return axiosInstance.delete('/api/client/profile/picture');
};


// =========================================================
// SESSION MANAGEMENT FUNCTIONS (Coach perspective)
// =========================================================
export const createSession = async (sessionData) => {
    // Corrected endpoint based on coachProfile.js routes
    return axiosInstance.post(`/api/coach/sessions`, sessionData);
};
export const updateSession = async (sessionId, sessionData) => {
    // Corrected endpoint based on coachProfile.js routes
    return axiosInstance.put(`/api/coach/sessions/${sessionId}`, sessionData);
};
export const deleteSession = async (sessionId) => {
    // Corrected endpoint based on coachProfile.js routes
    return axiosInstance.delete(`/api/coach/sessions/${sessionId}`);
};

// =========================================================
// BOOKING FUNCTION (Client perspective)
// =========================================================
export const bookSession = async (sessionId) => {
    // Use the protected endpoint from coachProfile.js
    return axiosInstance.post(`/api/coach/public/${sessionId}/book`);
};


// --- COACH DASHBOARD CLIENT MANAGEMENT API ---
export const getBookedClients = () => {
    // Corrected endpoint based on coachProfile.js routes
    return axiosInstance.get('/api/coach/clients/booked');
};
export const getFollowedClients = () => {
    // Corrected endpoint based on coachProfile.js routes
    return axiosInstance.get('/api/coach/clients/followed');
};

// --- CLIENT DASHBOARD: FOLLOWING ---
export const getFollowedCoachesClient = () => {
    // Corrected endpoint based on fetchCoachProfiles.js
    // Note: This needs the corresponding backend route GET /api/profiles/followed
    return axiosInstance.get(`/api/profiles/followed`);
};

// --- DASHBOARD OVERVIEWS ---
export const getCoachDashboardOverview = () => {
    // Corrected endpoint based on coachProfile.js routes
    return axiosInstance.get('/api/coach/dashboard/overview');
};
export const getClientDashboardOverview = () => {
    // Needs backend route, e.g., GET /api/client/dashboard/overview
    // This assumes the backend route is created.
    return axiosInstance.get('/api/client/dashboard/overview');
}


// --- TESTIMONIALS API ---
export const submitTestimonial = (coachId, data) => {
    // Corrected endpoint based on fetchCoachProfiles.js
    return axiosInstance.post(`/api/profiles/public/${coachId}/testimonials`, data);
};
export const checkClientReviewEligibility = (coachId) => {
    // Corrected endpoint based on fetchCoachProfiles.js
    return axiosInstance.get(`/api/profiles/public/${coachId}/review-eligibility`);
};
export const checkBookingReviewEligibility = (bookingId) => {
    // Corrected endpoint based on testimonial.js routes
    return axiosInstance.get(`/api/testimonials/check-booking/${bookingId}`);
};
export const getCoachTestimonials = (coachId) => {
    // Corrected endpoint based on testimonial.js routes
    return axiosInstance.get(`/api/testimonials/coach/${coachId}`);
}
export const deleteMyTestimonial = (testimonialId) => {
    // Corrected endpoint based on testimonial.js routes
    return axiosInstance.delete(`/api/testimonials/${testimonialId}`);
}
export const updateMyTestimonial = (testimonialId, data) => {
    // Corrected endpoint based on testimonial.js routes
    return axiosInstance.put(`/api/testimonials/${testimonialId}`, data);
}

// --- FOLLOW/UNFOLLOW API (Ensure endpoints match backend) ---
export const followCoach = (coachId) => {
    // Corrected endpoint based on fetchCoachProfiles.js
    return axiosInstance.post(`/api/profiles/public/${coachId}/follow`);
};

export const unfollowCoach = (coachId) => {
    // Corrected endpoint based on fetchCoachProfiles.js
    return axiosInstance.delete(`/api/profiles/public/${coachId}/follow`);
};

export const getFollowStatus = (coachId) => {
    // Corrected endpoint based on fetchCoachProfiles.js
    return axiosInstance.get(`/api/profiles/public/${coachId}/follow-status`);
};
