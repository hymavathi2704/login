import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom'; // NEW: Import useNavigate
import DashboardLayout from '../shared/DashboardLayout';
// MODIFIED: Add the Settings icon
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
  const navigate = useNavigate(); // NEW: Initialize useNavigate

  const navigationItems = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'sessions', label: 'Book Sessions', icon: Calendar },
    { id: 'resources', label: 'My Resources', icon: BookOpen },
    { id: 'progress', label: 'Progress', icon: TrendingUp },
    { id: 'communication', label: 'Messages', icon: MessageSquare },
    { id: 'profile', label: 'My Profile', icon: User },
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
        <title>Client Dashboard - The Katha</title>
        <meta name="description" content="Manage your coaching sessions, track progress, and access resources." />
      </Helmet>

      <DashboardLayout
        userType="client"
        navigationItems={navigationItems}
        activeTab={activeTab}
        onTabChange={handleTabChange} // MODIFIED: Use the new handler
        title="Client Dashboard"
        subtitle="Manage your coaching journey"
      >
        {renderContent()}
      </DashboardLayout>
    </>
  );
};

// ... (All your other components like ClientOverview and ClientProfile are unchanged)

export default ClientDashboard;