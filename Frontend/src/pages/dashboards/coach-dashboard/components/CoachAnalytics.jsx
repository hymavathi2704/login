import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Calendar, 
  Star,
  Clock,
  Target,
  ArrowUp,
  ArrowDown
} from 'lucide-react';

const CoachAnalytics = () => {
  const [timeRange, setTimeRange] = useState('30d');

  // Mock data - in real app this would come from your analytics API
  const analytics = {
    overview: {
      totalRevenue: 18750,
      totalSessions: 142,
      activeClients: 24,
      avgRating: 4.9,
      revenueChange: 12.5,
      sessionsChange: 8.3,
      clientsChange: 15.2,
      ratingChange: 0.1
    },
    revenueData: [
      { month: 'Jul', revenue: 12500, sessions: 95 },
      { month: 'Aug', revenue: 14200, sessions: 108 },
      { month: 'Sep', revenue: 16800, sessions: 125 },
      { month: 'Oct', revenue: 15400, sessions: 118 },
      { month: 'Nov', revenue: 17200, sessions: 132 },
      { month: 'Dec', revenue: 18750, sessions: 142 }
    ],
    clientProgress: [
      { name: 'Sarah Johnson', progress: 85, sessions: 12, goal: 'Work-Life Balance' },
      { name: 'Michael Chen', progress: 72, sessions: 8, goal: 'Career Development' },
      { name: 'Emma Wilson', progress: 45, sessions: 4, goal: 'Wellness' },
      { name: 'David Rodriguez', progress: 95, sessions: 15, goal: 'Leadership' },
      { name: 'Lisa Thompson', progress: 25, sessions: 2, goal: 'Personal Growth' }
    ],
    sessionTypes: [
      { type: 'Life Coaching', count: 58, revenue: 8700 },
      { type: 'Career Development', count: 34, revenue: 5100 },
      { type: 'Wellness Coaching', count: 28, revenue: 2800 },
      { type: 'Leadership Coaching', count: 22, revenue: 3850 }
    ],
    bookingTrends: [
      { day: 'Mon', bookings: 4 },
      { day: 'Tue', bookings: 6 },
      { day: 'Wed', bookings: 8 },
      { day: 'Thu', bookings: 7 },
      { day: 'Fri', bookings: 5 },
      { day: 'Sat', bookings: 3 },
      { day: 'Sun', bookings: 2 }
    ]
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getChangeColor = (change) => {
    return change >= 0 ? 'text-green-600' : 'text-red-600';
  };

  const getChangeIcon = (change) => {
    return change >= 0 ? ArrowUp : ArrowDown;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
          <p className="text-gray-600">Track your coaching business performance and growth</p>
        </div>
        <div>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(analytics.overview.totalRevenue)}
              </p>
              <div className="flex items-center mt-2">
                {React.createElement(getChangeIcon(analytics.overview.revenueChange), {
                  size: 16,
                  className: getChangeColor(analytics.overview.revenueChange)
                })}
                <span className={`text-sm ml-1 ${getChangeColor(analytics.overview.revenueChange)}`}>
                  {Math.abs(analytics.overview.revenueChange)}% vs last period
                </span>
              </div>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign size={24} className="text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Total Sessions</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.overview.totalSessions}</p>
              <div className="flex items-center mt-2">
                {React.createElement(getChangeIcon(analytics.overview.sessionsChange), {
                  size: 16,
                  className: getChangeColor(analytics.overview.sessionsChange)
                })}
                <span className={`text-sm ml-1 ${getChangeColor(analytics.overview.sessionsChange)}`}>
                  {Math.abs(analytics.overview.sessionsChange)}% vs last period
                </span>
              </div>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar size={24} className="text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Active Clients</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.overview.activeClients}</p>
              <div className="flex items-center mt-2">
                {React.createElement(getChangeIcon(analytics.overview.clientsChange), {
                  size: 16,
                  className: getChangeColor(analytics.overview.clientsChange)
                })}
                <span className={`text-sm ml-1 ${getChangeColor(analytics.overview.clientsChange)}`}>
                  {Math.abs(analytics.overview.clientsChange)}% vs last period
                </span>
              </div>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users size={24} className="text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Average Rating</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.overview.avgRating}</p>
              <div className="flex items-center mt-2">
                <Star size={16} className="text-yellow-500 fill-current" />
                <span className="text-sm ml-1 text-gray-600">
                  Based on 127 reviews
                </span>
              </div>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Star size={24} className="text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Revenue & Sessions Trend</h3>
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-purple-500 rounded"></div>
              <span>Revenue</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span>Sessions</span>
            </div>
          </div>
        </div>

        <div className="h-80">
          {/* Simple chart representation - in real app, use a chart library like Chart.js or Recharts */}
          <div className="flex items-end justify-between h-full space-x-2">
            {analytics.revenueData.map((data, index) => (
              <div key={data.month} className="flex flex-col items-center flex-1">
                <div className="flex items-end space-x-1 h-64">
                  <div
                    className="bg-purple-500 rounded-t"
                    style={{ 
                      height: `${(data.revenue / 20000) * 100}%`,
                      width: '20px'
                    }}
                  />
                  <div
                    className="bg-blue-500 rounded-t"
                    style={{ 
                      height: `${(data.sessions / 150) * 100}%`,
                      width: '20px'
                    }}
                  />
                </div>
                <span className="text-xs text-gray-600 mt-2">{data.month}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Session Types */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Session Types Performance</h3>
          <div className="space-y-4">
            {analytics.sessionTypes.map((type, index) => {
              const totalSessions = analytics.sessionTypes.reduce((acc, t) => acc + t.count, 0);
              const percentage = Math.round((type.count / totalSessions) * 100);
              
              return (
                <div key={type.type}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">{type.type}</span>
                    <span className="text-sm text-gray-500">{type.count} sessions</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          index === 0 ? 'bg-purple-500' :
                          index === 1 ? 'bg-blue-500' :
                          index === 2 ? 'bg-green-500' : 'bg-orange-500'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-700">{formatCurrency(type.revenue)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Booking Trends */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Weekly Booking Pattern</h3>
          <div className="space-y-3">
            {analytics.bookingTrends.map((day) => {
              const maxBookings = Math.max(...analytics.bookingTrends.map(d => d.bookings));
              const percentage = (day.bookings / maxBookings) * 100;
              
              return (
                <div key={day.day} className="flex items-center space-x-3">
                  <span className="w-8 text-sm font-medium text-gray-700">{day.day}</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-blue-500 h-3 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="w-8 text-sm text-gray-500">{day.bookings}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Client Progress */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4">Client Progress Overview</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Goal</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sessions</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Progress</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {analytics.clientProgress.map((client) => (
                <tr key={client.name} className="hover:bg-gray-50">
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-3">
                      <img
                        src={`/api/placeholder/32/32`}
                        alt={client.name}
                        className="w-8 h-8 rounded-full"
                      />
                      <span className="font-medium text-gray-900">{client.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-gray-600">{client.goal}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-gray-600">{client.sessions}</td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-3">
                      <div className="flex-1 bg-gray-200 rounded-full h-2 min-w-[100px]">
                        <div 
                          className={`h-2 rounded-full ${
                            client.progress >= 80 ? 'bg-green-500' :
                            client.progress >= 60 ? 'bg-blue-500' :
                            client.progress >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${client.progress}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-700">{client.progress}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CoachAnalytics;