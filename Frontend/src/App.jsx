// Frontend/src/App.jsx
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
// import Auth0ProviderWithHistory from './auth/Auth0ProviderWithHistory'; // <-- COMMENTED OUT
import { AuthProvider } from './auth/AuthContext';
import AppRoutes from './Routes';
import { Toaster } from 'sonner';

function App() {
  return (
    <Router>
      {/* ⚠️ TEMPORARILY DISABLED Auth0 Social Login */}
      {/* <Auth0ProviderWithHistory> */}
        <AuthProvider>
          <div className="App">
            <Toaster richColors position="top-right" />
            <AppRoutes />
          </div>
        </AuthProvider>
      {/* </Auth0ProviderWithHistory> */}
    </Router>
  );
}

export default App;