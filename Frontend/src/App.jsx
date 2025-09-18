// Frontend/src/App.jsx
import React from "react";
import Auth0ProviderWithHistory from "./auth/Auth0ProviderWithHistory";
import Routes from "./Routes";

function App() {
  return (
    <Auth0ProviderWithHistory>
      <Routes />
    </Auth0ProviderWithHistory>
  );
}

export default App;