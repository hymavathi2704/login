import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const RegistrationSuccess = ({ userEmail, onResendVerification, isResending }) => {
  return (
    <div className="text-center space-y-6">
      {/* Success Icon */}
      <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
        <Icon name="CheckCircle" size={32} className="text-green-600" />
      </div>

      {/* Success Message */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-foreground">Account Created Successfully!</h2>
        <p className="text-muted-foreground">
          Welcome to CoachFlow! We're excited to have you join our community of coaches.
        </p>
      </div>

      {/* Email Verification Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Icon name="Mail" size={20} className="text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-left">
            <h3 className="font-medium text-blue-900 mb-1">Verify Your Email</h3>
            <p className="text-sm text-blue-700 mb-3">
              We've sent a verification email to:
            </p>
            <p className="text-sm font-medium text-blue-900 bg-blue-100 px-3 py-1 rounded">
              {userEmail}
            </p>
            <p className="text-sm text-blue-700 mt-3">
              Please check your inbox and enter the verification code to activate your account.
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <Button
          variant="default"
          size="lg"
          fullWidth
          asChild
        >
          <Link to={`/email-verification?email=${encodeURIComponent(userEmail)}`}>
            Continue to Email Verification
          </Link>
        </Button>

        <div className="flex items-center justify-center space-x-4">
          <span className="text-sm text-muted-foreground">Didn't receive the email?</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={onResendVerification}
            loading={isResending}
            disabled={isResending}
          >
            {isResending ? 'Sending...' : 'Resend Email'}
          </Button>
        </div>
      </div>

      {/* Help Section */}
      <div className="bg-muted rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Icon name="HelpCircle" size={16} className="text-primary mt-0.5 flex-shrink-0" />
          <div className="text-left">
            <h4 className="text-sm font-medium text-foreground mb-1">Need Help?</h4>
            <p className="text-xs text-muted-foreground">
              If you don't see the verification email in your inbox, please check your spam folder. 
              The email should arrive within a few minutes.
            </p>
          </div>
        </div>
      </div>

      {/* Footer Links */}
      <div className="pt-4 border-t border-border">
        <p className="text-sm text-muted-foreground">
          Already verified your email?{' '}
          <Link to="/user-login" className="text-primary hover:underline font-medium">
            Sign in to your account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegistrationSuccess;