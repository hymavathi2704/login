import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  MoreVertical, 
  User, 
  Users,
  Shield,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Edit,
  Trash2,
  Ban,
  CheckCircle,
  XCircle,
  Eye
} from 'lucide-react';

const UserManagement = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddUser, setShowAddUser] = useState(false);

  const users = [
    {
      id: 1,
      name: "Dr. Emily Chen",
      email: "emily.chen@email.com",
      phone: "+1 (555) 123-4567",
      role: "coach",
      status: "active",
      joinDate: "2024-08-15",
      location: "San Francisco, CA",
      lastLogin: "2025-01-15T10:30:00",
      clients: 24,
      revenue: 18750,
      sessions: 142,
      avatar: "/api/placeholder/40/40"
    },
    {
      id: 2,
      name: "Sarah Johnson",
      email: "sarah.johnson@email.com",
      phone: "+1 (555) 234-5678",
      role: "client",
      status: "active",
      joinDate: "2024-11-20",
      location: "New York, NY",
      lastLogin: "2025-01-14T15:45:00",
      coach: "Dr. Emily Chen",
      sessionsCompleted: 12,
      totalSpent: 1800,
      avatar: "/api/placeholder/40/40"
    },
    {
      id: 3,
      name: "Michael Rodriguez",
      email: "michael.rodriguez@email.com",
      phone: "+1 (555) 345-6789",
      role: "coach",
      status: "active",
      joinDate: "2024-09-10",
      location: "Austin, TX",
      lastLogin: "2025-01-13T09:20:00",
      clients: 19,
      revenue: 15200,
      sessions: 98,
      avatar: "/api/placeholder/40/40"
    },
    {
      id: 4,
      name: "Lisa Thompson",
      email: "lisa.thompson@email.com",
      phone: "+1 (555) 456-7890",
      role: "client",
      status: "inactive",
      joinDate: "2024-12-01",
      location: "Seattle, WA",
      lastLogin: "2024-12-28T11:15:00",
      coach: "Sarah Williams",
      sessionsCompleted: 2,
      totalSpent: 300,
      avatar: "/api/placeholder/40/40"
    },
    {
      id: 5,
      name: "Admin User",
      email: "admin@thekata.com",
      phone: "+1 (555) 000-0001",
      role: "admin",
      status: "active",
      joinDate: "2024-06-01",
      location: "Remote",
      lastLogin: "2025-01-15T12:00:00",
      avatar: "/api/placeholder/40/40"
    }
  ];

  const filteredUsers = users.filter(user => {
    const matchesTab = activeTab === 'all' || user.role === activeTab;
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    return matchesTab && matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'suspended':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'coach':
        return Users;
      case 'client':
        return User;
      case 'admin':
        return Shield;
      default:
        return User;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'coach':
        return 'text-purple-600 bg-purple-100';
      case 'client':
        return 'text-blue-600 bg-blue-100';
      case 'admin':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getTabCounts = () => {
    return {
      all: users.length,
      coach: users.filter(u => u.role === 'coach').length,
      client: users.filter(u => u.role === 'client').length,
      admin: users.filter(u => u.role === 'admin').length
    };
  };

  const counts = getTabCounts();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
          <p className="text-gray-600">Manage coaches, clients, and platform administrators</p>
        </div>
        <button
          onClick={() => setShowAddUser(true)}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>Add User</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="text-3xl font-bold text-blue-600 mb-2">{users.length}</div>
          <div className="text-gray-600">Total Users</div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="text-3xl font-bold text-purple-600 mb-2">{counts.coach}</div>
          <div className="text-gray-600">Active Coaches</div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="text-3xl font-bold text-green-600 mb-2">{counts.client}</div>
          <div className="text-gray-600">Active Clients</div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="text-3xl font-bold text-orange-600 mb-2">
            {users.filter(u => u.status === 'active').length}
          </div>
          <div className="text-gray-600">Online Users</div>
        </div>
      </div>

      {/* Filters and Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        {/* User Type Tabs */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6">
          {[
            { id: 'all', label: `All Users (${counts.all})` },
            { id: 'coach', label: `Coaches (${counts.coach})` },
            { id: 'client', label: `Clients (${counts.client})` },
            { id: 'admin', label: `Admins (${counts.admin})` }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-gray-900 shadow'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="flex-1 relative">
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter size={20} className="text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact Info
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role & Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Activity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Performance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.map((user) => {
                const RoleIcon = getRoleIcon(user.role);
                
                return (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-10 h-10 rounded-full"
                        />
                        <div>
                          <div className="font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">ID: #{user.id}</div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 space-y-1">
                        <div className="flex items-center space-x-1">
                          <Mail size={12} />
                          <span>{user.email}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Phone size={12} />
                          <span>{user.phone}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MapPin size={12} />
                          <span>{user.location}</span>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-2">
                        <div className={`inline-flex items-center space-x-1 px-2 py-1 text-xs rounded-full ${getRoleColor(user.role)}`}>
                          <RoleIcon size={12} />
                          <span className="capitalize">{user.role}</span>
                        </div>
                        <div>
                          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(user.status)}`}>
                            {user.status}
                          </span>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 space-y-1">
                        <div>Joined: {new Date(user.joinDate).toLocaleDateString()}</div>
                        <div>Last login: {new Date(user.lastLogin).toLocaleDateString()}</div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {user.role === 'coach' && (
                          <div className="space-y-1">
                            <div>{user.clients} clients</div>
                            <div>${user.revenue?.toLocaleString()} revenue</div>
                            <div>{user.sessions} sessions</div>
                          </div>
                        )}
                        {user.role === 'client' && (
                          <div className="space-y-1">
                            <div>Coach: {user.coach}</div>
                            <div>{user.sessionsCompleted} sessions</div>
                            <div>${user.totalSpent} spent</div>
                          </div>
                        )}
                        {user.role === 'admin' && (
                          <div className="text-gray-500">Admin user</div>
                        )}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <button className="p-1 hover:bg-gray-100 rounded">
                          <Eye size={16} className="text-gray-600" />
                        </button>
                        <button className="p-1 hover:bg-gray-100 rounded">
                          <Edit size={16} className="text-gray-600" />
                        </button>
                        <button className="p-1 hover:bg-gray-100 rounded">
                          <Mail size={16} className="text-gray-600" />
                        </button>
                        {user.status === 'active' ? (
                          <button className="p-1 hover:bg-red-100 rounded">
                            <Ban size={16} className="text-red-600" />
                          </button>
                        ) : (
                          <button className="p-1 hover:bg-green-100 rounded">
                            <CheckCircle size={16} className="text-green-600" />
                          </button>
                        )}
                        <button className="p-1 hover:bg-gray-100 rounded">
                          <MoreVertical size={16} className="text-gray-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <Users size={48} className="text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
          </div>
        )}
      </div>

      {/* Add User Modal */}
      {showAddUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold">Add New User</h3>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Enter full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Enter email address"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Enter phone number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="City, State"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500">
                    <option value="client">Client</option>
                    <option value="coach">Coach</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500">
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <input
                  type="password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Enter temporary password"
                />
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowAddUser(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowAddUser(false)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Create User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;