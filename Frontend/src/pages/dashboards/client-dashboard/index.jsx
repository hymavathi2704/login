import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import DashboardLayout from '../shared/DashboardLayout';
import { Calendar, BookOpen, User, MessageSquare, TrendingUp } from 'lucide-react';
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

  const navigationItems = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'sessions', label: 'Book Sessions', icon: Calendar },
    { id: 'resources', label: 'My Resources', icon: BookOpen },
    { id: 'progress', label: 'Progress', icon: TrendingUp },
    { id: 'communication', label: 'Messages', icon: MessageSquare },
    { id: 'profile', label: 'My Profile', icon: User }
  ];

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
        onTabChange={setActiveTab}
        title="Client Dashboard"
        subtitle="Manage your coaching journey"
      >
        {renderContent()}
      </DashboardLayout>
    </>
  );
};

// Client Overview Component
const ClientOverview = () => {
  const { user } = useAuth();
  const fullName = user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : '';
  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Welcome back, {user?.firstName || 'Client'}!</h2>
        <p className="text-blue-100">You have 2 upcoming sessions this week</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="text-3xl font-bold text-blue-600 mb-2">12</div>
          <div className="text-gray-600">Sessions Completed</div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="text-3xl font-bold text-green-600 mb-2">85%</div>
          <div className="text-gray-600">Goal Progress</div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="text-3xl font-bold text-purple-600 mb-2">4</div>
          <div className="text-gray-600">Resources Accessed</div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="text-3xl font-bold text-orange-600 mb-2">2</div>
          <div className="text-gray-600">Upcoming Sessions</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Sessions Preview */}
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Upcoming Sessions</h3>
          <UpcomingSessions preview={true} />
        </div>

        {/* Recent Resources */}
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Recent Resources</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <BookOpen size={20} className="text-blue-600" />
              </div>
              <div>
                <div className="font-medium">Goal Setting Workbook</div>
                <div className="text-sm text-gray-500">Updated yesterday</div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <BookOpen size={20} className="text-green-600" />
              </div>
              <div>
                <div className="font-medium">Meditation Exercises</div>
                <div className="text-sm text-gray-500">2 days ago</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Client Profile Component
const ClientProfile = () => {
  const { user, setUser } = useAuth();
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
      const response = await authApi.updateProfile({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        coachingGoals: formData.coachingGoals // Correctly pass the data to the API
      });
      
      // Update local user state from the response
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
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
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
          <textarea
            rows="4"
            name="coachingGoals"
            value={formData.coachingGoals}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Describe your coaching goals and what you'd like to achieve..."
          />
        </div>

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