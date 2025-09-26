import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import DashboardLayout from '../shared/DashboardLayout';
import { 
  Users, 
  Calendar, 
  BookOpen, 
  MessageSquare, 
  TrendingUp, 
  Settings,
  User as UserIcon // Renamed to avoid conflict
} from 'lucide-react';

// Import coach dashboard components
import CoachOverview from './components/CoachOverview';
import ClientManagement from './components/ClientManagement';
import EventManagement from './components/EventManagement';
import BookingManagement from './components/BookingManagement';
import CommunicationCenter from './components/CommunicationCenter';
import ResourcesLibrary from './components/ResourcesLibrary';
import CoachAnalytics from './components/CoachAnalytics';
import CoachProfile from './components/CoachProfile';

const CoachDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const navigate = useNavigate(); // Initialize navigate

  const navigationItems = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'clients', label: 'Clients', icon: Users },
    { id: 'events', label: 'Events', icon: Calendar },
    { id: 'bookings', label: 'Bookings', icon: BookOpen },
    { id: 'communication', label: 'Communication', icon: MessageSquare },
    { id: 'resources', label: 'Resources', icon: BookOpen },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'profile', label: 'My Profile', icon: UserIcon },
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
        return <CoachOverview />;
      case 'clients':
        return <ClientManagement />;
      case 'events':
        return <EventManagement />;
      case 'bookings':
        return <BookingManagement />;
      case 'communication':
        return <CommunicationCenter />;
      case 'resources':
        return <ResourcesLibrary />;
      case 'analytics':
        return <CoachAnalytics />;
      case 'profile':
        return <CoachProfile />;
      default:
        return <CoachOverview />;
    }
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
        onTabChange={handleTabChange} // Use the updated handler
        title="Coach Dashboard"
        subtitle="Manage your coaching business"
      >
        {renderContent()}
      </DashboardLayout>
    </>
  );
};

export default CoachDashboard;