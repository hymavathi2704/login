import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
// --- THIS LINE IS CORRECTED ---
import { AuthProvider } from './auth/AuthContext';
// ------------------------------
import AppRoutes from './Routes';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;