import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';

const AccountPreferencesSection = ({ preferences, onUpdatePreferences }) => {
  const [formData, setFormData] = useState({
    timezone: preferences?.timezone || 'America/New_York',
    language: preferences?.language || 'en',
    dateFormat: preferences?.dateFormat || 'MM/DD/YYYY',
    timeFormat: preferences?.timeFormat || '12',
    emailNotifications: preferences?.emailNotifications || {
      newBookings: true,
      reminders: true,
      cancellations: true,
      marketing: false,
      systemUpdates: true
    },
    smsNotifications: preferences?.smsNotifications || {
      reminders: false,
      cancellations: false
    },
    availabilityHours: preferences?.availabilityHours || {
      monday: { enabled: true, start: '09:00', end: '17:00' },
      tuesday: { enabled: true, start: '09:00', end: '17:00' },
      wednesday: { enabled: true, start: '09:00', end: '17:00' },
      thursday: { enabled: true, start: '09:00', end: '17:00' },
      friday: { enabled: true, start: '09:00', end: '17:00' },
      saturday: { enabled: false, start: '09:00', end: '17:00' },
      sunday: { enabled: false, start: '09:00', end: '17:00' }
    },
    communicationPreferences: preferences?.communicationPreferences || {
      preferredMethod: 'email',
      allowClientMessages: true,
      autoResponder: false
    }
  });
  const [isEditing, setIsEditing] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const timezoneOptions = [
    { value: 'America/New_York', label: 'Eastern Time (ET)' },
    { value: 'America/Chicago', label: 'Central Time (CT)' },
    { value: 'America/Denver', label: 'Mountain Time (MT)' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
    { value: 'Europe/London', label: 'Greenwich Mean Time (GMT)' },
    { value: 'Europe/Paris', label: 'Central European Time (CET)' },
    { value: 'Asia/Tokyo', label: 'Japan Standard Time (JST)' },
    { value: 'Australia/Sydney', label: 'Australian Eastern Time (AET)' }
  ];

  const languageOptions = [
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Spanish' },
    { value: 'fr', label: 'French' },
    { value: 'de', label: 'German' },
    { value: 'it', label: 'Italian' },
    { value: 'pt', label: 'Portuguese' }
  ];

  const dateFormatOptions = [
    { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (US)' },
    { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (UK)' },
    { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (ISO)' }
  ];

  const timeFormatOptions = [
    { value: '12', label: '12-hour (AM/PM)' },
    { value: '24', label: '24-hour' }
  ];

  const communicationMethodOptions = [
    { value: 'email', label: 'Email' },
    { value: 'sms', label: 'SMS' },
    { value: 'both', label: 'Both Email & SMS' }
  ];

  const daysOfWeek = [
    { key: 'monday', label: 'Monday' },
    { key: 'tuesday', label: 'Tuesday' },
    { key: 'wednesday', label: 'Wednesday' },
    { key: 'thursday', label: 'Thursday' },
    { key: 'friday', label: 'Friday' },
    { key: 'saturday', label: 'Saturday' },
    { key: 'sunday', label: 'Sunday' }
  ];

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setHasChanges(true);
  };

  const handleNotificationChange = (category, type, checked) => {
    setFormData(prev => ({
      ...prev,
      [category]: {
        ...prev?.[category],
        [type]: checked
      }
    }));
    setHasChanges(true);
  };

  const handleAvailabilityChange = (day, field, value) => {
    setFormData(prev => ({
      ...prev,
      availabilityHours: {
        ...prev?.availabilityHours,
        [day]: {
          ...prev?.availabilityHours?.[day],
          [field]: value
        }
      }
    }));
    setHasChanges(true);
  };

  const handleCommunicationChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      communicationPreferences: {
        ...prev?.communicationPreferences,
        [field]: value
      }
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      await onUpdatePreferences(formData);
      setIsEditing(false);
      setHasChanges(false);
    } catch (error) {
      console.error('Failed to update preferences:', error);
    }
  };

  const handleCancel = () => {
    setFormData({
      timezone: preferences?.timezone || 'America/New_York',
      language: preferences?.language || 'en',
      dateFormat: preferences?.dateFormat || 'MM/DD/YYYY',
      timeFormat: preferences?.timeFormat || '12',
      emailNotifications: preferences?.emailNotifications || {
        newBookings: true,
        reminders: true,
        cancellations: true,
        marketing: false,
        systemUpdates: true
      },
      smsNotifications: preferences?.smsNotifications || {
        reminders: false,
        cancellations: false
      },
      availabilityHours: preferences?.availabilityHours || {
        monday: { enabled: true, start: '09:00', end: '17:00' },
        tuesday: { enabled: true, start: '09:00', end: '17:00' },
        wednesday: { enabled: true, start: '09:00', end: '17:00' },
        thursday: { enabled: true, start: '09:00', end: '17:00' },
        friday: { enabled: true, start: '09:00', end: '17:00' },
        saturday: { enabled: false, start: '09:00', end: '17:00' },
        sunday: { enabled: false, start: '09:00', end: '17:00' }
      },
      communicationPreferences: preferences?.communicationPreferences || {
        preferredMethod: 'email',
        allowClientMessages: true,
        autoResponder: false
      }
    });
    setIsEditing(false);
    setHasChanges(false);
  };

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center">
            <Icon name="Settings" size={20} color="rgb(100 116 139)" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Account Preferences</h3>
            <p className="text-sm text-muted-foreground">Customize your platform experience and notifications</p>
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
        {/* Regional Settings */}
        <div>
          <h4 className="text-md font-medium text-foreground mb-4 flex items-center">
            <Icon name="Globe" size={18} color="currentColor" className="mr-2" />
            Regional Settings
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Timezone"
              options={timezoneOptions}
              value={formData?.timezone}
              onChange={(value) => handleSelectChange('timezone', value)}
              disabled={!isEditing}
              searchable
            />
            <Select
              label="Language"
              options={languageOptions}
              value={formData?.language}
              onChange={(value) => handleSelectChange('language', value)}
              disabled={!isEditing}
            />
            <Select
              label="Date Format"
              options={dateFormatOptions}
              value={formData?.dateFormat}
              onChange={(value) => handleSelectChange('dateFormat', value)}
              disabled={!isEditing}
            />
            <Select
              label="Time Format"
              options={timeFormatOptions}
              value={formData?.timeFormat}
              onChange={(value) => handleSelectChange('timeFormat', value)}
              disabled={!isEditing}
            />
          </div>
        </div>

        {/* Email Notifications */}
        <div>
          <h4 className="text-md font-medium text-foreground mb-4 flex items-center">
            <Icon name="Mail" size={18} color="currentColor" className="mr-2" />
            Email Notifications
          </h4>
          <div className="space-y-3">
            <Checkbox
              label="New booking confirmations"
              description="Receive emails when clients book new sessions"
              checked={formData?.emailNotifications?.newBookings}
              onChange={(e) => handleNotificationChange('emailNotifications', 'newBookings', e?.target?.checked)}
              disabled={!isEditing}
            />
            <Checkbox
              label="Session reminders"
              description="Get reminded about upcoming coaching sessions"
              checked={formData?.emailNotifications?.reminders}
              onChange={(e) => handleNotificationChange('emailNotifications', 'reminders', e?.target?.checked)}
              disabled={!isEditing}
            />
            <Checkbox
              label="Cancellation notifications"
              description="Be notified when clients cancel or reschedule"
              checked={formData?.emailNotifications?.cancellations}
              onChange={(e) => handleNotificationChange('emailNotifications', 'cancellations', e?.target?.checked)}
              disabled={!isEditing}
            />
            <Checkbox
              label="System updates"
              description="Important platform updates and announcements"
              checked={formData?.emailNotifications?.systemUpdates}
              onChange={(e) => handleNotificationChange('emailNotifications', 'systemUpdates', e?.target?.checked)}
              disabled={!isEditing}
            />
            <Checkbox
              label="Marketing communications"
              description="Tips, resources, and promotional content"
              checked={formData?.emailNotifications?.marketing}
              onChange={(e) => handleNotificationChange('emailNotifications', 'marketing', e?.target?.checked)}
              disabled={!isEditing}
            />
          </div>
        </div>

        {/* Availability Hours */}
        <div>
          <h4 className="text-md font-medium text-foreground mb-4 flex items-center">
            <Icon name="Clock" size={18} color="currentColor" className="mr-2" />
            Availability Hours
          </h4>
          <div className="space-y-3">
            {daysOfWeek?.map(({ key, label }) => (
              <div key={key} className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center space-x-3 sm:w-32">
                  <Checkbox
                    checked={formData?.availabilityHours?.[key]?.enabled}
                    onChange={(e) => handleAvailabilityChange(key, 'enabled', e?.target?.checked)}
                    disabled={!isEditing}
                  />
                  <span className="text-sm font-medium text-foreground">{label}</span>
                </div>
                {formData?.availabilityHours?.[key]?.enabled && (
                  <div className="flex items-center space-x-2">
                    <input
                      type="time"
                      value={formData?.availabilityHours?.[key]?.start}
                      onChange={(e) => handleAvailabilityChange(key, 'start', e?.target?.value)}
                      disabled={!isEditing}
                      className="px-2 py-1 text-sm border border-border rounded bg-input disabled:bg-muted disabled:text-muted-foreground"
                    />
                    <span className="text-sm text-muted-foreground">to</span>
                    <input
                      type="time"
                      value={formData?.availabilityHours?.[key]?.end}
                      onChange={(e) => handleAvailabilityChange(key, 'end', e?.target?.value)}
                      disabled={!isEditing}
                      className="px-2 py-1 text-sm border border-border rounded bg-input disabled:bg-muted disabled:text-muted-foreground"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Communication Preferences */}
        <div>
          <h4 className="text-md font-medium text-foreground mb-4 flex items-center">
            <Icon name="MessageSquare" size={18} color="currentColor" className="mr-2" />
            Communication Preferences
          </h4>
          <div className="space-y-4">
            <Select
              label="Preferred Communication Method"
              options={communicationMethodOptions}
              value={formData?.communicationPreferences?.preferredMethod}
              onChange={(value) => handleCommunicationChange('preferredMethod', value)}
              disabled={!isEditing}
              description="How you prefer to communicate with clients"
            />
            <div className="space-y-3">
              <Checkbox
                label="Allow client messages"
                description="Let clients send you direct messages through the platform"
                checked={formData?.communicationPreferences?.allowClientMessages}
                onChange={(e) => handleCommunicationChange('allowClientMessages', e?.target?.checked)}
                disabled={!isEditing}
              />
              <Checkbox
                label="Enable auto-responder"
                description="Automatically respond to client messages when you're unavailable"
                checked={formData?.communicationPreferences?.autoResponder}
                onChange={(e) => handleCommunicationChange('autoResponder', e?.target?.checked)}
                disabled={!isEditing}
              />
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
              Save Preferences
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
            <span>Changes saved automatically</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountPreferencesSection;