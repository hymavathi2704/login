import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../../components/ui/Header';
import LoginForm from './components/LoginForm';
import SocialLoginButtons from './components/SocialLoginButtons';
import SecurityNotice from './components/SecurityNotice';
import Icon from '../../components/AppIcon';

const UserLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [attemptCount, setAttemptCount] = useState(0);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [nextAttemptTime, setNextAttemptTime] = useState(0);
  const [showCaptcha, setShowCaptcha] = useState(false);

  // Mock credentials for testing
  const mockCredentials = {
    email: 'coach@coachflow.com',
    password: 'coach123'
  };

  // Handle rate limiting countdown
  useEffect(() => {
    let interval;
    if (isRateLimited && nextAttemptTime > 0) {
      interval = setInterval(() => {
        setNextAttemptTime(prev => {
          if (prev <= 1) {
            setIsRateLimited(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRateLimited, nextAttemptTime]);

  const handleLogin = async (formData) => {
    if (isRateLimited) return;

    setIsLoading(true);
    setError('');

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Check credentials
      if (formData?.email === mockCredentials?.email && formData?.password === mockCredentials?.password) {
        // Check CAPTCHA if required
        if (showCaptcha && formData?.captcha !== '10') {
          throw new Error('CAPTCHA verification failed. Please try again.');
        }

        // Simulate JWT token storage
        const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mocktoken';
        localStorage.setItem('accessToken', mockToken);
        
        if (formData?.rememberMe) {
          localStorage.setItem('rememberMe', 'true');
        }

        // Reset security measures on successful login
        setAttemptCount(0);
        setShowCaptcha(false);
        setIsRateLimited(false);

        // Navigate to dashboard or intended destination
        const from = location?.state?.from?.pathname || '/user-profile-management';
        navigate(from, { replace: true });
      } else {
        // Handle failed login
        const newAttemptCount = attemptCount + 1;
        setAttemptCount(newAttemptCount);

        if (newAttemptCount >= 3) {
          setShowCaptcha(true);
        }

        if (newAttemptCount >= 5) {
          setIsRateLimited(true);
          setNextAttemptTime(Math.min(30 * Math.pow(2, newAttemptCount - 5), 300)); // Progressive delay, max 5 minutes
        }

        throw new Error(`Invalid email or password. Please try again.\nFor testing, use: ${mockCredentials.email} / ${mockCredentials.password}`);
      }
    } catch (err) {
      setError(err?.message);
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
      
      // Mock successful social login
      const mockSocialToken = `social_${provider}_token_${Date.now()}`;
      localStorage.setItem('accessToken', mockSocialToken);
      localStorage.setItem('loginProvider', provider);

      // Reset security measures
      setAttemptCount(0);
      setShowCaptcha(false);
      setIsRateLimited(false);

      // Navigate to dashboard
      const from = location?.state?.from?.pathname || '/user-profile-management';
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
          {/* Header */}
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-6">
              <Icon name="LogIn" size={32} color="white" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">Welcome Back</h1>
            <p className="mt-2 text-muted-foreground">
              Sign in to your CoachFlow account to continue managing your coaching business
            </p>
          </div>

          {/* Login Card */}
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

          {/* Additional Links */}
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