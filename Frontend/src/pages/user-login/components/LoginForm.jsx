import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { Checkbox } from '../../../components/ui/Checkbox';
import Icon from '../../../components/AppIcon';

const LoginForm = ({ onSubmit, isLoading, error, showCaptcha }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [captchaValue, setCaptchaValue] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e?.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear validation error when user starts typing
    if (validationErrors?.[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData?.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/?.test(formData?.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!formData?.password) {
      errors.password = 'Password is required';
    } else if (formData?.password?.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    if (showCaptcha && !captchaValue) {
      errors.captcha = 'Please complete the CAPTCHA verification';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors)?.length === 0;
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (validateForm()) {
      onSubmit({
        ...formData,
        captcha: captchaValue
      });
    }
  };

  const mockCaptchaQuestion = "What is 7 + 3?";
  const mockCaptchaAnswer = "10";
  const isEmailNotVerifiedError = error === 'Email not verified';

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <Icon name="AlertCircle" size={20} className="text-red-500 mr-3" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
          {isEmailNotVerifiedError && (
            <div className="mt-4">
              <Button
                variant="outline"
                fullWidth
                asChild
                iconName="Mail"
                iconPosition="left"
              >
                <Link to={`/email-verification?email=${encodeURIComponent(formData?.email)}`}>
                  Verify Your Email
                </Link>
              </Button>
            </div>
          )}
        </div>
      )}
      <div className="space-y-4">
        <Input
          label="Email Address"
          type="email"
          name="email"
          value={formData?.email}
          onChange={handleInputChange}
          placeholder="Enter your email"
          error={validationErrors?.email}
          required
          autoComplete="email"
          disabled={isLoading}
        />

        <div className="relative">
          <Input
            label="Password"
            type={showPassword ? "text" : "password"}
            name="password"
            value={formData?.password}
            onChange={handleInputChange}
            placeholder="Enter your password"
            error={validationErrors?.password}
            required
            autoComplete="current-password"
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-9 text-muted-foreground hover:text-foreground transition-colors"
            disabled={isLoading}
          >
            <Icon 
              name={showPassword ? "EyeOff" : "Eye"} 
              size={20} 
            />
          </button>
        </div>

        {showCaptcha && (
          <div className="bg-muted p-4 rounded-lg border">
            <label className="block text-sm font-medium text-foreground mb-2">
              Security Verification
            </label>
            <p className="text-sm text-muted-foreground mb-3">
              Please solve this simple math problem: <strong>{mockCaptchaQuestion}</strong>
            </p>
            <Input
              type="text"
              value={captchaValue}
              onChange={(e) => setCaptchaValue(e?.target?.value)}
              placeholder="Enter your answer"
              error={validationErrors?.captcha}
              disabled={isLoading}
            />
          </div>
        )}
      </div>
      <div className="flex items-center justify-between">
        <Checkbox
          label="Remember me"
          checked={formData?.rememberMe}
          onChange={handleInputChange}
          name="rememberMe"
          disabled={isLoading}
        />

        <Link 
          to="/password-reset" 
          className="text-sm text-primary hover:text-primary/80 transition-colors"
        >
          Forgot password?
        </Link>
      </div>
      <Button
        type="submit"
        variant="default"
        fullWidth
        loading={isLoading}
        disabled={isLoading}
        iconName="LogIn"
        iconPosition="left"
      >
        {isLoading ? 'Signing In...' : 'Sign In'}
      </Button>
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          Don't have an account?{' '}
          <Link 
            to="/register" 
            className="text-primary hover:text-primary/80 font-medium transition-colors"
          >
            Sign up here
          </Link>
        </p>
      </div>
    </form>
  );
};

export default LoginForm;