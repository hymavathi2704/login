import React from 'react';
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  Activity,
  UserCheck,
  UserX,
  Calendar,
  Star,
  ArrowUp,
  ArrowDown,
  AlertTriangle
} from 'lucide-react';

const AdminOverview = () => {
  const stats = [
    {
      title: "Total Users",
      value: "1,247",
      change: "+8.2%",
      changeType: "positive",
      icon: Users,
      color: "bg-blue-500",
      description: "892 Clients, 355 Coaches"
    },
    {
      title: "Monthly Revenue",
      value: "$47,850",
      change: "+12.4%",
      changeType: "positive", 
      icon: DollarSign,
      color: "bg-green-500",
      description: "15% commission + subscriptions"
    },
    {
      title: "Active Sessions",
      value: "3,456",
      change: "+5.7%",
      changeType: "positive",
      icon: Calendar,
      color: "bg-purple-500",
      description: "This month"
    },
    {
      title: "Platform Rating",
      value: "4.8",
      change: "+0.1",
      changeType: "positive",
      icon: Star,
      color: "bg-yellow-500",
      description: "Based on 2,341 reviews"
    }
  ];

  const recentActivity = [
    {
      type: "user_signup",
      message: "15 new coaches joined the platform",
      time: "2 hours ago",
      icon: UserCheck,
      color: "text-green-600"
    },
    {
      type: "revenue",
      message: "$2,340 in commission earned today",
      time: "4 hours ago",
      icon: DollarSign,
      color: "text-green-600"
    },
    {
      type: "issue",
      message: "Payment processing issue reported by 3 coaches",
      time: "6 hours ago",
      icon: AlertTriangle,
      color: "text-red-600"
    },
    {
      type: "milestone",
      message: "Platform reached 1,000+ active coaches milestone",
      time: "1 day ago",
      icon: TrendingUp,
      color: "text-blue-600"
    }
  ];

  const topCoaches = [
    {
      id: 1,
      name: "Dr. Emily Chen",
      specialty: "Life Coaching",
      clients: 24,
      revenue: 18750,
      rating: 4.9,
      avatar: "/api/placeholder/40/40"
    },
    {
      id: 2,
      name: "Michael Rodriguez",
      specialty: "Career Development",
      clients: 19,
      revenue: 15200,
      rating: 4.8,
      avatar: "/api/placeholder/40/40"
    },
    {
      id: 3,
      name: "Sarah Williams",
      specialty: "Wellness Coaching",
      clients: 21,
      revenue: 14800,
      rating: 4.9,
      avatar: "/api/placeholder/40/40"
    },
    {
      id: 4,
      name: "David Thompson",
      specialty: "Business Coaching",
      clients: 16,
      revenue: 12400,
      rating: 4.7,
      avatar: "/api/placeholder/40/40"
    }
  ];

  const systemHealth = {
    uptime: "99.9%",
    responseTime: "245ms",
    activeConnections: 1847,
    serverLoad: "32%"
  };

  const getChangeIcon = (changeType) => {
    return changeType === 'positive' ? ArrowUp : ArrowDown;
  };

  const getChangeColor = (changeType) => {
    return changeType === 'positive' ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-red-600 to-orange-600 rounded-xl p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Welcome to The Katha Admin</h2>
        <p className="text-red-100">Monitor platform performance and manage the coaching ecosystem</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const ChangeIcon = getChangeIcon(stat.changeType);
          
          return (
            <div key={index} className="bg-white p-6 rounded-xl border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                  <Icon size={24} className="text-white" />
                </div>
                <div className={`flex items-center space-x-1 ${getChangeColor(stat.changeType)}`}>
                  <ChangeIcon size={16} />
                  <span className="text-sm font-medium">{stat.change}</span>
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 mb-2">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Performing Coaches */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Top Performing Coaches</h3>
            <button className="text-red-600 hover:text-red-700 text-sm font-medium">
              View All
            </button>
          </div>
          
          <div className="space-y-4">
            {topCoaches.map((coach, index) => (
              <div key={coach.id} className="flex items-center space-x-4 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                <div className="flex items-center space-x-3 flex-1">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center text-red-600 font-bold text-sm">
                    #{index + 1}
                  </div>
                  <img
                    src={coach.avatar}
                    alt={coach.name}
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <p className="font-medium text-gray-900">{coach.name}</p>
                    <p className="text-sm text-gray-500">{coach.specialty}</p>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="font-medium text-gray-900">{coach.clients}</p>
                      <p className="text-gray-500">Clients</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">${coach.revenue.toLocaleString()}</p>
                      <p className="text-gray-500">Revenue</p>
                    </div>
                    <div>
                      <div className="flex items-center space-x-1">
                        <p className="font-medium text-gray-900">{coach.rating}</p>
                        <Star size={12} className="text-yellow-500 fill-current" />
                      </div>
                      <p className="text-gray-500">Rating</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
          
          <div className="space-y-4">
            {recentActivity.map((activity, index) => {
              const Icon = activity.icon;
              return (
                <div key={index} className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Icon size={16} className={activity.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 mb-1">{activity.message}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-200">
            <button className="w-full text-center text-red-600 hover:text-red-700 text-sm font-medium">
              View All Activities
            </button>
          </div>
        </div>
      </div>

      {/* System Health & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Health */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">System Health</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Uptime</p>
              <p className="text-xl font-bold text-green-600">{systemHealth.uptime}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Response Time</p>
              <p className="text-xl font-bold text-blue-600">{systemHealth.responseTime}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Active Connections</p>
              <p className="text-xl font-bold text-purple-600">{systemHealth.activeConnections.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Server Load</p>
              <p className="text-xl font-bold text-orange-600">{systemHealth.serverLoad}</p>
            </div>
          </div>

          <div className="mt-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span>Server Load</span>
              <span>{systemHealth.serverLoad}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-orange-500 h-2 rounded-full" style={{ width: systemHealth.serverLoad }}></div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <Users size={24} className="text-blue-600 mb-2" />
              <span className="text-sm font-medium">User Management</span>
            </button>
            
            <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <DollarSign size={24} className="text-green-600 mb-2" />
              <span className="text-sm font-medium">Revenue Reports</span>
            </button>
            
            <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <Activity size={24} className="text-purple-600 mb-2" />
              <span className="text-sm font-medium">Platform Analytics</span>
            </button>
            
            <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <AlertTriangle size={24} className="text-red-600 mb-2" />
              <span className="text-sm font-medium">System Alerts</span>
            </button>
          </div>
        </div>
      </div>

      {/* Platform Growth Chart */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4">Platform Growth Overview</h3>
        
        <div className="h-64">
          {/* Simple chart representation - replace with actual chart library */}
          <div className="flex items-end justify-between h-full space-x-2">
            {[
              { month: 'Jul', users: 45, revenue: 12 },
              { month: 'Aug', users: 62, revenue: 18 },
              { month: 'Sep', users: 78, revenue: 25 },
              { month: 'Oct', users: 89, revenue: 32 },
              { month: 'Nov', users: 95, revenue: 38 },
              { month: 'Dec', users: 100, revenue: 45 }
            ].map((data, index) => (
              <div key={data.month} className="flex flex-col items-center flex-1">
                <div className="flex items-end space-x-1 h-48">
                  <div
                    className="bg-blue-500 rounded-t"
                    style={{ 
                      height: `${data.users}%`,
                      width: '20px'
                    }}
                    title={`${data.users}% User Growth`}
                  />
                  <div
                    className="bg-green-500 rounded-t"
                    style={{ 
                      height: `${data.revenue}%`,
                      width: '20px'
                    }}
                    title={`$${data.revenue}K Revenue`}
                  />
                </div>
                <span className="text-xs text-gray-600 mt-2">{data.month}</span>
              </div>
            ))}
          </div>
          
          <div className="flex items-center justify-center space-x-6 mt-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span>User Growth</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span>Revenue Growth</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;