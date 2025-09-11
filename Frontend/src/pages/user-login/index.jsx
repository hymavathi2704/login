import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../../components/ui/Header';
import LoginForm from './components/LoginForm';
import SocialLoginButtons from './components/SocialLoginButtons';
import SecurityNotice from './components/SecurityNotice';
import Icon from '../../components/AppIcon';
// Add imports for the API call and AuthContext
import { loginUser } from '../../auth/authApi';
import { useAuth } from '../../auth/AuthContext';

const UserLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // Destructure setAccessToken from the AuthContext
  const { setAccessToken } = useAuth();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [attemptCount, setAttemptCount] = useState(0);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [nextAttemptTime, setNextAttemptTime] = useState(0);
  const [showCaptcha, setShowCaptcha] = useState(false);

  // You can now remove the mockCredentials variable
  // const mockCredentials = { /* ... */ };

  // Handle rate limiting countdown
  useEffect(() => {
    // ... (rest of the useEffect hook remains the same)
  }, [isRateLimited, nextAttemptTime]);

  const handleLogin = async (formData) => {
    if (isRateLimited) return;

    setIsLoading(true);
    setError('');

    try {
      // Use the actual API call
      const response = await loginUser(formData);
      
      // Store the real access token from the backend response
      setAccessToken(response?.data?.accessToken);

      // Reset security measures on successful login
      setAttemptCount(0);
      setShowCaptcha(false);
      setIsRateLimited(false);

      // Navigate to dashboard or intended destination
      const from = location.state?.from?.pathname || '/user-profile-management';
      navigate(from, { replace: true });
    } catch (err) {
      // Handle failed login attempts
      const newAttemptCount = attemptCount + 1;
      setAttemptCount(newAttemptCount);

      if (newAttemptCount >= 3) {
        setShowCaptcha(true);
      }

      if (newAttemptCount >= 5) {
        setIsRateLimited(true);
        setNextAttemptTime(Math.min(30 * Math.pow(2, newAttemptCount - 5), 300));
      }

      // Show the error message from the backend
      setError(err?.response?.data?.error || 'Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider) => {
    setIsLoading(true);
    setError('');

    try {
      // Simulate OAuth flow
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // For a real social login flow, you would call your backend here
      // const response = await socialLoginUser(provider);
      // setAccessToken(response?.data?.accessToken);

      const mockSocialToken = `social_${provider}_token_${Date.now()}`;
      setAccessToken(mockSocialToken); // Set a mock token for demonstration

      // Reset security measures
      setAttemptCount(0);
      setShowCaptcha(false);
      setIsRateLimited(false);

      // Navigate to dashboard
      const from = location.state?.from?.pathname || '/user-profile-management';
      navigate(from, { replace: true });
    } catch (err) {
      setError(`${provider} authentication failed. Please try again.`);
    } finally {
      setIsLoading(false);
    }
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