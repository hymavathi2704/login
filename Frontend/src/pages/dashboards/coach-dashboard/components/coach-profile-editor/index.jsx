import React, { useState, useEffect, useCallback } from 'react';
// ADDED EYE ICON
import { User, Briefcase, DollarSign, Phone, Save, AlertTriangle, Eye } from 'lucide-react';
import PersonalInfoSection from './components/PersonalInfoSection';
import ProfessionalSection from './components/ProfessionalSection';
import ServiceSection from './components/ServiceSection';
import ContactSection from './components/ContactSection';
// ADDED IMPORTS: SocialLinksSection and DemographicsFormSection
import SocialLinksSection from './components/SocialLinksSection'; 
import DemographicsFormSection from "../../../shared/DemographicsFormSection";
import Button from '../../../../../components/ui/Button';
import { cn } from '../../../../../utils/cn';
import { useAuth } from '@/auth/AuthContext';
import { getCoachProfile, updateUserProfile } from '../../../../../auth/authApi';
import { toast } from 'sonner';
// ADDED IMPORT: Link for navigation
import { Link } from 'react-router-dom';

const parseCorruptedState = (value) => {
  if (typeof value === 'string' && (value.trim().startsWith('[') || value.trim().startsWith('{'))) {
    try { return JSON.parse(value); } catch { return null; }
  }
  if (value === 'null' || value === 'undefined') return null;
  return value;
};

const safeParseAndDefault = (value, defaultValue) => {
  const parsed = parseCorruptedState(value);
  if (Array.isArray(defaultValue)) return Array.isArray(parsed) ? parsed : defaultValue;
  if (typeof defaultValue === 'object' && defaultValue !== null) return (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) ? parsed : defaultValue;
  return parsed ?? defaultValue;
};

const ensureUniqueIds = (arr) => {
  if (!Array.isArray(arr)) return [];
  return arr.map(item => ({ ...item, id: item.id || Date.now() + Math.random() }));
};

