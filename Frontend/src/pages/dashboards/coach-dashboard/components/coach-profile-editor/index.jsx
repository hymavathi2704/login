import React, { useState, useEffect, useCallback } from 'react';
import { User, Briefcase, DollarSign, Phone, Save, AlertTriangle, Eye, Copy } from 'lucide-react'; // 💡 IMPORTED COPY ICON
import PersonalInfoSection from './components/PersonalInfoSection';
import ProfessionalSection from './components/ProfessionalSection';
import ContactSection from './components/ContactSection';
import SocialLinksSection from './components/SocialLinksSection'; 
import Button from '../../../../../components/ui/Button';
import { cn } from '../../../../../utils/cn';
import { useAuth } from '@/auth/AuthContext';
import { getCoachProfile, updateUserProfile, addProfileItem, removeProfileItem } from '../../../../../auth/authApi';
import { toast } from 'sonner';
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
  const { user, setUser } = useAuth(); // Destructure setUser to update context after successful save
  const [activeTab, setActiveTab] = useState('personal');
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // REMOVED: defaultPricing and defaultAvailability constants

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    professionalTitle: '',
    // NEW: Field to hold the File object before submission
    profilePictureFile: null, 
    profilePicture: null, // KEEP: Used for display and the signal for deletion
    // REMOVED: websiteUrl (consolidated)
    bio: '',
    yearsOfExperience: 0,
    specialties: [],
    certifications: [],
    education: [],
    
    // NEW/UPDATED: Sessions array comes from direct association (kept in state/form for mapping only)
    sessions: [], // Array of Session objects
    
    // RE-ADDED: Demographics 
    dateOfBirth: '',
    gender: '',
    ethnicity: '',
    country: '',
    // RE-ADDED: Social Links 
    linkedinUrl: '',
    twitterUrl: '',
    instagramUrl: '',
    facebookUrl: '',
  });

  const [initialData, setInitialData] = useState({});
  const [errors, setErrors] = useState({});

  const mapApiToForm = useCallback((apiData) => {
    // CoachProfile association in the response is now 'CoachProfile'
    const coachProfile = apiData.user?.CoachProfile || apiData.CoachProfile || {};
    const coreUser = apiData.user || apiData;

    // Use profilePicture directly from the user object if available, as per recommended structure
    const profilePicturePath = coachProfile.profilePicture || coreUser.profilePicture || ''; 

    return {
      firstName: coreUser.firstName || '',
      lastName: coreUser.lastName || '',
      email: coreUser.email || '',
      phone: coreUser.phone || '',
      profilePicture: profilePicturePath, // Used for display, will be passed to PersonalInfoSection

      professionalTitle: coachProfile.professionalTitle || '',
      bio: coachProfile.bio || '',
      yearsOfExperience: coachProfile.yearsOfExperience || 0,
      
      // MAPPING FOR ARRAYS (still JSON on the DB but handled via list handlers)
      specialties: safeParseAndDefault(coachProfile.specialties, []),
      certifications: ensureUniqueIds(safeParseAndDefault(coachProfile.certifications, [])),
      education: ensureUniqueIds(safeParseAndDefault(coachProfile.education, [])),
      
      // NEW MAPPING: Sessions are a direct association array (no JSON parse needed)
      sessions: coachProfile.sessions || [],

      // Demographics mapping
      dateOfBirth: coachProfile.dateOfBirth || '',
      gender: coachProfile.gender || '',
      ethnicity: coachProfile.ethnicity || '',
      country: coachProfile.country || '',
      // Social Links mapping
      linkedinUrl: coachProfile.linkedinUrl || '',
      twitterUrl: coachProfile.twitterUrl || '',
      instagramUrl: coachProfile.instagramUrl || '',
      facebookUrl: coachProfile.facebookUrl || '',
      
      // Staged file is null on initial fetch
      profilePictureFile: null, 
      
      // REMOVED: websiteUrl, sessionTypes, pricing, availability
    };
  }, []);

  const fetchProfile = useCallback(async () => {
    try {
        setIsFetching(true);
        const response = await getCoachProfile();
        const mappedData = mapApiToForm(response.data);
        setFormData(mappedData);
        setInitialData(mappedData);
    } catch (error) {
        console.error("Failed to fetch coach profile:", error);
        toast.error('Failed to load profile data.', { description: error.message });
    } finally { 
        setIsFetching(false); 
        // Set loading to false only after initial fetch, not after subsequent session updates
        setIsLoading(false); 
    }
  }, [mapApiToForm]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    if (!isFetching) {
      // NOTE: Exclude the dynamic 'sessions' array and the 'profilePictureFile' (which is volatile) from the change check.
      const cleanFormData = { ...formData, sessions: [], profilePictureFile: null };
      const cleanInitialData = { ...initialData, sessions: [], profilePictureFile: null };
      
      // ✅ FIX: Check if a file is staged OR if the file deletion flag is set OR if other data has changed
      const hasFileStaged = !!formData.profilePictureFile || (formData.profilePicture === null && initialData.profilePicture !== ''); 
      const hasOtherChanges = JSON.stringify(cleanFormData) !== JSON.stringify(cleanInitialData);
      
      setUnsavedChanges(hasOtherChanges || hasFileStaged);
    }
  }, [formData, initialData, isFetching]); // ⚠️ Now this correctly tracks file changes

  const tabs = [
    { id: 'personal', label: 'Personal Info', icon: <User /> },
    { id: 'contact', label: 'Contact', icon: <Phone /> },
    { id: 'social', label: 'Social Links', icon: <User /> },
    { id: 'professional', label: 'Professional', icon: <Briefcase /> },
    // REMOVED: The 'services' tab entry as it is now a separate menu item
    // { id: 'services', label: 'Services', icon: <DollarSign /> }
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

  // --- NEW API HANDLERS FOR LISTS (Certifications, Education, Specialties) ---
  const handleAddListItem = useCallback(async (type, item) => {
    setIsLoading(true);
    try {
      // Call API (which successfully updates the backend)
      await addProfileItem({ type, item });
      
      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} added successfully!`);
      
      // ✅ FIX: Instead of manually manipulating the state (which caused the crash),
      // fetch the complete, fresh profile from the backend.
      await fetchProfile(); 
      
      setUnsavedChanges(false);
    } catch (error) {
      console.error('Add item failed:', error);
      toast.error(`Failed to add item to ${type}.`);
    } finally {
      setIsLoading(false);
    }
  }, [fetchProfile]); // Added fetchProfile to dependencies

  const handleRemoveListItem = useCallback(async (type, id) => {
    setIsLoading(true);
    try {
      // Call API (which successfully updates the backend)
      await removeProfileItem({ type, id });
      
      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} removed successfully!`);
      
      // ✅ FIX: Re-fetch the profile to guarantee state consistency after deletion.
      await fetchProfile(); 
      
      setUnsavedChanges(false);
    } catch (error) {
      console.error('Remove item failed:', error);
      toast.error(`Failed to remove item from ${type}.`);
    } finally {
      setIsLoading(false);
    }
  }, [fetchProfile]); // Added fetchProfile to dependencies
  // --- END NEW API HANDLERS FOR LISTS ---

  const validateForm = () => {
    const newErrors = {};
    if (!formData?.firstName?.trim()) newErrors.firstName = 'First name is required';
    if (!formData?.lastName?.trim()) newErrors.lastName = 'Last name is required';
    if (!formData?.email?.trim()) newErrors.email = 'Email is required';
    if (formData?.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData?.email)) newErrors.email = 'Please enter a valid email';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ✅ CORRECTED FUNCTION: Uses FormData for file upload AND handles deletion
  const handleSave = async () => {
    if (!validateForm()) return;
    setIsLoading(true);
    setErrors({});

    // 1. Create FormData object
    const payload = new FormData();

    // 2. Iterate over all fields in formData
    for (const key in formData) {
        const value = formData[key];

        // A. Handle the staged file (profilePictureFile) for upload OR deletion
        if (key === 'profilePictureFile') {
            if (value instanceof File) {
                // If a new file is staged, append it as 'profilePicture' (backend field name)
                payload.append('profilePicture', value);
            } else if (formData.profilePicture === null && initialData.profilePicture !== '') {
                // If the file was explicitly removed (profilePicture: null in state, but was not null initially), 
                // signal deletion to the backend by sending the string 'null'.
                payload.append('profilePicture', 'null');
            }
            continue; // Skip further processing for this key
        }

        // Skip undefined or null values that are not part of an explicit change (like file deletion, which is handled above)
        if (value === undefined || value === null) {
            continue;
        }

        // B. Handle fields that need to be JSON stringified
        else if (['specialties', 'certifications', 'education'].includes(key)) {
            payload.append(key, JSON.stringify(value));
        } 
        // C. Handle all other standard string/number fields 
        // Exclude the dynamic 'sessions' array and the temporary 'profilePicture' string path.
        else if (key !== 'sessions' && key !== 'profilePicture') {
            payload.append(key, value);
        }
    }

    try {
      // 3. Send the FormData object.
      const response = await updateUserProfile(payload);
      
      toast.success('Saved successfully! 🎉', { description: 'Your coach profile has been updated.' });
      
      // 4. Update user context and initial state with the full response data
      const updatedMappedData = mapApiToForm(response.data);
      setUser(response.data.user); // Update global AuthContext user
      setInitialData(updatedMappedData);
      
      // 5. Reset formData and ensure profilePictureFile is explicitly null
      setFormData({ ...updatedMappedData, profilePictureFile: null }); 
      
      setUnsavedChanges(false);

    } catch (error) {
      console.error('Save failed:', error);
      toast.error(error.response?.data?.error || 'Failed to save profile.');
    } finally { setIsLoading(false); }
  };

  // 💡 UPDATED FUNCTION: Handle Copy to Clipboard (Fixes public link defaulting to localhost)
  const handleCopyLink = () => {
    if (!user?.id) {
      toast.error('Coach ID not found.');
      return;
    }
    
    // 1. Get the base URL from environment variables, defaulting to localhost:5173
    let baseUrl = import.meta.env.VITE_FRONTEND_URL || 'http://localhost:5173';
    
    // 2. SMART FALLBACK: If the default (localhost) is used AND the app is currently running on a public domain,
    // use the current window's origin (e.g., https://katha.startworks.in) as the base URL.
    const isLocalhostDefault = baseUrl.includes('localhost') || baseUrl.includes('127.0.0.1');
    const isRunningPublicly = window.location.hostname !== 'localhost' && window.location.protocol.startsWith('http');
    
    if (isLocalhostDefault && isRunningPublicly) {
        baseUrl = window.location.origin;
    }

    const publicLink = `${baseUrl}/profiles/${user.id}`;
    
    navigator.clipboard.writeText(publicLink)
      .then(() => {
        toast.success('Public profile link copied to clipboard! 🔗', {
          description: publicLink,
          duration: 3000,
        });
      })
      .catch((err) => {
        console.error('Failed to copy link:', err);
        toast.error('Failed to copy link. Please try again or copy manually.');
      });
  };
  
  const renderTabContent = () => {
    // coachProfileId is no longer strictly needed here but kept for clarity/potential future use
    // const coachProfileId = initialData.id; 
    
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
                {/* 🔴 REMOVED: DemographicsFormSection is now rendered inside PersonalInfoSection */}
            </div>
        );
      case 'contact':
        return <ContactSection data={formData} errors={errors} updateData={handleUpdateFormData} setUnsavedChanges={setUnsavedChanges} />;
      case 'social':
        return <SocialLinksSection data={formData} updateData={handleUpdateFormData} setUnsavedChanges={setUnsavedChanges} />;
      case 'professional':
        return (
          <ProfessionalSection 
            data={formData} 
            errors={errors} 
            updateData={handleUpdateFormData} 
            updateNestedData={updateNestedFormData} 
            setUnsavedChanges={setUnsavedChanges} 
            onAddListItem={handleAddListItem}
            onRemoveListItem={handleRemoveListItem}
          />
        );
      // REMOVED: case 'services' which is now a dedicated top-level dashboard item
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
      <div className="mb-8 flex justify-between items-start"> 
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Edit Your Profile</h1>
          <p className="text-gray-600 mt-2">Keep your profile updated to attract the right clients.</p>
        </div>
        {/* 💡 NEW: Public Profile Buttons in the Header */}
        {user?.id && (
          <div className="flex space-x-3 mt-1">
            {/* 1. View Public Profile Button (as previously fixed to open in same tab) */}
            <Link 
                to={`/profiles/${user.id}`} 
                className={cn(
                    "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
                    "bg-transparent text-blue-600 border border-blue-600 hover:bg-blue-50/50 h-10 px-4 py-2 text-sm"
                )}
            >
                <Eye className="w-5 h-5 mr-2" />
                View Public Profile
            </Link>
            
            {/* 2. Copy Public Profile Link Button */}
            <Button 
                onClick={handleCopyLink} 
                variant="outline" 
                className="bg-white border-gray-300 text-gray-700 hover:bg-gray-100 h-10 px-4 py-2 text-sm"
                title="Copy Public Profile Link"
            >
                <Copy className="w-5 h-5 mr-2" />
                Public Link
            </Button>
          </div>
        )}
        {/* 💡 END: Public Profile Buttons */}
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
        
        {/* The 'View Public Profile' button logic was moved to the header for better visibility/UX */}
        
        <Button onClick={handleSave} disabled={isLoading || !unsavedChanges} size="lg">
          <Save className="w-5 h-5 mr-2" />
          {isLoading ? 'Saving...' : 'Save Changes'}
        </Button>
      </footer>
    </div>
  );
};

export default CoachProfileEditor;