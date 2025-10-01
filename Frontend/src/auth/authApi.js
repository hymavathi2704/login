import axios from "axios";

// Load backend URL from .env (fallback to localhost)
const API = import.meta.env.VITE_BACKEND_URL || "http://localhost:4028";

// Create an Axios instance for API requests
const axiosInstance = axios.create({
  baseURL: API,
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

export const updateUserProfile = (profileData) => {
  return axiosInstance.put('/api/auth/profile', profileData);
};

export const logoutUser = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("user");
  localStorage.removeItem("rememberMe");
};


// --- EVENTS & BOOKINGS API ---

// Fetch all published events for clients
export const getEvents = () => {
  return axiosInstance.get("/api/events");
};

// Fetch events for the logged-in coach
export const getMyEvents = () => {
  return axiosInstance.get("/api/events/my-events");
};

// Create a new event
export const createEvent = (eventData) => {
  return axiosInstance.post("/api/events", eventData);
};

// Update an event by its ID
export const updateEvent = (eventId, eventData) => {
  return axiosInstance.put(`/api/events/${eventId}`, eventData);
};

// Delete an event by its ID
export const deleteEvent = (eventId) => {
  return axiosInstance.delete(`/api/events/${eventId}`);
};

// Book an event
export const bookEvent = (eventId) => {
  return axiosInstance.post(`/api/events/${eventId}/book`);
};

// Fetch bookings for the logged-in coach
export const getMyBookings = () => {
  return axiosInstance.get("/api/events/my-bookings");
};

// Get all coaches for clients to view
export const getAllCoaches = () => {
  return axiosInstance.get('/api/profiles/coaches');
};

// Subscribe to a coach
export const subscribeToCoach = (coachId) => {
  return axiosInstance.post(`/api/profiles/coaches/${coachId}/subscribe`);
};

// Get a coach's list of subscribed clients
export const getMySubscribedClients = () => {
  return axiosInstance.get('/api/profiles/my-clients');
};