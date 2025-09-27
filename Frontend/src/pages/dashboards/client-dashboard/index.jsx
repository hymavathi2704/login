import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { toast } from 'sonner';
import { useAuth } from '@/auth/AuthContext';
import { updateUserProfile } from '@/auth/authApi';
import Input from '@/components/ui/Input'; // ✅ Corrected Path
import Button from '@/components/ui/Button'; // ✅ Corrected Path
import { Calendar, BookOpen, User, MessageSquare, TrendingUp, Settings } from 'lucide-react';

import DashboardLayout from '../shared/DashboardLayout';
import ClientOverview from './components/ClientOverview';
import BookNewSession from './components/BookNewSession';
import MyResources from './components/MyResources';
import ProgressTracker from './components/ProgressTracker';
import CoachCommunication from './components/CoachCommunication';
import AccountSettings from '../shared/AccountSettings';
import DemographicsFormSection from '../shared/DemographicsFormSection';

// This is the component for the "My Profile" tab
const ClientProfileSection = () => {
  const { user, setUser } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', phone: '', coachingGoals: '',
    dateOfBirth: '', gender: '', ethnicity: '', country: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        coachingGoals: user.ClientProfile?.coachingGoals || '',
        dateOfBirth: user.ClientProfile?.dateOfBirth || '',
        gender: user.ClientProfile?.gender || '',
        ethnicity: user.ClientProfile?.ethnicity || '',
        country: user.ClientProfile?.country || '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    setIsLoading(true);
    try {
      const response = await updateUserProfile(formData);
      setUser(response.data.user);
      toast.success('Profile updated successfully!');
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to save profile.';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Your Profile</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input label="First Name" name="firstName" value={formData.firstName} onChange={handleChange} />
        <Input label="Last Name" name="lastName" value={formData.lastName} onChange={handleChange} />
        <Input label="Email Address" name="email" type="email" value={formData.email} onChange={handleChange} disabled />
        <Input label="Phone Number" name="phone" value={formData.phone} onChange={handleChange} />
      </div>
      <div className="mt-6">
        <label htmlFor="coachingGoals" className="block text-sm font-medium text-gray-700 mb-1">Coaching Goals</label>
        <textarea id="coachingGoals" name="coachingGoals" rows="4" className="w-full p-2 border border-gray-300 rounded-md" value={formData.coachingGoals} onChange={handleChange}></textarea>
      </div>
      <DemographicsFormSection formData={formData} handleChange={handleChange} />
      <div className="mt-8 flex justify-end">
        <Button onClick={handleSaveProfile} disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
};

// This is the main component for the page
const ClientDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const navigationItems = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'sessions', label: 'Book Sessions', icon: Calendar },
    { id: 'resources', label: 'My Resources', icon: BookOpen },
    { id: 'progress', label: 'My Progress', icon: TrendingUp },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'settings', label: 'Account Settings', icon: Settings },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return <ClientOverview />;
      case 'sessions': return <BookNewSession />;
      case 'resources': return <MyResources />;
      case 'progress': return <ProgressTracker />;
      case 'messages': return <CoachCommunication />;
      case 'profile': return <ClientProfileSection />;
      case 'settings': return <AccountSettings />;
      default: return <ClientOverview />;
    }
  };

  return (
    <>
      <Helmet>
        <title>Client Dashboard - The Katha</title>
        <meta name="description" content="Manage your coaching journey." />
      </Helmet>
      <DashboardLayout
        userType="client"
        navigationItems={navigationItems}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        title="Client Dashboard"
        subtitle="Manage your coaching journey"
      >
        {renderContent()}
      </DashboardLayout>
    </>
  );
};

export default ClientDashboard;