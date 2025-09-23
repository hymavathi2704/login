import React, { useState } from 'react';
import { 
  Shield, 
  AlertTriangle, 
  Lock, 
  Key,
  Eye,
  EyeOff,
  UserX,
  Activity,
  Clock,
  Download,
  RefreshCw,
  CheckCircle,
  XCircle,
  Settings
} from 'lucide-react';

const SecurityCenter = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const securityData = {
    overview: {
      threatLevel: 'low',
      activeThreats: 2,
      blockedAttempts: 156,
      lastScan: '2025-01-15T08:30:00',
      systemStatus: 'secure'
    },
    threats: [
      {
        id: 1,
        type: 'brute_force',
        severity: 'medium',
        description: 'Multiple failed login attempts detected',
        ip: '192.168.1.100',
        timestamp: '2025-01-15T10:15:00',
        status: 'blocked',
        attempts: 5
      },
      {
        id: 2,
        type: 'suspicious_activity',
        severity: 'low',
        description: 'Unusual access pattern detected',
        user: 'user@email.com',
        timestamp: '2025-01-15T09:45:00',
        status: 'monitoring',
        score: 7.2
      }
    ],
    logs: [
      {
        id: 1,
        type: 'login',
        user: 'admin@thekata.com',
        ip: '10.0.0.1',
        timestamp: '2025-01-15T12:00:00',
        status: 'success',
        location: 'San Francisco, CA'
      },
      {
        id: 2,
        type: 'password_change',
        user: 'coach@email.com',
        ip: '10.0.0.2',
        timestamp: '2025-01-15T11:30:00',
        status: 'success',
        location: 'New York, NY'
      },
      {
        id: 3,
        type: 'failed_login',
        user: 'unknown@email.com',
        ip: '192.168.1.100',
        timestamp: '2025-01-15T10:15:00',
        status: 'blocked',
        location: 'Unknown'
      }
    ],
    permissions: {
      admins: [
        {
          id: 1,
          name: 'Super Admin',
          email: 'admin@thekata.com',
          role: 'super_admin',
          permissions: ['all'],
          lastActive: '2025-01-15T12:00:00',
          mfaEnabled: true
        },
        {
          id: 2,
          name: 'Content Admin',
          email: 'content@thekata.com',
          role: 'content_admin',
          permissions: ['user_management', 'content_moderation'],
          lastActive: '2025-01-14T16:30:00',
          mfaEnabled: false
        }
      ]
    }
  };

  const getThreatColor = (severity) => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'blocked':
        return 'bg-red-100 text-red-800';
      case 'monitoring':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Security Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Threat Level</p>
              <p className="text-2xl font-bold text-green-600 capitalize">{securityData.overview.threatLevel}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Shield size={24} className="text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Active Threats</p>
              <p className="text-2xl font-bold text-orange-600">{securityData.overview.activeThreats}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <AlertTriangle size={24} className="text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Blocked Attempts</p>
              <p className="text-2xl font-bold text-red-600">{securityData.overview.blockedAttempts}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <UserX size={24} className="text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">System Status</p>
              <p className="text-2xl font-bold text-green-600 capitalize">{securityData.overview.systemStatus}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Activity size={24} className="text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Threats */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Recent Security Threats</h3>
          <button className="text-red-600 hover:text-red-700 text-sm font-medium">
            View All
          </button>
        </div>

        <div className="space-y-3">
          {securityData.threats.map((threat) => (
            <div key={threat.id} className={`border rounded-lg p-4 ${getThreatColor(threat.severity)}`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertTriangle size={16} />
                    <span className="font-medium capitalize">{threat.type.replace('_', ' ')}</span>
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(threat.status)}`}>
                      {threat.status}
                    </span>
                  </div>
                  <p className="text-sm mb-2">{threat.description}</p>
                  <div className="flex items-center space-x-4 text-xs">
                    {threat.ip && <span>IP: {threat.ip}</span>}
                    {threat.user && <span>User: {threat.user}</span>}
                    {threat.attempts && <span>Attempts: {threat.attempts}</span>}
                    <span>Time: {new Date(threat.timestamp).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4">Security Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
            <RefreshCw size={24} className="text-blue-600 mb-2" />
            <span className="text-sm font-medium">Run Security Scan</span>
          </button>
          
          <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
            <Download size={24} className="text-green-600 mb-2" />
            <span className="text-sm font-medium">Export Logs</span>
          </button>
          
          <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
            <Lock size={24} className="text-purple-600 mb-2" />
            <span className="text-sm font-medium">Force Password Reset</span>
          </button>
          
          <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
            <Settings size={24} className="text-gray-600 mb-2" />
            <span className="text-sm font-medium">Security Settings</span>
          </button>
        </div>
      </div>
    </div>
  );

  const renderLogs = () => (
    <div className="bg-white rounded-xl border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold">Security Activity Logs</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">IP Address</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {securityData.logs.map((log) => (
              <tr key={log.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    <Activity size={16} className="text-gray-400" />
                    <span className="capitalize">{log.type.replace('_', ' ')}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {log.user}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {log.ip}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {log.location}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(log.status)}`}>
                    {log.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(log.timestamp).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderPermissions = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Administrator Accounts</h3>
          <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">
            Add Admin
          </button>
        </div>

        <div className="space-y-4">
          {securityData.permissions.admins.map((admin) => (
            <div key={admin.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="font-medium text-gray-900">{admin.name}</h4>
                    <span className="bg-red-100 text-red-800 px-2 py-1 text-xs rounded-full">
                      {admin.role.replace('_', ' ')}
                    </span>
                    {admin.mfaEnabled ? (
                      <CheckCircle size={16} className="text-green-600" />
                    ) : (
                      <XCircle size={16} className="text-red-600" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{admin.email}</p>
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span>Last active: {new Date(admin.lastActive).toLocaleDateString()}</span>
                    <span>MFA: {admin.mfaEnabled ? 'Enabled' : 'Disabled'}</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button className="bg-gray-100 text-gray-600 px-3 py-1 rounded text-sm hover:bg-gray-200">
                    Edit
                  </button>
                  {!admin.mfaEnabled && (
                    <button className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded text-sm hover:bg-yellow-200">
                      Enable MFA
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Security Settings */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4">Security Settings</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Two-Factor Authentication</h4>
              <p className="text-sm text-gray-500">Require 2FA for all admin accounts</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Password Requirements</h4>
              <p className="text-sm text-gray-500">Enforce strong password policies</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Login Attempt Monitoring</h4>
              <p className="text-sm text-gray-500">Monitor and block suspicious login attempts</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Session Timeout</h4>
              <p className="text-sm text-gray-500">Automatically log out inactive users</p>
            </div>
            <select className="px-3 py-1 border border-gray-300 rounded text-sm">
              <option>30 minutes</option>
              <option>1 hour</option>
              <option>2 hours</option>
              <option>4 hours</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header with Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Security Center</h2>
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'overview'
                ? 'bg-white text-gray-900 shadow'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Shield size={16} className="inline mr-2" />
            Security Overview
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'logs'
                ? 'bg-white text-gray-900 shadow'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Activity size={16} className="inline mr-2" />
            Activity Logs
          </button>
          <button
            onClick={() => setActiveTab('permissions')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'permissions'
                ? 'bg-white text-gray-900 shadow'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Key size={16} className="inline mr-2" />
            Permissions & Access
          </button>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'logs' && renderLogs()}
      {activeTab === 'permissions' && renderPermissions()}
    </div>
  );
};

export default SecurityCenter;