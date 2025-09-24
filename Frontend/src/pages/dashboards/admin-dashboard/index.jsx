import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import DashboardLayout from '../shared/DashboardLayout';
import { 
  BarChart3, 
  Users, // Keep Users icon, but we won't use UserManagement component
  DollarSign, 
  Settings, 
  Shield, 
  Database,
  AlertTriangle,
  Activity
} from 'lucide-react';

// Import admin dashboard components
import AdminOverview from './components/AdminOverview';
// Removed: import UserManagement from './components/UserManagement';
import PlatformAnalytics from './components/PlatformAnalytics';
import RevenueManagement from './components/RevenueManagement';
import SystemSettings from './components/SystemSettings';
import SecurityCenter from './components/SecurityCenter';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const navigationItems = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    // Removed: { id: 'users', label: 'User Management', icon: Users },
    { id: 'analytics', label: 'Platform Analytics', icon: Activity },
    { id: 'revenue', label: 'Revenue', icon: DollarSign },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <AdminOverview />;
      // Removed: case 'users':
      // Removed:   return <UserManagement />;
      case 'analytics':
        return <PlatformAnalytics />;
      case 'revenue':
        return <RevenueManagement />;
      case 'security':
        return <SecurityCenter />;
      case 'settings':
        return <SystemSettings />;
      default:
        return <AdminOverview />;
    }
  };

  return (
    <>
      <Helmet>
        <title>Admin Dashboard - The Katha</title>
        <meta name="description" content="Manage the coaching platform, users, and system settings." />
      </Helmet>

      <DashboardLayout
        userType="admin"
        navigationItems={navigationItems}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        title="Platform Administration"
        subtitle="Manage users, analytics, and system settings"
      >
        {renderContent()}
      </DashboardLayout>
    </>
  );
};

export default AdminDashboard;