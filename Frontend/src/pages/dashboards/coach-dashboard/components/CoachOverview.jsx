// Frontend/src/pages/dashboards/coach-dashboard/components/CoachOverview.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom'; // 👈 1. Import useNavigate
import {
  Users,
  Calendar,
  DollarSign,
  TrendingUp,
  Star,
  Target,
  AlertCircle,
  MessageSquare // 👈 2. Import MessageSquare
} from 'lucide-react';
import { useAuth } from '../../../../auth/AuthContext';
import { getCoachDashboardOverview } from '../../../../auth/authApi';

// Helper to format time (e.g., 10:00 AM)
const formatTime = (timeString) => {
  if (!timeString || typeof timeString !== 'string') return '';
  // Create a date object just to parse the time string
  const [hours, minutes] = timeString.split(':');
  if (hours === undefined || minutes === undefined) return timeString; // Return original if format is wrong

  const date = new Date();
  date.setHours(parseInt(hours, 10));
  date.setMinutes(parseInt(minutes, 10));

  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

// 👈 3. Add a new helper to format date
// Helper to format date (e.g., Oct 21, 2025)
const formatDate = (dateString) => {
  if (!dateString) return '';
  // The date from the DB should be correct (YYYY-MM-DD), use UTC methods to avoid timezone shift
  const date = new Date(dateString);
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth(); // 0-indexed
  const day = date.getUTCDate();

  const tempDate = new Date(Date.UTC(year, month, day)); // Create UTC date

  return tempDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC' // Specify UTC to prevent local timezone conversion in formatting
  });
};


const CoachOverview = () => {
  const { user } = useAuth();
  const navigate = useNavigate(); // 👈 4. Initialize useNavigate
  const [stats, setStats] = useState(null);
  const [upcomingSessions, setUpcomingSessions] = useState([]); // 👈 5. Rename state
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch data from the new backend endpoint
  const fetchOverview = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getCoachDashboardOverview();
      setStats(response.data.stats);
      setUpcomingSessions(response.data.upcomingSessions); // 👈 6. Set upcomingSessions
    } catch (err) {
      setError(err.message || 'Failed to fetch overview data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  // === Loading and Error States ===
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg" role="alert">
        <strong className="font-bold"><AlertCircle className="inline-block mr-2" />Error: </strong>
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }

  // === Dynamic Stats Cards ===
  const statCards = [
    {
      title: "Active Clients",
      value: stats?.activeClientsCount ?? 0,
      change: "From confirmed bookings",
      changeType: "neutral",
      icon: Users,
      color: "bg-blue-500"
    },
    {
      title: "Monthly Revenue",
      value: stats?.monthlyRevenue ?? "N/A",
      change: "Feature coming soon",
      changeType: "neutral",
      icon: DollarSign,
      color: "bg-green-500"
    },
    {
      title: "Upcoming Sessions", // 👈 7. Rename stat card
      value: stats?.sessionsThisWeekCount ?? 0,
      change: "In the next 7 days", // 👈 8. Update description
      changeType: "neutral",
      icon: Calendar,
      color: "bg-purple-500"
    },
    {
      title: "Average Rating",
      value: stats?.averageRating ?? "N/A",
      change: "Feature coming soon",
      changeType: "neutral",
      icon: Star,
      color: "bg-yellow-500"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Welcome back, {user?.firstName || 'Coach'}!</h2>
        <p className="text-purple-100">
          You have {stats?.sessionsThisWeekCount ?? 0} session(s) scheduled in the next 7 days. {/* 👈 Use count from stats */}
        </p>
        <button 
            onClick={() => navigate('/dashboard/coach/profile')}
            className="mt-3 inline-flex items-center text-sm font-medium text-white bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg transition-colors"
        >
          Complete Your Profile
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white p-6 rounded-xl border border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mb-2">{stat.value}</p>
                  <p className={`text-sm ${
                    stat.changeType === 'positive' ? 'text-green-600' :
                    stat.changeType === 'negative' ? 'text-red-600' : 'text-gray-500'
                  }`}>
                    {stat.change}
                  </p>
                </div>
                <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                  <Icon size={24} className="text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Sessions List */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Upcoming Sessions</h3> {/* 👈 Title */}
            {/* Link 'View All' to session management page */}
            <button
              onClick={() => navigate('/dashboard/coach/sessions')}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              View All Sessions
            </button>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto"> {/* Scroll */}
            {upcomingSessions.length > 0 ? (
              upcomingSessions.map((session) => ( // Loop over created sessions
                <div key={session.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  {/* Session Info */}
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center"> {/* Changed color */}
                      <Calendar size={20} className="text-purple-600" /> {/* Changed icon */}
                    </div>
                    <div>
                      {/* Show Session Title */}
                      <p className="font-medium">{session.title || 'Session'}</p>
                       {/* Show Client name if available, otherwise 'Not Booked' or similar */}
                       <p className="text-sm text-gray-500">
                         {session.client ? `${session.client.firstName} ${session.client.lastName}` : 'Availability'}
                       </p>
                    </div>
                  </div>

                  {/* Date and Time */}
                  <div className="text-right">
                    <p className="font-medium">{formatDate(session.date)}</p>
                    <p className="text-sm text-gray-500">{formatTime(session.startTime)} ({session.duration} min)</p>
                  </div>

                  {/* 🛑 MODIFIED: Action Button - KEEP ONLY EDIT */}
                  <div className="flex space-x-2">
                    
                    {/* Keep Edit button (or link to edit session page) */}
                    <button 
                        onClick={() => navigate(`/dashboard/coach/sessions?edit=${session.id}`)}
                        className="border border-gray-300 text-gray-600 px-3 py-1 rounded text-sm hover:bg-gray-50"
                    >
                        Edit
                    </button> 
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No upcoming sessions created.</p>
            )}
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Activities</h3>

          <div className="flex flex-col items-center justify-center h-full min-h-[150px] text-gray-500">
            <Target size={32} className="mb-2" />
            <p className="text-sm text-center">Recent activity feed<br/>is coming soon.</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          
          <button 
          onClick={() => navigate('/dashboard/coach/clients')}
          className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Users size={24} className="text-blue-600 mb-2" />
            <span className="text-sm font-medium">Add Client</span>
          </button>

          {/* Navigate to Session Management */}
          <button
            onClick={() => navigate('/dashboard/coach/sessions')}
            className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Calendar size={24} className="text-green-600 mb-2" />
            <span className="text-sm font-medium">Manage Sessions</span>
          </button>

          {/* Navigate to Communication */}
          <button
            onClick={() => navigate('/dashboard/coach/communication')}
            className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <MessageSquare size={24} className="text-purple-600 mb-2" />
            <span className="text-sm font-medium">Send Message</span>
          </button>

          {/* Navigate to Analytics */}
          <button
            onClick={() => navigate('/dashboard/coach/analytics')}
            className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <TrendingUp size={24} className="text-orange-600 mb-2" />
            <span className="text-sm font-medium">View Analytics</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CoachOverview;