import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const NewPasswordForm = ({ token, onSubmit, loading = false }) => {
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
    token: token || ''
  });
  const [errors, setErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    feedback: []
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const passwordRequirements = [
    { id: 'length', text: 'At least 8 characters', regex: /.{8,}/ },
    { id: 'uppercase', text: 'One uppercase letter', regex: /[A-Z]/ },
    { id: 'lowercase', text: 'One lowercase letter', regex: /[a-z]/ },
    { id: 'number', text: 'One number', regex: /\d/ },
    { id: 'special', text: 'One special character', regex: /[!@#$%^&*(),.?":{}|<>]/ }
  ];

  const calculatePasswordStrength = (password) => {
    const metRequirements = passwordRequirements?.filter(req => req?.regex?.test(password));
    const score = metRequirements?.length;
    const feedback = passwordRequirements?.map(req => ({
      ...req,
      met: req?.regex?.test(password)
    }));

    return { score, feedback };
  };

  useEffect(() => {
    if (formData?.password) {
      setPasswordStrength(calculatePasswordStrength(formData?.password));
    } else {
      setPasswordStrength({ score: 0, feedback: [] });
    }
  }, [formData?.password]);

  const getStrengthColor = (score) => {
    if (score <= 2) return 'bg-error';
    if (score <= 3) return 'bg-warning';
    if (score <= 4) return 'bg-primary';
    return 'bg-success';
  };

  const getStrengthText = (score) => {
    if (score <= 2) return 'Weak';
    if (score <= 3) return 'Fair';
    if (score <= 4) return 'Good';
    return 'Strong';
  };

  const handleInputChange = (e) => {
    const { name, value } = e?.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors?.[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData?.token?.trim()) {
      newErrors.token = 'Reset token is required';
    }

    if (!formData?.password) {
      newErrors.password = 'Password is required';
    } else if (passwordStrength?.score < 4) {
      newErrors.password = 'Password does not meet minimum requirements';
    }

    if (!formData?.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData?.password !== formData?.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    return newErrors;
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    const newErrors = validateForm();
    setErrors(newErrors);

    if (Object.keys(newErrors)?.length === 0) {
      onSubmit({
        password: formData?.password,
        token: formData?.token?.trim()
      });
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon name="Lock" size={32} color="var(--color-primary)" />
        </div>
        <h1 className="text-2xl font-semibold text-foreground mb-2">
          Create New Password
        </h1>
        <p className="text-muted-foreground">
          Enter your new password below to complete the reset process.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        {!token && (
          <Input
            label="Reset Token"
            type="text"
            name="token"
            placeholder="Enter the token from your email"
            value={formData?.token}
            onChange={handleInputChange}
            error={errors?.token}
            required
            disabled={loading}
            description="Copy the token from the reset email you received"
          />
        )}

        <div className="space-y-2">
          <div className="relative">
            <Input
              label="New Password"
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Enter your new password"
              value={formData?.password}
              onChange={handleInputChange}
              error={errors?.password}
              required
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-9 text-muted-foreground hover:text-foreground transition-colors"
            >
              <Icon name={showPassword ? "EyeOff" : "Eye"} size={20} />
            </button>
          </div>

          {formData?.password && (
            <div className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Password strength:</span>
                  <span className={`text-sm font-medium ${
                    passwordStrength?.score <= 2 ? 'text-error' :
                    passwordStrength?.score <= 3 ? 'text-warning' :
                    passwordStrength?.score <= 4 ? 'text-primary' : 'text-success'
                  }`}>
                    {getStrengthText(passwordStrength?.score)}
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${getStrengthColor(passwordStrength?.score)}`}
                    style={{ width: `${(passwordStrength?.score / 5) * 100}%` }}
                  />
                </div>
              </div>

              <div className="space-y-1">
                {passwordRequirements?.map((req) => {
                  const isMet = passwordStrength?.feedback?.find(f => f?.id === req?.id)?.met || false;
                  return (
                    <div key={req?.id} className="flex items-center space-x-2">
                      <Icon 
                        name={isMet ? "Check" : "X"} 
                        size={14} 
                        color={isMet ? "var(--color-success)" : "var(--color-muted-foreground)"} 
                      />
                      <span className={`text-xs ${isMet ? 'text-success' : 'text-muted-foreground'}`}>
                        {req?.text}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="relative">
          <Input
            label="Confirm New Password"
            type={showConfirmPassword ? "text" : "password"}
            name="confirmPassword"
            placeholder="Confirm your new password"
            value={formData?.confirmPassword}
            onChange={handleInputChange}
            error={errors?.confirmPassword}
            required
            disabled={loading}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-9 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Icon name={showConfirmPassword ? "EyeOff" : "Eye"} size={20} />
          </button>
        </div>

        <Button
          type="submit"
          variant="default"
          fullWidth
          loading={loading}
          iconName="Check"
          iconPosition="right"
          iconSize={16}
        >
          Update Password
        </Button>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Remember your password?{' '}
            {/* ✅ FIX: Corrected link path */}
            <Link 
              to="/login" 
              className="text-primary hover:text-primary/80 font-medium transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
};

export default NewPasswordForm;