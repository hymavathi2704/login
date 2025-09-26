import React from "react";
import { Routes as RouterRoutes, Route, Outlet } from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";
import NotFound from "pages/NotFound";
import UserLogin from './pages/user-login';
import EmailVerification from './pages/email-verification';
import UserRegistration from './pages/user-registration';
import PasswordResetPage from './pages/password-reset';
import Homepage from './pages/homepage';
import PrivateRoute from "./auth/PrivateRoute";
import Auth0Callback from "./auth/Auth0Callback";

// Dashboard imports
import ClientDashboard from './pages/dashboards/client-dashboard';
import CoachDashboard from './pages/dashboards/coach-dashboard';
import AdminDashboard from './pages/dashboards/admin-dashboard';

const Routes = () => {
  return (
    <ErrorBoundary>
      <ScrollToTop />
      <RouterRoutes>
        {/* Public Routes */}
        <Route path="/" element={<Homepage />} />
        <Route path="/login" element={<UserLogin />} /> {/* Updated from /user-login for simplicity */}
        <Route path="/register" element={<UserRegistration />} /> {/* Updated from /user-registration */}
        <Route path="/email-verification" element={<EmailVerification />} />
        <Route path="/password-reset" element={<PasswordResetPage />} />
        {/* REMOVED: The /role-selection route is no longer needed */}
        <Route path="/auth0-callback" element={<Auth0Callback />} />

        {/* Protected Dashboard Routes */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute allowedRoles={['client', 'coach', 'admin']}>
              <Outlet />
            </PrivateRoute>
          }
        >
          <Route path="client" element={<ClientDashboard />} />
          <Route path="coach" element={<CoachDashboard />} />
          <Route path="admin" element={<AdminDashboard />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<NotFound />} />
      </RouterRoutes>
    </ErrorBoundary>
  );
};

export default Routes;