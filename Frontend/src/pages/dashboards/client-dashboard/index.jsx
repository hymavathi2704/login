import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import DashboardLayout from '../shared/DashboardLayout';
import { Calendar, BookOpen, User, MessageSquare, TrendingUp, Settings } from 'lucide-react';
import { useAuth } from '../../../auth/AuthContext';
import authApi from '../../../auth/authApi';
import AccountSettings from '../shared/AccountSettings';

// Import dashboard sections
import ClientOverview from './components/ClientOverview'; // Using the detailed overview
import BookNewSession from './components/BookNewSession';
import MyResources from './components/MyResources';
import ProgressTracker from './components/ProgressTracker';
import CoachCommunication from './components/CoachCommunication';

const ClientDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const navigationItems = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'sessions', label: 'Book Sessions', icon: Calendar },
    { id: 'resources', label: 'My Resources', icon: BookOpen },
    { id: 'progress', label: 'Progress', icon: TrendingUp },
    { id: 'communication', label: 'Messages', icon: MessageSquare },
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'settings', label: 'Account Settings', icon: Settings }
  ];

  // Client Profile Component defined locally as requested
  const ClientProfile = () => {
    const { user, setUser } = useAuth();
    const [formData, setFormData] = useState({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      coachingGoals: user?.ClientProfile?.coachingGoals || ''
    });
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
      if (user) {
        setFormData({
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          email: user.email || '',
          phone: user.phone || '',
          coachingGoals: user.ClientProfile?.coachingGoals || ''
        });
      }
    }, [user]);

    const handleInputChange = (e) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
      setIsLoading(true);
      try {
        const response = await authApi.updateProfile({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          coachingGoals: formData.coachingGoals
        });

        setUser(response.data.user);
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
              <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
              <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
              <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Time Zone</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>Pacific Time (PT)</option>
                    <option>Mountain Time (MT)</option>
                    <option>Central Time (CT)</option>
                    <option>Eastern Time (ET)</option>
                </select>
            </div>
          </div>
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Coaching Goals</label>
            <textarea rows="4" name="coachingGoals" value={formData.coachingGoals} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Describe your coaching goals..."></textarea>
          </div>
          <div className="mt-6 flex justify-end">
            <button onClick={handleSave} disabled={isLoading} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    );
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
      case 'settings':
        return <AccountSettings />;
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