import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
  const { login } = useAuth(); // Use the login function from AuthContext
  const { loginWithRedirect } = useAuth0();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [attemptCount, setAttemptCount] = useState(0);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [nextAttemptTime, setNextAttemptTime] = useState(0);
  const [showCaptcha, setShowCaptcha] = useState(false);

  const intendedRole = location.state?.role;

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
      
      const userRoles = response?.data?.user?.roles || [];
      const userPrimaryRole = userRoles[0];

      if (intendedRole && !userRoles.includes(intendedRole)) {
        setError(`Your account does not have the required '${intendedRole}' role.`);
        setIsLoading(false);
        return;
      }
      
      // Use the login function from AuthContext to set the user state globally
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

  const handleSocialLogin = (provider) => {
    loginWithRedirect({
      connection: provider === 'google' ? 'google-oauth2' : provider,
      appState: { intendedRole }
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
              Sign in to continue your journey with The Katha
            </p>
          </div>
          <div className="bg-card rounded-xl shadow-soft-lg border border-border p-8">
            <SecurityNotice 
              attemptCount={attemptCount}
              isRateLimited={isRateLimited}
              nextAttemptTime={nextAttemptTime}
            />
            {/* The LoginForm now receives all the state it needs as props */}
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
          <div className="text-center text-sm text-muted-foreground">
            <p>
              Need help? Contact our{' '}
              <a href="#" className="text-primary hover:underline">
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