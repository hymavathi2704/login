import React from 'react';
import { 
  Users, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  Clock, 
  MessageSquare,
  Star,
  Target
} from 'lucide-react';

const CoachOverview = () => {
  const stats = [
    {
      title: "Active Clients",
      value: "24",
      change: "+3 this month",
      changeType: "positive",
      icon: Users,
      color: "bg-blue-500"
    },
    {
      title: "Monthly Revenue",
      value: "$4,850",
      change: "+12% from last month",
      changeType: "positive",
      icon: DollarSign,
      color: "bg-green-500"
    },
    {
      title: "Sessions This Week",
      value: "18",
      change: "2 upcoming today",
      changeType: "neutral",
      icon: Calendar,
      color: "bg-purple-500"
    },
    {
      title: "Average Rating",
      value: "4.9",
      change: "Based on 127 reviews",
      changeType: "neutral",
      icon: Star,
      color: "bg-yellow-500"
    }
  ];

  const recentActivities = [
    {
      type: "booking",
      message: "New session booked with Sarah Johnson",
      time: "2 hours ago",
      icon: Calendar
    },
    {
      type: "review",
      message: "5-star review received from Michael Chen",
      time: "4 hours ago",
      icon: Star
    },
    {
      type: "message",
      message: "3 new messages from clients",
      time: "6 hours ago",
      icon: MessageSquare
    },
    {
      type: "goal",
      message: "Emily completed her work-life balance milestone",
      time: "1 day ago",
      icon: Target
    }
  ];

  const upcomingSessions = [
    {
      id: 1,
      client: "Sarah Johnson",
      time: "10:00 AM",
      duration: "60 min",
      type: "Life Coaching",
      status: "confirmed"
    },
    {
      id: 2,
      client: "Michael Chen",
      time: "2:00 PM",
      duration: "45 min",
      type: "Career Development",
      status: "pending"
    },
    {
      id: 3,
      client: "Emma Wilson",
      time: "4:30 PM",
      duration: "60 min",
      type: "Wellness Coaching",
      status: "confirmed"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Welcome back, Dr. Emily!</h2>
        <p className="text-purple-100">You have 3 sessions scheduled for today</p>
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
        {/* Today's Sessions */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Today's Sessions</h3>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              View All
            </button>
          </div>
          
          <div className="space-y-3">
            {upcomingSessions.map((session) => (
              <div key={session.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users size={20} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">{session.client}</p>
                    <p className="text-sm text-gray-500">{session.type}</p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="font-medium">{session.time}</p>
                  <p className="text-sm text-gray-500">{session.duration}</p>
                </div>
                
                <div className="flex space-x-2">
                  <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">
                    Start
                  </button>
                  <button className="border border-gray-300 text-gray-600 px-3 py-1 rounded text-sm hover:bg-gray-50">
                    Reschedule
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Activities</h3>
          
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

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Users size={24} className="text-blue-600 mb-2" />
            <span className="text-sm font-medium">Add Client</span>
          </button>
          
          <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Calendar size={24} className="text-green-600 mb-2" />
            <span className="text-sm font-medium">Create Event</span>
          </button>
          
          <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <MessageSquare size={24} className="text-purple-600 mb-2" />
            <span className="text-sm font-medium">Send Message</span>
          </button>
          
          <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <TrendingUp size={24} className="text-orange-600 mb-2" />
            <span className="text-sm font-medium">View Analytics</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CoachOverview;