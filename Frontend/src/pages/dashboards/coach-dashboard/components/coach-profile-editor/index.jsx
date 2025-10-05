import React, { useState, useEffect, useCallback } from 'react';
import { User, Briefcase, DollarSign, Phone, Save, AlertTriangle, ChevronLeft, X } from 'lucide-react';
import PersonalInfoSection from './components/PersonalInfoSection';
import ProfessionalSection from './components/ProfessionalSection';
import ServiceSection from './components/ServiceSection';
import ContactSection from './components/ContactSection';
import Button from '../../../../../components/ui/Button';
import { cn } from '../../../../../utils/cn';

const CoachProfileEditor = () => {
  const [activeTab, setActiveTab] = useState('personal');
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    // Personal Information
    firstName: '',
    lastName: '',
    professionalTitle: '',
    profilePicture: null,
    
    // Contact Details
    email: '',
    phone: '',
    websiteUrl: '',
    
    // Professional Information  
    bio: '',
    specialties: [],
    certifications: [],
    education: [],
    yearsOfExperience: 0,
    
    // Service Offerings
    sessionTypes: [],
    pricing: {
      individual: '',
      group: '',
      package: ''
    },
    availability: {
      timezone: '',
      workingHours: {
        start: '09:00',
        end: '17:00'
      },
      workingDays: []
    }
  });

  const [errors, setErrors] = useState({});

  const tabs = [
    { id: 'personal', label: 'Personal Info', icon: <User /> },
    { id: 'contact', label: 'Contact', icon: <Phone /> },
    { id: 'professional', label: 'Professional', icon: <Briefcase /> },
    { id: 'services', label: 'Services', icon: <DollarSign /> }
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
        // Reset form or navigate away
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
      case 'contact':
        return (
          <ContactSection 
            data={formData}
            errors={errors}
            updateData={(data) => setFormData(prev => ({ ...prev, ...data }))}
            setUnsavedChanges={setUnsavedChanges}
          />
        );
      case 'professional':
        return (
          <ProfessionalSection 
            data={formData}
            errors={errors}
            updateData={updateFormData}
            updateNestedData={updateNestedFormData}
            setUnsavedChanges={setUnsavedChanges}
          />
        );
      case 'services':
        return (
          <ServiceSection 
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
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Edit Your Profile</h1>
        <p className="text-gray-600 mt-2">
          Keep your profile updated to attract the right clients.
        </p>
      </div>

      {/* START: Updated top navigation */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="flex space-x-4 -mb-px" aria-label="Tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm',
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              )}
            >
              {React.cloneElement(tab.icon, { className: 'w-5 h-5 mr-2' })}
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>
      {/* END: Updated top navigation */}
      
      {/* Main content area for the tabs */}
      <main>
        {renderTabContent()}
      </main>

      {/* Footer with action buttons */}
      <footer className="mt-8 pt-6 border-t border-gray-200 flex items-center justify-end space-x-4">
        {unsavedChanges && (
          <div className="flex items-center text-sm text-yellow-600">
            <AlertTriangle className="w-4 h-4 mr-2" />
            You have unsaved changes.
          </div>
        )}
        <Button onClick={handleSave} disabled={isLoading || !unsavedChanges} size="lg">
          <Save className="w-5 h-5 mr-2" />
          {isLoading ? 'Saving...' : 'Save Changes'}
        </Button>
      </footer>
    </div>
  );
};

export default CoachProfileEditor;

