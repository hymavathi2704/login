// src/Routes.jsx
import React from "react";
import { Routes as RouterRoutes, Route, Outlet } from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";
import NotFound from "pages/NotFound";
import UserLogin from "./pages/user-login";
import EmailVerification from "./pages/email-verification";
import UserRegistration from "./pages/user-registration";
import PasswordResetPage from "./pages/password-reset";
import Homepage from "./pages/homepage";
import PrivateRoute from "./auth/PrivateRoute";
import Auth0Callback from "./auth/Auth0Callback";
import Unauthorized from "./pages/Unauthorized";

// ✅ Dashboard imports
import ClientDashboard from "./pages/dashboards/client-dashboard";
import CoachDashboard from "./pages/dashboards/coach-dashboard";
import AdminDashboard from "./pages/dashboards/admin-dashboard";
// ✅ CoachPublicProfile from the shared folder
import CoachPublicProfile from "./pages/dashboards/shared/coach-public-profile";

// 🛑 NEW IMPORT: Create this file for the payment redirect landing page
import BookingConfirmation from "./pages/BookingConfirmation"; 

const Routes = () => {
  return (
    <ErrorBoundary>
      <ScrollToTop />
      <RouterRoutes>
        {/* Public Routes */}
        <Route path="/" element={<Homepage />} />
        <Route path="/login" element={<UserLogin />} />
        <Route path="/register" element={<UserRegistration />} />
        <Route path="/email-verification" element={<EmailVerification />} />
        
        {/* ✅ Password Reset Routes */}
        <Route path="/password-reset" element={<PasswordResetPage />} />
        <Route path="/password-reset/:token" element={<PasswordResetPage />} />
        
        <Route path="/auth0-callback" element={<Auth0Callback />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* ✅ ADDED PUBLIC ROUTE: Coach Public Profile */}
        <Route path="/profiles/:id" element={<CoachPublicProfile />} />

        {/* 🛑 NEW PUBLIC ROUTE FOR PAYMENT REDIRECT */}
        {/* This path must match the RETURN_URL configured in your Backend/.env file */}
        <Route path="/booking-confirmed" element={<BookingConfirmation />} />
        
        {/* 🔑 REMOVED: Onboarding route for WelcomeSetup page */}

        {/* ✅ Protected Dashboard Routes */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute allowedRoles={["client", "coach", "admin"]}>
              <Outlet />
            </PrivateRoute>
          }
        >
            {/* Client Dashboard Routes - FIX: Use wildcard to capture all tabs */}
            <Route path="client" element={<ClientDashboard />} />
            <Route path="client/*" element={<ClientDashboard />} /> {/* <-- FIX */}

            {/* Coach Dashboard Routes - FIX: Use wildcard to capture all tabs */}
            <Route path="coach" element={<CoachDashboard />} />
            <Route path="coach/*" element={<CoachDashboard />} /> {/* <-- FIX */}

            {/* Admin Dashboard Routes - FIX: Use wildcard to capture all tabs */}
            <Route path="admin" element={<AdminDashboard />} />
            <Route path="admin/*" element={<AdminDashboard />} /> {/* <-- FIX */}
        </Route>

        {/* Catch-all route */}
        <Route path="*" element={<NotFound />} />
      </RouterRoutes>
    </ErrorBoundary>
  );
};

export default Routes;