import React, { useRef, useState, useEffect } from 'react'; // ADDED useEffect
import { Upload, X, Camera } from 'lucide-react';
import { toast } from 'react-toastify'; // ADDED toast
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { cn } from '@/utils/cn';
import { useAuth } from '@/auth/AuthContext'; // ADDED useAuth
import { uploadProfilePicture } from '@/auth/authApi'; // ADDED API call

// Load backend URL from .env (fallback to localhost)
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:4028";


const PersonalInfoSection = ({ data, errors, updateData, setUnsavedChanges }) => {
  const fileInputRef = useRef(null);
  const { user, setUser } = useAuth(); // Get user state setter
  const [dragActive, setDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false); // New state for loading
  
  // Use the user state as the stable source for the profile picture
  const [previewUrl, setPreviewUrl] = useState(data?.profilePicture || user?.profilePicture || null);

  // Sync previewUrl if the data or user state changes externally (e.g., first load)
  useEffect(() => {
      setPreviewUrl(data?.profilePicture || user?.profilePicture || null);
  }, [user?.profilePicture, data?.profilePicture]);

  const handleInputChange = (field, value) => {
    updateData({ [field]: value });
    setUnsavedChanges(true);
  };
  
  // Helper to construct the full image source URL
  const getFullImageSrc = (pathOrBase64) => {
      // If it's a backend path (starts with /uploads/), prepend the API URL
      if (pathOrBase64?.startsWith('/uploads/')) {
          return `${API_BASE_URL}${pathOrBase64}`;
      }
      // Otherwise, it's a local Base64 preview or a full URL already
      return pathOrBase64;
  };


  const handleFileUpload = async (file) => { // MADE ASYNC
    if (!file || !file?.type?.startsWith('image/')) {
      toast.error("Please select a valid image file.");
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) { // 5MB limit check (matches backend multer limit)
        toast.error("File size exceeds 5MB limit.");
        return;
    }

    // 1. Show immediate local preview (temporary UX)
    const reader = new FileReader();
    reader.onload = (e) => {
        setPreviewUrl(e.target.result); 
    };
    reader.readAsDataURL(file);

    setIsUploading(true);
    
    try {
        // 2. Upload the file to the dedicated backend endpoint
        const response = await uploadProfilePicture(file);
        const newPath = response.data.profilePicture; // e.g., /uploads/image-123.jpg

        // 3. Update the global AuthContext state (crucial for header update)
        setUser(prevUser => ({ 
            ...prevUser, 
            profilePicture: newPath 
        }));
        
        // 4. Update the local form data state
        updateData({ profilePicture: newPath }); 
        
        // 5. Set final public path for stable display
        setPreviewUrl(newPath); 
        setUnsavedChanges(true);
        toast.success("Profile picture uploaded successfully!");
        
    } catch (error) {
        console.error("Image upload failed:", error);
        toast.error(error.message || "Image upload failed. Please try again.");
        // Revert the preview on failure to the last saved image
        setPreviewUrl(data?.profilePicture || user?.profilePicture || null);
    } finally {
        setIsUploading(false);
    }
  };


  const handleDrop = (e) => {
    e?.preventDefault();
    setDragActive(false);
    
    const file = e?.dataTransfer?.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDragOver = (e) => {
    e?.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e?.preventDefault();
    setDragActive(false);
  };

  const removeProfilePicture = () => {
    setPreviewUrl(null);
    updateData({ profilePicture: null });
    setUser(prevUser => ({ ...prevUser, profilePicture: null })); // Clear from global context
    setUnsavedChanges(true);
    // NOTE: A dedicated backend API call for deletion would be needed for a full cleanup.
  };

  return (
    <div className="space-y-6">
      {/* Profile Picture Upload */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Profile Picture</h3>
        
        <div className="flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-6">
          {/* Avatar Preview */}
          <div className="relative">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
              {isUploading ? (
                  // Simple loading indicator
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              ) : previewUrl ? (
                <img 
                  src={getFullImageSrc(previewUrl)} // USING HELPER HERE
                  alt="Profile preview" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <Camera className="w-8 h-8 text-gray-400" />
              )}
            </div>
            
            {previewUrl && !isUploading && (
              <button
                onClick={removeProfilePicture}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Upload Area */}
          <div className="flex-1">
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={cn(
                "border-2 border-dashed rounded-lg p-6 text-center transition-colors",
                dragActive 
                  ? "border-blue-400 bg-blue-50" :"border-gray-300 hover:border-gray-400"
              )}
            >
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500">
                  PNG, JPG, GIF up to 5MB
                </p>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef?.current?.click()}
                className="mt-4"
                disabled={isUploading} // Disable while uploading
              >
                {isUploading ? 'Uploading...' : 'Choose File'}
              </Button>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleFileUpload(e?.target?.files?.[0])}
                className="hidden"
                disabled={isUploading}
              />
            </div>
          </div>
        </div>
      </div>
      {/* Personal Information Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="First Name"
          required
          value={data?.firstName || ''}
          onChange={(e) => handleInputChange('firstName', e?.target?.value)}
          error={errors?.firstName}
          placeholder="Enter your first name"
        />
        
        <Input
          label="Last Name"
          required
          value={data?.lastName || ''}
          onChange={(e) => handleInputChange('lastName', e?.target?.value)}
          error={errors?.lastName}
          placeholder="Enter your last name"
        />
      </div>
      <Input
        label="Professional Title"
        value={data?.professionalTitle || ''}
        onChange={(e) => handleInputChange('professionalTitle', e?.target?.value)}
        placeholder="e.g., Certified Life Coach, Business Mentor"
        description="This title will appear prominently on your profile"
      />
      {/* Preview Card */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h4 className="text-sm font-medium text-gray-900 mb-4">Profile Preview</h4>
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
            {isUploading ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
            ) : previewUrl ? (
              <img 
                src={getFullImageSrc(previewUrl)} // USING HELPER HERE
                alt="Profile preview" 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Camera className="w-6 h-6 text-gray-400" />
              </div>
            )}
          </div>
          <div>
            <h5 className="font-semibold text-gray-900">
              {data?.firstName || data?.lastName 
                ? `${data?.firstName || ''} ${data?.lastName || ''}`?.trim() || 'Your Name'
                : 'Your Name'
              }
            </h5>
            <p className="text-gray-600">
              {data?.professionalTitle || 'Your Professional Title'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalInfoSection;