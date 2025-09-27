// Frontend/src/pages/dashboards/coach-dashboard/components/CoachProfile.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/auth/AuthContext';
import { updateUserProfile } from '@/auth/authApi';
import Input from "@/components/ui/Input";
import Button from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import DemographicsFormSection from '../../shared/DemographicsFormSection'; // 1. IMPORT
import TargetAudienceSelection from './TargetAudienceSelection'; // 2. IMPORT
import { toast } from 'sonner'; 
const CoachProfile = () => {
  const { user, setUser } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    title: '',
    bio: '',
    website: '',
    // --- 3. ADD DEMOGRAPHIC AND TARGET AUDIENCE STATE ---
    dateOfBirth: '',
    gender: '',
    ethnicity: '',
    country: '',
  });
  const [targetAudience, setTargetAudience] = useState([]);
  // ----------------------------------------------------
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        title: user.coach_profile?.title || '',
        bio: user.coach_profile?.bio || '',
        website: user.coach_profile?.website || '',
        // --- 4. PRE-FILL NEW DATA ---
        dateOfBirth: user.coach_profile?.dateOfBirth || '',
        gender: user.coach_profile?.gender || '',
        ethnicity: user.coach_profile?.ethnicity || '',
        country: user.coach_profile?.country || '',
      });
      // Ensure targetAudience is always an array
      setTargetAudience(user.coach_profile?.targetAudience || []);
      // -----------------------------
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
  setIsLoading(true);
  try {
    const payload = {
      ...formData,
      targetAudience: targetAudience,
    };
    const response = await updateUserProfile(payload);
    setUser(response.data.user);
    toast.success('Profile updated successfully!'); // REPLACED ALERT
  } catch (error) {
    console.error('Failed to update profile:', error);
    const errorMessage = error.response?.data?.error || 'Failed to save profile. Please try again.';
    toast.error(errorMessage); // REPLACED ALERT
  } finally {
    setIsLoading(false);
  }
};

  if (!user) {
    return <div>Loading coach profile...</div>;
  }

  return (
    <div className="bg-white p-8 rounded-lg shadow-md max-w-4xl mx-auto my-10">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Your Professional Profile</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input label="First Name" name="firstName" value={formData.firstName} onChange={handleChange} />
        <Input label="Last Name" name="lastName" value={formData.lastName} onChange={handleChange} />
        <Input label="Email Address" name="email" type="email" value={formData.email} onChange={handleChange} disabled />
        <Input label="Phone Number" name="phone" value={formData.phone} onChange={handleChange} />
        <Input label="Professional Title" name="title" placeholder="e.g., Certified Life Coach" value={formData.title} onChange={handleChange} />
        <Input label="Website" name="website" placeholder="https://yourwebsite.com" value={formData.website} onChange={handleChange} />
      </div>
      <div className="mt-6">
        <Textarea
          label="Biography"
          name="bio"
          rows="5"
          placeholder="Tell clients about your background and coaching philosophy."
          value={formData.bio}
          onChange={handleChange}
        />
      </div>

      {/* --- 6. RENDER THE NEW COMPONENTS --- */}
      <TargetAudienceSelection selectedAudiences={targetAudience} setSelectedAudiences={setTargetAudience} />
      <DemographicsFormSection formData={formData} handleChange={handleChange} />
      {/* ------------------------------------ */}

      <div className="mt-8 flex justify-end">
        <Button onClick={handleSaveProfile} disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
};

export default CoachProfile;