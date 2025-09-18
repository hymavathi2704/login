// Frontend/src/auth/Auth0Callback.jsx
import React, { useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import axios from 'axios';
import Icon from '../components/AppIcon';

const Auth0Callback = () => {
  const { user, isAuthenticated, getAccessTokenSilently } = useAuth0();
  const { setAccessToken } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const processAuth0Login = async () => {
      if (isAuthenticated) {
        try {
          const auth0Token = await getAccessTokenSilently({
            authorizationParams: {
              audience: 'https://api.coachflow.com', // <-- Updated with your API Identifier
            },
          });

          // Send Auth0 token to our backend's social login endpoint
          const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/auth/social-login`, {}, {
            headers: {
              Authorization: `Bearer ${auth0Token}`,
            },
          });

          // Get our custom access token from the backend response
          const customAccessToken = response?.data?.accessToken;
          setAccessToken(customAccessToken);
          
          // Redirect to the user's dashboard or profile page
          navigate('/user-profile-management', { replace: true });

        } catch (error) {
          console.error("Error processing Auth0 callback:", error);
          // Handle error, maybe redirect to an error page
          navigate('/user-login?error=social_login_failed', { replace: true });
        }
      }
    };

    processAuth0Login();
  }, [isAuthenticated, getAccessTokenSilently, setAccessToken, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center p-8">
        <div className="animate-spin mb-4">
          <Icon name="Loader2" size={32} className="text-primary" />
        </div>
        <h1 className="text-xl font-medium text-foreground">Completing your login...</h1>
        <p className="text-sm text-muted-foreground mt-2">
          Please wait while we set up your account.
        </p>
      </div>
    </div>
  );
};

export default Auth0Callback;