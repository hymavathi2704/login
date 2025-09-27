// Frontend/src/pages/email-verification/index.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import VerificationForm from './components/VerificationForm';
import TroubleshootingGuide from './components/TroubleshootingGuide';
import VerificationStatus from './components/VerificationStatus';
import { verifyEmail, resendVerificationEmail } from '../../auth/authApi'; // ✅ CORRECTED IMPORT

const EmailVerification = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [verificationStatus, setVerificationStatus] = useState('pending');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showTroubleshooting, setShowTroubleshooting] = useState(false);
  const [progress, setProgress] = useState(25);
  const [userEmail, setUserEmail] = useState(searchParams.get('email') || '');
  const [isResendingEmail, setIsResendingEmail] = useState(false);
  
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
      // ✅ CORRECTED FUNCTION CALL
      await verifyEmail({ email: userEmail, code: verificationToken });
      setSuccess(true);
      setVerificationStatus('success');
      setProgress(100);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      console.error(err);
      setError(err?.message || 'There was an issue verifying your email.');
      setVerificationStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (email, code) => {
    setIsLoading(true);
    setError('');
    try {
      // ✅ CORRECTED FUNCTION CALL
      await verifyEmail({ email: email, code: code });
      setSuccess(true);
      setVerificationStatus('success');
      setProgress(100);
      setTimeout(() => navigate('/login'), 3000);
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
      setError('Could not resend email. The email address is missing.');
      setVerificationStatus('error');
      return;
    }
    try {
      setIsResendingEmail(true);
      setError('');
      // ✅ CORRECTED FUNCTION CALL
      await resendVerificationEmail(userEmail);
      setProgress(50);
      // ... (rest of the function is fine)
    } catch (err) {
      setError('Failed to resend email. Please try again.');
    } finally {
      setIsResendingEmail(false);
    }
  };
  
  // ... (rest of the component remains the same)
  // The UI part of your component does not need to change.

  const handleContactSupport = () => {
    console.log('Contact support clicked');
  };

  const getStatusMessage = () => {
    // ...
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        <div className="min-h-screen flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-4xl mx-auto space-y-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Icon name={success ? "ShieldCheck" : "Mail"} size={40} color="var(--color-primary)" />
              </div>
              <h1 className="text-3xl font-bold text-foreground mb-3">
                {success ? "Email Verified!" : "Verify Your Email"}
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {success ? "You can now securely log in to your account." : "Complete your account setup by verifying your email address"}
              </p>
            </div>
            <div className="grid lg:grid-cols-2 gap-8 items-start">
              <div className="space-y-8">
                {success ? (
                  <div className="bg-card border border-border rounded-lg p-6 text-center space-y-6">
                    <VerificationStatus 
                      status={verificationStatus}
                      message={getStatusMessage()}
                      progress={progress}
                    />
                    <p className="text-sm text-muted-foreground">
                      Redirecting you to the login page...
                    </p>
                    <Button
                      variant="default"
                      asChild
                      iconName="ArrowRight"
                      iconPosition="right"
                    >
                      <Link to="/login">
                        Continue to Login
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <>
                    <VerificationStatus 
                      status={verificationStatus}
                      message={getStatusMessage()}
                      progress={progress}
                    />
                    <VerificationForm
                      userEmail={userEmail}
                      onVerifyToken={handleVerifyCode}
                      onResendEmail={handleResendEmail}
                      isLoading={isLoading}
                      error={error}
                      success={success}
                    />
                  </>
                )}
              </div>
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
          </div>
        </div>
      </main>
    </div>
  );
};

export default EmailVerification;