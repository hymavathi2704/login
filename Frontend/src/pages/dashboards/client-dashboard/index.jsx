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
    { id: 'settings', label: 'Account Settings', icon: Settings },
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

// ---UNCHANGED---
const ClientOverview = ({ onTabChange }) => {
    // ... your existing overview component code
};

// ---UPDATED ClientProfile Component---
const ClientProfile = () => {
  // MODIFIED: Using refreshUserData from context
  const { user, refreshUserData } = useAuth(); 
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    coachingGoals: '',
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
      // MODIFIED: API payload now matches the backend structure
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        clientData: {
          coachingGoals: formData.coachingGoals,
        }
      };
      await authApi.updateProfile(payload);
      
      // MODIFIED: Correctly refresh user data across the app
      await refreshUserData(); 
      alert('Profile saved successfully!');

    } catch (err) {
      console.error('Failed to update profile:', err);
      alert('Failed to save profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // ... your existing ClientProfile JSX remains unchanged
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Form content here */}
    </div>
  );
};

export default ClientDashboard;