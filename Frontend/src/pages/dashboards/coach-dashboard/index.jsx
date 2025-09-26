import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom'; // NEW: Import useNavigate
import DashboardLayout from '../shared/DashboardLayout';
import { 
  Users, 
  Calendar, 
  BookOpen, 
  MessageSquare, 
  TrendingUp, 
  Settings,
  User as UserIcon // NEW: Added alias for User icon
} from 'lucide-react';

// Import coach dashboard components
// ... (Your imports are unchanged)

const CoachDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const navigate = useNavigate(); // NEW: Initialize useNavigate

  const navigationItems = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'clients', label: 'Clients', icon: Users },
    { id: 'events', label: 'Events', icon: Calendar },
    { id: 'bookings', label: 'Bookings', icon: BookOpen }, // Corrected icon
    { id: 'communication', label: 'Communication', icon: MessageSquare },
    { id: 'resources', label: 'Resources', icon: BookOpen },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'profile', label: 'Profile', icon: UserIcon }, // MODIFIED: Use aliased icon
    // NEW: Added link to Account Settings page
    { id: 'settings', label: 'Account Settings', icon: Settings }
  ];

  // NEW: Update the handler to navigate to the settings page
  const handleTabChange = (tabId) => {
    if (tabId === 'settings') {
      navigate('/dashboard/settings');
    } else {
      setActiveTab(tabId);
    }
  };

  const renderContent = () => {
    // ... (This function is unchanged)
  };

  return (
    <>
      <Helmet>
        <title>Coach Dashboard - The Katha</title>
        <meta name="description" content="Manage your coaching business, clients, and sessions." />
      </Helmet>

      <DashboardLayout
        userType="coach"
        navigationItems={navigationItems}
        activeTab={activeTab}
        onTabChange={handleTabChange} // MODIFIED: Use the new handler
        title="Coach Dashboard"
        subtitle="Manage your coaching business"
      >
        {renderContent()}
      </DashboardLayout>
    </>
  );
};

export default CoachDashboard;