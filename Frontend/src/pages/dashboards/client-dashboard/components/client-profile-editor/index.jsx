import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Save, AlertTriangle, Upload, X, Camera } from 'lucide-react';
import Button from '../../../../../components/ui/Button';
import Input from '../../../../../components/ui/Input';
import { cn } from '../../../../../utils/cn';

const ClientProfileEditor = () => {
  const [isSaving, setIsSaving] = useState(false);
  const [profileData, setProfileData] = useState({});
  const [initialData, setInitialData] = useState({});
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

  // ==========================================================
  // --- THIS IS THE CORRECTED DATA FETCHING LOGIC ---
  // ==========================================================
  useEffect(() => {
    const fetchProfileData = async () => {
      // Get the token the user received when they logged in
      const token = localStorage.getItem('accessToken');
      if (!token) {
        console.error("Authentication Error: No token found. Please log in.");
        // You could redirect to login page here if you want
        return;
      }

      try {
        // Fetch data from your backend's /me endpoint
        const response = await fetch('http://localhost:4028/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user data from the server.');
        }

        const data = await response.json();
        
        // Populate the form with the REAL data from the database
        setProfileData(data.user); 
        setInitialData(data.user);
        setPreviewUrl(data.user.profilePicture);

      } catch (error) {
        console.error("Error fetching profile data:", error);
        // Handle error (e.g., show a message to the user)
      }
    };

    fetchProfileData();
  }, []); // The empty array [] ensures this runs only once when the page loads

  
  // Detects if any changes have been made to the form
  useEffect(() => {
    // We check against initialData to see if the user has typed anything new
    const hasUnsavedChanges = JSON.stringify(profileData) !== JSON.stringify(initialData);
    setUnsavedChanges(hasUnsavedChanges);
  }, [profileData, initialData]);

  // Updates the state in real-time as you type in a form field
  const updateData = useCallback((newData) => {
    setProfileData(prev => ({ ...prev, ...newData }));
  }, []);

  const handleFileUpload = (file) => {
    if (file && file?.type?.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target.result);
        updateData({ profilePicture: e.target.result });
      };
      reader.readAsDataURL(file);
    }
  };

  // Saves the updated data to the backend
  const handleSave = async () => {
    setIsSaving(true);
    const token = localStorage.getItem('accessToken');

    if (!token) {
      alert("You are not logged in. Please log in to save your profile.");
      setIsSaving(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:4028/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'An unknown error occurred.');
      }

      alert('Profile saved successfully!');
      
      // IMPORTANT: Update the state with the fresh data from the server
      // This ensures the page is in sync after saving
      setProfileData(data.user);
      setInitialData(data.user);

    } catch (error) {
      console.error('Failed to save profile:', error);
      alert(`Error saving profile: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };
  
  // Helper functions for drag-and-drop
  const handleDrop = (e) => { e.preventDefault(); setDragActive(false); handleFileUpload(e.dataTransfer.files[0]); };
  const handleDragOver = (e) => { e.preventDefault(); setDragActive(true); };
  const handleDragLeave = (e) => { e.preventDefault(); setDragActive(false); };
  const removeProfilePicture = () => { setPreviewUrl(null); updateData({ profilePicture: null }); };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Edit Your Profile</h1>
        <p className="text-gray-600 mt-2">
          Keep your profile updated to get the best matches with coaches.
        </p>
      </div>

      <main className="space-y-6">
        {/* Profile Picture Upload Section */}
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

        {/* Personal Information Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input label="First Name" required value={profileData.firstName || ''} onChange={(e) => updateData({ firstName: e.target.value })} />
          <Input label="Last Name" required value={profileData.lastName || ''} onChange={(e) => updateData({ lastName: e.target.value })} />
        </div>

        {/* Contact Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
          <Input label="Email Address" type="email" required value={profileData.email || ''} onChange={(e) => updateData({ email: e.target.value })} />
          <Input
            label="Phone Number (Optional)"
            type="tel"
            value={profileData.phone || ''}
            onChange={(e) => updateData({ phone: e.target.value })}
            placeholder="+1 (555) 123-4567"
          />
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