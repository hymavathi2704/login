import React, { useState, useEffect, useCallback } from 'react';
import { User, Heart, Target, Settings, Save, AlertTriangle } from 'lucide-react';
import PersonalInfoSection from './components/PersonalInfoSection';
import PreferencesSection from './components/PreferencesSection';
import GoalsSection from './components/GoalsSection';
import AccountSection from './components/AccountSection';
import Button from '@/components/ui/Button';

const ClientProfileEditor = () => {
  const [activeTab, setActiveTab] = useState('personal');
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // FIX: State declarations moved to the top level of the component
  const [profileData, setProfileData] = useState({});
  const [initialData, setInitialData] = useState({});
  const [errors, setErrors] = useState({});

  // Fetch initial data
  useEffect(() => {
    const fetchProfileData = async () => {
      // Replace with actual API call
      const mockData = {
        firstName: 'Alex',
        lastName: 'Doe',
        email: 'alex.doe@example.com',
        emailVerified: true,
        phone: '123-456-7890',
        phoneVerified: false,
        profilePicture: 'https://via.placeholder.com/150',
        profileVisibility: 'coaches-only',
        coachingFocusAreas: ['Career Development', 'Leadership'],
        communicationPreferences: { email: true, sms: false, push: true },
        sessionFrequency: 'bi-weekly',
        preferredSessionFormat: 'online',
        budget: { min: 100, max: 250 },
        shortTermGoals: [
          { id: 1, text: 'Improve presentation skills', completed: true },
          { id: 2, text: 'Network with 5 new people this month', completed: false }
        ],
        longTermGoals: [
          { id: 3, text: 'Get promoted to a leadership role', completed: false }
        ],
        progressTracking: true,
        coachingHistory: 'Worked with a career coach last year, found it very helpful.',
        notifications: { sessionReminders: true, progressUpdates: true, coachMessages: true, marketing: false },
        privacy: { profileVisibility: 'coaches-only', shareProgress: false, allowReviews: true },
        subscription: { plan: 'premium', autoRenew: true }
      };
      setProfileData(mockData);
      setInitialData(mockData);
    };

    fetchProfileData();
  }, []);

  // Check for unsaved changes
  useEffect(() => {
    const hasUnsavedChanges = JSON.stringify(profileData) !== JSON.stringify(initialData);
    setUnsavedChanges(hasUnsavedChanges);
  }, [profileData, initialData]);

  // Handle data updates from child components
  const updateData = useCallback((newData) => {
    setProfileData(prev => ({ ...prev, ...newData }));
  }, []);

  const updateNestedData = useCallback((path, value) => {
    setProfileData(prev => {
      const keys = path.split('.');
      const newState = { ...prev };
      let current = newState;
      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] };
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      return newState;
    });
  }, []);

  // Validate and save data
  const handleSave = async () => {
    setIsSaving(true);
    setErrors({});
    let validationErrors = {};
    if (!profileData.firstName) validationErrors.firstName = 'First name is required.';
    if (!profileData.lastName) validationErrors.lastName = 'Last name is required.';
    if (!profileData.email) {
      validationErrors.email = 'Email is required.';
    } else if (!/\S+@\S+\.\S+/.test(profileData.email)) {
      validationErrors.email = 'Email is invalid.';
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setIsSaving(false);
      return;
    }
    
    console.log('Saving profile data:', profileData);
    await new Promise(resolve => setTimeout(resolve, 1500)); 

    setInitialData(profileData);
    setIsSaving(false);
    setUnsavedChanges(false);
  };

  const tabs = [
    { id: 'personal', label: 'Personal Info', icon: <User /> },
    { id: 'preferences', label: 'Preferences', icon: <Heart /> },
    { id: 'goals', label: 'Goals', icon: <Target /> },
    { id: 'account', label: 'Account', icon: <Settings /> },
  ];

  // FIX: This function was missing but is needed to render the content for each tab
  const renderTabContent = () => {
    const props = {
        data: profileData,
        errors,
        updateData,
        updateNestedData,
        setUnsavedChanges,
    };
    switch (activeTab) {
        case 'personal': return <PersonalInfoSection {...props} />;
        case 'preferences': return <PreferencesSection {...props} />;
        case 'goals': return <GoalsSection {...props} />;
        case 'account': return <AccountSection {...props} />;
        default: return null;
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Edit Your Profile</h1>
        <p className="text-gray-600 mt-2">
          Keep your profile updated to get the best matches with coaches.
        </p>
      </div>
      <div className="flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-1/4">
          <nav className="space-y-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {React.cloneElement(tab.icon, { className: 'w-5 h-5' })}
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </aside>
        <main className="flex-1">
          {renderTabContent()}
        </main>
      </div>

      <footer className="mt-8 pt-6 border-t border-gray-200 flex items-center justify-end space-x-4">
        {unsavedChanges && (
          <div className="flex items-center text-sm text-yellow-600">
            <AlertTriangle className="w-4 h-4 mr-2" />
            You have unsaved changes.
          </div>
        )}
        <Button
          onClick={handleSave}
          disabled={isSaving || !unsavedChanges}
          size="lg"
        >
          <Save className="w-5 h-5 mr-2" />
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </footer>
    </div>
  );
};

export default ClientProfileEditor;