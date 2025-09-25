// In Frontend/src/auth/Auth0Callback.jsx
import React, { useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import axios from 'axios';
import Icon from '../components/AppIcon';

const Auth0Callback = () => {
  const { user, isAuthenticated, getAccessTokenSilently } = useAuth0();
  const { setAccessToken, setUser } = useAuth();
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

        if (backendToken) {
          localStorage.setItem("accessToken", backendToken);
          setAccessToken(backendToken);

          if (backendUser) {
            localStorage.setItem("user", JSON.stringify(backendUser));
            setUser(backendUser);

            // Dynamically redirect based on the user's role from the backend
            const userRole = backendUser.role;
            let redirectPath;
            switch (userRole) {
              case 'client':
                redirectPath = '/dashboard/client';
                break;
              case 'coach':
                redirectPath = '/dashboard/coach';
                break;
              case 'admin':
                redirectPath = '/dashboard/admin';
                break;
              default:
                // Fallback for an unrecognized role
                redirectPath = '/unauthorized';
                break;
            }
            navigate(redirectPath, { replace: true });
          } else {
            console.error("No user data returned from backend.");
            navigate('/user-login?error=backend_failed', { replace: true });
          }
        } else {
          console.error("No access token returned from backend.");
          navigate('/user-login?error=backend_failed', { replace: true });
        }
      } catch (error) {
        console.error("Error processing Auth0 callback:", error);
        navigate('/user-login?error=social_login_failed', { replace: true });
      }
    };

    processAuth0Login();
  }, [isAuthenticated, getAccessTokenSilently, setAccessToken, setUser, navigate]);

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

export default Auth0Callback;