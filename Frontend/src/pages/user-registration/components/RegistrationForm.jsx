import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import { Checkbox } from '../../../components/ui/Checkbox';
import Icon from '../../../components/AppIcon';
// 🔑 NEW IMPORTS for Select components
import Select, { SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../../components/ui/Select'; 
import { Tag } from 'lucide-react'; 

// List of popular specialties adapted from ProfessionalSection
const popularSpecialties = [
  'Life Coaching', 'Business Coaching', 'Career Coaching', 'Executive Coaching',
  'Health & Wellness', 'Relationship Coaching', 'Leadership Development',
  'Performance Coaching', 'Financial Coaching', 'Mindfulness & Meditation'
];

const RegistrationForm = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState({
    // Core fields
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
    // 🔑 NEW: Role with default 'client'
    role: 'client', 
    // 🔑 NEW: Specialty (holds the final selected/custom value sent to backend)
    specialty: '', 
  });

  const [errors, setErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  // 🔑 NEW STATES for specialty dropdown control
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [customSpecialty, setCustomSpecialty] = useState('');

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
    
    // 🔑 MODIFIED: Handle role change
    if (name === 'role') {
        if (value === 'client') {
            // Clear specialty-related states if role is client
            setFormData(prev => ({ ...prev, specialty: '' }));
            setSelectedSpecialty('');
            setCustomSpecialty('');
        } else if (value === 'coach') {
            // If switching to coach, ensure formData.specialty is reset to force selection/input validation
            setFormData(prev => ({ ...prev, specialty: '' }));
        }
    }
    
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    if (name === 'password') setPasswordStrength(validatePassword(value));
  };

  // 🔑 NEW: Handler for Select component
  const handleSpecialtySelect = (value) => {
      setSelectedSpecialty(value);
      setCustomSpecialty(''); // Clear custom input when a selection is made
      setErrors(prev => ({ ...prev, specialty: '' })); 
      
      // If a popular specialty is selected, set it in the final form data
      if (value !== 'other' && value !== 'disabled-placeholder') { 
          setFormData(prev => ({ ...prev, specialty: value }));
      } else {
          // If 'other' or placeholder is selected, clear the final specialty value (will be set by custom input or remain empty)
          setFormData(prev => ({ ...prev, specialty: '' }));
      }
  };
  
  // 🔑 NEW: Handler for custom specialty input
  const handleCustomSpecialtyChange = (e) => {
      const value = e.target.value;
      setCustomSpecialty(value);
      // Update the final form data with the custom value as user types
      setFormData(prev => ({ ...prev, specialty: value })); 
      if (errors.specialty) setErrors(prev => ({ ...prev, specialty: '' }));
  };


// ===================================
  // 🔑 NEW: Handlers for Pop-up messages
  // ===================================
  const handleTermsClick = (e) => {
    e.preventDefault(); // Stop navigation
    window.alert("Terms of Service:\n\nThese terms are currently under development. By proceeding, you agree to the default terms of use for beta software.");
  };

  const handlePrivacyClick = (e) => {
    e.preventDefault(); // Stop navigation
    window.alert("Privacy Policy:\n\nThis policy is currently under development. Your data will be treated securely and will not be shared with third parties.");
  };
  // ===================================

  const validateForm = () => {
    const newErrors = {};
    
    // 🔑 UPDATED: Validate specialty if role is coach AND the final formData.specialty is empty
    if (formData.role === 'coach' && !formData.specialty.trim()) {
      newErrors.specialty = 'Primary coaching specialty is required for coach registration.';
    }
    
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
      
      {/* 🔑 NEW BLOCK: Role Selection & Conditional Specialty Input */}
      <div className="space-y-4">
        <label className="block text-sm font-medium text-foreground">
          I am registering as: <span className="text-destructive ml-1">*</span>
        </label>
        <div className="flex space-x-6">
          {/* Client Radio (Default) */}
          <div className="flex items-center">
            <input
              type="radio"
              id="role-client"
              name="role"
              value="client"
              checked={formData.role === 'client'}
              onChange={handleInputChange}
              className="h-4 w-4 text-primary border-gray-300 focus:ring-primary"
            />
            <label htmlFor="role-client" className="ml-2 text-sm font-medium text-gray-700">Client (Default)</label>
          </div>
          {/* Coach Radio */}
          <div className="flex items-center">
            <input
              type="radio"
              id="role-coach"
              name="role"
              value="coach"
              checked={formData.role === 'coach'}
              onChange={handleInputChange}
              className="h-4 w-4 text-primary border-gray-300 focus:ring-primary"
            />
            <label htmlFor="role-coach" className="ml-2 text-sm font-medium text-gray-700">Coach</label>
          </div>
        </div>

        {/* Conditional Specialty Input/Select for Coach */}
        {formData.role === 'coach' && (
          <div className="space-y-2">
            <label htmlFor="specialty-select-trigger" className="block text-sm font-medium text-foreground">
              Primary Coaching Specialty <span className="text-destructive ml-1">*</span>
            </label>
            
            {/* Specialty Dropdown */}
            <Select 
              value={selectedSpecialty} 
              onValueChange={handleSpecialtySelect}
            >
              <SelectTrigger id="specialty-select-trigger" className="w-full">
                <SelectValue placeholder="Select your primary specialty..." />
              </SelectTrigger>
              <SelectContent>
                {/* 🔑 FIX: Changed value from "" to a non-empty string to avoid Radix error */}
                <SelectItem value="disabled-placeholder" disabled>Select your primary specialty...</SelectItem> 
                {popularSpecialties.map((s) => (
                    <SelectItem key={s} value={s}>
                        {s}
                    </SelectItem>
                ))}
                <SelectItem value="other">Other (type below)</SelectItem>
              </SelectContent>
            </Select>
            
            {/* Display error if selectedSpecialty is NOT 'other' AND there is a validation error */}
            {errors.specialty && selectedSpecialty !== 'other' && !formData.specialty.trim() && (
                <p className="text-sm text-red-600 mt-1">{errors.specialty}</p>
            )}
            
            {/* Custom Input for 'Other' option */}
            {selectedSpecialty === 'other' && (
                <div className="pt-2">
                    <Input
                        type="text"
                        name="customSpecialtyInput" // Unique name for the input field
                        placeholder="Type your custom specialty here"
                        value={customSpecialty}
                        onChange={handleCustomSpecialtyChange}
                        // Show specialty error here if validation fails
                        error={errors.specialty} 
                        required
                        description="This will be set as your initial specialty."
                    />
                </div>
            )}
          </div>
        )}
      </div>
      {/* 🔑 END NEW BLOCK */}
      
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
              <a 
                  href="#" 
                  onClick={handleTermsClick} 
                  className="text-indigo-600 hover:underline font-medium"
              >
                  Terms of Service
              </a>{' '}
              and{' '}
              <a 
                  href="#" 
                  onClick={handlePrivacyClick} 
                  className="text-indigo-600 hover:underline font-medium"
              >
                  Privacy Policy
              </a>
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