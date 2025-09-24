import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useParams, Link } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import VerificationForm from './components/VerificationForm';
import TroubleshootingGuide from './components/TroubleshootingGuide';
import VerificationStatus from './components/VerificationStatus';
import authApi from '../../auth/authApi';

const EmailVerification = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { token } = useParams();
  
  // State management
  const [verificationStatus, setVerificationStatus] = useState('pending');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showTroubleshooting, setShowTroubleshooting] = useState(false);
  const [progress, setProgress] = useState(25);
  const [userEmail, setUserEmail] = useState(searchParams.get('email') || '');
  const [isResendingEmail, setIsResendingEmail] = useState(false);
  
  // Context hook is no longer needed here as we redirect to login after verification
  // const { user, setUser } = useAuth(); 

  // Check for token in URL params (from email link)
  useEffect(() => {
    if (token && userEmail) {
      handleAutoVerification(token);
    } else if (token && !userEmail) {
      setError('Email address is missing from the verification link. Please check your email and try again.');
      setVerificationStatus('error');
    }
  }, [token, userEmail]);

  const handleAutoVerification = async (verificationToken) => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await authApi.verifyEmail(userEmail, verificationToken);
      
      if (response?.status === 200) {
        setSuccess(true);
        setVerificationStatus('success');
        setProgress(100);
        
        // Redirect to login after successful verification
        setTimeout(() => navigate('/user-login'), 3000);
      } else {
        throw new Error(response?.data?.error || 'Invalid or expired verification token');
      }
    } catch (err) {
      console.error(err);
      setError(err?.message || 'There was an issue verifying your email. Please try again or contact support if the problem persists.');
      setVerificationStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (email, code) => {
    setIsLoading(true);
    setError('');
    
    try {
      const payload = {
          email: email,
          code: code
      };
      const response = await authApi.verifyEmail(payload);
      
      if (response?.status === 200) {
        setSuccess(true);
        setVerificationStatus('success');
        setProgress(100);
        
        // Redirect to login after successful verification
        setTimeout(() => navigate('/user-login'), 3000);
      } else {
        throw new Error(response?.data?.error || 'Invalid verification code. Please check and try again.');
      }
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.error || err?.message);
      setVerificationStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendEmail = async () => {
    if (!userEmail) {
      setError('Could not resend email. The email address is missing. Please return to the registration page and try again.');
      setVerificationStatus('error');
      return;
    }
    
    try {
      setIsResendingEmail(true);
      setError('');
      await authApi.resendVerificationEmail(userEmail);
      
      setProgress(50);
      
      const originalStatus = verificationStatus;
      setVerificationStatus('pending');
      
      setTimeout(() => {
        setVerificationStatus(originalStatus);
      }, 2000);
      
    } catch (err) {
      setError('Failed to resend email. Please try again.');
    } finally {
      setIsResendingEmail(false);
    }
  };

  const handleContactSupport = () => {
    console.log('Contact support clicked');
    console.log('Support contact feature would be implemented here');
  };

  const getStatusMessage = () => {
    switch (verificationStatus) {
      case 'pending':
        return `We've sent a verification email to ${userEmail || 'your email address'}. Please check your inbox and enter the code below.`;
      case 'success':
        return 'Your email has been successfully verified! You can now log in to your account.';
      case 'error':
        return error;
      case 'expired':
        return 'Your verification code has expired. Please request a new verification email to continue.';
      default:
        return 'Please verify your email address to complete your account setup.';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        <div className="min-h-screen flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-4xl mx-auto">
            
            {/* Header Section */}
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Icon name="ShieldCheck" size={40} color="var(--color-primary)" />
              </div>
              <h1 className="text-3xl font-bold text-foreground mb-3">
                Verify Your Email
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Complete your account setup by verifying your email address
              </p>
            </div>

            {/* Main Content */}
            <div className="grid lg:grid-cols-2 gap-8 items-start">
              
              {/* Left Column - Verification Form */}
              <div className="space-y-8">
                <VerificationStatus 
                  status={verificationStatus}
                  message={getStatusMessage()}
                  progress={progress}
                />
                
                {!success && (
                  <VerificationForm
                    userEmail={userEmail}
                    onVerifyToken={handleVerifyCode}
                    onResendEmail={handleResendEmail}
                    isLoading={isLoading}
                    error={error}
                    success={success}
                  />
                )}

                {success && (
                  <div className="text-center space-y-4">
                    <div className="flex items-center justify-center space-x-2 text-success">
                      <Icon name="CheckCircle" size={20} />
                      <span className="font-medium">Verification Complete!</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Redirecting you to the login page to sign in...
                    </p>
                    <Button
                      variant="default"
                      asChild
                      iconName="ArrowRight"
                      iconPosition="right"
                    >
                      <Link to="/user-login">
                        Continue to Login
                      </Link>
                    </Button>
                  </div>
                )}
              </div>

              {/* Right Column - Troubleshooting */}
              <div className="space-y-6">
                {!showTroubleshooting ? (
                  <div className="bg-card border border-border rounded-lg p-6">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Icon name="Lightbulb" size={24} color="var(--color-accent)" />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground mb-3">
                        Quick Tips
                      </h3>
                      <div className="space-y-3 text-sm text-muted-foreground text-left">
                        <div className="flex items-start space-x-3">
                          <Icon name="Check" size={16} color="var(--color-success)" className="mt-0.5 flex-shrink-0" />
                          <span>Check your spam/junk folder if you don't see the email</span>
                        </div>
                        <div className="flex items-start space-x-3">
                          <Icon name="Check" size={16} color="var(--color-success)" className="mt-0.5 flex-shrink-0" />
                          <span>Email delivery can take up to 10 minutes</span>
                        </div>
                        <div className="flex items-start space-x-3">
                          <Icon name="Check" size={16} color="var(--color-success)" className="mt-0.5 flex-shrink-0" />
                          <span>You can enter the code manually or click the email link</span>
                        </div>
                        <div className="flex items-start space-x-3">
                          <Icon name="Check" size={16} color="var(--color-success)" className="mt-0.5 flex-shrink-0" />
                          <span>Use code "123456" for demo purposes</span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        onClick={() => setShowTroubleshooting(true)}
                        className="mt-4"
                        iconName="HelpCircle"
                        iconPosition="left"
                      >
                        Need More Help?
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Button
                      variant="ghost"
                      onClick={() => setShowTroubleshooting(false)}
                      iconName="ArrowLeft"
                      iconPosition="left"
                      className="mb-4"
                    >
                      Back to Verification
                    </Button>
                    <TroubleshootingGuide onContactSupport={handleContactSupport} />
                  </div>
                )}
              </div>
            </div>

            {/* Alternative Actions */}
            <div className="bg-muted/50 rounded-lg p-6 text-center">
              <h4 className="font-medium text-foreground mb-3">
                Need to use a different email?
              </h4>
              <p className="text-sm text-muted-foreground mb-4">
                If you entered the wrong email address, you can create a new account.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  variant="outline"
                  asChild
                  iconName="UserPlus"
                  iconPosition="left"
                >
                  <Link to="/user-registration">Register Again</Link>
                </Button>
                <Button
                  variant="ghost"
                  asChild
                  iconName="LogIn"
                  iconPosition="left"
                >
                  <Link to="/user-login">Back to Login</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EmailVerification;