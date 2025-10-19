// Frontend/src/pages/dashboards/shared/AccountSettings.jsx

import React, { useState } from 'react';
import { Shield, Trash2 } from 'lucide-react'; 
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

// CRITICAL IMPORTS
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/auth/AuthContext';


const AccountSettings = () => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false); // <-- NEW state for delete button
  const navigate = useNavigate();
  const { logout } = useAuth(); 

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };
  
  // Existing handleChangePassword function (omitted for brevity, assume it is here)
  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
        return toast.error("Please fill in all password fields.");
    }
    if (formData.newPassword !== formData.confirmPassword) {
        return toast.error("New passwords do not match.");
    }
    if (formData.newPassword.length < 8) {
        return toast.error("New password must be at least 8 characters long.");
    }
    if (formData.currentPassword === formData.newPassword) {
         return toast.error("New password cannot be the same as the current password.");
    }
    
    setIsLoading(true);

    try {
        const apiUrl = `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:4028'}/api/auth/change-password`; 
        // 🔑 FIX: Get token from localStorage
        const token = localStorage.getItem('accessToken'); 

        await axios.put(apiUrl, {
            currentPassword: formData.currentPassword,
            newPassword: formData.newPassword,
        }, {
            withCredentials: true,
            // 🔑 CRITICAL FIX: Manually add the Authorization header
            headers: {
                'Authorization': `Bearer ${token}` 
            }
        });

        toast.success("Password updated successfully. You will now be logged out.");
        
        setTimeout(() => {
            logout(); 
            navigate("/login"); 
        }, 1500);

    } catch (error) {
        const message = error.response?.data?.error || 'Failed to change password. Please check your current password.';
        toast.error(message);
    } finally {
        setIsLoading(false);
    }
  };


  // ===================================
  // ✅ NEW: handleDeleteAccount function
  // ===================================
  const handleDeleteAccount = async () => {
    const confirmDelete = window.confirm(
      "WARNING: Are you sure you want to permanently delete your account? This action is irreversible and all your data will be lost."
    );

    if (!confirmDelete) return;

    setIsDeleting(true);

    try {
      const apiUrl = `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:4028'}/api/auth/me`;
      // 🔑 FIX: Get token from localStorage
      const token = localStorage.getItem('accessToken'); 

      // 1. Send DELETE request to the protected route
      await axios.delete(apiUrl, {
        withCredentials: true,
        // 🔑 CRITICAL FIX: Manually add the Authorization header for DELETE
        headers: {
            'Authorization': `Bearer ${token}` 
        }
      });

      // 2. Success, Logout, and Redirect
      toast.success("Account successfully deleted. Goodbye!", { duration: 2500 });
      
      // Clear client-side session immediately and redirect
      logout();
      navigate("/login"); 

    } catch (error) {
      const message = error.response?.data?.error || 'Failed to delete account. Please try again.';
      toast.error(message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-12">
      {/* Security Settings (Password Change Only) */}
      <section>
        <div className="flex items-center space-x-3 mb-6">
          <Shield className="w-6 h-6 text-gray-700" />
          <h2 className="text-2xl font-semibold text-gray-800">Account Security</h2>
        </div>
        
        {/* Password Change Form */}
        <form onSubmit={handleChangePassword}>
            <h3 className="text-xl font-medium text-gray-700 mb-4 border-b pb-2">Change Password</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* ... Input Fields ... */}
              <Input
                id="currentPassword"
                name="currentPassword"
                type="password"
                label="Current Password"
                value={formData.currentPassword}
                onChange={handleChange}
                required
              />
              <div /> 
              <Input
                id="newPassword"
                name="newPassword"
                type="password"
                label="New Password"
                value={formData.newPassword}
                onChange={handleChange}
                required
              />
              <Input
                id="confirmPassword"
                name="confirmPassword" 
                type="password"
                label="Confirm New Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="mt-8 flex justify-start">
                <Button 
                    type="submit" 
                    isLoading={isLoading} 
                    disabled={isLoading}
                >
                    {isLoading ? 'Updating...' : 'Update Password'}
                </Button>
            </div>
        </form>
        {/* Optional: Add a link to the public password reset flow for forgotten passwords */}
                <div className="mt-6 pt-4 border-t border-gray-100">
                    <p className="text-sm text-gray-500">
                        Forgot your current password? If you cannot remember your current password, you must use the public password reset link:
                        <a 
                            href="/password-reset" 
                            className="text-indigo-600 hover:text-indigo-800 font-medium ml-2"
                        >
                            Reset Password
                        </a>
                    </p>
                </div>
        
      </section>

      {/* Account Deletion */}
      <section>
        <div className="flex items-center space-x-3 mb-6">
          <Trash2 className="w-6 h-6 text-red-600" />
          <h2 className="text-2xl font-semibold text-gray-800">Account Management</h2>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Permanently delete your account and all associated data. This action is irreversible.
        </p>
        <Button 
            variant="destructive" 
            onClick={handleDeleteAccount}
            isLoading={isDeleting}
            disabled={isDeleting}
        >
          {isDeleting ? 'Deleting...' : 'Delete My Account'}
        </Button>
      </section>
    </div>
  );
};

export default AccountSettings;
