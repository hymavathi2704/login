import React from "react";
import { Routes as RouterRoutes, Route } from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";
import NotFound from "pages/NotFound";
import Unauthorized from "./pages/Unauthorized";
import UserLogin from './pages/user-login';
import EmailVerification from './pages/email-verification';
import UserRegistration from './pages/user-registration';
import PasswordResetPage from './pages/password-reset';
import Homepage from './pages/homepage';
import PrivateRoute from "./auth/PrivateRoute";
import Auth0Callback from "./auth/Auth0Callback";
import RoleSelection from "./pages/role-selection";

// --- UPDATED IMPORTS ---
import DashboardLayout from './pages/dashboards/shared/DashboardLayout';
import AccountSettings from './pages/dashboards/shared/AccountSettings';
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
        <Route path="/user-login" element={<UserLogin />} />
        <Route path="/user-registration" element={<UserRegistration />} />
        <Route path="/email-verification" element={<EmailVerification />} />
        <Route path="/password-reset" element={<PasswordResetPage />} />
        <Route path="/role-selection" element={<RoleSelection />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="/auth0-callback" element={<Auth0Callback />} />

        {/* --- NEW: Shared, Protected Dashboard Layout --- */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute allowedRoles={['client', 'coach', 'admin']}>
              <DashboardLayout />
            </PrivateRoute>
          }
        >
          {/* Nested routes will render inside the DashboardLayout's <Outlet /> */}
          <Route path="client" element={<ClientDashboard />} />
          <Route path="coach" element={<CoachDashboard />} />
          <Route path="admin" element={<AdminDashboard />} />
          <Route path="settings" element={<AccountSettings />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<NotFound />} />
      </RouterRoutes>
    </ErrorBoundary>
  );
};

export default Routes;