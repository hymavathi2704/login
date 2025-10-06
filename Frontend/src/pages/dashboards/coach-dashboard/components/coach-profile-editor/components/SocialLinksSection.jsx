// Frontend/src/pages/dashboards/coach-dashboard/components/coach-profile-editor/components/SocialLinksSection.jsx
import React from 'react';
import { Linkedin, Twitter, Instagram, Facebook } from 'lucide-react';
import Input from '@/components/ui/Input';

const socialFields = [
  { id: 'linkedinUrl', label: 'LinkedIn URL', icon: Linkedin, placeholder: 'https://linkedin.com/in/yourprofile' },
  { id: 'twitterUrl', label: 'Twitter (X) URL', icon: Twitter, placeholder: 'https://twitter.com/yourhandle' },
  { id: 'instagramUrl', label: 'Instagram URL', icon: Instagram, placeholder: 'https://instagram.com/yourhandle' },
  { id: 'facebookUrl', label: 'Facebook URL', icon: Facebook, placeholder: 'https://facebook.com/yourpage' },
];

const SocialLinksSection = ({ data, updateData, setUnsavedChanges }) => {

  const handleInputChange = (field, value) => {
    updateData({ [field]: value });
    setUnsavedChanges(true);
  };

  const formatSocialUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `https://${url}`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Social Media Links</h3>
        <p className="text-sm text-gray-600 mb-6">
          Link your professional social profiles. These will be displayed on your public profile.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {socialFields.map(({ id, label, icon: Icon, placeholder }) => (
          <div key={id} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {label}
            </label>
            <div className="relative">
              <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="url"
                value={data?.[id] || ''}
                onChange={(e) => handleInputChange(id, e.target.value)}
                placeholder={placeholder}
                className="pl-10"
              />
            </div>
            
            {data?.[id] && (
                <div className="flex items-center space-x-2 text-sm text-blue-600">
                    <a 
                        href={formatSocialUrl(data?.[id])}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline flex items-center space-x-1"
                    >
                        <span>Preview link</span>
                        <Icon className="w-3 h-3" />
                    </a>
                </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SocialLinksSection;