import React, { useState } from 'react';
import { Shield, Bell, CreditCard, User, Trash2 } from 'lucide-react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';

const AccountSettings = () => {
  const [formData, setFormData] = useState({
    // Security
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    enable2FA: true,
    // Notifications
    emailNotifications: true,
    pushNotifications: false,
    // Billing
    cardName: '',
    cardNumber: '',
    expiryDate: '',
    cvc: '',
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSaveChanges = (e) => {
    e.preventDefault();
    // Add logic to save changes to the backend
    console.log('Saving changes:', formData);
    // You might want to show a toast notification here
  };

  const handleDeleteAccount = () => {
    // Add confirmation modal before deleting
    console.log('Deleting account...');
  };

  return (
    <div className="space-y-12">
      {/* Security Settings */}
      <section>
        <div className="flex items-center space-x-3 mb-6">
          <Shield className="w-6 h-6 text-gray-700" />
          <h2 className="text-2xl font-semibold text-gray-800">Security</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            id="currentPassword"
            name="currentPassword"
            type="password"
            label="Current Password"
            value={formData.currentPassword}
            onChange={handleChange}
          />
          <div />
          <Input
            id="newPassword"
            name="newPassword"
            type="password"
            label="New Password"
            value={formData.newPassword}
            onChange={handleChange}
          />
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            label="Confirm New Password"
            value={formData.confirmPassword}
            onChange={handleChange}
          />
        </div>
        <div className="mt-6 flex items-center space-x-3">
          <Checkbox
            id="enable2FA"
            name="enable2FA"
            checked={formData.enable2FA}
            onCheckedChange={(checked) => handleChange({ target: { name: 'enable2FA', type: 'checkbox', checked } })}
          />
          <label htmlFor="enable2FA" className="text-sm font-medium text-gray-700">
            Enable Two-Factor Authentication (2FA)
          </label>
        </div>
      </section>

      {/* Notification Settings */}
      <section>
        <div className="flex items-center space-x-3 mb-6">
          <Bell className="w-6 h-6 text-gray-700" />
          <h2 className="text-2xl font-semibold text-gray-800">Notifications</h2>
        </div>
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <Checkbox
              id="emailNotifications"
              name="emailNotifications"
              checked={formData.emailNotifications}
              onCheckedChange={(checked) => handleChange({ target: { name: 'emailNotifications', type: 'checkbox', checked } })}
            />
            <label htmlFor="emailNotifications" className="text-sm font-medium text-gray-700">
              Receive email notifications for messages and updates
            </label>
          </div>
          <div className="flex items-center space-x-3">
            <Checkbox
              id="pushNotifications"
              name="pushNotifications"
              checked={formData.pushNotifications}
              onCheckedChange={(checked) => handleChange({ target: { name: 'pushNotifications', type: 'checkbox', checked } })}
            />
            <label htmlFor="pushNotifications" className="text-sm font-medium text-gray-700">
              Enable push notifications on your devices
            </label>
          </div>
        </div>
      </section>

      {/* Account Deletion */}
      <section>
        <div className="flex items-center space-x-3 mb-6">
          <Trash2 className="w-6 h-6 text-red-600" />
          <h2 className="text-2xl font-semibold text-gray-800">Account Management</h2>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Permanently delete your account and all associated data. This action is irreversible.
        </p>
        <Button variant="destructive" onClick={handleDeleteAccount}>
          Delete My Account
        </Button>
      </section>

      {/* Save Button */}
      <div className="flex justify-end pt-6 border-t">
        <Button onClick={handleSaveChanges}>Save Changes</Button>
      </div>
    </div>
  );
};

export default AccountSettings;