import React, { useState } from 'react';
import { 
  Settings, 
  Database, 
  Mail, 
  Globe, 
  Bell,
  Palette,
  Code,
  Shield,
  Save,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Upload
} from 'lucide-react';

const SystemSettings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    general: {
      siteName: 'The Katha',
      siteDescription: 'All-in-one coaching platform',
      timezone: 'America/Los_Angeles',
      dateFormat: 'MM/DD/YYYY',
      maintenanceMode: false
    },
    email: {
      provider: 'sendgrid',
      fromEmail: 'noreply@thekata.com',
      fromName: 'The Katha',
      smtpHost: 'smtp.sendgrid.net',
      smtpPort: 587,
      apiKey: 'SG.***hidden***'
    },
    notifications: {
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
      adminAlerts: true,
      systemAlerts: true
    },
    appearance: {
      theme: 'light',
      primaryColor: '#dc2626',
      secondaryColor: '#059669',
      logo: '/logo.png',
      favicon: '/favicon.ico'
    },
    integrations: {
      googleAnalytics: 'GA-XXXXXX',
      stripePublicKey: 'pk_test_***hidden***',
      auth0Domain: 'dev-gjk24zn26rg6f20d.us.auth0.com',
      auth0ClientId: 'GRRmNwYrwXXzDhQvgInMK4uY06AMo8o4'
    }
  });

  const handleSettingChange = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  const renderGeneral = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4">General Settings</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Site Name</label>
            <input
              type="text"
              value={settings.general.siteName}
              onChange={(e) => handleSettingChange('general', 'siteName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
            <select
              value={settings.general.timezone}
              onChange={(e) => handleSettingChange('general', 'timezone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="America/Los_Angeles">Pacific Time (PT)</option>
              <option value="America/Denver">Mountain Time (MT)</option>
              <option value="America/Chicago">Central Time (CT)</option>
              <option value="America/New_York">Eastern Time (ET)</option>
              <option value="UTC">UTC</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Site Description</label>
            <textarea
              value={settings.general.siteDescription}
              onChange={(e) => handleSettingChange('general', 'siteDescription', e.target.value)}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date Format</label>
            <select
              value={settings.general.dateFormat}
              onChange={(e) => handleSettingChange('general', 'dateFormat', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700">Maintenance Mode</label>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.general.maintenanceMode}
                  onChange={(e) => handleSettingChange('general', 'maintenanceMode', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
              </label>
            </div>
            <p className="text-sm text-gray-500 mt-1">Temporarily disable the platform for maintenance</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4">System Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-gray-600 mb-1">Platform Version</p>
            <p className="font-medium">v2.1.0</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Database Version</p>
            <p className="font-medium">MongoDB 6.0</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Last Updated</p>
            <p className="font-medium">January 10, 2025</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderEmail = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4">Email Configuration</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email Provider</label>
            <select
              value={settings.email.provider}
              onChange={(e) => handleSettingChange('email', 'provider', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="sendgrid">SendGrid</option>
              <option value="mailgun">Mailgun</option>
              <option value="smtp">Custom SMTP</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">From Email</label>
            <input
              type="email"
              value={settings.email.fromEmail}
              onChange={(e) => handleSettingChange('email', 'fromEmail', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">From Name</label>
            <input
              type="text"
              value={settings.email.fromName}
              onChange={(e) => handleSettingChange('email', 'fromName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">API Key</label>
            <input
              type="password"
              value={settings.email.apiKey}
              onChange={(e) => handleSettingChange('email', 'apiKey', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
            <Mail size={16} />
            <span>Send Test Email</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4">Email Templates</h3>
        
        <div className="space-y-3">
          {[
            'Welcome Email',
            'Password Reset',
            'Session Confirmation',
            'Event Registration',
            'Payment Receipt'
          ].map((template, index) => (
            <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">{template}</h4>
                <p className="text-sm text-gray-500">Last updated: 2 days ago</p>
              </div>
              <button className="bg-gray-100 text-gray-600 px-3 py-1 rounded text-sm hover:bg-gray-200">
                Edit Template
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderNotifications = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4">Notification Settings</h3>
        
        <div className="space-y-6">
          {[
            {
              key: 'emailNotifications',
              title: 'Email Notifications',
              description: 'Send notifications via email to users and admins'
            },
            {
              key: 'smsNotifications',
              title: 'SMS Notifications',
              description: 'Send SMS notifications for urgent alerts'
            },
            {
              key: 'pushNotifications',
              title: 'Push Notifications',
              description: 'Send browser push notifications'
            },
            {
              key: 'adminAlerts',
              title: 'Admin Alerts',
              description: 'Notify admins of important platform events'
            },
            {
              key: 'systemAlerts',
              title: 'System Alerts',
              description: 'Send alerts for system errors and issues'
            }
          ].map((notification) => (
            <div key={notification.key} className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">{notification.title}</h4>
                <p className="text-sm text-gray-500">{notification.description}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.notifications[notification.key]}
                  onChange={(e) => handleSettingChange('notifications', notification.key, e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderIntegrations = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4">Third-Party Integrations</h3>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Google Analytics ID</label>
            <input
              type="text"
              value={settings.integrations.googleAnalytics}
              onChange={(e) => handleSettingChange('integrations', 'googleAnalytics', e.target.value)}
              placeholder="GA-XXXXXXXXX"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Stripe Public Key</label>
            <input
              type="text"
              value={settings.integrations.stripePublicKey}
              onChange={(e) => handleSettingChange('integrations', 'stripePublicKey', e.target.value)}
              placeholder="pk_test_..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Auth0 Domain</label>
              <input
                type="text"
                value={settings.integrations.auth0Domain}
                onChange={(e) => handleSettingChange('integrations', 'auth0Domain', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Auth0 Client ID</label>
              <input
                type="text"
                value={settings.integrations.auth0ClientId}
                onChange={(e) => handleSettingChange('integrations', 'auth0ClientId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4">Integration Status</h3>
        
        <div className="space-y-3">
          {[
            { name: 'Auth0 Authentication', status: 'connected', lastSync: '2 minutes ago' },
            { name: 'Stripe Payments', status: 'connected', lastSync: '5 minutes ago' },
            { name: 'SendGrid Email', status: 'connected', lastSync: '1 hour ago' },
            { name: 'Google Analytics', status: 'error', lastSync: 'Failed to connect' }
          ].map((integration, index) => (
            <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${
                  integration.status === 'connected' ? 'bg-green-500' : 'bg-red-500'
                }`} />
                <div>
                  <h4 className="font-medium text-gray-900">{integration.name}</h4>
                  <p className="text-sm text-gray-500">{integration.lastSync}</p>
                </div>
              </div>
              <button className="bg-gray-100 text-gray-600 px-3 py-1 rounded text-sm hover:bg-gray-200">
                Configure
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header with Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">System Settings</h2>
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('general')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'general'
                ? 'bg-white text-gray-900 shadow'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Settings size={16} className="inline mr-2" />
            General
          </button>
          <button
            onClick={() => setActiveTab('email')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'email'
                ? 'bg-white text-gray-900 shadow'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Mail size={16} className="inline mr-2" />
            Email
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'notifications'
                ? 'bg-white text-gray-900 shadow'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Bell size={16} className="inline mr-2" />
            Notifications
          </button>
          <button
            onClick={() => setActiveTab('integrations')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'integrations'
                ? 'bg-white text-gray-900 shadow'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Globe size={16} className="inline mr-2" />
            Integrations
          </button>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'general' && renderGeneral()}
      {activeTab === 'email' && renderEmail()}
      {activeTab === 'notifications' && renderNotifications()}
      {activeTab === 'integrations' && renderIntegrations()}

      {/* Save Button */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <CheckCircle size={16} className="text-green-600" />
            <span>All settings are saved automatically</span>
          </div>
          <div className="flex space-x-3">
            <button className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-200 flex items-center space-x-2">
              <RefreshCw size={16} />
              <span>Reset to Defaults</span>
            </button>
            <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center space-x-2">
              <Save size={16} />
              <span>Save All Changes</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemSettings;