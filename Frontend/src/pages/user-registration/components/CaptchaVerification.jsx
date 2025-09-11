import React, { useState, useEffect } from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const CaptchaVerification = ({ onVerify, isVisible, onClose }) => {
  const [captchaCode, setCaptchaCode] = useState('');
  const [userInput, setUserInput] = useState('');
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  // Generate random captcha code
  const generateCaptcha = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars?.charAt(Math.floor(Math.random() * chars?.length));
    }
    setCaptchaCode(result);
    setUserInput('');
    setError('');
  };

  useEffect(() => {
    if (isVisible) {
      generateCaptcha();
    }
  }, [isVisible]);

  const handleVerify = async () => {
    if (!userInput?.trim()) {
      setError('Please enter the CAPTCHA code');
      return;
    }

    if (userInput?.toLowerCase() !== captchaCode?.toLowerCase()) {
      setError('CAPTCHA code is incorrect. Please try again.');
      generateCaptcha();
      return;
    }

    setIsVerifying(true);
    
    // Simulate verification delay
    setTimeout(() => {
      setIsVerifying(false);
      onVerify(true);
    }, 1000);
  };

  const handleInputChange = (e) => {
    setUserInput(e?.target?.value);
    if (error) {
      setError('');
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg shadow-soft-lg max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Security Verification</h3>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <Icon name="X" size={20} />
          </button>
        </div>

        <p className="text-sm text-muted-foreground mb-6">
          Please complete this security check to continue with your registration.
        </p>

        {/* CAPTCHA Display */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-foreground mb-2">
            Enter the code shown below:
          </label>
          <div className="flex items-center space-x-4 mb-3">
            <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-4 flex-1">
              <div className="text-center">
                <span 
                  className="text-2xl font-mono font-bold text-gray-700 tracking-wider select-none"
                  style={{
                    textShadow: '1px 1px 2px rgba(0,0,0,0.1)',
                    transform: 'skew(-5deg)',
                    display: 'inline-block'
                  }}
                >
                  {captchaCode}
                </span>
              </div>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={generateCaptcha}
              title="Refresh CAPTCHA"
            >
              <Icon name="RefreshCw" size={16} />
            </Button>
          </div>

          <input
            type="text"
            value={userInput}
            onChange={handleInputChange}
            placeholder="Enter CAPTCHA code"
            className={`
              w-full px-3 py-2 border rounded-lg text-sm
              focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
              ${error ? 'border-red-500' : 'border-border'}
            `}
            maxLength={6}
          />
          
          {error && (
            <p className="text-sm text-red-600 mt-1 flex items-center">
              <Icon name="AlertCircle" size={14} className="mr-1" />
              {error}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
            disabled={isVerifying}
          >
            Cancel
          </Button>
          <Button
            variant="default"
            onClick={handleVerify}
            className="flex-1"
            loading={isVerifying}
            disabled={isVerifying}
          >
            {isVerifying ? 'Verifying...' : 'Verify'}
          </Button>
        </div>

        {/* Help Text */}
        <div className="mt-4 p-3 bg-muted rounded-lg">
          <div className="flex items-start space-x-2">
            <Icon name="Info" size={14} className="text-primary mt-0.5 flex-shrink-0" />
            <p className="text-xs text-muted-foreground">
              Can't see the code clearly? Click the refresh button to generate a new one.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CaptchaVerification;