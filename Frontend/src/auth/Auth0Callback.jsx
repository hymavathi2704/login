import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import axios from 'axios';
import Icon from '../components/AppIcon';

// Check if Auth0 should be used
const USE_AUTH0 = import.meta.env.VITE_USE_AUTH0 === 'true';

let Auth0Callback = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!USE_AUTH0) {
      // Mock login (for EC2 IP / no HTTPS)
      login({
        accessToken: "test-token",
        user: { id: "test-user", name: "Test User", roles: [] },
      });
      return;
    }

    // Auth0 login (for localhost or domain with HTTPS)
    const { useAuth0 } = require('@auth0/auth0-react');
    const { isAuthenticated, getAccessTokenSilently } = useAuth0();

    const processAuth0Login = async () => {
      if (!isAuthenticated) return;
      try {
        const auth0Token = await getAccessTokenSilently({
          authorizationParams: {
            audience: import.meta.env.VITE_AUTH0_AUDIENCE,
          },
        });

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
          navigate('/user-login?error=backend_failed', { replace: true });
        }
      } catch (err) {
        console.error(err);
        navigate('/user-login?error=social_login_failed', { replace: true });
      }
    };

    processAuth0Login();
  }, [login, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center p-8">
        <div className="animate-spin mb-4">
          <Icon name="Loader2" size={32} className="text-primary" />
        </div>
        <h1 className="text-xl font-medium text-foreground">
          {USE_AUTH0 ? "Completing your login..." : "Logging in (mock)..."}
        </h1>
        <p className="text-sm text-muted-foreground mt-2">
          Please wait while we set up your account.
        </p>
      </div>
    </div>
  );
};

export default Auth0Callback;
