import React, { useState } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  Download,
  Filter,
  Search,
  MoreVertical,
  CreditCard,
  Users,
  Percent,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

const RevenueManagement = () => {
  const [timeRange, setTimeRange] = useState('30d');
  const [filterType, setFilterType] = useState('all');

  const revenueData = {
    overview: {
      totalRevenue: 187500,
      monthlyRevenue: 47850,
      commission: 15600,
      subscriptions: 8900,
      revenueGrowth: 22.4,
      commissionRate: 15,
      avgTransactionValue: 85
    },
    transactions: [
      {
        id: 'TXN-001',
        type: 'session_booking',
        coach: 'Dr. Emily Chen',
        client: 'Sarah Johnson',
        amount: 150,
        commission: 22.50,
        date: '2025-01-15T10:30:00',
        status: 'completed',
        paymentMethod: 'card'
      },
      {
        id: 'TXN-002',
        type: 'event_registration',
        coach: 'Michael Rodriguez',
        client: 'Multiple Attendees',
        amount: 490,
        commission: 73.50,
        date: '2025-01-14T16:20:00',
        status: 'completed',
        paymentMethod: 'card'
      },
      {
        id: 'TXN-003',
        type: 'subscription',
        coach: 'Platform',
        client: 'Sarah Williams',
        amount: 29,
        commission: 29.00,
        date: '2025-01-14T09:15:00',
        status: 'completed',
        paymentMethod: 'auto'
      },
      {
        id: 'TXN-004',
        type: 'session_booking',
        coach: 'Sarah Williams',
        client: 'Emma Wilson',
        amount: 100,
        commission: 15.00,
        date: '2025-01-13T14:45:00',
        status: 'pending',
        paymentMethod: 'card'
      },
      {
        id: 'TXN-005',
        type: 'refund',
        coach: 'David Thompson',
        client: 'Lisa Brown',
        amount: -120,
        commission: -18.00,
        date: '2025-01-12T11:30:00',
        status: 'refunded',
        paymentMethod: 'card'
      }
    ],
    monthlyBreakdown: [
      { month: 'Jul', sessions: 12500, events: 8900, subscriptions: 2100, commission: 3540 },
      { month: 'Aug', sessions: 15200, events: 11300, subscriptions: 2400, commission: 4335 },
      { month: 'Sep', sessions: 18900, events: 14200, subscriptions: 2700, commission: 5370 },
      { month: 'Oct', sessions: 21300, events: 16800, subscriptions: 2900, commission: 6150 },
      { month: 'Nov', sessions: 24600, events: 18400, subscriptions: 3200, commission: 6930 },
      { month: 'Dec', sessions: 28900, events: 21200, subscriptions: 3500, commission: 7995 }
    ],
    topCoaches: [
      {
        name: 'Dr. Emily Chen',
        totalRevenue: 18750,
        commission: 2812.50,
        sessions: 125,
        avgSession: 150
      },
      {
        name: 'Michael Rodriguez',
        totalRevenue: 15200,
        commission: 2280.00,
        sessions: 95,
        avgSession: 160
      },
      {
        name: 'Sarah Williams',
        totalRevenue: 12800,
        commission: 1920.00,
        sessions: 128,
        avgSession: 100
      },
      {
        name: 'David Thompson',
        totalRevenue: 11400,
        commission: 1710.00,
        sessions: 76,
        avgSession: 150
      }
    ]
  };

  const getTransactionTypeColor = (type) => {
    switch (type) {
      case 'session_booking':
        return 'bg-blue-100 text-blue-800';
      case 'event_registration':
        return 'bg-green-100 text-green-800';
      case 'subscription':
        return 'bg-purple-100 text-purple-800';
      case 'refund':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'refunded':
        return 'bg-red-100 text-red-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const filteredTransactions = revenueData.transactions.filter(transaction => {
    if (filterType === 'all') return true;
    return transaction.type === filterType;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Revenue Management</h2>
          <p className="text-gray-600">Monitor platform revenue, commissions, and financial performance</p>
        </div>
        <div className="flex space-x-3">
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
          <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center space-x-2">
            <Download size={20} />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Revenue Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(revenueData.overview.totalRevenue)}</p>
              <div className="flex items-center mt-2">
                <ArrowUpRight size={16} className="text-green-600" />
                <span className="text-sm text-green-600 ml-1">+{revenueData.overview.revenueGrowth}%</span>
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
              <p className="text-sm font-medium text-gray-600 mb-1">Monthly Revenue</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(revenueData.overview.monthlyRevenue)}</p>
              <p className="text-sm text-gray-500 mt-2">This month</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar size={24} className="text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Commission Earned</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(revenueData.overview.commission)}</p>
              <p className="text-sm text-gray-500 mt-2">{revenueData.overview.commissionRate}% avg rate</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Percent size={24} className="text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Avg Transaction</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(revenueData.overview.avgTransactionValue)}</p>
              <p className="text-sm text-gray-500 mt-2">Per booking</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <CreditCard size={24} className="text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Revenue Breakdown</h3>
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span>Sessions</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span>Events</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-purple-500 rounded"></div>
              <span>Subscriptions</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-orange-500 rounded"></div>
              <span>Commission</span>
            </div>
          </div>
        </div>

        <div className="h-80">
          <div className="flex items-end justify-between h-full space-x-2">
            {revenueData.monthlyBreakdown.map((data) => (
              <div key={data.month} className="flex flex-col items-center flex-1">
                <div className="flex items-end space-x-1 h-64">
                  <div
                    className="bg-blue-500 rounded-t"
                    style={{ 
                      height: `${(data.sessions / 30000) * 100}%`,
                      width: '12px'
                    }}
                    title={`Sessions: ${formatCurrency(data.sessions)}`}
                  />
                  <div
                    className="bg-green-500 rounded-t"
                    style={{ 
                      height: `${(data.events / 25000) * 100}%`,
                      width: '12px'
                    }}
                    title={`Events: ${formatCurrency(data.events)}`}
                  />
                  <div
                    className="bg-purple-500 rounded-t"
                    style={{ 
                      height: `${(data.subscriptions / 4000) * 100}%`,
                      width: '12px'
                    }}
                    title={`Subscriptions: ${formatCurrency(data.subscriptions)}`}
                  />
                  <div
                    className="bg-orange-500 rounded-t"
                    style={{ 
                      height: `${(data.commission / 8000) * 100}%`,
                      width: '12px'
                    }}
                    title={`Commission: ${formatCurrency(data.commission)}`}
                  />
                </div>
                <span className="text-xs text-gray-600 mt-2">{data.month}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Revenue Coaches */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Top Revenue Generating Coaches</h3>
          <div className="space-y-4">
            {revenueData.topCoaches.map((coach, index) => (
              <div key={coach.name} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center text-red-600 font-bold text-sm">
                    #{index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{coach.name}</p>
                    <p className="text-sm text-gray-500">{coach.sessions} sessions</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">{formatCurrency(coach.totalRevenue)}</p>
                  <p className="text-sm text-gray-500">{formatCurrency(coach.commission)} commission</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Recent Transactions</h3>
            <div className="flex items-center space-x-2">
              <Filter size={16} className="text-gray-400" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="text-sm px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="all">All Types</option>
                <option value="session_booking">Sessions</option>
                <option value="event_registration">Events</option>
                <option value="subscription">Subscriptions</option>
                <option value="refund">Refunds</option>
              </select>
            </div>
          </div>

          <div className="space-y-3">
            {filteredTransactions.slice(0, 5).map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className={`px-2 py-1 text-xs rounded-full ${getTransactionTypeColor(transaction.type)}`}>
                      {transaction.type.replace('_', ' ')}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(transaction.status)}`}>
                      {transaction.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-900">{transaction.coach}</p>
                  <p className="text-xs text-gray-500">{new Date(transaction.date).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(transaction.amount)}
                  </p>
                  <p className="text-xs text-gray-500">
                    Commission: {formatCurrency(transaction.commission)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* All Transactions Table */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">All Transactions</h3>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search transactions..."
                  className="pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Transaction
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Coach
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Commission
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredTransactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{transaction.id}</div>
                    <div className="text-sm text-gray-500">{transaction.client}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${getTransactionTypeColor(transaction.type)}`}>
                      {transaction.type.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {transaction.coach}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`font-medium ${transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(transaction.amount)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`font-medium ${transaction.commission >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(transaction.commission)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(transaction.status)}`}>
                      {transaction.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(transaction.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button className="p-1 hover:bg-gray-100 rounded">
                      <MoreVertical size={16} className="text-gray-600" />
                    </button>
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

export default RevenueManagement;