import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const PasswordResetForm = ({ onSubmit, loading = false }) => {
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({});

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex?.test(email);
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    const newErrors = {};

    if (!email?.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors)?.length === 0) {
      onSubmit({ email: email?.trim() });
    }
  };

  const handleEmailChange = (e) => {
    setEmail(e?.target?.value);
    if (errors?.email) {
      setErrors(prev => ({ ...prev, email: '' }));
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon name="KeyRound" size={32} color="var(--color-primary)" />
        </div>
        <h1 className="text-2xl font-semibold text-foreground mb-2">
          Reset Your Password
        </h1>
        <p className="text-muted-foreground">
          Enter your email address and we'll send you a link to reset your password.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="Email Address"
          type="email"
          placeholder="Enter your email address"
          value={email}
          onChange={handleEmailChange}
          error={errors?.email}
          required
          disabled={loading}
        />

        <Button
          type="submit"
          variant="default"
          fullWidth
          loading={loading}
          iconName="Send"
          iconPosition="right"
          iconSize={16}
        >
          Send Reset Link
        </Button>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Remember your password?{' '}
            <Link 
              to="/user-login" 
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

export default PasswordResetForm;