const CoachProfileEditor = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('personal');
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const defaultPricing = { individual: '', group: '', package: '' };
  const defaultAvailability = { timezone: '', workingHours: { start: '09:00', end: '17:00' }, workingDays: [] };

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    professionalTitle: '',
    profilePicture: null,
    websiteUrl: '',
    bio: '',
    yearsOfExperience: 0,
    specialties: [],
    certifications: [],
    education: [],
    sessionTypes: [],
    pricing: defaultPricing,
    availability: defaultAvailability,
    // RE-ADDED: Demographics (from previous steps)
    dateOfBirth: '',
    gender: '',
    ethnicity: '',
    country: '',
    // RE-ADDED: Social Links (from previous steps)
    linkedinUrl: '',
    twitterUrl: '',
    instagramUrl: '',
    facebookUrl: '',
  });

  const [initialData, setInitialData] = useState({});
  const [errors, setErrors] = useState({});

  const mapApiToForm = useCallback((apiData) => {
    const coachProfile = apiData.user?.CoachProfile || apiData.CoachProfile || {};
    const coreUser = apiData.user || apiData;

    return {
      firstName: coreUser.firstName || '',
      lastName: coreUser.lastName || '',
      email: coreUser.email || '',
      phone: coreUser.phone || '',
      professionalTitle: coachProfile.professionalTitle || '',
      profilePicture: coachProfile.profilePicture || null,
      websiteUrl: coachProfile.websiteUrl || '',
      bio: coachProfile.bio || '',
      yearsOfExperience: coachProfile.yearsOfExperience || 0,
      specialties: safeParseAndDefault(coachProfile.specialties, []),
      sessionTypes: safeParseAndDefault(coachProfile.sessionTypes, []),
      certifications: ensureUniqueIds(safeParseAndDefault(coachProfile.certifications, [])),
      education: ensureUniqueIds(safeParseAndDefault(coachProfile.education, [])),
      pricing: safeParseAndDefault(coachProfile.pricing, defaultPricing),
      availability: safeParseAndDefault(coachProfile.availability, defaultAvailability),
      // RE-ADDED: Demographics mapping
      dateOfBirth: coachProfile.dateOfBirth || '',
      gender: coachProfile.gender || '',
      ethnicity: coachProfile.ethnicity || '',
      country: coachProfile.country || '',
      // RE-ADDED: Social Links mapping
      linkedinUrl: coachProfile.linkedinUrl || '',
      twitterUrl: coachProfile.twitterUrl || '',
      instagramUrl: coachProfile.instagramUrl || '',
      facebookUrl: coachProfile.facebookUrl || '',
    };
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await getCoachProfile();
        const mappedData = mapApiToForm(response.data);
        setFormData(mappedData);
        setInitialData(mappedData);
      } catch (error) {
        console.error("Failed to fetch coach profile:", error);
        toast.error('Failed to load profile data.', { description: error.message });
      } finally { setIsFetching(false); }
    };
    fetchProfile();
  }, [mapApiToForm]);

  useEffect(() => {
    if (!isFetching) {
      setUnsavedChanges(JSON.stringify(formData) !== JSON.stringify(initialData));
    }
  }, [formData, initialData, isFetching]);

  const tabs = [
    { id: 'personal', label: 'Personal Info', icon: <User /> },
    { id: 'contact', label: 'Contact', icon: <Phone /> },
    // RE-ADDED TAB: Social Links
    { id: 'social', label: 'Social Links', icon: <User /> },
    // END RE-ADDED TAB
    { id: 'professional', label: 'Professional', icon: <Briefcase /> },
    { id: 'services', label: 'Services', icon: <DollarSign /> }
  ];

  const handleUpdateFormData = useCallback((newPartialData) => {
    setFormData(prev => ({ ...prev, ...newPartialData }));
  }, []);

  const updateNestedFormData = useCallback((path, value) => {
    setFormData(prev => {
      const newData = { ...prev };
      const keys = path?.split('.');
      let current = newData;
      for (let i = 0; i < keys?.length - 1; i++) {
        current[keys[i]] = { ...current?.[keys[i]] };
        current = current?.[keys[i]];
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
    if (formData?.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData?.email)) newErrors.email = 'Please enter a valid email';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    setIsLoading(true);
    setErrors({});

    const payload = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      professionalTitle: formData.professionalTitle,
      profilePicture: formData.profilePicture,
      websiteUrl: formData.websiteUrl,
      bio: formData.bio,
      yearsOfExperience: parseInt(formData.yearsOfExperience) || 0,
      
      // RE-ADDED: Demographics & Social Links to payload
      dateOfBirth: formData.dateOfBirth,
      gender: formData.gender,
      ethnicity: formData.ethnicity,
      country: formData.country,
      linkedinUrl: formData.linkedinUrl,
      twitterUrl: formData.twitterUrl,
      instagramUrl: formData.instagramUrl,
      facebookUrl: formData.facebookUrl,

      specialties: JSON.stringify(formData.specialties),
      sessionTypes: JSON.stringify(formData.sessionTypes),
      certifications: JSON.stringify(formData.certifications),
      education: JSON.stringify(formData.education),
      pricing: JSON.stringify(formData.pricing),
      availability: JSON.stringify(formData.availability),
    };

    try {
      const response = await updateUserProfile(payload);
      toast.success('Saved successfully! 🎉', { description: 'Your coach profile has been updated.' });
      const updatedMappedData = mapApiToForm(response.data);
      setInitialData(updatedMappedData);
      setFormData(updatedMappedData);
      setUnsavedChanges(false);
    } catch (error) {
      console.error('Save failed:', error);
      toast.error(error.response?.data?.error || 'Failed to save profile.');
    } finally { setIsLoading(false); }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'personal':
        return (
            <div className='space-y-8'>
                <PersonalInfoSection 
                    data={formData} 
                    errors={errors} 
                    updateData={handleUpdateFormData} 
                    setUnsavedChanges={setUnsavedChanges} 
                />
                {/* RE-ADDED: Demographic Information Section to Personal tab */}
                <DemographicsFormSection 
                    formData={formData} 
                    handleChange={e => handleUpdateFormData({ [e.target.name]: e.target.value })} 
                />
            </div>
        );
      case 'contact':
        return <ContactSection data={formData} errors={errors} updateData={handleUpdateFormData} setUnsavedChanges={setUnsavedChanges} />;
      // RE-ADDED TAB CONTENT
      case 'social':
        return <SocialLinksSection data={formData} updateData={handleUpdateFormData} setUnsavedChanges={setUnsavedChanges} />;
      // END RE-ADDED TAB CONTENT
      case 'professional':
        return <ProfessionalSection data={formData} errors={errors} updateData={handleUpdateFormData} updateNestedData={updateNestedFormData} setUnsavedChanges={setUnsavedChanges} />;
      case 'services':
        return <ServiceSection data={formData} errors={errors} updateData={handleUpdateFormData} updateNestedData={updateNestedFormData} setUnsavedChanges={setUnsavedChanges} />;
      default: return null;
    }
  };

  if (isFetching) return (
    <div className="flex items-center justify-center py-12">
      <div className="animate-spin mr-3"><Save className="w-5 h-5 text-blue-600" /></div>
      <p className="text-gray-600">Loading profile data...</p>
    </div>
  );

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Edit Your Profile</h1>
        <p className="text-gray-600 mt-2">Keep your profile updated to attract the right clients.</p>
      </div>

      <div className="border-b border-gray-200 mb-8">
        <nav className="flex space-x-4 -mb-px" aria-label="Tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={(e) => { e.preventDefault(); setActiveTab(tab.id); }}
              className={cn('group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm',
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

      <main>{renderTabContent()}</main>

      <footer className="mt-8 pt-6 border-t border-gray-200 flex items-center justify-end space-x-4">
        {unsavedChanges && (
          <div className="flex items-center text-sm text-yellow-600">
            <AlertTriangle className="w-4 h-4 mr-2" />
            You have unsaved changes.
          </div>
        )}
        
        {/* START: ADDED View Public Profile Button */}
        {user?.id && (
            <Link 
                to={`/profiles/${user.id}`} 
                target="_blank" 
                className={cn(
                    // Mimics the Button component's styling for a secondary action
                    "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
                    "bg-transparent text-blue-600 border border-blue-600 hover:bg-blue-50/50 h-10 px-4 py-2 text-sm"
                )}
            >
                <Eye className="w-5 h-5 mr-2" />
                View Public Profile
            </Link>
        )}
        {/* END: ADDED View Public Profile Button */}

        <Button onClick={handleSave} disabled={isLoading || !unsavedChanges} size="lg">
          <Save className="w-5 h-5 mr-2" />
          {isLoading ? 'Saving...' : 'Save Changes'}
        </Button>
      </footer>
    </div>
  );
};

export default CoachProfileEditor;