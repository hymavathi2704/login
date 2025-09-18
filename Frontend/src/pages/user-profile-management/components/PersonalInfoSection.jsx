import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import axios from 'axios';

const PersonalInfoSection = ({ userProfile, onProfileUpdated }) => {
  const [formData, setFormData] = useState({
    firstName: userProfile?.firstName || '',
    lastName: userProfile?.lastName || '',
    email: userProfile?.email || '',
    phone: userProfile?.phone || '',
    profilePhoto: userProfile?.profilePhoto || ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setFormData({
      firstName: userProfile?.firstName || '',
      lastName: userProfile?.lastName || '',
      email: userProfile?.email || '',
      phone: userProfile?.phone || '',
      profilePhoto: userProfile?.profilePhoto || ''
    });
  }, [userProfile]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors?.[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({ ...prev, profilePhoto: 'Please select a valid image file' }));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, profilePhoto: 'Image size must be less than 5MB' }));
      return;
    }

    setIsUploading(true);
    try {
      const data = new FormData();
      data.append('profilePhoto', file);

      const token = localStorage.getItem('accessToken');
      const response = await axios.put(
        'http://localhost:4028/api/auth/me/photo',
        data,
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } }
      );

      setFormData(prev => ({ ...prev, profilePhoto: response.data.profilePhoto }));
      setErrors(prev => ({ ...prev, profilePhoto: '' }));
    } catch (error) {
      setErrors(prev => ({ ...prev, profilePhoto: 'Failed to upload image. Please try again.' }));
    } finally {
      setIsUploading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Please enter a valid email address';
    if (formData.phone && !/^\+?[\d\s\-\(\)]+$/.test(formData.phone)) newErrors.phone = 'Please enter a valid phone number';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.put(
        'http://localhost:4028/api/auth/me',
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setIsEditing(false);
      onProfileUpdated(response.data); // update parent state
    } catch (error) {
      setErrors(prev => ({ ...prev, general: 'Failed to update profile. Please try again.' }));
    }
  };

  const handleCancel = () => {
    setFormData({
      firstName: userProfile?.firstName || '',
      lastName: userProfile?.lastName || '',
      email: userProfile?.email || '',
      phone: userProfile?.phone || '',
      profilePhoto: userProfile?.profilePhoto || ''
    });
    setErrors({});
    setIsEditing(false);
  };

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <Icon name="User" size={20} color="rgb(37 99 235)" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Personal Information</h3>
            <p className="text-sm text-muted-foreground">Update your personal details and contact information</p>
          </div>
        </div>
        {!isEditing && (
          <Button variant="outline" size="sm" onClick={() => setIsEditing(true)} iconName="Edit2" iconPosition="left" iconSize={16}>Edit</Button>
        )}
      </div>

      {errors?.general && (
        <div className="mb-4 p-3 bg-error/10 border border-error/20 rounded-lg">
          <p className="text-sm text-error">{errors.general}</p>
        </div>
      )}

      <div className="space-y-6">
        {/* Profile Photo */}
        <div className="flex flex-col sm:flex-row sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
          <div className="flex-shrink-0">
            <div className="relative">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-muted border-2 border-border">
                {formData.profilePhoto ? (
                  <Image src={formData.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Icon name="User" size={32} color="rgb(100 116 139)" />
                  </div>
                )}
              </div>
              {isEditing && (
                <label className="absolute -bottom-2 -right-2 w-8 h-8 bg-primary rounded-full flex items-center justify-center cursor-pointer hover:bg-primary/90 transition-colors">
                  <Icon name="Camera" size={16} color="white" />
                  <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" disabled={isUploading} />
                </label>
              )}
              {isUploading && (
                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                  <Icon name="Loader2" size={20} color="white" className="animate-spin" />
                </div>
              )}
            </div>
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-medium text-foreground mb-1">Profile Photo</h4>
            <p className="text-sm text-muted-foreground mb-2">Upload a professional photo that represents you as a coach</p>
            {isEditing && <div className="text-xs text-muted-foreground">Recommended: Square image, at least 400x400px, max 5MB</div>}
            {errors.profilePhoto && <p className="text-sm text-error mt-1">{errors.profilePhoto}</p>}
          </div>
        </div>

        {/* Name Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="First Name" name="firstName" type="text" value={formData.firstName} onChange={handleInputChange} placeholder="Enter your first name" disabled={!isEditing} required error={errors.firstName} />
          <Input label="Last Name" name="lastName" type="text" value={formData.lastName} onChange={handleInputChange} placeholder="Enter your last name" disabled={!isEditing} required error={errors.lastName} />
        </div>

        {/* Contact Information */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Email Address" name="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="Enter your email address" disabled={!isEditing} required error={errors.email} description={!userProfile?.emailVerified ? "Email not verified" : ""} />
          <Input label="Phone Number" name="phone" type="tel" value={formData.phone} onChange={handleInputChange} placeholder="Enter your phone number" disabled={!isEditing} error={errors.phone} description="Optional - for client communication" />
        </div>

        {/* Action Buttons */}
        {isEditing && (
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border">
            <Button variant="default" onClick={handleSave} iconName="Save" iconPosition="left" iconSize={16} className="sm:w-auto">Save Changes</Button>
            <Button variant="outline" onClick={handleCancel} iconName="X" iconPosition="left" iconSize={16} className="sm:w-auto">Cancel</Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PersonalInfoSection;
