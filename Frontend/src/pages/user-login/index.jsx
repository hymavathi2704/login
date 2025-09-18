import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import Header from '../../components/ui/Header';
import LoginForm from './components/LoginForm';
import SocialLoginButtons from './components/SocialLoginButtons';
import SecurityNotice from './components/SecurityNotice';
import Icon from '../../components/AppIcon';
import { loginUser } from '../../auth/authApi';
import { useAuth } from '../../auth/AuthContext';
import { useAuth0 } from '@auth0/auth0-react';

const UserLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setAccessToken } = useAuth();
  const { loginWithRedirect } = useAuth0();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [attemptCount, setAttemptCount] = useState(0);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [nextAttemptTime, setNextAttemptTime] = useState(0);
  const [showCaptcha, setShowCaptcha] = useState(false);

  // Handle rate limiting countdown
  useEffect(() => {
    // ... (rest of the useEffect hook remains the same)
  }, [isRateLimited, nextAttemptTime]);

  const handleLogin = async (formData) => {
    if (isRateLimited) return;

    setIsLoading(true);
    setError('');

    try {
      const response = await loginUser(formData);
      
      setAccessToken(response?.data?.accessToken);

      setAttemptCount(0);
      setShowCaptcha(false);
      setIsRateLimited(false);

      const from = location.state?.from?.pathname || '/user-profile-management';
      navigate(from, { replace: true });
    } catch (err) {
      const newAttemptCount = attemptCount + 1;
      setAttemptCount(newAttemptCount);

      if (newAttemptCount >= 3) {
        setShowCaptcha(true);
      }

      if (newAttemptCount >= 5) {
        setIsRateLimited(true);
        setNextAttemptTime(Math.min(30 * Math.pow(2, newAttemptCount - 5), 300));
      }

      setError(err?.response?.data?.error || 'Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider) => {
    loginWithRedirect({
      connection: provider === 'google' ? 'google-oauth2' : provider,
    });
  };

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
              Sign in to your CoachFlow account to continue managing your coaching business
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

            <div className="mt-6">
              <SocialLoginButtons
                onSocialLogin={handleSocialLogin}
                isLoading={isLoading}
              />
            </div>
          </div>

          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Need help? Contact our{' '}
              <a href="#" className="text-primary hover:text-primary/80 transition-colors">
                support team
              </a>
            </p>
            <div className="flex items-center justify-center space-x-4 text-xs text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
              <span>•</span>
              <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserLogin;