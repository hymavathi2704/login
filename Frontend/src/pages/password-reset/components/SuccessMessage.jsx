import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const SuccessMessage = ({ autoRedirect = true, redirectDelay = 5 }) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (autoRedirect) {
      const timer = setTimeout(() => {
        // ✅ FIX: Corrected redirect path
        navigate('/login');
      }, redirectDelay * 1000);

      return () => clearTimeout(timer);
    }
  }, [autoRedirect, redirectDelay, navigate]);

  return (
    <div className="w-full max-w-md mx-auto text-center">
      <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
        <Icon name="CheckCircle" size={40} color="var(--color-success)" />
      </div>
      
      <h1 className="text-2xl font-semibold text-foreground mb-4">
        Password Reset Successful
      </h1>
      
      <div className="space-y-4 mb-8">
        <p className="text-muted-foreground">
          Your password has been successfully updated. You can now sign in with your new password.
        </p>
        
        {autoRedirect && (
          <div className="bg-success/5 border border-success/20 rounded-lg p-4">
            <div className="flex items-center justify-center space-x-2">
              <Icon name="Clock" size={16} color="var(--color-success)" />
              <p className="text-sm text-success">
                Redirecting to sign in page in {redirectDelay} seconds...
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-3">
        <Button
          variant="default"
          fullWidth
          asChild
        >
          {/* ✅ FIX: Corrected link path */}
          <Link to="/login">
            Continue to Sign In
          </Link>
        </Button>

        <Button
          variant="ghost"
          fullWidth
          asChild
        >
          <Link to="/homepage">
            Back to Homepage
          </Link>
        </Button>
      </div>

      <div className="mt-8 p-4 bg-muted/50 rounded-lg">
        <div className="flex items-start space-x-3">
          <Icon name="Shield" size={20} color="var(--color-primary)" className="mt-0.5" />
          <div className="text-left">
            <h3 className="text-sm font-medium text-foreground mb-2">
              Security Tips
            </h3>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Use a unique password for your CoachFlow account</li>
              <li>• Consider using a password manager</li>
              <li>• Enable two-factor authentication when available</li>
              <li>• Never share your password with others</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuccessMessage;