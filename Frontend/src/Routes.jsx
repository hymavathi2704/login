import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";
import NotFound from "pages/NotFound";
import UserLogin from './pages/user-login';
import EmailVerification from './pages/email-verification';
import UserProfileManagement from './pages/user-profile-management';
import UserRegistration from './pages/user-registration';
import PasswordResetPage from './pages/password-reset';
import Homepage from './pages/homepage';
import PrivateRoute from "./auth/PrivateRoute";

const Routes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <ScrollToTop />
        <RouterRoutes>
          {/* Public routes */}
          <Route path="/" element={<EmailVerification />} />
          <Route path="/user-login" element={<UserLogin />} />
          <Route path="/email-verification" element={<EmailVerification />} />
          <Route path="/user-registration" element={<UserRegistration />} />
          <Route path="/password-reset" element={<PasswordResetPage />} />
          <Route path="/password-reset/:token" element={<PasswordResetPage />} /> {/* Add this line */}

          {/* Protected routes */}
          <Route
            path="/homepage"
            element={
              <PrivateRoute>
                <Homepage />
              </PrivateRoute>
            }
          />
          <Route
            path="/user-profile-management"
            element={
              <PrivateRoute>
                <UserProfileManagement />
              </PrivateRoute>
            }
          />

          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </RouterRoutes>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;