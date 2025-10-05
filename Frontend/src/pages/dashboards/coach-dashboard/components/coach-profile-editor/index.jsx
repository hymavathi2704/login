// Frontend/src/pages/dashboards/coach-dashboard/components/coach-profile-editor/index.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { User, Briefcase, DollarSign, Phone, Save, AlertTriangle } from 'lucide-react';
import PersonalInfoSection from './components/PersonalInfoSection'; 
import ProfessionalSection from './components/ProfessionalSection';
import ServiceSection from './components/ServiceSection';
import ContactSection from './components/ContactSection';
import Button from '../../../../../components/ui/Button';
import { cn } from '../../../../../utils/cn';
import { useAuth } from '@/auth/AuthContext';
import { getCoachProfile, updateUserProfile } from '../../../../../auth/authApi'; 
import { toast } from 'sonner';

// Helper function to safely parse potential JSON strings (used for both saving and fetching)
const parseCorruptedState = (value) => {
    // Check if the value is a string that looks like JSON (starts with [ or {)
    if (typeof value === 'string' && (value.trim().startsWith('[') || value.trim().startsWith('{'))) {
        try {
            return JSON.parse(value);
        } catch (e) {
            console.warn('Failed to parse stringified state value:', value, e);
        }
    }
    // If it's not a string or parsing fails, return the original value
    return value;
};

// Helper function to ensure fetched data is an Array or Object, or returns defaults
const safeParseAndDefault = (value, defaultValue) => {
    const parsedValue = parseCorruptedState(value);
    
    // Check for array fields
    if (Array.isArray(defaultValue)) {
        return Array.isArray(parsedValue) ? parsedValue : defaultValue;
    }
    
    // Check for object fields
    if (typeof defaultValue === 'object' && defaultValue !== null) {
        return (typeof parsedValue === 'object' && parsedValue !== null && !Array.isArray(parsedValue)) 
            ? parsedValue 
            : defaultValue;
    }
    
    return parsedValue || defaultValue;
};


