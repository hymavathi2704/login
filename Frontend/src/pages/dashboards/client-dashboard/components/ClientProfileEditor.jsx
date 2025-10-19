// Frontend/src/pages/dashboards/client-dashboard/components/ClientProfileEditor.jsx

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Save, AlertTriangle, Upload, X, Camera } from 'lucide-react';
// CORRECTED IMPORTS USING @/ ALIAS
import Button from '@/components/ui/Button'; 
import Input from '@/components/ui/Input';
import { cn } from '@/utils/cn'; 
// 🌟 NEW: Import the reusable Demographic component
import DemographicsFormSection from '@/pages/dashboards/shared/DemographicsFormSection'; 
// 🌟 NEW: Import API functions and DELETE function
import { getMe, updateClientProfile, uploadClientProfilePicture, deleteClientProfilePicture } from '@/auth/authApi'; 
import { toast } from 'sonner'; 
// ✅ FIX: Import useAuth to access the global state updater
import { useAuth } from '@/auth/AuthContext';


const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4028';

// 🔑 CRITICAL FIX: Base URL Helper (Duplicated from CoachProfileEditor's helper logic)
const getFullImageSrc = (pathOrBase64) => {
    // If path is already a data URL (local preview) or a full URL, return it
    if (typeof pathOrBase64 !== 'string' || !pathOrBase64.startsWith('/uploads/')) {
        return pathOrBase64;
    }

    // Determine the base URL for fetching the image.
    let baseUrl = API_BASE_URL;
    const isLocalhost = API_BASE_URL.includes('localhost') || API_BASE_URL.includes('127.0.0.1');

    if (isLocalhost && window.location.hostname !== 'localhost') {
        // When VITE_BACKEND_URL points to localhost but the app is on a public domain, 
        // use the current public domain to construct the absolute URL.
        baseUrl = window.location.origin;
    }
    
    // Return the absolute URL: http://katha.startworks.in/uploads/...
    return `${baseUrl}${pathOrBase64}`;
};


