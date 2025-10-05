import React, { useState } from 'react';
import { Globe, Phone, Mail, ExternalLink } from 'lucide-react';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';

const ContactSection = ({ data, errors, updateData, setUnsavedChanges }) => {
  const [emailVerified, setEmailVerified] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);

  const handleInputChange = (field, value) => {
    updateData({ [field]: value });
    setUnsavedChanges(true);
  };

  const validateWebsiteUrl = (url) => {
    if (!url) return true;
    try {
      new URL(url.startsWith('http') ? url : `https://${url}`);
      return true;
    } catch {
      return false;
    }
  };

  const formatWebsiteUrl = (url) => {
    if (!url) return '';
    return url?.startsWith('http') ? url : `https://${url}`;
  };

  const sendVerificationEmail = async () => {
    // Simulate verification email
    console.log('Sending verification email...');
    // In real app, this would trigger email verification
  };

  const sendVerificationSMS = async () => {
    // Simulate verification SMS
    console.log('Sending verification SMS...');
    // In real app, this would trigger SMS verification
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
        <p className="text-sm text-gray-600 mb-6">
          This information will be used to contact you and may be visible to your clients.
        </p>
      </div>
      <div className="space-y-6">
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
            description="Primary email for account notifications and client communications"
          />
          
          <div className="flex items-center space-x-3">
            <span className={`text-xs px-2 py-1 rounded-full ${
              emailVerified 
                ? 'bg-green-100 text-green-800' :'bg-yellow-100 text-yellow-800'
            }`}>
              {emailVerified ? '✓ Verified' : '⚠ Unverified'}
            </span>
            
            {!emailVerified && data?.email && (
              <Button
                variant="outline"
                size="xs"
                onClick={sendVerificationEmail}
              >
                Send Verification
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
            error={errors?.phone}
            placeholder="+1 (555) 123-4567"
            description="Optional: Phone number for urgent client communications"
          />
          
          {data?.phone && (
            <div className="flex items-center space-x-3">
              <span className={`text-xs px-2 py-1 rounded-full ${
                phoneVerified 
                  ? 'bg-green-100 text-green-800' :'bg-yellow-100 text-yellow-800'
              }`}>
                {phoneVerified ? '✓ Verified' : '⚠ Unverified'}
              </span>
              
              {!phoneVerified && (
                <Button
                  variant="outline"
                  size="xs"
                  onClick={sendVerificationSMS}
                >
                  Send SMS Verification
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Website */}
        <div className="space-y-2">
          <Input
            label="Website URL"
            type="url"
            value={data?.websiteUrl || ''}
            onChange={(e) => handleInputChange('websiteUrl', e?.target?.value)}
            error={
              data?.websiteUrl && !validateWebsiteUrl(data?.websiteUrl) 
                ? 'Please enter a valid website URL' 
                : undefined
            }
            placeholder="www.yourwebsite.com"
            description="Your professional website or portfolio"
          />
          
          {data?.websiteUrl && validateWebsiteUrl(data?.websiteUrl) && (
            <div className="flex items-center space-x-2 text-sm text-blue-600">
              <Globe className="w-4 h-4" />
              <a 
                href={formatWebsiteUrl(data?.websiteUrl)}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline flex items-center space-x-1"
              >
                <span>Preview website</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}
        </div>
      </div>
      {/* Contact Preferences */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h4 className="font-medium text-gray-900 mb-4">Contact Preferences</h4>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-3 block">
              How would you like clients to contact you?
            </label>
            
            <div className="space-y-2">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={data?.allowEmailContact ?? true}
                  onChange={(e) => handleInputChange('allowEmailContact', e?.target?.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-700">Email messages</span>
                </div>
              </label>
              
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={data?.allowPhoneContact ?? false}
                  onChange={(e) => handleInputChange('allowPhoneContact', e?.target?.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-700">Phone calls</span>
                </div>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Response Time Commitment
            </label>
            <select
              value={data?.responseTime || 'within-24h'}
              onChange={(e) => handleInputChange('responseTime', e?.target?.value)}
              className="w-full rounded-md border-gray-300 py-2 px-3 text-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="within-1h">Within 1 hour</option>
              <option value="within-4h">Within 4 hours</option>
              <option value="within-24h">Within 24 hours</option>
              <option value="within-48h">Within 48 hours</option>
              <option value="varies">Response time varies</option>
            </select>
          </div>
        </div>
      </div>
      {/* Contact Summary */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h4 className="font-medium text-blue-900 mb-3">Contact Summary</h4>
        <div className="text-sm text-blue-800 space-y-1">
          <p><strong>Email:</strong> {data?.email || 'Not provided'}</p>
          <p><strong>Phone:</strong> {data?.phone || 'Not provided'}</p>
          <p><strong>Website:</strong> {data?.websiteUrl || 'Not provided'}</p>
          <p><strong>Preferred Contact:</strong> {
            data?.allowEmailContact && data?.allowPhoneContact 
              ? 'Email and Phone'
              : data?.allowEmailContact 
                ? 'Email only'
                : data?.allowPhoneContact
                  ? 'Phone only' :'No preference set'
          }</p>
        </div>
      </div>
    </div>
  );
};

export default ContactSection;