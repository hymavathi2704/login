// Frontend/src/Routes.jsx
import React from "react";
import { Routes as RouterRoutes, Route } from "react-router-dom";
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
import RoleSelection from "./pages/role-selection";

// Import Dashboards
import ClientDashboard from './pages/dashboards/client-dashboard';
import CoachDashboard from './pages/dashboards/coach-dashboard';
import AdminDashboard from './pages/dashboards/admin-dashboard';

const Routes = () => {
  return (
    <ErrorBoundary>
      <ScrollToTop />
      <RouterRoutes>
        {/* Public routes */}
        <Route path="/" element={<Homepage />} />
        <Route path="/auth0-callback" element={<Auth0Callback />} />
        <Route path="/user-login" element={<UserLogin />} />
        <Route path="/email-verification" element={<EmailVerification />} />
        <Route path="/user-registration" element={<UserRegistration />} />
        <Route path="/password-reset" element={<PasswordResetPage />} />
        <Route path="/password-reset/:token" element={<PasswordResetPage />} />
        <Route path="/role-selection" element={<RoleSelection />} />

        {/* Dashboard Routes - Protected */}
        <Route
          path="/dashboard/client"
          element={
            <PrivateRoute>
              <ClientDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboard/coach"
          element={
            <PrivateRoute>
              <CoachDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboard/admin"
          element={
            <PrivateRoute>
              <AdminDashboard />
            </PrivateRoute>
          }
        />

        {/* Legacy Protected route (Optional) */}
        <Route
          path="/homepage"
          element={
            <PrivateRoute>
              <Homepage />
            </PrivateRoute>
          }
        />

        {/* Catch-all */}
        <Route path="*" element={<NotFound />} />
      </RouterRoutes>
    </ErrorBoundary>
  );
};

export default Routes;
