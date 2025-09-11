import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import RegistrationForm from './components/RegistrationForm';
import SocialLoginButtons from './components/SocialLoginButtons';
import CaptchaVerification from './components/CaptchaVerification';
import RegistrationSuccess from './components/RegistrationSuccess';
import Icon from '../../components/AppIcon';

const UserRegistration = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showCaptcha, setShowCaptcha] = useState(false);
  const [registrationStep, setRegistrationStep] = useState('form'); // 'form', 'success'
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [isResendingEmail, setIsResendingEmail] = useState(false);
  const [rateLimitMessage, setRateLimitMessage] = useState('');

  // Mock rate limiting state
  const [attemptCount, setAttemptCount] = useState(0);
  const maxAttempts = 3;

  const handleFormSubmit = async (formData) => {
    // Check rate limiting
    if (attemptCount >= maxAttempts) {
      setRateLimitMessage('Too many registration attempts. Please try again in 15 minutes.');
      return;
    }

    setIsLoading(true);
    setRateLimitMessage('');

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Show CAPTCHA for additional security
      setShowCaptcha(true);
      setIsLoading(false);

      // Store form data for after CAPTCHA verification
      window.tempRegistrationData = formData;
    } catch (error) {
      setIsLoading(false);
      setAttemptCount(prev => prev + 1);
      console.error('Registration error:', error);
    }
  };

  const handleCaptchaVerification = async (isVerified) => {
    if (isVerified) {
      setShowCaptcha(false);
      setIsLoading(true);

      try {
        // Simulate registration API call
        await new Promise(resolve => setTimeout(resolve, 2000));

        const formData = window.tempRegistrationData;
        setRegisteredEmail(formData?.email);
        setRegistrationStep('success');
        
        // Clean up temp data
        delete window.tempRegistrationData;
        
        console.log('Registration successful:', {
          email: formData?.email,
          fullName: formData?.fullName,
          timestamp: new Date()?.toISOString()
        });
      } catch (error) {
        console.error('Registration failed:', error);
        setAttemptCount(prev => prev + 1);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSocialLogin = async (provider) => {
    setIsLoading(true);
    
    try {
      // Simulate OAuth flow
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log(`${provider} OAuth registration initiated`);
      
      // Mock successful social registration
      const mockEmail = `user@${provider}.com`;
      setRegisteredEmail(mockEmail);
      setRegistrationStep('success');
    } catch (error) {
      console.error(`${provider} registration error:`, error);
      setAttemptCount(prev => prev + 1);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setIsResendingEmail(true);
    
    try {
      // Simulate resend API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Verification email resent to:', registeredEmail);
    } catch (error) {
      console.error('Resend verification error:', error);
    } finally {
      setIsResendingEmail(false);
    }
  };

  const handleCloseCaptcha = () => {
    setShowCaptcha(false);
    setIsLoading(false);
    delete window.tempRegistrationData;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-md w-full space-y-8">
            {registrationStep === 'form' ? (
              <>
                {/* Header */}
                <div className="text-center">
                  <div className="mx-auto w-12 h-12 bg-primary rounded-lg flex items-center justify-center mb-4">
                    <Icon name="UserPlus" size={24} color="white" />
                  </div>
                  <h1 className="text-3xl font-bold text-foreground">Create Your Account</h1>
                  <p className="mt-2 text-muted-foreground">
                    Join thousands of coaches building their online presence
                  </p>
                </div>

                {/* Rate Limit Message */}
                {rateLimitMessage && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <Icon name="AlertTriangle" size={16} className="text-red-600" />
                      <p className="text-sm text-red-700">{rateLimitMessage}</p>
                    </div>
                  </div>
                )}

                {/* Registration Form */}
                <div className="bg-card shadow-soft-lg rounded-lg p-8">
                  <RegistrationForm 
                    onSubmit={handleFormSubmit}
                    isLoading={isLoading}
                  />
                  
                  {/* Social Login Options */}
                  <div className="mt-8">
                    <SocialLoginButtons 
                      onSocialLogin={handleSocialLogin}
                      isLoading={isLoading}
                    />
                  </div>
                </div>

                {/* Security Features */}
                <div className="bg-muted rounded-lg p-4">
                  <div className="flex items-center justify-center space-x-6 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Icon name="Shield" size={14} />
                      <span>SSL Secured</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Icon name="Lock" size={14} />
                      <span>GDPR Compliant</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Icon name="Eye" size={14} />
                      <span>Privacy Protected</span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              /* Success State */
              (<div className="bg-card shadow-soft-lg rounded-lg p-8">
                <RegistrationSuccess 
                  userEmail={registeredEmail}
                  onResendVerification={handleResendVerification}
                  isResending={isResendingEmail}
                />
              </div>)
            )}
          </div>
        </div>
      </main>
      {/* CAPTCHA Modal */}
      <CaptchaVerification 
        isVisible={showCaptcha}
        onVerify={handleCaptchaVerification}
        onClose={handleCloseCaptcha}
      />
    </div>
  );
};

export default UserRegistration;