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
  const [saveStatus, setSaveStatus] = useState(null);

  const [userProfile, setUserProfile] = useState(null);
  const [businessProfile, setBusinessProfile] = useState({});
  const [preferences, setPreferences] = useState({});
  const [securityInfo, setSecurityInfo] = useState({});
  const [visibilitySettings, setVisibilitySettings] = useState({});

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) return;

        const response = await fetch("http://localhost:4028/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error("Failed to fetch user profile");

        const data = await response.json();
        const user = data?.user || {};

        // Safely handle dates
        const safeDate = (dateStr) => {
          const d = new Date(dateStr);
          return isNaN(d.getTime()) ? null : d.toISOString().split("T")[0];
        };

        setUserProfile({
          firstName: user.firstName || user.name?.split(" ")[0] || "",
          lastName: user.lastName || user.name?.split(" ")[1] || "",
          email: user.email || "",
          profilePhoto: user.picture || "",
          emailVerified: user.email_verified || false,
          joinDate: safeDate(user.createdAt),
        });

        // Optional: set other sections if returned from backend
        setBusinessProfile(data.businessProfile || {});
        setPreferences(data.preferences || {});
        setSecurityInfo(data.securityInfo || {});
        setVisibilitySettings(data.visibilitySettings || {});
      } catch (err) {
        console.error("Error fetching user profile:", err);
      }
    };

    fetchUserProfile();
  }, []);

  const showSaveStatus = (type, message) => {
    setSaveStatus({ type, message });
    setTimeout(() => setSaveStatus(null), 3000);
  };

  const handleUpdateProfile = async (updatedProfile) => {
    try {
      // Call your API to update the profile
      // const res = await updateUserProfile(updatedProfile);
      setUserProfile((prev) => ({ ...prev, ...updatedProfile }));
      showSaveStatus('success', 'Profile updated successfully!');
    } catch (err) {
      console.error(err);
      showSaveStatus('error', 'Failed to update profile.');
      throw err;
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'personal':
        return userProfile && <PersonalInfoSection userProfile={userProfile} onUpdateProfile={handleUpdateProfile} />;
      case 'business':
        return <BusinessProfileSection businessProfile={businessProfile} onUpdateBusinessProfile={() => {}} />;
      case 'preferences':
        return <AccountPreferencesSection preferences={preferences} onUpdatePreferences={() => {}} />;
      case 'security':
        return <SecuritySection securityInfo={securityInfo} onUpdatePassword={() => {}} onUpdateSecurity={() => {}} />;
      case 'visibility':
        return <ProfileVisibilitySection visibilitySettings={visibilitySettings} onUpdateVisibility={() => {}} />;
      default:
        return null;
    }
  };

  const tabs = [
    { id: 'personal', label: 'Personal Info', icon: 'User', description: 'Basic information and contact details' },
    { id: 'business', label: 'Business Profile', icon: 'Briefcase', description: 'Coaching specialization and services' },
    { id: 'preferences', label: 'Preferences', icon: 'Settings', description: 'Account settings and notifications' },
    { id: 'security', label: 'Security', icon: 'Lock', description: 'Password and security settings' },
    { id: 'visibility', label: 'Profile Visibility', icon: 'Eye', description: 'Public profile and privacy controls' }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header
        isAuthenticated={true}
        userProfile={{
          name: userProfile ? `${userProfile.firstName} ${userProfile.lastName}` : "",
          email: userProfile?.email || "",
        }}
      />
      <div className="pt-16">
        {/* Page Header */}
        <div className="bg-card border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div>
                <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-2">
                  <Link to="/homepage" className="hover:text-foreground transition-colors">Home</Link>
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
                  onClick={() => window.open(`https://${visibilitySettings?.profileUrl || ''}`, '_blank')}
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
            <div className={`p-3 rounded-lg border ${saveStatus.type === 'success' ? 'bg-success/10 border-success/20 text-success' : 'bg-error/10 border-error/20 text-error'}`}>
              <div className="flex items-center space-x-2">
                <Icon name={saveStatus.type === 'success' ? "CheckCircle" : "AlertCircle"} size={16} />
                <span className="text-sm font-medium">{saveStatus.message}</span>
              </div>
            </div>
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar */}
            <div className="lg:w-80 flex-shrink-0">
              <div className="bg-card rounded-lg border border-border p-4">
                <h2 className="text-lg font-semibold text-foreground mb-4">Settings</h2>
                <nav className="space-y-2">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-start space-x-3 p-3 rounded-lg text-left transition-colors ${
                        activeTab === tab.id ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-foreground'
                      }`}
                    >
                      <Icon name={tab.icon} size={20} color={activeTab === tab.id ? 'white' : 'currentColor'} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{tab.label}</p>
                        <p className={`text-xs mt-1 ${activeTab === tab.id ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>{tab.description}</p>
                      </div>
                    </button>
                  ))}
                </nav>

                {/* Profile Summary */}
                {userProfile && (
                  <div className="mt-6 pt-6 border-t border-border">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-muted">
                        {userProfile.profilePhoto ? (
                          <img src={userProfile.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Icon name="User" size={24} color="rgb(100 116 139)" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{userProfile.firstName} {userProfile.lastName}</p>
                        <p className="text-xs text-muted-foreground truncate">{businessProfile?.specialization || 'Coach'}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 min-w-0">{renderTabContent()}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfileManagement;
