// Frontend/src/pages/dashboards/coach-dashboard/components/coach-profile-editor/components/ContactSection.jsx
import React, { useState, useEffect } from 'react';
import { Phone, Mail } from 'lucide-react'; 
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

const ContactSection = ({ data, errors, updateData, setUnsavedChanges }) => {
  const [emailVerified, setEmailVerified] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);

  useEffect(() => {
    setUnsavedChanges(false);
  }, []);

  const handleInputChange = (field, value) => {
    updateData({ [field]: value });
    setUnsavedChanges(true);
  };

  

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
        <p className="text-sm text-gray-600 mb-6">
          This information will be used to contact you and may be visible to your clients.
        </p>
      </div>

      {/* Email */}
      <div className="space-y-2">
        <Input
          label="Email Address"
          type="email"
          required
          value={data?.email || ''}
          onChange={(e) => handleInputChange('email', e.target.value)}
          error={errors?.email}
          placeholder="your@email.com"
        />
      </div>

      {/* Phone */}
      <div className="space-y-2">
        <Input
          label="Phone Number"
          type="tel"
          value={data?.phone || ''}
          onChange={(e) => handleInputChange('phone', e.target.value)}
          error={errors?.phone}
          placeholder="+91 XXXXXXXXXX"
        />
        
      </div>
    </div>
  );
};

export default ContactSection;