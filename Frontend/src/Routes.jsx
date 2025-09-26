// src/Routes.jsx

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
import WelcomeSetup from './pages/welcome-setup'; // ✅ Import the new page
import Unauthorized from "./pages/Unauthorized"; // ✅ Import the Unauthorized page

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
        <Route path="/login" element={<UserLogin />} />
        <Route path="/register" element={<UserRegistration />} />
        <Route path="/email-verification" element={<EmailVerification />} />
        <Route path="/password-reset" element={<PasswordResetPage />} />
        <Route path="/auth0-callback" element={<Auth0Callback />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* ✅ Onboarding route for new users */}
        <Route
          path="/welcome-setup"
          element={
            <PrivateRoute allowedRoles={[]}> {/* Empty array means just needs to be logged in */}
              <WelcomeSetup />
            </PrivateRoute>
          }
        />

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