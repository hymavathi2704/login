import React, { useState } from "react";
import { Lock } from "lucide-react";
import Input from "../../../components/ui/Input";
import Button from "../../../components/ui/Button";
import { useAuth } from "../../../auth/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify"; // <-- MODIFIED

const AccountSettings = () => {
    const [formData, setFormData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
    });
    const [isLoading, setIsLoading] = useState(false);
    const { logout } = useAuth(); // Assuming useAuth provides a logout function
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (formData.newPassword !== formData.confirmNewPassword) {
            return toast.error("New passwords do not match.");
        }

        if (formData.newPassword.length < 6) { // Example length check
            return toast.error("New password must be at least 6 characters long.");
        }

        setIsLoading(true);

        try {
            // Adjust the API_BASE_URL as needed from your .env
            const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/api/auth/change-password`; 

            await axios.put(apiUrl, {
                currentPassword: formData.currentPassword,
                newPassword: formData.newPassword,
            }, {
                // Assuming your authentication context handles adding the Authorization header
                withCredentials: true // Important for sending cookies/tokens
            });

            toast.success("Password updated successfully. You will now be redirected to log in.");
            
            // Redirect to login after successful change
            setTimeout(() => {
                logout(); // Clear local session state (context/storage)
                navigate("/login"); // Redirect to the login page
            }, 1000);

        } catch (error) {
            const message = error.response?.data?.message || 'Failed to change password.';
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-8 max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Lock className="w-6 h-6 mr-3 text-indigo-600" />
                Account Security Settings
            </h1>

            <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-gray-100">
                <h2 className="text-xl font-semibold text-gray-800 mb-6 border-b pb-3">
                    Change Your Password
                </h2>
                <p className="text-sm text-gray-500 mb-6">
                    To change your password, please enter your current password and your new password. You will be logged out and required to sign in again after the change is complete.
                </p>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Current Password"
                        name="currentPassword"
                        type="password"
                        value={formData.currentPassword}
                        onChange={handleChange}
                        required
                    />
                    <Input
                        label="New Password"
                        name="newPassword"
                        type="password"
                        value={formData.newPassword}
                        onChange={handleChange}
                        required
                        placeholder="At least 6 characters"
                    />
                    <Input
                        label="Confirm New Password"
                        name="confirmNewPassword"
                        type="password"
                        value={formData.confirmNewPassword}
                        onChange={handleChange}
                        required
                    />
                    <div className="pt-4">
                        <Button
                            type="submit"
                            isLoading={isLoading}
                            disabled={isLoading}
                            className="w-full sm:w-auto"
                        >
                            Update Password and Log Out
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
            </div>

            {/* You can add other settings here, e.g., email notifications, account deletion */}
        </div>
    );
};

export default AccountSettings;