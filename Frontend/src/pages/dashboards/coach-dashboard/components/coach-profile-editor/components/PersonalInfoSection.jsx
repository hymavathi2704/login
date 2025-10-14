// Frontend/src/pages/dashboards/coach-dashboard/components/coach-profile-editor/components/PersonalInfoSection.jsx
import React, { useRef, useState, useEffect } from 'react';
import { Upload, X, Camera } from 'lucide-react';
// ⚠️ FIX: If you use toast, make sure the import is correct based on your setup (e.g., 'sonner' or 'react-toastify')
import { toast } from 'react-toastify'; 
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { cn } from '@/utils/cn';
import { useAuth } from '@/auth/AuthContext';
// import { uploadProfilePicture } from '@/auth/authApi'; // ⚠️ Correctly REMOVED from the previous steps

// Load backend URL from .env (fallback to localhost)
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:4028";

const PersonalInfoSection = ({ data, errors, updateData, setUnsavedChanges }) => {
    const fileInputRef = useRef(null);
    const { user, setUser } = useAuth();
    const [dragActive, setDragActive] = useState(false);
    // Using isProcessing to indicate file selection/preview time
    const [isProcessing, setIsProcessing] = useState(false); 
    
    // State to hold the Base64 string or the final URL path for display
    const [previewUrl, setPreviewUrl] = useState(data?.profilePicture || user?.profilePicture || null);

    // State to track the local file object
    const [selectedFile, setSelectedFile] = useState(null); 

    useEffect(() => {
        // If no file is locally selected, update the preview from the data/user context
        if (!selectedFile) {
            setPreviewUrl(data?.profilePicture || user?.profilePicture || null);
        }
        // The dependency array now correctly tracks changes that could affect the preview
    }, [user?.profilePicture, data?.profilePicture, selectedFile]);

    const handleInputChange = (field, value) => {
        updateData({ [field]: value });
        setUnsavedChanges(true);
    };
    
    const getFullImageSrc = (pathOrBase64) => {
        if (typeof pathOrBase64 === 'string' && pathOrBase64.startsWith('/uploads/')) {
            return `${API_BASE_URL}${pathOrBase64}`; 
        }
        return pathOrBase64;
    };

    // ⚠️ CRITICAL FIX: Staging the file object
    const handleFileUpload = (file) => {
        if (!file || !file?.type?.startsWith('image/')) {
            toast.error("Please select a valid image file.");
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            toast.error("File size exceeds 5MB limit.");
            return;
        }

        setIsProcessing(true);
        setSelectedFile(file); // Store the file object locally

        const reader = new FileReader();
        reader.onload = (e) => {
            setPreviewUrl(e.target.result); // Set Base64 for immediate preview
            
            // ✅ ACTION 1: Pass the file object to the parent data
            updateData({ profilePictureFile: file }); 
            
            // ✅ ACTION 2: Trigger the parent component to activate the Save button
            setUnsavedChanges(true); 
            setIsProcessing(false);
        };
        reader.readAsDataURL(file);
    };

    const handleDrop = (e) => {
        e?.preventDefault();
        setDragActive(false);
        const file = e?.dataTransfer?.files?.[0];
        if (file) handleFileUpload(file);
    };

    const handleDragOver = (e) => { e?.preventDefault(); setDragActive(true); };
    const handleDragLeave = (e) => { e?.preventDefault(); setDragActive(false); };

    const removeProfilePicture = () => {
        setPreviewUrl(null);
        setSelectedFile(null); // Clear the staged file
        
        // ✅ ACTION: Send two flags: clear existing path (profilePicture: null) and clear staged file (profilePictureFile: null)
        updateData({ profilePicture: null, profilePictureFile: null }); 
        
        setUser(prevUser => ({ ...prevUser, profilePicture: null }));
        setUnsavedChanges(true);
        toast.info("Profile picture removed. Click 'Save Changes' to confirm.");
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
                            {isProcessing ? (
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                            ) : previewUrl ? (
                                <img 
                                    src={getFullImageSrc(previewUrl)} 
                                    alt="Profile preview" 
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <Camera className="w-8 h-8 text-gray-400" />
                            )}
                        </div>
                        {previewUrl && !isProcessing && (
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
                                dragActive ? "border-blue-400 bg-blue-50" :"border-gray-300 hover:border-gray-400"
                            )}
                        >
                            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                            <div className="space-y-2">
                                <p className="text-sm text-gray-600">
                                    <span className="font-medium">Click to upload</span> or drag and drop
                                </p>
                                <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => fileInputRef?.current?.click()}
                                className="mt-4"
                                disabled={isProcessing}
                            >
                                {isProcessing ? 'Processing...' : 'Choose File'}
                            </Button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleFileUpload(e?.target?.files?.[0])}
                                className="hidden"
                                disabled={isProcessing}
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

            {/* Profile Preview Card */}
            <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="text-sm font-medium text-gray-900 mb-4">Profile Preview</h4>
                <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 flex-shrink-0 flex items-center justify-center">
                        {isProcessing ? (
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                        ) : previewUrl ? (
                            <img 
                                src={getFullImageSrc(previewUrl)} 
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