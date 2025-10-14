// In Frontend/src/auth/Auth0Callback.jsx
import React, { useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import axios from 'axios';
import Icon from '../components/AppIcon';

const Auth0Callback = () => {
  // ⚠️ TEMPORARILY DISABLED Auth0 Social Login
  /*
  const { isAuthenticated, getAccessTokenSilently } = useAuth0();
  // FIX 1: Correctly de-structure the 'login' function from AuthContext
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const processAuth0Login = async () => {
      if (!isAuthenticated) return;

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

        // Exchange the Auth0 token for your backend token
        const response = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/auth/social-login`,
          {},
          {
            headers: {
              Authorization: `Bearer ${auth0Token}`,
            },
          }
        );

        const backendToken = response?.data?.accessToken;
        const backendUser = response?.data?.user;

        if (backendToken && backendUser) {
          // FIX 2: Use the unified login function from AuthContext. 
          // This function handles saving token, setting user, checking roles, and redirecting 
          // (including the redirection to /welcome-setup for users without a role).
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
    // FIX 3: Updated dependency array
  }, [isAuthenticated, getAccessTokenSilently, login, navigate]); 
  */

  // ADDED: Immediate redirect when flow is disabled
  const navigate = useNavigate();
  useEffect(() => {
    navigate('/login', { replace: true });
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center p-8">
        <div className="animate-spin mb-4">
          <Icon name="Loader2" size={32} className="text-primary" />
        </div>
        <h1 className="text-xl font-medium text-foreground">
          Redirecting...
        </h1>
        <p className="text-sm text-muted-foreground mt-2">
          Social login is temporarily disabled.
        </p>
      </div>
    </div>
  );
};

export default Auth0Callback;