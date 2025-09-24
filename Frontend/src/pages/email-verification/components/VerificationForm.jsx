import React, { useState, useEffect } from 'react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Icon from '../../../components/AppIcon';

const VerificationForm = ({ 
  userEmail, 
  onVerifyToken, 
  onResendEmail, 
  isLoading, 
  error, 
  success 
}) => {
  const [verificationCode, setVerificationCode] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleVerifySubmit = (e) => {
    e?.preventDefault();
    // Ensure both email and code are available before submitting
    if (verificationCode?.trim()?.length === 6 && userEmail) {
      onVerifyToken(userEmail, verificationCode?.trim());
    }
  };

  const handleResendEmail = async () => {
    if (!userEmail) return;

    setIsResending(true);
    await onResendEmail();
    setResendCooldown(60); // 60 second cooldown
    setIsResending(false);
  };

  const handleCodeChange = (e) => {
    const value = e?.target?.value?.replace(/\D/g, '')?.slice(0, 6);
    setVerificationCode(value);
  };
  
  // Disable button if email is missing or code is not 6 digits
  const isDisabled = !userEmail || verificationCode?.length !== 6 || isLoading;

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleVerifySubmit} className="space-y-6">
        {/* Email Display */}
        <div className="text-center">
          <div className="flex items-center justify-center mb-3">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Icon name="Mail" size={24} color="var(--color-primary)" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Verification email sent to
          </p>
          <p className="font-medium text-foreground break-all">
            {userEmail || '—'}
          </p>
        </div>

        {/* Verification Code Input */}
        <div>
          <Input
            label="Verification Code"
            type="text"
            placeholder="Enter 6-digit code"
            value={verificationCode}
            onChange={handleCodeChange}
            error={error}
            required
            className="text-center text-lg tracking-widest"
            maxLength={6}
            pattern="[0-9]{6}"
            inputMode="numeric"
          />
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Enter the 6-digit code from your email
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="flex items-center space-x-2 p-3 bg-success/10 border border-success/20 rounded-lg">
            <Icon name="CheckCircle" size={20} color="var(--color-success)" />
            <p className="text-sm text-success font-medium">
              Email verified successfully! Redirecting...
            </p>
          </div>
        )}

        {/* Verify Button */}
        <Button
          type="submit"
          variant="default"
          fullWidth
          loading={isLoading}
          disabled={isDisabled}
          iconName="Shield"
          iconPosition="left"
        >
          {isLoading ? 'Verifying...' : 'Verify Email'}
        </Button>

        {/* Resend Email */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-3">
            Didn't receive the email?
          </p>
          <Button
            type="button"
            variant="ghost"
            onClick={handleResendEmail}
            disabled={resendCooldown > 0 || isResending || !userEmail}
            loading={isResending}
            iconName="RefreshCw"
            iconPosition="left"
            className="text-primary hover:text-primary/80"
          >
            {resendCooldown > 0 
              ? `Resend in ${resendCooldown}s` 
              : isResending 
                ? 'Sending...' :'Resend Email'
            }
          </Button>
        </div>
      </form>
    </div>
  );
};

export default VerificationForm;