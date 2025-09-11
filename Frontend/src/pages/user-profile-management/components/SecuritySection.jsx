import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';

const SecuritySection = ({ securityInfo, onUpdatePassword, onUpdateSecurity }) => {
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const connectedAccounts = [
    {
      provider: 'google',
      name: 'Google',
      email: 'coach@gmail.com',
      connected: true,
      icon: 'Mail'
    },
    {
      provider: 'github',
      name: 'GitHub',
      username: '@coachuser',
      connected: false,
      icon: 'Github'
    }
  ];

  const securityFeatures = [
    {
      title: 'Two-Factor Authentication',
      description: 'Add an extra layer of security to your account',
      enabled: securityInfo?.twoFactorEnabled || false,
      icon: 'Shield',
      action: 'setup-2fa'
    },
    {
      title: 'Login Notifications',
      description: 'Get notified when someone logs into your account',
      enabled: securityInfo?.loginNotifications || true,
      icon: 'Bell',
      action: 'toggle-notifications'
    },
    {
      title: 'Session Management',
      description: 'View and manage your active sessions',
      enabled: true,
      icon: 'Monitor',
      action: 'manage-sessions'
    }
  ];

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password?.length >= 8) strength += 1;
    if (/[a-z]/?.test(password)) strength += 1;
    if (/[A-Z]/?.test(password)) strength += 1;
    if (/[0-9]/?.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/?.test(password)) strength += 1;
    return strength;
  };

  const getPasswordStrengthLabel = (strength) => {
    const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
    return labels?.[strength] || 'Very Weak';
  };

  const getPasswordStrengthColor = (strength) => {
    const colors = ['bg-error', 'bg-warning', 'bg-warning', 'bg-accent', 'bg-success'];
    return colors?.[strength] || 'bg-error';
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e?.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'newPassword') {
      setPasswordStrength(calculatePasswordStrength(value));
    }

    // Clear errors when user starts typing
    if (passwordErrors?.[name]) {
      setPasswordErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validatePasswordForm = () => {
    const errors = {};

    if (!passwordData?.currentPassword) {
      errors.currentPassword = 'Current password is required';
    }

    if (!passwordData?.newPassword) {
      errors.newPassword = 'New password is required';
    } else if (passwordData?.newPassword?.length < 8) {
      errors.newPassword = 'Password must be at least 8 characters long';
    } else if (passwordStrength < 3) {
      errors.newPassword = 'Password is too weak. Include uppercase, lowercase, numbers, and symbols';
    }

    if (!passwordData?.confirmPassword) {
      errors.confirmPassword = 'Please confirm your new password';
    } else if (passwordData?.newPassword !== passwordData?.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    if (passwordData?.currentPassword === passwordData?.newPassword) {
      errors.newPassword = 'New password must be different from current password';
    }

    setPasswordErrors(errors);
    return Object.keys(errors)?.length === 0;
  };

  const handlePasswordSubmit = async (e) => {
    e?.preventDefault();
    if (!validatePasswordForm()) return;

    try {
      await onUpdatePassword(passwordData);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setIsChangingPassword(false);
      setPasswordStrength(0);
    } catch (error) {
      setPasswordErrors({
        general: 'Failed to update password. Please check your current password and try again.'
      });
    }
  };

  const handleSecurityFeatureToggle = async (action, enabled) => {
    try {
      await onUpdateSecurity({ action, enabled: !enabled });
    } catch (error) {
      console.error('Failed to update security setting:', error);
    }
  };

  const handleAccountConnection = async (provider, connected) => {
    try {
      if (connected) {
        // Disconnect account
        await onUpdateSecurity({ action: 'disconnect-account', provider });
      } else {
        // Connect account - would typically redirect to OAuth flow
        console.log(`Connecting ${provider} account...`);
      }
    } catch (error) {
      console.error('Failed to update account connection:', error);
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev?.[field]
    }));
  };

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-error/10 rounded-lg flex items-center justify-center">
          <Icon name="Lock" size={20} color="rgb(239 68 68)" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">Security Settings</h3>
          <p className="text-sm text-muted-foreground">Manage your account security and connected services</p>
        </div>
      </div>
      <div className="space-y-8">
        {/* Password Change */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-md font-medium text-foreground flex items-center">
              <Icon name="Key" size={18} color="currentColor" className="mr-2" />
              Password
            </h4>
            {!isChangingPassword && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsChangingPassword(true)}
                iconName="Edit2"
                iconPosition="left"
                iconSize={16}
              >
                Change Password
              </Button>
            )}
          </div>

          {isChangingPassword ? (
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              {passwordErrors?.general && (
                <div className="p-3 bg-error/10 border border-error/20 rounded-lg">
                  <p className="text-sm text-error">{passwordErrors?.general}</p>
                </div>
              )}

              <div className="relative">
                <Input
                  label="Current Password"
                  name="currentPassword"
                  type={showPasswords?.current ? "text" : "password"}
                  value={passwordData?.currentPassword}
                  onChange={handlePasswordChange}
                  placeholder="Enter your current password"
                  required
                  error={passwordErrors?.currentPassword}
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('current')}
                  className="absolute right-3 top-8 text-muted-foreground hover:text-foreground"
                >
                  <Icon name={showPasswords?.current ? "EyeOff" : "Eye"} size={16} />
                </button>
              </div>

              <div className="relative">
                <Input
                  label="New Password"
                  name="newPassword"
                  type={showPasswords?.new ? "text" : "password"}
                  value={passwordData?.newPassword}
                  onChange={handlePasswordChange}
                  placeholder="Enter your new password"
                  required
                  error={passwordErrors?.newPassword}
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('new')}
                  className="absolute right-3 top-8 text-muted-foreground hover:text-foreground"
                >
                  <Icon name={showPasswords?.new ? "EyeOff" : "Eye"} size={16} />
                </button>
                {passwordData?.newPassword && (
                  <div className="mt-2">
                    <div className="flex items-center space-x-2 mb-1">
                      <div className="flex-1 bg-muted rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${getPasswordStrengthColor(passwordStrength)}`}
                          style={{ width: `${(passwordStrength / 5) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {getPasswordStrengthLabel(passwordStrength)}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="relative">
                <Input
                  label="Confirm New Password"
                  name="confirmPassword"
                  type={showPasswords?.confirm ? "text" : "password"}
                  value={passwordData?.confirmPassword}
                  onChange={handlePasswordChange}
                  placeholder="Confirm your new password"
                  required
                  error={passwordErrors?.confirmPassword}
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('confirm')}
                  className="absolute right-3 top-8 text-muted-foreground hover:text-foreground"
                >
                  <Icon name={showPasswords?.confirm ? "EyeOff" : "Eye"} size={16} />
                </button>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  type="submit"
                  variant="default"
                  iconName="Save"
                  iconPosition="left"
                  iconSize={16}
                >
                  Update Password
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsChangingPassword(false);
                    setPasswordData({
                      currentPassword: '',
                      newPassword: '',
                      confirmPassword: ''
                    });
                    setPasswordErrors({});
                    setPasswordStrength(0);
                  }}
                  iconName="X"
                  iconPosition="left"
                  iconSize={16}
                >
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">
                Password last changed on {new Date()?.toLocaleDateString()}
              </p>
            </div>
          )}
        </div>

        {/* Security Features */}
        <div>
          <h4 className="text-md font-medium text-foreground mb-4 flex items-center">
            <Icon name="Shield" size={18} color="currentColor" className="mr-2" />
            Security Features
          </h4>
          <div className="space-y-4">
            {securityFeatures?.map((feature, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <Icon name={feature?.icon} size={16} color="rgb(37 99 235)" />
                  </div>
                  <div>
                    <h5 className="text-sm font-medium text-foreground">{feature?.title}</h5>
                    <p className="text-sm text-muted-foreground">{feature?.description}</p>
                  </div>
                </div>
                <Button
                  variant={feature?.enabled ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleSecurityFeatureToggle(feature?.action, feature?.enabled)}
                  iconName={feature?.enabled ? "Check" : "Plus"}
                  iconPosition="left"
                  iconSize={16}
                >
                  {feature?.enabled ? "Enabled" : "Enable"}
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Connected Accounts */}
        <div>
          <h4 className="text-md font-medium text-foreground mb-4 flex items-center">
            <Icon name="Link" size={18} color="currentColor" className="mr-2" />
            Connected Accounts
          </h4>
          <div className="space-y-4">
            {connectedAccounts?.map((account, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-card rounded-lg flex items-center justify-center border border-border">
                    <Icon name={account?.icon} size={16} color="currentColor" />
                  </div>
                  <div>
                    <h5 className="text-sm font-medium text-foreground">{account?.name}</h5>
                    <p className="text-sm text-muted-foreground">
                      {account?.connected 
                        ? (account?.email || account?.username)
                        : 'Not connected'
                      }
                    </p>
                  </div>
                </div>
                <Button
                  variant={account?.connected ? "outline" : "default"}
                  size="sm"
                  onClick={() => handleAccountConnection(account?.provider, account?.connected)}
                  iconName={account?.connected ? "Unlink" : "Link"}
                  iconPosition="left"
                  iconSize={16}
                >
                  {account?.connected ? "Disconnect" : "Connect"}
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <h4 className="text-md font-medium text-foreground mb-4 flex items-center">
            <Icon name="Activity" size={18} color="currentColor" className="mr-2" />
            Recent Security Activity
          </h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-success rounded-full"></div>
                <div>
                  <p className="text-sm font-medium text-foreground">Successful login</p>
                  <p className="text-xs text-muted-foreground">Chrome on Windows • 2 hours ago</p>
                </div>
              </div>
              <Icon name="CheckCircle" size={16} color="rgb(16 185 129)" />
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <div>
                  <p className="text-sm font-medium text-foreground">Profile updated</p>
                  <p className="text-xs text-muted-foreground">Safari on macOS • 1 day ago</p>
                </div>
              </div>
              <Icon name="Info" size={16} color="rgb(37 99 235)" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecuritySection;