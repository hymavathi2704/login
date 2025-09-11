import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import PersonalInfoSection from './components/PersonalInfoSection';
import BusinessProfileSection from './components/BusinessProfileSection';
import AccountPreferencesSection from './components/AccountPreferencesSection';
import SecuritySection from './components/SecuritySection';
import ProfileVisibilitySection from './components/ProfileVisibilitySection';

const UserProfileManagement = () => {
  const [activeTab, setActiveTab] = useState('personal');
  const [isLoading, setIsLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);

  // Mock user data
  const [userProfile, setUserProfile] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@coachflow.com',
    phone: '+1 (555) 123-4567',
    profilePhoto: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
    emailVerified: true,
    joinDate: '2024-01-15'
  });

  const [businessProfile, setBusinessProfile] = useState({
    specialization: 'life-coaching',
    bio: `Passionate life coach with over 8 years of experience helping individuals unlock their potential and achieve their goals. I specialize in personal development, career transitions, and work-life balance.\n\nMy approach combines evidence-based coaching techniques with personalized strategies tailored to each client's unique needs and circumstances.`,hourlyRate: '150',currency: 'USD',
    serviceOfferings: ['one-on-one', 'group-coaching', 'workshops'],
    experience: '8',
    certifications: `• ICF Professional Certified Coach (PCC)\n• Certified Professional Co-Active Coach (CPCC)\n• Master's in Psychology, Stanford University\n• Certified Mindfulness-Based Stress Reduction Instructor`
  });

  const [preferences, setPreferences] = useState({
    timezone: 'America/New_York',
    language: 'en',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12',
    emailNotifications: {
      newBookings: true,
      reminders: true,
      cancellations: true,
      marketing: false,
      systemUpdates: true
    },
    smsNotifications: {
      reminders: false,
      cancellations: false
    },
    availabilityHours: {
      monday: { enabled: true, start: '09:00', end: '17:00' },
      tuesday: { enabled: true, start: '09:00', end: '17:00' },
      wednesday: { enabled: true, start: '09:00', end: '17:00' },
      thursday: { enabled: true, start: '09:00', end: '17:00' },
      friday: { enabled: true, start: '09:00', end: '17:00' },
      saturday: { enabled: false, start: '09:00', end: '17:00' },
      sunday: { enabled: false, start: '09:00', end: '17:00' }
    },
    communicationPreferences: {
      preferredMethod: 'email',
      allowClientMessages: true,
      autoResponder: false
    }
  });

  const [securityInfo, setSecurityInfo] = useState({
    twoFactorEnabled: false,
    loginNotifications: true,
    lastPasswordChange: '2024-08-15',
    activeSessions: 3
  });

  const [visibilitySettings, setVisibilitySettings] = useState({
    profilePublic: true,
    showEmail: false,
    showPhone: false,
    showRates: true,
    showAvailability: true,
    showTestimonials: true,
    showCertifications: true,
    searchable: true,
    profileUrl: 'coachflow.com/coach/john-doe',
    directBooking: true,
    clientReviews: true,
    socialLinks: {
      linkedin: 'https://linkedin.com/in/johndoe-coach',
      twitter: '',
      website: 'https://johndoecoaching.com',
      instagram: ''
    }
  });

  const tabs = [
    {
      id: 'personal',
      label: 'Personal Info',
      icon: 'User',
      description: 'Basic information and contact details'
    },
    {
      id: 'business',
      label: 'Business Profile',
      icon: 'Briefcase',
      description: 'Coaching specialization and services'
    },
    {
      id: 'preferences',
      label: 'Preferences',
      icon: 'Settings',
      description: 'Account settings and notifications'
    },
    {
      id: 'security',
      label: 'Security',
      icon: 'Lock',
      description: 'Password and security settings'
    },
    {
      id: 'visibility',
      label: 'Profile Visibility',
      icon: 'Eye',
      description: 'Public profile and privacy controls'
    }
  ];

  const showSaveStatus = (type, message) => {
    setSaveStatus({ type, message });
    setTimeout(() => setSaveStatus(null), 3000);
  };

  const handleUpdateProfile = async (updatedData) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setUserProfile(prev => ({ ...prev, ...updatedData }));
      showSaveStatus('success', 'Personal information updated successfully');
    } catch (error) {
      showSaveStatus('error', 'Failed to update personal information');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateBusinessProfile = async (updatedData) => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setBusinessProfile(prev => ({ ...prev, ...updatedData }));
      showSaveStatus('success', 'Business profile updated successfully');
    } catch (error) {
      showSaveStatus('error', 'Failed to update business profile');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePreferences = async (updatedData) => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      setPreferences(prev => ({ ...prev, ...updatedData }));
      showSaveStatus('success', 'Preferences updated successfully');
    } catch (error) {
      showSaveStatus('error', 'Failed to update preferences');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePassword = async (passwordData) => {
    setIsLoading(true);
    try {
      // Simulate password validation
      if (passwordData?.currentPassword !== 'currentpass123') {
        throw new Error('Current password is incorrect');
      }
      await new Promise(resolve => setTimeout(resolve, 1500));
      setSecurityInfo(prev => ({
        ...prev,
        lastPasswordChange: new Date()?.toISOString()?.split('T')?.[0]
      }));
      showSaveStatus('success', 'Password updated successfully');
    } catch (error) {
      showSaveStatus('error', error?.message || 'Failed to update password');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateSecurity = async (securityData) => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSecurityInfo(prev => ({ ...prev, ...securityData }));
      showSaveStatus('success', 'Security settings updated successfully');
    } catch (error) {
      showSaveStatus('error', 'Failed to update security settings');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateVisibility = async (updatedData) => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      setVisibilitySettings(prev => ({ ...prev, ...updatedData }));
      showSaveStatus('success', 'Visibility settings updated successfully');
    } catch (error) {
      showSaveStatus('error', 'Failed to update visibility settings');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'personal':
        return (
          <PersonalInfoSection
            userProfile={userProfile}
            onUpdateProfile={handleUpdateProfile}
          />
        );
      case 'business':
        return (
          <BusinessProfileSection
            businessProfile={businessProfile}
            onUpdateBusinessProfile={handleUpdateBusinessProfile}
          />
        );
      case 'preferences':
        return (
          <AccountPreferencesSection
            preferences={preferences}
            onUpdatePreferences={handleUpdatePreferences}
          />
        );
      case 'security':
        return (
          <SecuritySection
            securityInfo={securityInfo}
            onUpdatePassword={handleUpdatePassword}
            onUpdateSecurity={handleUpdateSecurity}
          />
        );
      case 'visibility':
        return (
          <ProfileVisibilitySection
            visibilitySettings={visibilitySettings}
            onUpdateVisibility={handleUpdateVisibility}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header 
        isAuthenticated={true} 
        userProfile={{
          name: `${userProfile?.firstName} ${userProfile?.lastName}`,
          email: userProfile?.email
        }} 
      />
      <div className="pt-16">
        {/* Page Header */}
        <div className="bg-card border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div>
                <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-2">
                  <Link to="/homepage" className="hover:text-foreground transition-colors">
                    Home
                  </Link>
                  <Icon name="ChevronRight" size={16} />
                  <span className="text-foreground">Profile Management</span>
                </nav>
                <h1 className="text-2xl font-bold text-foreground">Profile Management</h1>
                <p className="text-muted-foreground mt-1">
                  Manage your personal information, business profile, and account settings
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(`https://${visibilitySettings?.profileUrl}`, '_blank')}
                  iconName="ExternalLink"
                  iconPosition="left"
                  iconSize={16}
                >
                  View Public Profile
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Save Status */}
        {saveStatus && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
            <div className={`p-3 rounded-lg border ${
              saveStatus?.type === 'success' ?'bg-success/10 border-success/20 text-success' :'bg-error/10 border-error/20 text-error'
            }`}>
              <div className="flex items-center space-x-2">
                <Icon 
                  name={saveStatus?.type === 'success' ? "CheckCircle" : "AlertCircle"} 
                  size={16} 
                />
                <span className="text-sm font-medium">{saveStatus?.message}</span>
              </div>
            </div>
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Navigation */}
            <div className="lg:w-80 flex-shrink-0">
              <div className="bg-card rounded-lg border border-border p-4">
                <h2 className="text-lg font-semibold text-foreground mb-4">Settings</h2>
                <nav className="space-y-2">
                  {tabs?.map((tab) => (
                    <button
                      key={tab?.id}
                      onClick={() => setActiveTab(tab?.id)}
                      className={`w-full flex items-start space-x-3 p-3 rounded-lg text-left transition-colors ${
                        activeTab === tab?.id
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-muted text-foreground'
                      }`}
                    >
                      <Icon 
                        name={tab?.icon} 
                        size={20} 
                        color={activeTab === tab?.id ? 'white' : 'currentColor'} 
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{tab?.label}</p>
                        <p className={`text-xs mt-1 ${
                          activeTab === tab?.id 
                            ? 'text-primary-foreground/80' 
                            : 'text-muted-foreground'
                        }`}>
                          {tab?.description}
                        </p>
                      </div>
                    </button>
                  ))}
                </nav>

                {/* Profile Summary */}
                <div className="mt-6 pt-6 border-t border-border">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-muted">
                      {userProfile?.profilePhoto ? (
                        <img
                          src={userProfile?.profilePhoto}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Icon name="User" size={24} color="rgb(100 116 139)" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {userProfile?.firstName} {userProfile?.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {businessProfile?.specialization?.replace('-', ' ')?.replace(/\b\w/g, l => l?.toUpperCase()) || 'Coach'}
                      </p>
                      <div className="flex items-center space-x-1 mt-1">
                        <div className={`w-2 h-2 rounded-full ${
                          visibilitySettings?.profilePublic ? 'bg-success' : 'bg-warning'
                        }`}></div>
                        <span className="text-xs text-muted-foreground">
                          {visibilitySettings?.profilePublic ? 'Public' : 'Private'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 min-w-0">
              {isLoading && (
                <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
                  <div className="bg-card rounded-lg p-6 shadow-soft-lg">
                    <div className="flex items-center space-x-3">
                      <Icon name="Loader2" size={20} className="animate-spin" />
                      <span className="text-sm font-medium">Saving changes...</span>
                    </div>
                  </div>
                </div>
              )}
              {renderTabContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfileManagement;