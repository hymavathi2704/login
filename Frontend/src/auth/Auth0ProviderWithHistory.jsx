import { Auth0Provider } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";

const Auth0ProviderWithHistory = ({ children }) => {
  // ⚠️ TEMPORARILY DISABLED Auth0 Social Login
  /*
  const navigate = useNavigate();

  const domain = import.meta.env.VITE_AUTH0_DOMAIN;
  const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID;
  const audience = "https://api.coachflow.com"; // ✅ Must match backend audience

  const onRedirectCallback = (appState) => {
    navigate(appState?.returnTo || window.location.pathname);
  };

  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: `${window.location.origin}/auth0-callback`,
        audience,
        scope: "openid profile email", // ✅ ADDED: ensures we get email in token
      }}
      onRedirectCallback={onRedirectCallback}
    >
      {children}
    </Auth0Provider>
  );
  */
 return children; // <--- ADDED: Render children directly when disabled
};

export default Auth0ProviderWithHistory;