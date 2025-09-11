import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const RateLimitMessage = ({ 
  remainingTime = 300, // 5 minutes in seconds
  maxAttempts = 5,
  currentAttempts = 5,
  onRetry 
}) => {
  const [timeLeft, setTimeLeft] = useState(remainingTime);

  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds?.toString()?.padStart(2, '0')}`;
  };

  const canRetry = timeLeft <= 0;

  return (
    <div className="w-full max-w-md mx-auto text-center">
      <div className="w-16 h-16 bg-warning/10 rounded-full flex items-center justify-center mx-auto mb-6">
        <Icon name="Clock" size={32} color="var(--color-warning)" />
      </div>
      
      <h1 className="text-2xl font-semibold text-foreground mb-4">
        Too Many Attempts
      </h1>
      
      <div className="space-y-4 mb-8">
        <p className="text-muted-foreground">
          You've reached the maximum number of password reset attempts. Please wait before trying again.
        </p>
        
        <div className="bg-warning/5 border border-warning/20 rounded-lg p-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Attempts used:</span>
              <span className="text-sm font-medium text-warning">
                {currentAttempts} of {maxAttempts}
              </span>
            </div>
            
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="h-2 rounded-full bg-warning transition-all duration-300"
                style={{ width: `${(currentAttempts / maxAttempts) * 100}%` }}
              />
            </div>
            
            {!canRetry && (
              <div className="flex items-center justify-center space-x-2">
                <Icon name="Timer" size={16} color="var(--color-warning)" />
                <p className="text-sm text-warning font-medium">
                  Try again in {formatTime(timeLeft)}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {canRetry ? (
          <Button
            variant="default"
            fullWidth
            onClick={onRetry}
            iconName="RefreshCw"
            iconPosition="left"
            iconSize={16}
          >
            Try Again
          </Button>
        ) : (
          <Button
            variant="outline"
            fullWidth
            disabled
            iconName="Clock"
            iconPosition="left"
            iconSize={16}
          >
            Please Wait ({formatTime(timeLeft)})
          </Button>
        )}

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

      <div className="mt-8 p-4 bg-muted/50 rounded-lg">
        <div className="flex items-start space-x-3">
          <Icon name="Info" size={20} color="var(--color-primary)" className="mt-0.5" />
          <div className="text-left">
            <h3 className="text-sm font-medium text-foreground mb-2">
              Why is this happening?
            </h3>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Rate limiting protects your account from abuse</li>
              <li>• Multiple failed attempts trigger security measures</li>
              <li>• This helps prevent unauthorized access attempts</li>
              <li>• Contact support if you need immediate assistance</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RateLimitMessage;