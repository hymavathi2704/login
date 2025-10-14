// Frontend/src/auth/Auth0Callback.jsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import axios from 'axios';
import Icon from '../components/AppIcon';

// Toggle Auth0 based on environment variable
const USE_AUTH0 = import.meta.env.VITE_USE_AUTH0 === 'true';

let Auth0Callback;

if (USE_AUTH0) {
  // Auth0 login (for localhost or domain with HTTPS)
  const { useAuth0 } = require('@auth0/auth0-react');

  Auth0Callback = () => {
    const { isAuthenticated, getAccessTokenSilently } = useAuth0();
    const { login } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
      if (!isAuthenticated) return;

      const processAuth0Login = async () => {
        try {
          const auth0Token = await getAccessTokenSilently({
            authorizationParams: {
              audience: import.meta.env.VITE_AUTH0_AUDIENCE || "https://api.coachflow.com",
            },
          });

          if (!auth0Token) {
            console.error("No Auth0 token received.");
            return navigate('/user-login?error=no_token', { replace: true });
          }

          // Exchange the Auth0 token for backend token
          const response = await axios.post(
            `${import.meta.env.VITE_BACKEND_URL}/api/auth/social-login`,
            {},
            { headers: { Authorization: `Bearer ${auth0Token}` } }
          );

          const backendToken = response?.data?.accessToken;
          const backendUser = response?.data?.user;

          if (backendToken && backendUser) {
            login({ accessToken: backendToken, user: backendUser });
          } else {
            console.error("Missing token or user data from backend.");
            navigate('/user-login?error=backend_failed', { replace: true });
          }
        } catch (error) {
          console.error("Error processing Auth0 callback:", error);
          navigate('/user-login?error=social_login_failed', { replace: true });
        }
      };

      processAuth0Login();
    }, [isAuthenticated, getAccessTokenSilently, login, navigate]);

    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center p-8">
          <div className="animate-spin mb-4">
            <Icon name="Loader2" size={32} className="text-primary" />
          </div>
          <h1 className="text-xl font-medium text-foreground">
            Completing your login...
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            Please wait while we set up your account.
          </p>
        </div>
      </div>
    );
  };
} else {
  // Mock login for EC2 without HTTPS
  Auth0Callback = () => {
    const { login } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
      login({
        accessToken: "test-token",
        user: { id: "test-user", name: "Test User", roles: [] },
      });

      // Optionally redirect to home after mock login
      navigate('/', { replace: true });
    }, [login, navigate]);

    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center p-8">
          <div className="animate-spin mb-4">
            <Icon name="Loader2" size={32} className="text-primary" />
          </div>
          <h1 className="text-xl font-medium text-foreground">
            Logging in (mock)...
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            Please wait while we set up your account.
          </p>
        </div>
      </div>
    );
  };
}

export default Auth0Callback;
