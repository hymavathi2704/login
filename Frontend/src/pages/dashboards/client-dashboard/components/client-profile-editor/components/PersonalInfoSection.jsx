import React, { useRef, useState } from 'react';
import { Upload, X, Camera, CheckCircle, AlertCircle } from 'lucide-react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { cn } from '../../../utils/cn';

const PersonalInfoSection = ({ data, errors, updateData, setUnsavedChanges }) => {
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(data?.profilePicture || null);

  const handleInputChange = (field, value) => {
    updateData({ [field]: value });
    setUnsavedChanges(true);
  };

  const handleFileUpload = (file) => {
    if (file && file?.type?.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e?.target?.result);
        updateData({ profilePicture: e?.target?.result });
        setUnsavedChanges(true);
      };
      reader?.readAsDataURL(file);
    }
  };

  const handleDrop = (e) => {
    e?.preventDefault();
    setDragActive(false);
    
    const file = e?.dataTransfer?.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDragOver = (e) => {
    e?.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e?.preventDefault();
    setDragActive(false);
  };

  const removeProfilePicture = () => {
    setPreviewUrl(null);
    updateData({ profilePicture: null });
    setUnsavedChanges(true);
  };

  const sendEmailVerification = async () => {
    // Simulate email verification
    console.log('Sending email verification...');
    updateData({ emailVerified: false });
  };

  const sendPhoneVerification = async () => {
    // Simulate phone verification
    console.log('Sending phone verification...');
    updateData({ phoneVerified: false });
  };

  return (
    <div className="space-y-6">
      {/* Profile Picture Upload */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Profile Picture</h3>
        <p className="text-sm text-gray-600">
          Your profile picture will be visible to coaches when you inquire about their services.
        </p>
        
        <div className="flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-6">
          {/* Avatar Preview */}
          <div className="relative">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
              {previewUrl ? (
                <img 
                  src={previewUrl} 
                  alt="Profile preview" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <Camera className="w-8 h-8 text-gray-400" />
              )}
            </div>
            
            {previewUrl && (
              <button
                onClick={removeProfilePicture}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Upload Area */}
          <div className="flex-1">
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={cn(
                "border-2 border-dashed rounded-lg p-6 text-center transition-colors",
                dragActive 
                  ? "border-blue-400 bg-blue-50" :"border-gray-300 hover:border-gray-400"
              )}
            >
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500">
                  PNG, JPG, GIF up to 5MB
                </p>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef?.current?.click()}
                className="mt-4"
              >
                Choose File
              </Button>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleFileUpload(e?.target?.files?.[0])}
                className="hidden"
              />
            </div>
          </div>
        </div>
      </div>
      {/* Personal Information Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="First Name"
          required
          value={data?.firstName || ''}
          onChange={(e) => handleInputChange('firstName', e?.target?.value)}
          error={errors?.firstName}
          placeholder="Enter your first name"
        />
        
        <Input
          label="Last Name"
          required
          value={data?.lastName || ''}
          onChange={(e) => handleInputChange('lastName', e?.target?.value)}
          error={errors?.lastName}
          placeholder="Enter your last name"
        />
      </div>
      {/* Contact Information */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
        
        {/* Email */}
        <div className="space-y-2">
          <Input
            label="Email Address"
            type="email"
            required
            value={data?.email || ''}
            onChange={(e) => handleInputChange('email', e?.target?.value)}
            error={errors?.email}
            placeholder="your@email.com"
            description="Primary email for account notifications and coach communications"
          />
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {data?.emailVerified ? (
                <span className="inline-flex items-center text-xs px-2 py-1 rounded-full bg-green-100 text-green-800">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Email Verified
                </span>
              ) : (
                <span className="inline-flex items-center text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-800">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Email Not Verified
                </span>
              )}
            </div>
            
            {!data?.emailVerified && data?.email && (
              <Button
                variant="outline"
                size="xs"
                onClick={sendEmailVerification}
              >
                Verify Email
              </Button>
            )}
          </div>
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <Input
            label="Phone Number"
            type="tel"
            value={data?.phone || ''}
            onChange={(e) => handleInputChange('phone', e?.target?.value)}
            placeholder="+1 (555) 123-4567"
            description="Optional: For urgent communications from coaches"
          />
          
          {data?.phone && (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {data?.phoneVerified ? (
                  <span className="inline-flex items-center text-xs px-2 py-1 rounded-full bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Phone Verified
                  </span>
                ) : (
                  <span className="inline-flex items-center text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-800">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Phone Not Verified
                  </span>
                )}
              </div>
              
              {!data?.phoneVerified && (
                <Button
                  variant="outline"
                  size="xs"
                  onClick={sendPhoneVerification}
                >
                  Verify Phone
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
      {/* Profile Visibility Settings */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h4 className="font-medium text-blue-900 mb-4">Profile Visibility</h4>
        <div className="space-y-3">
          <label className="flex items-start space-x-3">
            <input
              type="radio"
              name="profileVisibility"
              value="coaches-only"
              checked={data?.profileVisibility !== 'public'}
              onChange={() => handleInputChange('profileVisibility', 'coaches-only')}
              className="mt-0.5 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
            />
            <div>
              <p className="text-sm font-medium text-blue-900">Coaches Only (Recommended)</p>
              <p className="text-xs text-blue-700">
                Your profile is only visible to coaches when you inquire about their services.
              </p>
            </div>
          </label>
          
          <label className="flex items-start space-x-3">
            <input
              type="radio"
              name="profileVisibility"
              value="public"
              checked={data?.profileVisibility === 'public'}
              onChange={() => handleInputChange('profileVisibility', 'public')}
              className="mt-0.5 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
            />
            <div>
              <p className="text-sm font-medium text-blue-900">Public Profile</p>
              <p className="text-xs text-blue-700">
                Your profile may appear in coach testimonials and case studies (with your permission).
              </p>
            </div>
          </label>
        </div>
      </div>
      {/* Profile Preview */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h4 className="text-sm font-medium text-gray-900 mb-4">Profile Preview</h4>
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
            {previewUrl ? (
              <img 
                src={previewUrl} 
                alt="Profile preview" 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Camera className="w-6 h-6 text-gray-400" />
              </div>
            )}
          </div>
          <div>
            <h5 className="font-semibold text-gray-900">
              {data?.firstName || data?.lastName 
                ? `${data?.firstName || ''} ${data?.lastName || ''}`?.trim() || 'Your Name'
                : 'Your Name'
              }
            </h5>
            <p className="text-sm text-gray-600">
              Client • {data?.profileVisibility === 'public' ? 'Public Profile' : 'Private Profile'}
            </p>
            <div className="flex items-center space-x-3 mt-1">
              {data?.emailVerified && (
                <span className="text-xs text-green-600">✓ Email</span>
              )}
              {data?.phoneVerified && (
                <span className="text-xs text-green-600">✓ Phone</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalInfoSection;