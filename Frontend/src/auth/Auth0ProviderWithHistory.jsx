import { Auth0Provider } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";

const Auth0ProviderWithHistory = ({ children }) => {
  const navigate = useNavigate();

  const domain = import.meta.env.VITE_AUTH0_DOMAIN;
  const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID;
  const audience = "https://api.coachflow.com";

  const onRedirectCallback = (appState) => {
    navigate(appState?.returnTo || window.location.pathname);
  };

  return (
    <Auth0Provider
  domain={domain}
  clientId={clientId}
  authorizationParams={{
    redirect_uri: window.location.origin + "/auth0-callback",
    audience: "https://api.coachflow.com", // 👈 must match backend audience
  }}
  onRedirectCallback={onRedirectCallback}
>
  {children}
</Auth0Provider>
  );
};

export default Auth0ProviderWithHistory;
