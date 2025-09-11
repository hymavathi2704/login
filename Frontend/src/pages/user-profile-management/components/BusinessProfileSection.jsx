import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';

const BusinessProfileSection = ({ businessProfile, onUpdateBusinessProfile }) => {
  const [formData, setFormData] = useState({
    specialization: businessProfile?.specialization || '',
    bio: businessProfile?.bio || '',
    hourlyRate: businessProfile?.hourlyRate || '',
    currency: businessProfile?.currency || 'USD',
    serviceOfferings: businessProfile?.serviceOfferings || [],
    experience: businessProfile?.experience || '',
    certifications: businessProfile?.certifications || ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [errors, setErrors] = useState({});

  const specializationOptions = [
    { value: 'life-coaching', label: 'Life Coaching' },
    { value: 'business-coaching', label: 'Business Coaching' },
    { value: 'executive-coaching', label: 'Executive Coaching' },
    { value: 'career-coaching', label: 'Career Coaching' },
    { value: 'wellness-coaching', label: 'Wellness Coaching' },
    { value: 'fitness-coaching', label: 'Fitness Coaching' },
    { value: 'relationship-coaching', label: 'Relationship Coaching' },
    { value: 'financial-coaching', label: 'Financial Coaching' },
    { value: 'leadership-coaching', label: 'Leadership Coaching' },
    { value: 'other', label: 'Other' }
  ];

  const currencyOptions = [
    { value: 'USD', label: 'USD ($)' },
    { value: 'EUR', label: 'EUR (€)' },
    { value: 'GBP', label: 'GBP (£)' },
    { value: 'CAD', label: 'CAD (C$)' },
    { value: 'AUD', label: 'AUD (A$)' }
  ];

  const serviceOptions = [
    { value: 'one-on-one', label: 'One-on-One Coaching' },
    { value: 'group-coaching', label: 'Group Coaching' },
    { value: 'workshops', label: 'Workshops & Seminars' },
    { value: 'online-courses', label: 'Online Courses' },
    { value: 'consultation', label: 'Consultation Services' },
    { value: 'mentoring', label: 'Mentoring Programs' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e?.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors?.[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors?.[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData?.specialization) {
      newErrors.specialization = 'Please select your coaching specialization';
    }
    
    if (!formData?.bio?.trim()) {
      newErrors.bio = 'Professional bio is required';
    } else if (formData?.bio?.trim()?.length < 50) {
      newErrors.bio = 'Bio should be at least 50 characters long';
    }
    
    if (formData?.hourlyRate && (isNaN(formData?.hourlyRate) || parseFloat(formData?.hourlyRate) <= 0)) {
      newErrors.hourlyRate = 'Please enter a valid hourly rate';
    }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      await onUpdateBusinessProfile(formData);
      setIsEditing(false);
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        general: 'Failed to update business profile. Please try again.'
      }));
    }
  };

  const handleCancel = () => {
    setFormData({
      specialization: businessProfile?.specialization || '',
      bio: businessProfile?.bio || '',
      hourlyRate: businessProfile?.hourlyRate || '',
      currency: businessProfile?.currency || 'USD',
      serviceOfferings: businessProfile?.serviceOfferings || [],
      experience: businessProfile?.experience || '',
      certifications: businessProfile?.certifications || ''
    });
    setErrors({});
    setIsEditing(false);
  };

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
            <Icon name="Briefcase" size={20} color="rgb(5 150 105)" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Business Profile</h3>
            <p className="text-sm text-muted-foreground">Manage your coaching business information and services</p>
          </div>
        </div>
        {!isEditing && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(true)}
            iconName="Edit2"
            iconPosition="left"
            iconSize={16}
          >
            Edit
          </Button>
        )}
      </div>
      {errors?.general && (
        <div className="mb-4 p-3 bg-error/10 border border-error/20 rounded-lg">
          <p className="text-sm text-error">{errors?.general}</p>
        </div>
      )}
      <div className="space-y-6">
        {/* Specialization */}
        <Select
          label="Coaching Specialization"
          options={specializationOptions}
          value={formData?.specialization}
          onChange={(value) => handleSelectChange('specialization', value)}
          placeholder="Select your primary coaching area"
          disabled={!isEditing}
          required
          error={errors?.specialization}
          description="Choose the area where you have the most expertise"
        />

        {/* Professional Bio */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Professional Bio <span className="text-error">*</span>
          </label>
          <textarea
            name="bio"
            value={formData?.bio}
            onChange={handleInputChange}
            placeholder="Tell potential clients about your coaching philosophy, experience, and approach. This will be visible on your public profile."
            disabled={!isEditing}
            rows={6}
            className={`w-full px-3 py-2 border rounded-lg resize-none transition-colors ${
              !isEditing 
                ? 'bg-muted border-border text-muted-foreground cursor-not-allowed' 
                : 'bg-input border-border text-foreground focus:border-ring focus:ring-2 focus:ring-ring/20'
            } ${errors?.bio ? 'border-error' : ''}`}
          />
          <div className="flex justify-between items-center mt-1">
            <div className="text-xs text-muted-foreground">
              {formData?.bio?.length}/500 characters (minimum 50)
            </div>
            {errors?.bio && (
              <p className="text-sm text-error">{errors?.bio}</p>
            )}
          </div>
        </div>

        {/* Pricing */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Hourly Rate"
            name="hourlyRate"
            type="number"
            value={formData?.hourlyRate}
            onChange={handleInputChange}
            placeholder="150"
            disabled={!isEditing}
            error={errors?.hourlyRate}
            description="Your standard coaching session rate"
            min="0"
            step="0.01"
          />
          <Select
            label="Currency"
            options={currencyOptions}
            value={formData?.currency}
            onChange={(value) => handleSelectChange('currency', value)}
            disabled={!isEditing}
            description="Pricing currency for your services"
          />
        </div>

        {/* Service Offerings */}
        <Select
          label="Service Offerings"
          options={serviceOptions}
          value={formData?.serviceOfferings}
          onChange={(value) => handleSelectChange('serviceOfferings', value)}
          placeholder="Select the services you offer"
          disabled={!isEditing}
          multiple
          searchable
          description="Choose all services you provide to clients"
        />

        {/* Experience */}
        <Input
          label="Years of Experience"
          name="experience"
          type="number"
          value={formData?.experience}
          onChange={handleInputChange}
          placeholder="5"
          disabled={!isEditing}
          description="Total years of coaching experience"
          min="0"
          max="50"
        />

        {/* Certifications */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Certifications & Credentials
          </label>
          <textarea
            name="certifications"
            value={formData?.certifications}
            onChange={handleInputChange}
            placeholder="List your relevant certifications, degrees, and professional credentials (e.g., ICF Certified Coach, MBA, etc.)"
            disabled={!isEditing}
            rows={4}
            className={`w-full px-3 py-2 border rounded-lg resize-none transition-colors ${
              !isEditing 
                ? 'bg-muted border-border text-muted-foreground cursor-not-allowed' 
                : 'bg-input border-border text-foreground focus:border-ring focus:ring-2 focus:ring-ring/20'
            }`}
          />
          <div className="text-xs text-muted-foreground mt-1">
            Include relevant certifications to build client trust
          </div>
        </div>

        {/* Action Buttons */}
        {isEditing && (
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border">
            <Button
              variant="default"
              onClick={handleSave}
              iconName="Save"
              iconPosition="left"
              iconSize={16}
              className="sm:w-auto"
            >
              Save Changes
            </Button>
            <Button
              variant="outline"
              onClick={handleCancel}
              iconName="X"
              iconPosition="left"
              iconSize={16}
              className="sm:w-auto"
            >
              Cancel
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BusinessProfileSection;