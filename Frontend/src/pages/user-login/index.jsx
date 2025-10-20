import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../../components/ui/Header';
import LoginForm from './components/LoginForm';
// import SocialLoginButtons from './components/SocialLoginButtons';
import SecurityNotice from './components/SecurityNotice';
import Icon from '../../components/AppIcon';
import { loginUser } from '../../auth/authApi';
import { useAuth } from '../../auth/AuthContext';
// import { useAuth0 } from '@auth0/auth0-react'; // Already commented out

const UserLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth(); // Use the login function from AuthContext
  // const { loginWithRedirect } = useAuth0(); // ⚠️ COMMENTED OUT: Social Login functionality hook
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [attemptCount, setAttemptCount] = useState(0);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [nextAttemptTime, setNextAttemptTime] = useState(0);
  const [showCaptcha, setShowCaptcha] = useState(false);

  

  useEffect(() => {
    let interval;
    if (isRateLimited && nextAttemptTime > 0) {
      interval = setInterval(() => {
        setNextAttemptTime((prev) => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRateLimited, nextAttemptTime]);

  const handleLogin = async (formData) => {
    if (isRateLimited) return;
    setIsLoading(true);
    setError('');

    try {
      const response = await loginUser(formData);
      
     
      login(response.data);

    } catch (err) {
      const newAttemptCount = attemptCount + 1;
      setAttemptCount(newAttemptCount);

      if (newAttemptCount >= 3) setShowCaptcha(true);
      
      if (newAttemptCount >= 5) {
        setIsRateLimited(true);
        const waitTime = Math.min(30 * Math.pow(2, newAttemptCount - 5), 300);
        setNextAttemptTime(waitTime);
      }

      setError(err?.response?.data?.error || 'Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ NEW: Handler for Support Team Pop-up
  const handleSupportClick = (e) => {
    e.preventDefault(); // Stop navigation
    window.alert("Contact Support:\n\nFor immediate assistance, please email us at support@thekatha.com. We aim to respond within 24 hours.");
  };

  /* ⚠️ COMMENTED OUT: Social Login Handler
  const handleSocialLogin = (provider) => {
    loginWithRedirect({
      connection: provider === 'google' ? 'google-oauth2' : provider,
      
    });
  };
  */

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="pt-16 min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-6">
              <Icon name="LogIn" size={32} color="white" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">Welcome Back</h1>
            <p className="mt-2 text-muted-foreground">
              Sign in to continue your journey with The Katha
            </p>
          </div>
          <div className="bg-card rounded-xl shadow-soft-lg border border-border p-8">
            <SecurityNotice 
              attemptCount={attemptCount}
              isRateLimited={isRateLimited}
              nextAttemptTime={nextAttemptTime}
            />
            <LoginForm
              onSubmit={handleLogin}
              isLoading={isLoading}
              error={error}
              showCaptcha={showCaptcha}
            />
            {/* ⚠️ COMMENTED OUT: Social Login UI */}
            {/*
            <div className="mt-6">
              <SocialLoginButtons
                onSocialLogin={handleSocialLogin}
                isLoading={isLoading}
              />
            </div>
            */}
          </div>
          <div className="text-center text-sm text-muted-foreground">
            <p>
              Need help? Contact our{' '}
              {/* ✅ MODIFIED: Added onClick handler to trigger the alert */}
              <a 
                href="#" 
                onClick={handleSupportClick} // 👈 Added handler here
                className="text-primary hover:underline font-medium" // 👈 Added font-medium for better visibility
              >
                support team
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserLogin;