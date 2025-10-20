import React from 'react';
import {
  Users,
  Calendar,
  DollarSign,
  TrendingUp,
  Clock,
  MessageSquare,
  Star,
  Target,
  BookOpen,
  Video
} from 'lucide-react';
import { useAuth } from '../../../../auth/AuthContext';
// ADDED IMPORT: Import the UpcomingSessions component
import UpcomingSessions from './UpcomingSessions';


const ClientOverview = () => {
  const { user } = useAuth();
  const stats = [
    {
      title: "Completed Sessions",
      value: "12",
      change: "+2 this month",
      changeType: "positive",
      icon: Calendar,
      color: "bg-green-500"
    },
    {
        title: "Goals in Progress",
        value: "3",
        change: "1 overdue",
        changeType: "negative",
        icon: Target,
        color: "bg-yellow-500"
    },
    {
      title: "Upcoming Sessions",
      value: "2",
      change: "1 this week",
      changeType: "neutral",
      icon: Clock,
      color: "bg-blue-500"
    },
    {
      title: "Your Coach's Rating",
      value: "4.9",
      change: "Dr. Emily",
      changeType: "neutral",
      icon: Star,
      color: "bg-purple-500"
    }
  ];

  const recentActivities = [
    {
      type: "reschedule",
      message: "Your session was rescheduled to tomorrow",
      time: "1 hour ago",
      icon: Calendar
    },
    {
      type: "resource",
      message: "New resource 'Mindfulness Guide' added",
      time: "5 hours ago",
      icon: BookOpen
    },
    {
      type: "message",
      message: "You received a new message from Dr. Emily",
      time: "1 day ago",
      icon: MessageSquare
    },
    {
      type: "goal",
      message: "You completed the 'Weekly Journaling' goal",
      time: "2 days ago",
      icon: Target
    }
  ];

  // REMOVED: hardcoded upcomingSessions array is no longer needed

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">
           Welcome back, {user?.firstName || 'Client'}!
        </h2>
        <p className="text-blue-100">You have 1 session scheduled for today</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
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
        {/* MODIFIED: Your Upcoming Sessions replaced with component */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Your Upcoming Sessions</h3>
            {/* Direct link to the full sessions page */}
            <a href="/dashboard/client/sessions" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              View All
            </a>
          </div>
          <div className="space-y-3">
            {/* RENDER THE UPCOMING SESSIONS COMPONENT IN PREVIEW MODE */}
            <UpcomingSessions preview={true} />
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Your Recent Activities</h3>
          <div className="space-y-3">
            {recentActivities.map((activity, index) => {
              const Icon = activity.icon;
              return (
                <div key={index} className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Icon size={16} className="text-gray-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 mb-1">{activity.message}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientOverview;