import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { toast } from 'sonner';
import { useAuth } from '@/auth/AuthContext';
import { updateUserProfile } from '@/auth/authApi';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { Calendar, BookOpen, User, MessageSquare, TrendingUp, Settings, Compass } from 'lucide-react';

import DashboardLayout from '../shared/DashboardLayout';
import ClientOverview from './components/ClientOverview';
import BookNewSession from './components/BookNewSession';
import MyResources from './components/MyResources';
import ProgressTracker from './components/ProgressTracker';
import CoachCommunication from './components/CoachCommunication';
import AccountSettings from '../shared/AccountSettings';
import DemographicsFormSection from '../shared/DemographicsFormSection';
import ExploreCoaches from './components/ExploreCoaches';
import ClientProfileEditor from './components/ClientProfileEditor'; // <-- IMPORTING THE NEW EDITOR

// This is the main component for the page
const ClientDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [breadcrumb, setBreadcrumb] = useState(null); // <-- Add this line

  const navigationItems = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'explore-coaches', label: 'Explore Coaches', icon: Compass },
    { id: 'sessions', label: 'Book Sessions', icon: Calendar },
    { id: 'resources', label: 'My Resources', icon: BookOpen },
    { id: 'progress', label: 'My Progress', icon: TrendingUp },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'settings', label: 'Account Settings', icon: Settings },
  ];
  
  // Add this handler function
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setBreadcrumb(null); // Reset breadcrumb when changing main tabs
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return <ClientOverview />;
      case 'explore-coaches': return <ExploreCoaches setBreadcrumb={setBreadcrumb} />; // Pass down the setter
      case 'sessions': return <BookNewSession />;
      case 'resources': return <MyResources />;
      case 'progress': return <ProgressTracker />;
      case 'messages': return <CoachCommunication />;
      case 'profile': return <ClientProfileEditor />; // <-- USING THE NEW EDITOR
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
        onTabChange={handleTabChange} // Use the new handler
        title="Client Dashboard"
        subtitle="Manage your coaching journey"
        breadcrumb={breadcrumb} // Pass the breadcrumb state
      >
        {renderContent()}
      </DashboardLayout>
    </>
  );
};

export default ClientDashboard;