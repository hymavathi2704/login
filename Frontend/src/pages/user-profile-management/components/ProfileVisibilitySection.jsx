import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { Checkbox } from '../../../components/ui/Checkbox';


const ProfileVisibilitySection = ({ visibilitySettings, onUpdateVisibility }) => {
  const [settings, setSettings] = useState({
    profilePublic: visibilitySettings?.profilePublic || false,
    showEmail: visibilitySettings?.showEmail || false,
    showPhone: visibilitySettings?.showPhone || false,
    showRates: visibilitySettings?.showRates || true,
    showAvailability: visibilitySettings?.showAvailability || true,
    showTestimonials: visibilitySettings?.showTestimonials || true,
    showCertifications: visibilitySettings?.showCertifications || true,
    searchable: visibilitySettings?.searchable || true,
    profileUrl: visibilitySettings?.profileUrl || 'coachflow.com/coach/john-doe',
    directBooking: visibilitySettings?.directBooking || false,
    clientReviews: visibilitySettings?.clientReviews || true,
    socialLinks: visibilitySettings?.socialLinks || {
      linkedin: '',
      twitter: '',
      website: '',
      instagram: ''
    }
  });
  const [isEditing, setIsEditing] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const visibilityOptions = [
    {
      key: 'profilePublic',
      title: 'Public Profile',
      description: 'Make your profile visible to potential clients',
      icon: 'Globe',
      critical: true
    },
    {
      key: 'searchable',
      title: 'Searchable Profile',
      description: 'Allow your profile to appear in search results',
      icon: 'Search',
      dependsOn: 'profilePublic'
    },
    {
      key: 'showRates',
      title: 'Display Rates',
      description: 'Show your hourly rates on your public profile',
      icon: 'DollarSign',
      dependsOn: 'profilePublic'
    },
    {
      key: 'showAvailability',
      title: 'Show Availability',
      description: 'Display your available time slots',
      icon: 'Calendar',
      dependsOn: 'profilePublic'
    },
    {
      key: 'directBooking',
      title: 'Direct Booking',
      description: 'Allow clients to book sessions directly from your profile',
      icon: 'BookOpen',
      dependsOn: 'profilePublic'
    },
    {
      key: 'showTestimonials',
      title: 'Client Testimonials',
      description: 'Display client reviews and testimonials',
      icon: 'Star',
      dependsOn: 'profilePublic'
    },
    {
      key: 'clientReviews',
      title: 'Client Reviews',
      description: 'Allow clients to leave public reviews',
      icon: 'MessageSquare',
      dependsOn: 'profilePublic'
    },
    {
      key: 'showCertifications',
      title: 'Show Certifications',
      description: 'Display your professional certifications',
      icon: 'Award',
      dependsOn: 'profilePublic'
    }
  ];

  const contactVisibilityOptions = [
    {
      key: 'showEmail',
      title: 'Email Address',
      description: 'Show your email on your public profile',
      icon: 'Mail'
    },
    {
      key: 'showPhone',
      title: 'Phone Number',
      description: 'Display your phone number for direct contact',
      icon: 'Phone'
    }
  ];

  const handleSettingChange = (key, value) => {
    setSettings(prev => {
      const newSettings = {
        ...prev,
        [key]: value
      };

      // If profilePublic is disabled, disable dependent settings
      if (key === 'profilePublic' && !value) {
        visibilityOptions?.forEach(option => {
          if (option?.dependsOn === 'profilePublic') {
            newSettings[option.key] = false;
          }
        });
        // Also disable contact visibility
        newSettings.showEmail = false;
        newSettings.showPhone = false;
      }

      return newSettings;
    });
    setHasChanges(true);
  };

  const handleSocialLinkChange = (platform, value) => {
    setSettings(prev => ({
      ...prev,
      socialLinks: {
        ...prev?.socialLinks,
        [platform]: value
      }
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      await onUpdateVisibility(settings);
      setIsEditing(false);
      setHasChanges(false);
    } catch (error) {
      console.error('Failed to update visibility settings:', error);
    }
  };

  const handleCancel = () => {
    setSettings({
      profilePublic: visibilitySettings?.profilePublic || false,
      showEmail: visibilitySettings?.showEmail || false,
      showPhone: visibilitySettings?.showPhone || false,
      showRates: visibilitySettings?.showRates || true,
      showAvailability: visibilitySettings?.showAvailability || true,
      showTestimonials: visibilitySettings?.showTestimonials || true,
      showCertifications: visibilitySettings?.showCertifications || true,
      searchable: visibilitySettings?.searchable || true,
      profileUrl: visibilitySettings?.profileUrl || 'coachflow.com/coach/john-doe',
      directBooking: visibilitySettings?.directBooking || false,
      clientReviews: visibilitySettings?.clientReviews || true,
      socialLinks: visibilitySettings?.socialLinks || {
        linkedin: '',
        twitter: '',
        website: '',
        instagram: ''
      }
    });
    setIsEditing(false);
    setHasChanges(false);
  };

  const generateProfileUrl = () => {
    const baseUrl = 'coachflow.com/coach/';
    const randomId = Math.random()?.toString(36)?.substring(2, 8);
    const newUrl = `${baseUrl}coach-${randomId}`;
    setSettings(prev => ({
      ...prev,
      profileUrl: newUrl
    }));
    setHasChanges(true);
  };

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <Icon name="Eye" size={20} color="rgb(37 99 235)" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Profile Visibility</h3>
            <p className="text-sm text-muted-foreground">Control what information is visible to potential clients</p>
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
      <div className="space-y-8">
        {/* Profile Status */}
        <div className={`p-4 rounded-lg border-2 ${
          settings?.profilePublic 
            ? 'bg-success/10 border-success/20' :'bg-warning/10 border-warning/20'
        }`}>
          <div className="flex items-center space-x-3">
            <Icon 
              name={settings?.profilePublic ? "CheckCircle" : "AlertCircle"} 
              size={20} 
              color={settings?.profilePublic ? "rgb(16 185 129)" : "rgb(245 158 11)"} 
            />
            <div>
              <h4 className="text-sm font-medium text-foreground">
                Profile Status: {settings?.profilePublic ? 'Public' : 'Private'}
              </h4>
              <p className="text-sm text-muted-foreground">
                {settings?.profilePublic 
                  ? 'Your profile is visible to potential clients' :'Your profile is hidden from public view'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Public Profile URL */}
        <div>
          <h4 className="text-md font-medium text-foreground mb-4 flex items-center">
            <Icon name="Link" size={18} color="currentColor" className="mr-2" />
            Profile URL
          </h4>
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <div className="p-3 bg-muted rounded-lg border border-border">
                  <p className="text-sm font-mono text-foreground">{settings?.profileUrl}</p>
                </div>
              </div>
              {isEditing && (
                <Button
                  variant="outline"
                  onClick={generateProfileUrl}
                  iconName="RefreshCw"
                  iconPosition="left"
                  iconSize={16}
                >
                  Generate New
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigator.clipboard?.writeText(`https://${settings?.profileUrl}`)}
                iconName="Copy"
                iconPosition="left"
                iconSize={16}
              >
                Copy Link
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open(`https://${settings?.profileUrl}`, '_blank')}
                iconName="ExternalLink"
                iconPosition="left"
                iconSize={16}
              >
                Preview
              </Button>
            </div>
          </div>
        </div>

        {/* Profile Visibility Settings */}
        <div>
          <h4 className="text-md font-medium text-foreground mb-4 flex items-center">
            <Icon name="Settings" size={18} color="currentColor" className="mr-2" />
            Visibility Settings
          </h4>
          <div className="space-y-4">
            {visibilityOptions?.map((option) => (
              <div key={option?.key} className="flex items-start space-x-3 p-3 bg-muted/50 rounded-lg">
                <div className="w-8 h-8 bg-card rounded-lg flex items-center justify-center border border-border flex-shrink-0 mt-1">
                  <Icon name={option?.icon} size={16} color="currentColor" />
                </div>
                <div className="flex-1">
                  <Checkbox
                    label={option?.title}
                    description={option?.description}
                    checked={settings?.[option?.key]}
                    onChange={(e) => handleSettingChange(option?.key, e?.target?.checked)}
                    disabled={!isEditing || (option?.dependsOn && !settings?.[option?.dependsOn])}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Information Visibility */}
        <div>
          <h4 className="text-md font-medium text-foreground mb-4 flex items-center">
            <Icon name="Contact" size={18} color="currentColor" className="mr-2" />
            Contact Information
          </h4>
          <div className="space-y-4">
            {contactVisibilityOptions?.map((option) => (
              <div key={option?.key} className="flex items-start space-x-3 p-3 bg-muted/50 rounded-lg">
                <div className="w-8 h-8 bg-card rounded-lg flex items-center justify-center border border-border flex-shrink-0 mt-1">
                  <Icon name={option?.icon} size={16} color="currentColor" />
                </div>
                <div className="flex-1">
                  <Checkbox
                    label={option?.title}
                    description={option?.description}
                    checked={settings?.[option?.key]}
                    onChange={(e) => handleSettingChange(option?.key, e?.target?.checked)}
                    disabled={!isEditing || !settings?.profilePublic}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Social Links */}
        <div>
          <h4 className="text-md font-medium text-foreground mb-4 flex items-center">
            <Icon name="Share2" size={18} color="currentColor" className="mr-2" />
            Social Links
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">LinkedIn</label>
              <div className="flex items-center space-x-2">
                <Icon name="Linkedin" size={16} color="currentColor" />
                <input
                  type="url"
                  value={settings?.socialLinks?.linkedin}
                  onChange={(e) => handleSocialLinkChange('linkedin', e?.target?.value)}
                  placeholder="https://linkedin.com/in/yourprofile"
                  disabled={!isEditing || !settings?.profilePublic}
                  className="flex-1 px-3 py-2 text-sm border border-border rounded-lg bg-input disabled:bg-muted disabled:text-muted-foreground"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Website</label>
              <div className="flex items-center space-x-2">
                <Icon name="Globe" size={16} color="currentColor" />
                <input
                  type="url"
                  value={settings?.socialLinks?.website}
                  onChange={(e) => handleSocialLinkChange('website', e?.target?.value)}
                  placeholder="https://yourwebsite.com"
                  disabled={!isEditing || !settings?.profilePublic}
                  className="flex-1 px-3 py-2 text-sm border border-border rounded-lg bg-input disabled:bg-muted disabled:text-muted-foreground"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Twitter</label>
              <div className="flex items-center space-x-2">
                <Icon name="Twitter" size={16} color="currentColor" />
                <input
                  type="url"
                  value={settings?.socialLinks?.twitter}
                  onChange={(e) => handleSocialLinkChange('twitter', e?.target?.value)}
                  placeholder="https://twitter.com/yourusername"
                  disabled={!isEditing || !settings?.profilePublic}
                  className="flex-1 px-3 py-2 text-sm border border-border rounded-lg bg-input disabled:bg-muted disabled:text-muted-foreground"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Instagram</label>
              <div className="flex items-center space-x-2">
                <Icon name="Instagram" size={16} color="currentColor" />
                <input
                  type="url"
                  value={settings?.socialLinks?.instagram}
                  onChange={(e) => handleSocialLinkChange('instagram', e?.target?.value)}
                  placeholder="https://instagram.com/yourusername"
                  disabled={!isEditing || !settings?.profilePublic}
                  className="flex-1 px-3 py-2 text-sm border border-border rounded-lg bg-input disabled:bg-muted disabled:text-muted-foreground"
                />
              </div>
            </div>
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
              Save Settings
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

        {/* Auto-save indicator */}
        {hasChanges && !isEditing && (
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Icon name="Check" size={16} color="rgb(16 185 129)" />
            <span>Settings saved automatically</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileVisibilitySection;