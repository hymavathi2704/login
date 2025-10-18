import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import { Checkbox } from '../../../components/ui/Checkbox';
import Icon from '../../../components/AppIcon';

// ✅ The form now takes 'onSubmit' and 'isLoading' props from its parent
const RegistrationForm = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState({
    // 🔑 MODIFIED: Split 'fullName' into 'firstName' and 'lastName'
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false
  });

  const [errors, setErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validatePassword = (password) => {
    let strength = 0;
    if (password?.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const getPasswordStrengthText = (strength) => {
    switch (strength) {
      case 0: case 1: return 'Weak';
      case 2: case 3: return 'Medium';
      case 4: case 5: return 'Strong';
      default: return '';
    }
  };

  const getPasswordStrengthColor = (strength) => {
    switch (strength) {
      case 0: case 1: return 'bg-red-500';
      case 2: case 3: return 'bg-yellow-500';
      case 4: case 5: return 'bg-green-500';
      default: return 'bg-gray-200';
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const inputValue = type === 'checkbox' ? checked : value;
    setFormData(prev => ({ ...prev, [name]: inputValue }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    if (name === 'password') setPasswordStrength(validatePassword(value));
  };

  const validateForm = () => {
    const newErrors = {};
    // 🔑 MODIFIED: Validate First Name
    if (!formData.firstName.trim() || formData.firstName.trim().length < 2) 
        newErrors.firstName = 'First name must be at least 2 characters';
    // 🔑 MODIFIED: Validate Last Name
    if (!formData.lastName.trim() || formData.lastName.trim().length < 2) 
        newErrors.lastName = 'Last name must be at least 2 characters';
        
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!emailRegex.test(formData.email)) newErrors.email = 'Please enter a valid email address';
    
    if (!formData.password || formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
    else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    
    if (!formData.agreeToTerms) newErrors.agreeToTerms = 'You must agree to the terms and conditions';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ✅ The submit handler is correct, it calls the onSubmit prop.
  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      // Pass the correct fields to the parent handler
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 🔑 MODIFIED: Replaced Full Name with two side-by-side inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="First Name"
          type="text"
          name="firstName"
          placeholder="Enter your first name"
          value={formData.firstName}
          onChange={handleInputChange}
          error={errors.firstName}
          required
        />
        <Input
          label="Last Name"
          type="text"
          name="lastName"
          placeholder="Enter your last name"
          value={formData.lastName}
          onChange={handleInputChange}
          error={errors.lastName}
          required
        />
      </div>
      
      <Input
        label="Email Address"
        type="email"
        name="email"
        placeholder="Enter your email address"
        value={formData.email}
        onChange={handleInputChange}
        error={errors.email}
        required
      />
      <div className="space-y-2">
        <div className="relative">
          <Input
            label="Password"
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Create a strong password"
            value={formData.password}
            onChange={handleInputChange}
            error={errors.password}
            required
          />
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-9 text-gray-500">
            <Icon name={showPassword ? "EyeOff" : "Eye"} size={20} />
          </button>
        </div>
        {formData.password && (
          <div className="space-y-2">
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map((level) => (
                <div
                  key={level}
                  className={`h-2 flex-1 rounded-full ${level <= passwordStrength ? getPasswordStrengthColor(passwordStrength) : 'bg-gray-200'}`}
                />
              ))}
            </div>
            <p className="text-sm text-gray-600">
              Password strength: <span className="font-medium">{getPasswordStrengthText(passwordStrength)}</span>
            </p>
          </div>
        )}
      </div>
      <div className="relative">
        <Input
          label="Confirm Password"
          type={showConfirmPassword ? "text" : "password"}
          name="confirmPassword"
          placeholder="Confirm your password"
          value={formData.confirmPassword}
          onChange={handleInputChange}
          error={errors.confirmPassword}
          required
        />
        <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-9 text-gray-500">
          <Icon name={showConfirmPassword ? "EyeOff" : "Eye"} size={20} />
        </button>
      </div>
      <div className="space-y-2">
        <Checkbox
          name="agreeToTerms"
          checked={formData.agreeToTerms}
          onChange={handleInputChange}
          error={errors.agreeToTerms}
          label={
            <span className="text-sm text-gray-600">
              I agree to the{' '}
              <Link to="/terms" className="text-indigo-600 hover:underline font-medium">Terms of Service</Link>{' '}
              and{' '}
              <Link to="/privacy" className="text-indigo-600 hover:underline font-medium">Privacy Policy</Link>
            </span>
          }
          required
        />
      </div>
      <Button type="submit" fullWidth loading={isLoading} disabled={isLoading}>
        {isLoading ? 'Creating Account...' : 'Create Account'}
      </Button>
      <div className="text-center">
        <p className="text-sm text-gray-600">
          Already have an account?{' '}
          <Link 
            to="/login"
            className="text-indigo-600 hover:underline font-medium"
          >
            Sign in here
          </Link>
        </p>
      </div>
    </form>
  );
};

export default RegistrationForm;