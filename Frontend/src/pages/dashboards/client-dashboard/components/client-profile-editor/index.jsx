import React, { useState, useCallback } from 'react';
import { ChevronLeft, Save, X } from 'lucide-react';
import Button from '../../components/ui/Button';

import PersonalInfoSection from './components/PersonalInfoSection';
import PreferencesSection from './components/PreferencesSection';
import GoalsSection from './components/GoalsSection';
import AccountSection from './components/AccountSection';
import { cn } from '../../utils/cn';

const ClientProfileEditor = () => {
  const [activeTab, setActiveTab] = useState('personal');
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    // Personal Information
    firstName: '',
    lastName: '',
    profilePicture: null,
    
    // Contact Details
    email: '',
    phone: '',
    emailVerified: false,
    phoneVerified: false,
    
    // Preferences
    coachingFocusAreas: [],
    communicationPreferences: {
      email: true,
      sms: false,
      push: true
    },
    sessionFrequency: 'weekly',
    preferredSessionFormat: 'individual',
    budget: {
      min: '',
      max: ''
    },
    
    // Goals
    shortTermGoals: [],
    longTermGoals: [],
    progressTracking: true,
    coachingHistory: '',
    
    // Account Settings
    notifications: {
      sessionReminders: true,
      progressUpdates: true,
      coachMessages: true,
      marketing: false
    },
    privacy: {
      profileVisibility: 'coaches-only',
      shareProgress: false,
      allowReviews: true
    },
    subscription: {
      plan: 'basic',
      autoRenew: true
    }
  });

  const [errors, setErrors] = useState({});

  const tabs = [
    { id: 'personal', label: 'Personal Info', icon: '👤' },
    { id: 'preferences', label: 'Preferences', icon: '⚙️' },
    { id: 'goals', label: 'Goals', icon: '🎯' },
    { id: 'account', label: 'Account', icon: '🔧' }
  ];

  const updateFormData = useCallback((section, data) => {
    setFormData(prev => ({
      ...prev,
      [section]: { ...prev?.[section], ...data }
    }));
    setUnsavedChanges(true);
  }, []);

  const updateNestedFormData = useCallback((path, value) => {
    setFormData(prev => {
      const newData = { ...prev };
      const keys = path?.split('.');
      let current = newData;
      
      for (let i = 0; i < keys?.length - 1; i++) {
        current[keys[i]] = { ...current?.[keys?.[i]] };
        current = current?.[keys?.[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newData;
    });
    setUnsavedChanges(true);
  }, []);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData?.firstName?.trim()) newErrors.firstName = 'First name is required';
    if (!formData?.lastName?.trim()) newErrors.lastName = 'Last name is required';
    if (!formData?.email?.trim()) newErrors.email = 'Email is required';
    if (formData?.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/?.test(formData?.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setUnsavedChanges(false);
      setShowSaveConfirm(true);
      setTimeout(() => setShowSaveConfirm(false), 3000);
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (unsavedChanges) {
      if (window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
        setUnsavedChanges(false);
      }
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'personal':
        return (
          <PersonalInfoSection 
            data={formData}
            errors={errors}
            updateData={(data) => setFormData(prev => ({ ...prev, ...data }))}
            setUnsavedChanges={setUnsavedChanges}
          />
        );
      case 'preferences':
        return (
          <PreferencesSection 
            data={formData}
            errors={errors}
            updateData={updateFormData}
            updateNestedData={updateNestedFormData}
            setUnsavedChanges={setUnsavedChanges}
          />
        );
      case 'goals':
        return (
          <GoalsSection 
            data={formData}
            errors={errors}
            updateData={updateFormData}
            updateNestedData={updateNestedFormData}
            setUnsavedChanges={setUnsavedChanges}
          />
        );
      case 'account':
        return (
          <AccountSection 
            data={formData}
            errors={errors}
            updateData={updateFormData}
            updateNestedData={updateNestedFormData}
            setUnsavedChanges={setUnsavedChanges}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => window.history?.back()}
                className="text-gray-600 hover:text-gray-900"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Client Profile Editor</h1>
                <p className="text-sm text-gray-600">Manage your profile and coaching preferences</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {unsavedChanges && (
                <span className="text-sm text-orange-600 font-medium">
                  Unsaved changes
                </span>
              )}
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={isLoading}
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={isLoading}
                loading={isLoading}
              >
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </div>

          {/* Success Message */}
          {showSaveConfirm && (
            <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-md">
              Profile saved successfully!
            </div>
          )}
        </div>
      </header>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm">
          {/* Desktop Tabs */}
          <div className="hidden md:block border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {tabs?.map((tab) => (
                <button
                  key={tab?.id}
                  onClick={() => setActiveTab(tab?.id)}
                  className={cn(
                    "py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex items-center space-x-2",
                    activeTab === tab?.id
                      ? "border-blue-500 text-blue-600" :"border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  )}
                >
                  <span>{tab?.icon}</span>
                  <span>{tab?.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Mobile Accordion */}
          <div className="md:hidden">
            {tabs?.map((tab) => (
              <div key={tab?.id} className="border-b border-gray-200">
                <button
                  onClick={() => setActiveTab(activeTab === tab?.id ? '' : tab?.id)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">{tab?.icon}</span>
                    <span className="font-medium text-gray-900">{tab?.label}</span>
                  </div>
                  <ChevronLeft 
                    className={cn(
                      "w-5 h-5 text-gray-400 transition-transform",
                      activeTab === tab?.id && "-rotate-90"
                    )}
                  />
                </button>
                {activeTab === tab?.id && (
                  <div className="px-6 pb-6">
                    {renderTabContent()}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Desktop Content */}
          <div className="hidden md:block p-6">
            {renderTabContent()}
          </div>
        </div>
      </div>
      {/* Sticky Save Bar - Mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isLoading}
            loading={isLoading}
            className="flex-1"
          >
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ClientProfileEditor;