const CoachProfileEditor = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('personal');
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [isFetching, setIsFetching] = useState(true); 
  const [isLoading, setIsLoading] = useState(false);

  // Default complex object structures
  const defaultPricing = { individual: '', group: '', package: '' };
  const defaultAvailability = { timezone: '', workingHours: { start: '09:00', end: '17:00' }, workingDays: [] };

  // Form state structure
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    professionalTitle: '',
    profilePicture: null,
    websiteUrl: '',
    bio: '',
    specialties: [],
    certifications: [],
    education: [],
    yearsOfExperience: 0,
    sessionTypes: [],
    pricing: defaultPricing,
    availability: defaultAvailability,
  });

  const [initialData, setInitialData] = useState({});
  const [errors, setErrors] = useState({});


  // Helper to map API response to flat form state
  const mapApiToForm = useCallback((apiData) => {
    const coachProfile = apiData.user?.CoachProfile || apiData.CoachProfile || {};
    const coreUser = apiData.user || apiData; 

    return {
      // Core User fields
      firstName: coreUser.firstName || '',
      lastName: coreUser.lastName || '',
      email: coreUser.email || '',
      phone: coreUser.phone || '',
      
      // CoachProfile fields (using direct keys which match DB and BE logic)
      professionalTitle: coachProfile.professionalTitle || '', 
      profilePicture: coachProfile.profilePicture || null,
      websiteUrl: coachProfile.websiteUrl || '', 
      bio: coachProfile.bio || '',
      yearsOfExperience: coachProfile.yearsOfExperience || 0, 
      
      // CRITICAL FIX: Ensure ALL complex fields are native arrays/objects upon fetch
      specialties: safeParseAndDefault(coachProfile.specialties, []), 
      certifications: safeParseAndDefault(coachProfile.certifications, []),
      education: safeParseAndDefault(coachProfile.education, []),
      sessionTypes: safeParseAndDefault(coachProfile.sessionTypes, []),
      pricing: safeParseAndDefault(coachProfile.pricing, defaultPricing),
      availability: safeParseAndDefault(coachProfile.availability, defaultAvailability),
    };
  }, []);

  // 1. DATA FETCHING: Load user data on component mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await getCoachProfile(); 
        const mappedData = mapApiToForm(response.data); 
        
        setFormData(mappedData);
        setInitialData(mappedData);
      } catch (error) {
        console.error("Failed to fetch coach profile:", error);
      } finally {
        setIsFetching(false);
      }
    };
    fetchProfile();
  }, [mapApiToForm]); 

  // Check for unsaved changes (must run after form data is set)
  useEffect(() => {
    if (!isFetching) {
      setUnsavedChanges(JSON.stringify(formData) !== JSON.stringify(initialData));
    }
  }, [formData, initialData, isFetching]);


  const tabs = [
    { id: 'personal', label: 'Personal Info', icon: <User /> },
    { id: 'contact', label: 'Contact', icon: <Phone /> },
    { id: 'professional', label: 'Professional', icon: <Briefcase /> },
    { id: 'services', label: 'Services', icon: <DollarSign /> }
  ];

  const handleUpdateFormData = useCallback((newPartialData) => {
    setFormData(prev => ({
      ...prev,
      ...newPartialData
    }));
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
  }, []);
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData?.firstName?.trim()) newErrors.firstName = 'First name is required';
    if (!formData?.lastName?.trim()) newErrors.lastName = 'Last name is required';
    if (!formData?.email?.trim()) newErrors.email = 'Email is required';
    if (formData?.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData?.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };


  // 3. DATA SAVING: Handle actual API call
  const handleSave = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    setErrors({});
    
    // 1. Prepare and CLEAN the payload right before sending
    const payload = {
      // User fields
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      
      // CoachProfile fields 
      professionalTitle: formData.professionalTitle, 
      profilePicture: formData.profilePicture,
      websiteUrl: formData.websiteUrl,
      bio: formData.bio,
      yearsOfExperience: formData.yearsOfExperience,
      
      // APPLY CLEANUP/PARSING TO ALL COMPLEX FIELDS
      // This guarantees the backend receives native objects/arrays
      specialties: parseCorruptedState(formData.specialties),
      certifications: parseCorruptedState(formData.certifications),
      education: parseCorruptedState(formData.education),
      sessionTypes: parseCorruptedState(formData.sessionTypes),
      pricing: parseCorruptedState(formData.pricing),
      availability: parseCorruptedState(formData.availability),
    };

    try {
      const response = await updateUserProfile(payload);
      
      toast.success('Saved successfully! 🎉', {
        description: 'Your coach profile has been updated.',
      });
      
      // Update form state with the fresh data returned from the server
      const updatedMappedData = mapApiToForm(response.data);
      setInitialData(updatedMappedData);
      setFormData(updatedMappedData);
      setUnsavedChanges(false);

    } catch (error) {
      console.error('Save failed:', error);
      const errorMessage = error.response?.data?.error || 'Failed to save profile. Please check the console.';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };


  const renderTabContent = () => {
    switch (activeTab) {
      case 'personal':
        return (
          <PersonalInfoSection 
            data={formData}
            errors={errors}
            updateData={handleUpdateFormData}
            setUnsavedChanges={setUnsavedChanges}
          />
        );
      case 'contact':
        return (
          <ContactSection 
            data={formData}
            errors={errors}
            updateData={handleUpdateFormData}
            setUnsavedChanges={setUnsavedChanges}
          />
        );
      case 'professional':
        return (
          <ProfessionalSection 
            data={formData}
            errors={errors}
            updateData={handleUpdateFormData}
            updateNestedData={updateNestedFormData}
            setUnsavedChanges={setUnsavedChanges}
          />
        );
      case 'services':
        return (
          <ServiceSection 
            data={formData}
            errors={errors}
            updateData={handleUpdateFormData}
            updateNestedData={updateNestedFormData}
            setUnsavedChanges={setUnsavedChanges}
          />
        );
      default:
        return null;
    }
  };

  if (isFetching) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin mr-3">
          <Save className="w-5 h-5 text-blue-600" />
        </div>
        <p className="text-gray-600">Loading profile data...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Edit Your Profile</h1>
        <p className="text-gray-600 mt-2">
          Keep your profile updated to attract the right clients.
        </p>
      </div>

      <div className="border-b border-gray-200 mb-8">
        <nav className="flex space-x-4 -mb-px" aria-label="Tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={(e) => {
                e.preventDefault(); 
                setActiveTab(tab.id);
              }}
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
      
      <main>
        {renderTabContent()}
      </main>

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