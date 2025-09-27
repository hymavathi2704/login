// Frontend/src/App.jsx
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import AppRoutes from './Routes';
import { Toaster } from 'sonner'; // 1. IMPORT THE TOASTER

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="App">
          <Toaster richColors position="top-right" /> {/* 2. ADD THE TOASTER COMPONENT HERE */}
          <AppRoutes />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;