import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import VerificationForm from './components/VerificationForm';
import TroubleshootingGuide from './components/TroubleshootingGuide';
import VerificationStatus from './components/VerificationStatus';

const EmailVerification = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Mock user data - in real app this would come from auth context
  const mockUser = {
    email: "sarah.johnson@example.com",
    name: "Sarah Johnson",
    isVerified: false
  };

  // State management
  const [verificationStatus, setVerificationStatus] = useState('pending');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showTroubleshooting, setShowTroubleshooting] = useState(false);
  const [progress, setProgress] = useState(25);

  // Check for token in URL params (from email link)
  useEffect(() => {
    const token = searchParams?.get('token');
    if (token) {
      handleAutoVerification(token);
    }
  }, [searchParams]);

  // Auto-redirect after successful verification
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        navigate('/user-profile-management', { 
          state: { message: 'Email verified successfully! Welcome to CoachFlow.' }
        });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success, navigate]);

  const handleAutoVerification = async (token) => {
    setIsLoading(true);
    setError('');
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock validation - in real app this would validate against backend
      if (token === 'valid-token-123') {
        setSuccess(true);
        setVerificationStatus('success');
        setProgress(100);
      } else {
        throw new Error('Invalid or expired verification token');
      }
    } catch (err) {
      setError(err?.message);
      setVerificationStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyToken = async (code) => {
    setIsLoading(true);
    setError('');
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock validation - accept code "123456" as valid
      if (code === '123456') {
        setSuccess(true);
        setVerificationStatus('success');
        setProgress(100);
      } else {
        throw new Error('Invalid verification code. Please check and try again.');
      }
    } catch (err) {
      setError(err?.message);
      setVerificationStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendEmail = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setError('');
      setProgress(50);
      
      // Show success message briefly
      const originalStatus = verificationStatus;
      setVerificationStatus('pending');
      
      setTimeout(() => {
        setVerificationStatus(originalStatus);
      }, 2000);
      
    } catch (err) {
      setError('Failed to resend email. Please try again.');
    }
  };

  const handleContactSupport = () => {
    // In real app, this would open support chat or redirect to support page
    console.log('Contact support clicked');
    alert('Support contact feature would be implemented here');
  };

  const getStatusMessage = () => {
    switch (verificationStatus) {
      case 'pending':
        return `We've sent a verification email to ${mockUser?.email}. Please check your inbox and click the verification link, or enter the 6-digit code below.`;
      case 'success':
        return 'Your email has been successfully verified! You now have full access to your CoachFlow account.';
      case 'error':
        return 'There was an issue verifying your email. Please try again or contact support if the problem persists.';
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
                    userEmail={mockUser?.email}
                    onVerifyToken={handleVerifyToken}
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
                      Redirecting you to your dashboard...
                    </p>
                    <Button
                      variant="default"
                      asChild
                      iconName="ArrowRight"
                      iconPosition="right"
                    >
                      <Link to="/user-profile-management">
                        Continue to Dashboard
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

            {/* Footer Links */}
            <div className="mt-12 text-center">
              <div className="flex flex-wrap justify-center gap-6 text-sm">
                <Link 
                  to="/homepage" 
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Back to Home
                </Link>
                <span className="text-border">•</span>
                <button 
                  onClick={handleContactSupport}
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Contact Support
                </button>
                <span className="text-border">•</span>
                <Link 
                  to="/user-login" 
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EmailVerification;