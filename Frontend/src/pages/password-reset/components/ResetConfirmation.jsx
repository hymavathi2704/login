import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ResetConfirmation = ({ email, onResend, resendLoading = false, canResend = true }) => {
  return (
    <div className="w-full max-w-md mx-auto text-center">
      <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
        <Icon name="Mail" size={32} color="var(--color-success)" />
      </div>
      
      <h1 className="text-2xl font-semibold text-foreground mb-4">
        Check Your Email
      </h1>
      
      <div className="space-y-4 mb-8">
        <p className="text-muted-foreground">
          We've sent password reset instructions to:
        </p>
        <p className="text-foreground font-medium bg-muted px-4 py-2 rounded-lg">
          {email}
        </p>
        <p className="text-sm text-muted-foreground">
          The email should arrive within 2-5 minutes. Please check your spam folder if you don't see it.
        </p>
      </div>

      <div className="space-y-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Icon name="Clock" size={20} color="var(--color-warning)" className="mt-0.5" />
            <div className="text-left">
              <p className="text-sm font-medium text-foreground mb-1">
                Reset Link Expires
              </p>
              <p className="text-sm text-muted-foreground">
                Your reset link will expire in 15 minutes for security reasons.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Button
            variant="outline"
            fullWidth
            onClick={onResend}
            loading={resendLoading}
            disabled={!canResend}
            iconName="RefreshCw"
            iconPosition="left"
            iconSize={16}
          >
            {canResend ? 'Resend Email' : 'Please wait to resend'}
          </Button>

          <Button
            variant="ghost"
            fullWidth
            asChild
          >
            <Link to="/user-login">
              Back to Sign In
            </Link>
          </Button>
        </div>
      </div>

      <div className="mt-8 p-4 bg-muted/50 rounded-lg">
        <h3 className="text-sm font-medium text-foreground mb-2">
          Didn't receive the email?
        </h3>
        <ul className="text-xs text-muted-foreground space-y-1 text-left">
          <li>• Check your spam or junk folder</li>
          <li>• Make sure the email address is correct</li>
          <li>• Try resending the email after a few minutes</li>
          <li>• Contact support if the problem persists</li>
        </ul>
      </div>
    </div>
  );
};

export default ResetConfirmation;