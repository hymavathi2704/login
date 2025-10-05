import React from 'react';
import { Bell, Shield, CreditCard, Eye, EyeOff, Star, Users } from 'lucide-react';
import Button from '@/components/ui/Button';

const AccountSection = ({ data, errors, updateData, updateNestedData, setUnsavedChanges }) => {
  
  // Notifications Management
  const updateNotificationSetting = (type, value) => {
    updateNestedData(`notifications.${type}`, value);
    setUnsavedChanges(true);
  };

  // Privacy Management  
  const updatePrivacySetting = (type, value) => {
    updateNestedData(`privacy.${type}`, value);
    setUnsavedChanges(true);
  };

  // Subscription Management
  const updateSubscriptionSetting = (type, value) => {
    updateNestedData(`subscription.${type}`, value);
    setUnsavedChanges(true);
  };

  const subscriptionPlans = [
    {
      value: 'basic',
      label: 'Basic',
      price: 'Free',
      features: ['Profile creation', 'Browse coaches', 'Basic messaging']
    },
    {
      value: 'premium',
      label: 'Premium',
      price: '$19/month',
      features: ['All Basic features', 'Unlimited messaging', 'Priority support', 'Progress tracking']
    },
    {
      value: 'pro',
      label: 'Professional',
      price: '$39/month',
      features: ['All Premium features', 'Advanced analytics', 'Goal tracking tools', '1-on-1 platform support']
    }
  ];

  return (
    <div className="space-y-8">
      {/* Notification Settings */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Bell className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Notification Settings</h3>
        </div>
        <p className="text-sm text-gray-600">
          Choose which notifications you'd like to receive to stay updated on your coaching journey.
        </p>
        
        <div className="space-y-4">
          <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
            <div className="flex items-center space-x-3">
              <Bell className="w-5 h-5 text-gray-500" />
              <div>
                <p className="font-medium text-gray-900">Session Reminders</p>
                <p className="text-sm text-gray-600">Get reminded about upcoming coaching sessions</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={data?.notifications?.sessionReminders ?? true}
              onChange={(e) => updateNotificationSetting('sessionReminders', e?.target?.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          </label>

          <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
            <div className="flex items-center space-x-3">
              <Star className="w-5 h-5 text-gray-500" />
              <div>
                <p className="font-medium text-gray-900">Progress Updates</p>
                <p className="text-sm text-gray-600">Receive updates on your goal progress and achievements</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={data?.notifications?.progressUpdates ?? true}
              onChange={(e) => updateNotificationSetting('progressUpdates', e?.target?.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          </label>

          <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
            <div className="flex items-center space-x-3">
              <Users className="w-5 h-5 text-gray-500" />
              <div>
                <p className="font-medium text-gray-900">Coach Messages</p>
                <p className="text-sm text-gray-600">Get notified when coaches send you messages</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={data?.notifications?.coachMessages ?? true}
              onChange={(e) => updateNotificationSetting('coachMessages', e?.target?.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          </label>

          <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
            <div className="flex items-center space-x-3">
              <Bell className="w-5 h-5 text-gray-500" />
              <div>
                <p className="font-medium text-gray-900">Marketing & Promotions</p>
                <p className="text-sm text-gray-600">Receive updates about new features and special offers</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={data?.notifications?.marketing ?? false}
              onChange={(e) => updateNotificationSetting('marketing', e?.target?.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          </label>
        </div>
      </div>
      {/* Privacy Controls */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Shield className="w-5 h-5 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">Privacy Controls</h3>
        </div>
        <p className="text-sm text-gray-600">
          Manage who can see your information and how it's used.
        </p>
        
        <div className="space-y-4">
          {/* Profile Visibility */}
          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-3 mb-3">
              {data?.privacy?.profileVisibility === 'public' ? <Eye className="w-5 h-5 text-gray-500" /> : <EyeOff className="w-5 h-5 text-gray-500" />}
              <div>
                <p className="font-medium text-gray-900">Profile Visibility</p>
                <p className="text-sm text-gray-600">Control who can see your profile information</p>
              </div>
            </div>
            
            <div className="space-y-3 ml-8">
              <label className="flex items-center space-x-3">
                <input
                  type="radio"
                  name="profileVisibility"
                  value="coaches-only"
                  checked={data?.privacy?.profileVisibility !== 'public'}
                  onChange={() => updatePrivacySetting('profileVisibility', 'coaches-only')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <div>
                  <p className="text-sm font-medium text-gray-900">Coaches Only</p>
                  <p className="text-xs text-gray-600">Only visible to coaches you contact</p>
                </div>
              </label>
              
              <label className="flex items-center space-x-3">
                <input
                  type="radio"
                  name="profileVisibility"
                  value="public"
                  checked={data?.privacy?.profileVisibility === 'public'}
                  onChange={() => updatePrivacySetting('profileVisibility', 'public')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <div>
                  <p className="text-sm font-medium text-gray-900">Public Profile</p>
                  <p className="text-xs text-gray-600">May appear in testimonials (with permission)</p>
                </div>
              </label>
            </div>
          </div>

          {/* Progress Sharing */}
          <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
            <div className="flex items-center space-x-3">
              <Star className="w-5 h-5 text-gray-500" />
              <div>
                <p className="font-medium text-gray-900">Share Progress Achievements</p>
                <p className="text-sm text-gray-600">Allow coaches to share your success stories (anonymously)</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={data?.privacy?.shareProgress ?? false}
              onChange={(e) => updatePrivacySetting('shareProgress', e?.target?.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          </label>

          {/* Reviews */}
          <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
            <div className="flex items-center space-x-3">
              <Star className="w-5 h-5 text-gray-500" />
              <div>
                <p className="font-medium text-gray-900">Allow Coach Reviews</p>
                <p className="text-sm text-gray-600">Let coaches you've worked with leave reviews on your profile</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={data?.privacy?.allowReviews ?? true}
              onChange={(e) => updatePrivacySetting('allowReviews', e?.target?.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          </label>
        </div>
      </div>
      {/* Subscription Management */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <CreditCard className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900">Subscription & Billing</h3>
        </div>
        <p className="text-sm text-gray-600">
          Manage your subscription plan and billing preferences.
        </p>
        
        {/* Current Plan */}
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-purple-900">Current Plan</p>
              <p className="text-sm text-purple-700">
                {subscriptionPlans?.find(plan => plan?.value === (data?.subscription?.plan || 'basic'))?.label} - 
                {subscriptionPlans?.find(plan => plan?.value === (data?.subscription?.plan || 'basic'))?.price}
              </p>
            </div>
            <Button variant="outline" size="sm">
              Change Plan
            </Button>
          </div>
        </div>

        {/* Plan Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {subscriptionPlans?.map((plan) => (
            <div
              key={plan?.value}
              className={`border rounded-lg p-4 cursor-pointer transition-all ${
                (data?.subscription?.plan || 'basic') === plan?.value
                  ? 'border-blue-500 bg-blue-50' :'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => updateSubscriptionSetting('plan', plan?.value)}
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900">{plan?.label}</h4>
                <input
                  type="radio"
                  name="subscriptionPlan"
                  value={plan?.value}
                  checked={(data?.subscription?.plan || 'basic') === plan?.value}
                  onChange={() => updateSubscriptionSetting('plan', plan?.value)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
              </div>
              <p className="text-lg font-semibold text-gray-900 mb-3">{plan?.price}</p>
              <ul className="text-sm text-gray-600 space-y-1">
                {plan?.features?.map((feature, index) => (
                  <li key={index} className="flex items-center space-x-2">
                    <span className="text-green-500">✓</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Auto-renewal */}
        <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
          <div className="flex items-center space-x-3">
            <CreditCard className="w-5 h-5 text-gray-500" />
            <div>
              <p className="font-medium text-gray-900">Auto-renewal</p>
              <p className="text-sm text-gray-600">Automatically renew your subscription each billing cycle</p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={data?.subscription?.autoRenew ?? true}
            onChange={(e) => updateSubscriptionSetting('autoRenew', e?.target?.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
        </label>
      </div>
      {/* Account Actions */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Account Actions</h3>
        
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
          <Button variant="outline" className="flex-1 sm:flex-none">
            Export My Data
          </Button>
          <Button variant="outline" className="flex-1 sm:flex-none">
            Deactivate Account
          </Button>
          <Button variant="destructive" className="flex-1 sm:flex-none">
            Delete Account
          </Button>
        </div>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            <strong>Account Deletion:</strong> Deleting your account will permanently remove all your data, 
            including goals, progress tracking, and message history. This action cannot be undone.
          </p>
        </div>
      </div>
      {/* Account Summary */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h4 className="font-medium text-gray-900 mb-4">Account Summary</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
          <div>
            <p><strong>Subscription:</strong> {subscriptionPlans?.find(plan => plan?.value === (data?.subscription?.plan || 'basic'))?.label}</p>
            <p><strong>Auto-renewal:</strong> {data?.subscription?.autoRenew ? 'Enabled' : 'Disabled'}</p>
            <p><strong>Profile Visibility:</strong> {data?.privacy?.profileVisibility === 'public' ? 'Public' : 'Coaches Only'}</p>
          </div>
          <div>
            <p><strong>Session Reminders:</strong> {data?.notifications?.sessionReminders ? 'On' : 'Off'}</p>
            <p><strong>Progress Updates:</strong> {data?.notifications?.progressUpdates ? 'On' : 'Off'}</p>
            <p><strong>Marketing Emails:</strong> {data?.notifications?.marketing ? 'On' : 'Off'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountSection;