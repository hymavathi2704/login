import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import DashboardLayout from '../shared/DashboardLayout';
// MODIFIED: Added Settings icon
import { Calendar, BookOpen, User, MessageSquare, TrendingUp, Settings } from 'lucide-react';
import { useAuth } from '../../../auth/AuthContext';
import authApi from '../../../auth/authApi';

// Import dashboard sections
import UpcomingSessions from './components/UpcomingSessions';
import BookNewSession from './components/BookNewSession';
import MyResources from './components/MyResources';
import ProgressTracker from './components/ProgressTracker';
import CoachCommunication from './components/CoachCommunication';

const ClientDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const navigate = useNavigate(); // Initialize navigate

  const navigationItems = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'sessions', label: 'Book Sessions', icon: Calendar },
    { id: 'resources', label: 'My Resources', icon: BookOpen },
    { id: 'progress', label: 'Progress', icon: TrendingUp },
    { id: 'communication', label: 'Messages', icon: MessageSquare },
    { id: 'profile', label: 'My Profile', icon: User },
    // --- NEW NAVIGATION ITEM ---
    { id: 'settings', label: 'Account Settings', icon: Settings }
  ];

  const handleTabChange = (tabId) => {
    // MODIFIED: Navigate to settings page if 'settings' is clicked
    if (tabId === 'settings') {
      navigate('/dashboard/settings');
    } else {
      setActiveTab(tabId);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <ClientOverview />;
      case 'sessions':
        return <BookNewSession />;
      case 'resources':
        return <MyResources />;
      case 'progress':
        return <ProgressTracker />;
      case 'communication':
        return <CoachCommunication />;
      case 'profile':
        return <ClientProfile />;
      default:
        return <ClientOverview />;
    }
  };

  return (
    <>
      <Helmet>
        <title>Client Dashboard - The Katha</title>
        <meta name="description" content="Manage your coaching sessions, track progress, and access resources." />
      </Helmet>

      <DashboardLayout
        userType="client"
        navigationItems={navigationItems}
        activeTab={activeTab}
        onTabChange={handleTabChange} // Use the updated handler
        title="Client Dashboard"
        subtitle="Manage your coaching journey"
      >
        {renderContent()}
      </DashboardLayout>
    </>
  );
};

// Client Overview Component (Unchanged)
const ClientOverview = () => {
  const { user } = useAuth();
  const fullName = user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : '';
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Welcome back, {user?.firstName || 'Client'}!</h2>
        <p className="text-blue-100">You have 2 upcoming sessions this week</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Quick Stats content... */}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Other components... */}
      </div>
    </div>
  );
};

// Client Profile Component (Corrected Save Logic)
const ClientProfile = () => {
  const { user, refreshUserData } = useAuth(); // Use refreshUserData
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    coachingGoals: user?.ClientProfile?.coachingGoals || '',
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
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSave = async () => {
    setIsLoading(true);
    try {
      // MODIFIED: Correctly structure the payload for the API
      const response = await authApi.updateProfile({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        clientData: { // Nest client-specific data
          coachingGoals: formData.coachingGoals
        }
      });
      
      await refreshUserData(); // Refresh user data from context
      alert('Profile saved successfully!');

    } catch (err) {
      console.error('Failed to update profile:', err);
      alert('Failed to save profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-2xl font-bold mb-6">My Profile</h2>
        {/* Form JSX remains unchanged... */}
        <div className="mt-6 flex justify-end">
          <button 
            onClick={handleSave} 
            disabled={isLoading}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;