// ✅ FIX: Changed to anonymous default export to resolve "does not provide an export named 'default'" error
export default () => {
  // ✅ FIX: Destructure setUser (correct name from AuthContext) from useAuth
  const { setUser } = useAuth();
    
  const [isSaving, setIsSaving] = useState(false);
  const [profileData, setProfileData] = useState({});
  const [initialData, setInitialData] = useState({});
  const [unsavedChanges, setUnsavedChanges] = useState(false);

  // 🌟 NEW STATE: To hold the actual file object before upload
  const [imageFile, setImageFile] = useState(null); 
  
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

  // --- Data Fetching Logic ---
  useEffect(() => {
    const fetchProfileData = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        toast.error("Authentication Error: Please log in.");
        return;
      }

      try {
        const response = await getMe();
        const data = response.data;
        
        const userData = {
            ...data.user,
            ...data.user.ClientProfile 
        };

        // 🔑 FIX 1: Set +91 default if phone is empty or null
        if (!userData.phone || userData.phone === '') {
            userData.phone = '+91';
        }

        setProfileData(userData); 
        setInitialData(userData);
        // 🔑 FIX 2: Use the helper function when setting the initial URL for display
        setPreviewUrl(getFullImageSrc(userData.profilePicture)); 

      } catch (error) {
        console.error("Error fetching profile data:", error);
        toast.error(error.message || "Failed to fetch profile data from server.");
      }
    };

    fetchProfileData();
  }, [setUser]); // Added setUser to dependency array for clarity 

  
  // Detects if any changes have been made to the form
  useEffect(() => {
    const hasUnsavedChanges = JSON.stringify(profileData) !== JSON.stringify(initialData) || imageFile !== null;
    setUnsavedChanges(hasUnsavedChanges);
  }, [profileData, initialData, imageFile]);

  // Updates the state in real-time as you type in a form field
  const updateData = useCallback((newData) => {
    setProfileData(prev => ({ ...prev, ...newData }));
  }, []);
  
  // Universal change handler for inputs and selects
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    
    // Enforce +91 prefix if the user deletes it entirely
    if (name === 'phone' && value.length > 0 && !value.startsWith('+') && !value.startsWith('(')) {
        updateData({ [name]: '+' + value.replace(/[^0-9]/g, '') });
    } else {
        updateData({ [name]: value });
    }
  }, [updateData]);


  // Handles file preview and saves the file object
  const handleFileUpload = (file) => {
    if (file && file?.type?.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target.result); // Show preview using Base64
      };
      reader.readAsDataURL(file);

      setImageFile(file); 
      setUnsavedChanges(true); 
    }
  };

  // 🔑 FIX 3: Implement dedicated API call for photo deletion
  const removeProfilePicture = async () => { 
    if (!window.confirm("Are you sure you want to permanently delete your profile picture? This cannot be undone.")) {
      return;
    }
    
    // If the image is already null and there's no file pending, just clear local state
    if (!profileData.profilePicture && !imageFile) {
        setPreviewUrl(null); 
        setImageFile(null);
        setUnsavedChanges(true); 
        return;
    }
    
    try {
        let response = { data: {} };
        
        // Only call API if a URL exists (i.e., it's saved in the DB)
        if (profileData.profilePicture) {
            response = await deleteClientProfilePicture(); 
            toast.success("Profile picture successfully deleted from server.");
        }

        setPreviewUrl(null); 
        setImageFile(null); // Clear the temporary file object
        updateData({ profilePicture: null }); // Set DB path to null
        setUnsavedChanges(true); 
        
        // ✅ FIX: Update global state after deletion using setUser
        setUser(response.data.user || { ...profileData, profilePicture: null }); 
        
    } catch (error) {
        console.error("Failed to delete profile picture:", error);
        toast.error(error.response?.data?.message || "Failed to delete profile picture.");
    }
  };


  // Two-step Save function
  const handleSave = async () => {
    setIsSaving(true);
    const token = localStorage.getItem('accessToken');
    let finalProfileData = { ...profileData };

    if (!token) {
      toast.error("You are not logged in. Please log in to save your profile.");
      setIsSaving(false);
      return;
    }

    // --- STEP 1: Upload File if a new one is pending ---
    if (imageFile) {
        try {
            const uploadResponse = await uploadClientProfilePicture(imageFile);
            const uploadData = uploadResponse.data; 
            // The image is now saved and we have the final path
            finalProfileData.profilePicture = uploadData.profilePicture;
            
            // ✅ FIX: Update global state immediately after successful upload using setUser
            setUser(uploadData.user); 

        } catch (uploadError) {
            console.error('Profile picture upload failed:', uploadError);
            toast.error(`Error uploading picture: ${uploadError.message}`);
            setIsSaving(false);
            return;
        }
    } else if (profileData.profilePicture === null && initialData.profilePicture !== null) {
        // This case is handled by the dedicated removeProfilePicture, but kept for safety.
        finalProfileData.profilePicture = null;
    }

    // --- STEP 2: Save the Profile Data ---
    try {
      // Filter out file-specific fields before PUT call, as they are now handled in STEP 1 or deletion is signaled by profilePicture: null
      const dataToSave = { ...finalProfileData };
      delete dataToSave.profilePictureFile; // Ensure this temporary field is not sent
      
      const response = await updateClientProfile(dataToSave);
      
      const data = response.data; 

      toast.success('Profile saved successfully! 🎉');
      
      const savedUserData = {
        ...data.user,
        ...data.user.ClientProfile 
      };
      
      setProfileData(savedUserData);
      setInitialData(savedUserData);
      setImageFile(null); 
      // 🔑 FIX 4: Use the helper function when setting the final saved URL for display
      setPreviewUrl(getFullImageSrc(savedUserData.profilePicture)); 
      
      // ✅ FIX: Update global state after text/demographic changes using setUser
      setUser(data.user);


    } catch (error) {
      console.error('Failed to save profile:', error);
      toast.error(`Error saving profile: ${error.response?.data?.error || error.message}`);
    } finally {
      setIsSaving(false);
    }
  };
  
  // Helper functions for drag-and-drop 
  const handleDrop = (e) => { e.preventDefault(); setDragActive(false); e.dataTransfer.files[0] && handleFileUpload(e.dataTransfer.files[0]); };
  const handleDragOver = (e) => { e.preventDefault(); setDragActive(true); };
  const handleDragLeave = (e) => { e.preventDefault(); setDragActive(false); };


  // 🔑 FIX 5: Calculate the maximum allowed date (Today)
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="max-w-4xl mx-auto py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Edit Your Profile</h1>
        <p className="text-gray-600 mt-2">
          Keep your profile updated to get the best matches with coaches.
        </p>
      </div>

      <main className="space-y-8 bg-white shadow-lg rounded-xl p-8">
        
        {/* Profile Picture Upload Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Profile Picture</h3>
          <div className="flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                {/* 🔑 CRITICAL FIX: Use the new local helper function to get the correct URL */}
                {previewUrl 
                    ? <img 
                        src={getFullImageSrc(previewUrl)} 
                        alt="Profile preview" 
                        className="w-full h-full object-cover" 
                      /> 
                    : <Camera className="w-8 h-8 text-gray-400" />}
              </div>
              {previewUrl && <button onClick={removeProfilePicture} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"><X className="w-4 h-4" /></button>}
            </div>
            <div className="flex-1">
              {/* 🔑 CRITICAL FIX 6: The small, single-line upload component */}
              <div 
                    onClick={() => fileInputRef.current && fileInputRef.current.click()} // Make the whole div clickable
                    onDrop={handleDrop} 
                    onDragOver={handleDragOver} 
                    onDragLeave={handleDragLeave} 
                    className={cn("border-2 border-dashed rounded-lg p-3 text-center cursor-pointer transition-colors hover:border-indigo-400", dragActive ? "border-blue-400 bg-blue-50" : "border-gray-300")}
                >
                <p className="text-sm text-gray-600 flex items-center justify-center space-x-2">
                    <Upload className="h-5 w-5 text-gray-400" />
                    <span><span className="font-medium">Click to upload</span> or drag and drop (PNG, JPG, GIF up to 5MB)</span>
                </p>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={(e) => e.target.files && handleFileUpload(e.target.files[0])} className="hidden" />
              </div>
            </div>
          </div>
        </div>

        {/* Personal Information Form */}
        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Personal Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input label="First Name" required value={profileData.firstName || ''} onChange={(e) => updateData({ firstName: e.target.value })} />
              <Input label="Last Name" required value={profileData.lastName || ''} onChange={(e) => updateData({ lastName: e.target.value })} />
            </div>
        </div>

        {/* Contact Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
          <Input label="Email Address" type="email" required value={profileData.email || ''} onChange={(e) => updateData({ email: e.target.value })} disabled={true} description="Email cannot be changed." />
          <Input
            label="Phone Number (Optional)"
            type="tel"
            name="phone"
            value={profileData.phone || ''}
            onChange={handleChange} // Use the consolidated handleChange
            placeholder="+91 XXXXXXXXXX"
          />
        </div>
        
        {/* 🌟 DEMOGRAPHIC FIELDS SECTION (Integrated Component) */}
        <DemographicsFormSection 
            formData={profileData} 
            handleChange={handleChange} 
            // 🔑 FIX 5: Pass max date to prevent future dates in Date of Birth selector
            maxDate={today}
        />
      </main>

      {/* The Save button footer */}
      <footer className="mt-8 pt-6 border-t border-gray-200 flex items-center justify-end space-x-4">
        {unsavedChanges && <div className="flex items-center text-sm text-yellow-600"><AlertTriangle className="w-4 h-4 mr-2" />You have unsaved changes.</div>}
        <Button onClick={handleSave} disabled={isSaving || !unsavedChanges} size="lg">
          <Save className="w-5 h-5 mr-2" />{isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </footer>
    </div>
  );
};