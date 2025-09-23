import React, { useState } from 'react';
import { 
  TrendingUp, 
  Users, 
  Calendar, 
  DollarSign,
  Activity,
  BarChart3,
  ArrowUp,
  ArrowDown,
  Eye,
  Clock,
  Globe
} from 'lucide-react';

const PlatformAnalytics = () => {
  const [timeRange, setTimeRange] = useState('30d');

  const analyticsData = {
    overview: {
      totalUsers: 1247,
      activeUsers: 856,
      totalSessions: 3456,
      totalRevenue: 187500,
      userGrowth: 15.2,
      sessionGrowth: 8.7,
      revenueGrowth: 22.4,
      activeGrowth: 12.1
    },
    userEngagement: {
      dailyActiveUsers: 342,
      weeklyActiveUsers: 678,
      monthlyActiveUsers: 856,
      avgSessionDuration: '28 mins',
      bounceRate: '24%',
      retention: '78%'
    },
    geographicData: [
      { country: 'United States', users: 456, percentage: 36.6 },
      { country: 'Canada', users: 187, percentage: 15.0 },
      { country: 'United Kingdom', users: 134, percentage: 10.7 },
      { country: 'Australia', users: 89, percentage: 7.1 },
      { country: 'Germany', users: 67, percentage: 5.4 },
      { country: 'Others', users: 314, percentage: 25.2 }
    ],
    deviceBreakdown: [
      { device: 'Desktop', users: 523, percentage: 41.9 },
      { device: 'Mobile', users: 456, percentage: 36.6 },
      { device: 'Tablet', users: 268, percentage: 21.5 }
    ],
    topPages: [
      { page: '/dashboard/coach', views: 12456, avgTime: '5m 23s' },
      { page: '/dashboard/client', views: 9834, avgTime: '4m 15s' },
      { page: '/events', views: 7621, avgTime: '3m 42s' },
      { page: '/bookings', views: 6789, avgTime: '6m 12s' },
      { page: '/resources', views: 5432, avgTime: '4m 33s' }
    ],
    revenueBreakdown: [
      { source: 'Session Bookings', amount: 89750, percentage: 47.9 },
      { source: 'Event Registration', amount: 45600, percentage: 24.3 },
      { source: 'Subscription Fees', amount: 32100, percentage: 17.1 },
      { source: 'Commission', amount: 20050, percentage: 10.7 }
    ],
    growthMetrics: [
      { month: 'Jul', users: 892, sessions: 2145, revenue: 125400 },
      { month: 'Aug', users: 945, sessions: 2387, revenue: 142300 },
      { month: 'Sep', users: 1034, sessions: 2654, revenue: 159800 },
      { month: 'Oct', users: 1098, sessions: 2891, revenue: 168900 },
      { month: 'Nov', users: 1165, sessions: 3124, revenue: 175600 },
      { month: 'Dec', users: 1247, sessions: 3456, revenue: 187500 }
    ]
  };

  const getChangeColor = (value) => {
    return value >= 0 ? 'text-green-600' : 'text-red-600';
  };

  const getChangeIcon = (value) => {
    return value >= 0 ? ArrowUp : ArrowDown;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Platform Analytics</h2>
          <p className="text-gray-600">Comprehensive insights into platform performance and user behavior</p>
        </div>
        <div>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
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
              <p className="text-sm font-medium text-gray-600 mb-1">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{analyticsData.overview.totalUsers.toLocaleString()}</p>
              <div className="flex items-center mt-2">
                {React.createElement(getChangeIcon(analyticsData.overview.userGrowth), {
                  size: 16,
                  className: getChangeColor(analyticsData.overview.userGrowth)
                })}
                <span className={`text-sm ml-1 ${getChangeColor(analyticsData.overview.userGrowth)}`}>
                  {Math.abs(analyticsData.overview.userGrowth)}% vs last period
                </span>
              </div>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users size={24} className="text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Active Users</p>
              <p className="text-2xl font-bold text-gray-900">{analyticsData.overview.activeUsers.toLocaleString()}</p>
              <div className="flex items-center mt-2">
                {React.createElement(getChangeIcon(analyticsData.overview.activeGrowth), {
                  size: 16,
                  className: getChangeColor(analyticsData.overview.activeGrowth)
                })}
                <span className={`text-sm ml-1 ${getChangeColor(analyticsData.overview.activeGrowth)}`}>
                  {Math.abs(analyticsData.overview.activeGrowth)}% vs last period
                </span>
              </div>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Activity size={24} className="text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Total Sessions</p>
              <p className="text-2xl font-bold text-gray-900">{analyticsData.overview.totalSessions.toLocaleString()}</p>
              <div className="flex items-center mt-2">
                {React.createElement(getChangeIcon(analyticsData.overview.sessionGrowth), {
                  size: 16,
                  className: getChangeColor(analyticsData.overview.sessionGrowth)
                })}
                <span className={`text-sm ml-1 ${getChangeColor(analyticsData.overview.sessionGrowth)}`}>
                  {Math.abs(analyticsData.overview.sessionGrowth)}% vs last period
                </span>
              </div>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Calendar size={24} className="text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(analyticsData.overview.totalRevenue)}</p>
              <div className="flex items-center mt-2">
                {React.createElement(getChangeIcon(analyticsData.overview.revenueGrowth), {
                  size: 16,
                  className: getChangeColor(analyticsData.overview.revenueGrowth)
                })}
                <span className={`text-sm ml-1 ${getChangeColor(analyticsData.overview.revenueGrowth)}`}>
                  {Math.abs(analyticsData.overview.revenueGrowth)}% vs last period
                </span>
              </div>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <DollarSign size={24} className="text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Growth Chart */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Growth Trends</h3>
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span>Users</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span>Sessions</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-orange-500 rounded"></div>
              <span>Revenue</span>
            </div>
          </div>
        </div>

        <div className="h-80">
          <div className="flex items-end justify-between h-full space-x-2">
            {analyticsData.growthMetrics.map((data, index) => (
              <div key={data.month} className="flex flex-col items-center flex-1">
                <div className="flex items-end space-x-1 h-64">
                  <div
                    className="bg-blue-500 rounded-t"
                    style={{ 
                      height: `${(data.users / 1300) * 100}%`,
                      width: '15px'
                    }}
                    title={`${data.users} users`}
                  />
                  <div
                    className="bg-green-500 rounded-t"
                    style={{ 
                      height: `${(data.sessions / 4000) * 100}%`,
                      width: '15px'
                    }}
                    title={`${data.sessions} sessions`}
                  />
                  <div
                    className="bg-orange-500 rounded-t"
                    style={{ 
                      height: `${(data.revenue / 200000) * 100}%`,
                      width: '15px'
                    }}
                    title={`${formatCurrency(data.revenue)} revenue`}
                  />
                </div>
                <span className="text-xs text-gray-600 mt-2">{data.month}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Engagement */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">User Engagement</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Daily Active</p>
              <p className="text-xl font-bold text-blue-600">{analyticsData.userEngagement.dailyActiveUsers}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Weekly Active</p>
              <p className="text-xl font-bold text-green-600">{analyticsData.userEngagement.weeklyActiveUsers}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Monthly Active</p>
              <p className="text-xl font-bold text-purple-600">{analyticsData.userEngagement.monthlyActiveUsers}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Avg Session</p>
              <p className="text-xl font-bold text-orange-600">{analyticsData.userEngagement.avgSessionDuration}</p>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Retention Rate</span>
              <span className="font-medium">{analyticsData.userEngagement.retention}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full" style={{ width: analyticsData.userEngagement.retention }}></div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Bounce Rate</span>
              <span className="font-medium">{analyticsData.userEngagement.bounceRate}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-red-500 h-2 rounded-full" style={{ width: analyticsData.userEngagement.bounceRate }}></div>
            </div>
          </div>
        </div>

        {/* Top Pages */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Top Pages</h3>
          <div className="space-y-3">
            {analyticsData.topPages.map((page, index) => (
              <div key={page.page} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{page.page}</div>
                  <div className="text-sm text-gray-500">{page.views.toLocaleString()} views</div>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-1 text-sm text-gray-600">
                    <Clock size={14} />
                    <span>{page.avgTime}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Geographic Distribution */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Geographic Distribution</h3>
          <div className="space-y-3">
            {analyticsData.geographicData.map((country) => (
              <div key={country.country} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Globe size={16} className="text-gray-400" />
                  <span className="font-medium text-gray-900">{country.country}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="flex-1 bg-gray-200 rounded-full h-2 min-w-[60px]">
                    <div 
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${country.percentage}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-700">{country.users}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Device Breakdown */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Device Breakdown</h3>
          <div className="space-y-4">
            {analyticsData.deviceBreakdown.map((device, index) => (
              <div key={device.device}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900">{device.device}</span>
                  <span className="text-sm text-gray-500">{device.users} users</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full ${
                      index === 0 ? 'bg-blue-500' :
                      index === 1 ? 'bg-green-500' : 'bg-purple-500'
                    }`}
                    style={{ width: `${device.percentage}%` }}
                  />
                </div>
                <div className="text-xs text-gray-500 mt-1">{device.percentage}%</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Revenue Breakdown */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4">Revenue Sources</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {analyticsData.revenueBreakdown.map((source, index) => (
            <div key={source.source} className="text-center p-4 border border-gray-200 rounded-lg">
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {formatCurrency(source.amount)}
              </div>
              <div className="text-sm text-gray-600 mb-2">{source.source}</div>
              <div className="text-xs text-gray-500">{source.percentage}% of total</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PlatformAnalytics;