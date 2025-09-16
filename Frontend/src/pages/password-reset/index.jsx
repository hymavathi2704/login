// Frontend/src/pages/password-reset/index.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Header from '../../components/ui/Header';
import PasswordResetForm from './components/PasswordResetForm';
import ResetConfirmation from './components/ResetConfirmation';
import NewPasswordForm from './components/NewPasswordForm';
import SuccessMessage from './components/SuccessMessage';
import RateLimitMessage from './components/RateLimitMessage';
import authApi from '../../auth/authApi'; // Import authApi

const PasswordResetPage = () => {
  const { token } = useParams(); // This line is the key change
  const navigate = useNavigate();

  // Get token from URL parameters
  const tokenFromUrl = token;
  
  // State management
  const [currentStep, setCurrentStep] = useState(tokenFromUrl ? 'new-password' : 'request-reset');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [canResend, setCanResend] = useState(true);
  const [rateLimitInfo, setRateLimitInfo] = useState({
    isRateLimited: false,
    remainingTime: 0,
    attempts: 0,
    maxAttempts: 5
  });

  // Mock rate limiting data
  const mockRateLimitData = {
    remainingTime: 300, // 5 minutes
    currentAttempts: 5,
    maxAttempts: 5
  };

  useEffect(() => {
    // Simulate checking if user is rate limited on component mount
    const checkRateLimit = () => {
      // Mock rate limit check - in a real app this would be an API call
      const isRateLimited = Math.random() < 0.1; // 10% chance of being rate limited
      
      if (isRateLimited) {
        setRateLimitInfo({
          isRateLimited: true,
          remainingTime: mockRateLimitData?.remainingTime,
          attempts: mockRateLimitData?.currentAttempts,
          maxAttempts: mockRateLimitData?.maxAttempts
        });
        setCurrentStep('rate-limited');
      }
    };

    checkRateLimit();
  }, []);

  const handlePasswordResetRequest = async (formData) => {
    setLoading(true);
    
    try {
      // Use the actual backend API call for forgot password
      const response = await authApi.forgotPassword({ email: formData.email });
      
      // The backend returns a generic success message to prevent user enumeration
      // We assume if the call is successful, the email was sent.
      if (response.status === 200) {
        setEmail(formData.email);
        setCurrentStep('confirmation');
      
        // Start resend cooldown
        setCanResend(false);
        setTimeout(() => setCanResend(true), 60000); // 1 minute cooldown
      }
      
    } catch (error) {
      console.error('Password reset request failed:', error?.message);
      // In a real app, you would show this error to the user,
      // but for security, the backend's response is generic.
      alert(error?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmail = async () => {
    if (!canResend) return;
    
    setResendLoading(true);
    
    try {
      // Call the API to resend the verification email
      await authApi.resendVerificationEmail(email);
      
      // Start new cooldown
      setCanResend(false);
      setTimeout(() => setCanResend(true), 60000); // 1 minute cooldown
      
    } catch (error) {
      console.error('Resend failed:', error?.message);
      alert('Failed to resend email. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  const handleNewPasswordSubmit = async (formData) => {
    setLoading(true);
    
    try {
      // Call the API to reset the password with the new password and token
      await authApi.resetPassword({ token: formData.token, newPassword: formData.password });
      
      setCurrentStep('success');
      
    } catch (error) {
      console.error('Password reset failed:', error?.message);
      alert(error?.message || 'Password reset failed. The link may be invalid or expired.');
    } finally {
      setLoading(false);
    }
  };

  const handleRateLimitRetry = () => {
    setRateLimitInfo({
      isRateLimited: false,
      remainingTime: 0,
      attempts: 0,
      maxAttempts: 5
    });
    setCurrentStep('request-reset');
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'request-reset':
        return (
          <PasswordResetForm
            onSubmit={handlePasswordResetRequest}
            loading={loading}
          />
        );
      
      case 'confirmation':
        return (
          <ResetConfirmation
            email={email}
            onResend={handleResendEmail}
            resendLoading={resendLoading}
            canResend={canResend}
          />
        );
      
      case 'new-password':
        return (
          <NewPasswordForm
            token={tokenFromUrl}
            onSubmit={handleNewPasswordSubmit}
            loading={loading}
          />
        );
      
      case 'success':
        return (
          <SuccessMessage
            autoRedirect={true}
            redirectDelay={5}
          />
        );
      
      case 'rate-limited':
        return (
          <RateLimitMessage
            remainingTime={rateLimitInfo?.remainingTime}
            maxAttempts={rateLimitInfo?.maxAttempts}
            currentAttempts={rateLimitInfo?.attempts}
            onRetry={handleRateLimitRetry}
          />
        );
      
      default:
        return (
          <PasswordResetForm
            onSubmit={handlePasswordResetRequest}
            loading={loading}
          />
        );
    }
  };

  return (
    <>
      <Helmet>
        <title>Reset Password - CoachFlow</title>
        <meta name="description" content="Reset your CoachFlow account password securely. Enter your email to receive reset instructions." />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="pt-16">
          <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-md">
              {renderCurrentStep()}
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default PasswordResetPage;