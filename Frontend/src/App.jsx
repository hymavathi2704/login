// Frontend/src/App.jsx
import React from "react";
import { BrowserRouter } from "react-router-dom";
import AuthProvider from "./auth/AuthContext";
import Auth0ProviderWithHistory from "./auth/Auth0ProviderWithHistory";
import Routes from "./Routes";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Auth0ProviderWithHistory>
          <Routes />
        </Auth0ProviderWithHistory>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;