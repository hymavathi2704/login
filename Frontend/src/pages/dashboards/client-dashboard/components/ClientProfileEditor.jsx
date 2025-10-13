import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Save, AlertTriangle, Upload, X, Camera } from 'lucide-react';
// CORRECTED IMPORTS USING @/ ALIAS
import Button from '@/components/ui/Button'; 
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select'; // Assuming you have this component
import { cn } from '@/utils/cn'; 

// --- Helper Data for Selects ---
const genderOptions = [
    { value: '', label: 'Select Gender' },
    { value: 'Male', label: 'Male' },
    { value: 'Female', label: 'Female' },
    { value: 'Non-binary', label: 'Non-binary' },
    { value: 'Prefer not to say', label: 'Prefer not to say' },
];

const countryOptions = [
    { value: '', label: 'Select Country' },
    { value: 'US', label: 'United States' },
    { value: 'CA', label: 'Canada' },
    { value: 'IN', label: 'India' },
];
// ---------------------------------


const ClientProfileEditor = () => {
  const [isSaving, setIsSaving] = useState(false);
  const [profileData, setProfileData] = useState({});
  const [initialData, setInitialData] = useState({});
  const [unsavedChanges, setUnsavedChanges] = useState(false);

  // 🌟 NEW STATE: To hold the actual file object before upload
  const [imageFile, setImageFile] = useState(null); 
  
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

  // --- Data Fetching Logic (UNCHANGED) ---
  useEffect(() => {
    const fetchProfileData = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        console.error("Authentication Error: No token found. Please log in.");
        return;
      }

      try {
        const response = await fetch('http://localhost:4028/api/auth/me', {
          headers: { 'Authorization': `Bearer ${token}`, },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user data from the server.');
        }

        const data = await response.json();
        
        const userData = {
            ...data.user,
            ...data.user.ClientProfile 
        };

        setProfileData(userData); 
        setInitialData(userData);
        setPreviewUrl(userData.profilePicture);

      } catch (error) {
        console.error("Error fetching profile data:", error);
      }
    };

    fetchProfileData();
  }, []); 

  
  // Detects if any changes have been made to the form (UNCHANGED)
  useEffect(() => {
    const hasUnsavedChanges = JSON.stringify(profileData) !== JSON.stringify(initialData) || imageFile !== null;
    setUnsavedChanges(hasUnsavedChanges);
  }, [profileData, initialData, imageFile]);

  // Updates the state in real-time as you type in a form field (UNCHANGED)
  const updateData = useCallback((newData) => {
    setProfileData(prev => ({ ...prev, ...newData }));
  }, []);

  // 🌟 UPDATED: Handles file preview and saves the file object
  const handleFileUpload = (file) => {
    if (file && file?.type?.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target.result); // Show preview using Base64
      };
      reader.readAsDataURL(file);

      // Save the actual File object and clear temporary Base64
      setImageFile(file); 
      setUnsavedChanges(true); 
    }
  };

  // 🌟 UPDATED: Two-step Save function
  const handleSave = async () => {
    setIsSaving(true);
    const token = localStorage.getItem('accessToken');
    let finalProfileData = { ...profileData };

    if (!token) {
      alert("You are not logged in. Please log in to save your profile.");
      setIsSaving(false);
      return;
    }

    // --- STEP 1: Upload File if a new one is pending ---
    if (imageFile) {
        const formData = new FormData();
        formData.append('profilePicture', imageFile);
        
        try {
            // Use the dedicated upload endpoint
            const uploadResponse = await fetch('http://localhost:4028/api/client/profile/upload-picture', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    // IMPORTANT: Do NOT set Content-Type: application/json; FormData sets it correctly.
                },
                body: formData,
            });

            const uploadData = await uploadResponse.json();
            if (!uploadResponse.ok) {
                throw new Error(uploadData.error || 'File upload failed.');
            }
            
            // Update the profile data with the permanent URL from the backend
            finalProfileData.profilePicture = uploadData.profilePicture;

        } catch (uploadError) {
            console.error('Profile picture upload failed:', uploadError);
            alert(`Error uploading picture: ${uploadError.message}`);
            setIsSaving(false);
            return;
        }
    } else if (profileData.profilePicture === null) {
        // If the user removed the picture but didn't upload a new one, 
        // explicitly set the value to null to save to the database.
        finalProfileData.profilePicture = null;
    }

    // --- STEP 2: Save the Profile Data (with the new file path) ---
    try {
      const response = await fetch('http://localhost:4028/api/client/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(finalProfileData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'An unknown error occurred during saving.');
      }

      alert('Profile saved successfully!');
      
      // Update state with fresh server data and clear temporary file state
      setProfileData(data.user);
      setInitialData(data.user);
      setImageFile(null); // Clear the file object after successful save

    } catch (error) {
      console.error('Failed to save profile:', error);
      alert(`Error saving profile: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };
  
  // Helper functions for drag-and-drop 
  const handleDrop = (e) => { e.preventDefault(); setDragActive(false); e.dataTransfer.files[0] && handleFileUpload(e.dataTransfer.files[0]); };
  const handleDragOver = (e) => { e.preventDefault(); setDragActive(true); };
  const handleDragLeave = (e) => { e.preventDefault(); setDragActive(false); };
  // 🌟 UPDATED: Removes preview and the file object
  const removeProfilePicture = () => { 
    setPreviewUrl(null); 
    setImageFile(null); 
    updateData({ profilePicture: null }); 
    setUnsavedChanges(true); 
  };


  return (
    <div className="max-w-4xl mx-auto py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Edit Your Profile</h1>
        <p className="text-gray-600 mt-2">
          Keep your profile updated to get the best matches with coaches.
        </p>
      </div>

      <main className="space-y-8 bg-white shadow-lg rounded-xl p-8">
        
        {/* Profile Picture Upload Section (UPDATED to use imageFile) */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Profile Picture</h3>
          <div className="flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                {previewUrl ? <img src={previewUrl} alt="Profile preview" className="w-full h-full object-cover" /> : <Camera className="w-8 h-8 text-gray-400" />}
              </div>
              {previewUrl && <button onClick={removeProfilePicture} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"><X className="w-4 h-4" /></button>}
            </div>
            <div className="flex-1">
              <div onDrop={handleDrop} onDragOver={handleDragOver} onDragLeave={handleDragLeave} className={cn("border-2 border-dashed rounded-lg p-6 text-center", dragActive ? "border-blue-400 bg-blue-50" : "border-gray-300")}>
                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-sm text-gray-600"><span className="font-medium">Click to upload</span> or drag and drop</p>
                <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                <Button variant="outline" size="sm" onClick={() => fileInputRef.current && fileInputRef.current.click()} className="mt-4">Choose File</Button>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={(e) => e.target.files && handleFileUpload(e.target.files[0])} className="hidden" />
              </div>
            </div>
          </div>
        </div>

        {/* Personal Information Form (UNCHANGED) */}
        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Personal Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input label="First Name" required value={profileData.firstName || ''} onChange={(e) => updateData({ firstName: e.target.value })} />
              <Input label="Last Name" required value={profileData.lastName || ''} onChange={(e) => updateData({ lastName: e.target.value })} />
            </div>
        </div>

        {/* Contact Information (UNCHANGED) */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
          <Input label="Email Address" type="email" required value={profileData.email || ''} onChange={(e) => updateData({ email: e.target.value })} disabled={true} description="Email cannot be changed." />
          <Input
            label="Phone Number (Optional)"
            type="tel"
            value={profileData.phone || ''}
            onChange={(e) => updateData({ phone: e.target.value })}
            placeholder="+1 (555) 123-4567"
          />
        </div>
        
        {/* DEMOGRAPHIC FIELDS SECTION (UNCHANGED) */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Demographics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input 
                    label="Date of Birth (Optional)" 
                    type="date"
                    value={profileData.dateOfBirth ? profileData.dateOfBirth.split('T')[0] : ''} 
                    onChange={(e) => updateData({ dateOfBirth: e.target.value })} 
                />
                
                <Select 
                    label="Gender (Optional)"
                    value={profileData.gender || ''}
                    onChange={(e) => updateData({ gender: e.target.value })}
                    options={genderOptions}
                />
                
                <Select 
                    label="Country (Optional)"
                    value={profileData.country || ''}
                    onChange={(e) => updateData({ country: e.target.value })}
                    options={countryOptions}
                />
                
                <Input 
                    label="Ethnicity (Optional)" 
                    type="text"
                    value={profileData.ethnicity || ''} 
                    onChange={(e) => updateData({ ethnicity: e.target.value })} 
                />
            </div>
        </div>
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

export default ClientProfileEditor;