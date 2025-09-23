import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  Filter, 
  MoreVertical, 
  User, 
  Calendar, 
  MessageSquare,
  TrendingUp,
  Phone,
  Mail,
  MapPin,
  Edit,
  Trash2
} from 'lucide-react';

const ClientManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedClients, setSelectedClients] = useState([]);
  const [showAddClient, setShowAddClient] = useState(false);

  const clients = [
    {
      id: 1,
      name: "Sarah Johnson",
      email: "sarah.johnson@email.com",
      phone: "+1 (555) 123-4567",
      location: "San Francisco, CA",
      joinDate: "2024-11-15",
      status: "active",
      sessionsCompleted: 12,
      nextSession: "2025-01-16 10:00 AM",
      goalCategory: "Work-Life Balance",
      progress: 75,
      lastActivity: "2 hours ago",
      tags: ["Premium", "Long-term"],
      avatar: "/api/placeholder/40/40"
    },
    {
      id: 2,
      name: "Michael Chen",
      email: "michael.chen@email.com",
      phone: "+1 (555) 234-5678",
      location: "New York, NY",
      joinDate: "2024-10-22",
      status: "active",
      sessionsCompleted: 8,
      nextSession: "2025-01-17 2:00 PM",
      goalCategory: "Career Development",
      progress: 60,
      lastActivity: "1 day ago",
      tags: ["Executive", "Fast-track"],
      avatar: "/api/placeholder/40/40"
    },
    {
      id: 3,
      name: "Emma Wilson",
      email: "emma.wilson@email.com",
      phone: "+1 (555) 345-6789",
      location: "Los Angeles, CA",
      joinDate: "2024-12-01",
      status: "active",
      sessionsCompleted: 4,
      nextSession: "2025-01-18 4:30 PM",
      goalCategory: "Wellness",
      progress: 40,
      lastActivity: "3 days ago",
      tags: ["Wellness", "New"],
      avatar: "/api/placeholder/40/40"
    },
    {
      id: 4,
      name: "David Rodriguez",
      email: "david.rodriguez@email.com",
      phone: "+1 (555) 456-7890",
      location: "Austin, TX",
      joinDate: "2024-09-10",
      status: "inactive",
      sessionsCompleted: 15,
      nextSession: null,
      goalCategory: "Leadership",
      progress: 90,
      lastActivity: "2 weeks ago",
      tags: ["Completed"],
      avatar: "/api/placeholder/40/40"
    },
    {
      id: 5,
      name: "Lisa Thompson",
      email: "lisa.thompson@email.com",
      phone: "+1 (555) 567-8901",
      location: "Seattle, WA",
      joinDate: "2024-12-20",
      status: "trial",
      sessionsCompleted: 1,
      nextSession: "2025-01-19 11:00 AM",
      goalCategory: "Personal Growth",
      progress: 15,
      lastActivity: "5 days ago",
      tags: ["Trial", "New"],
      avatar: "/api/placeholder/40/40"
    }
  ];

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.goalCategory.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || client.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'trial':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getProgressColor = (progress) => {
    if (progress >= 75) return 'bg-green-500';
    if (progress >= 50) return 'bg-blue-500';
    if (progress >= 25) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Client Management</h2>
          <p className="text-gray-600">Manage your clients and track their progress</p>
        </div>
        <button
          onClick={() => setShowAddClient(true)}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>Add New Client</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="text-3xl font-bold text-blue-600 mb-2">
            {clients.filter(c => c.status === 'active').length}
          </div>
          <div className="text-gray-600">Active Clients</div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="text-3xl font-bold text-green-600 mb-2">
            {clients.filter(c => c.status === 'trial').length}
          </div>
          <div className="text-gray-600">Trial Clients</div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="text-3xl font-bold text-purple-600 mb-2">
            {clients.reduce((acc, client) => acc + client.sessionsCompleted, 0)}
          </div>
          <div className="text-gray-600">Total Sessions</div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="text-3xl font-bold text-orange-600 mb-2">
            {Math.round(clients.reduce((acc, client) => acc + client.progress, 0) / clients.length)}%
          </div>
          <div className="text-gray-600">Avg Progress</div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="flex-1 relative">
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search clients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter size={20} className="text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="trial">Trial</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Clients Table */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Progress
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Next Session
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredClients.map((client) => (
                <tr key={client.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-3">
                      <img
                        src={client.avatar}
                        alt={client.name}
                        className="w-10 h-10 rounded-full"
                      />
                      <div>
                        <div className="font-medium text-gray-900">{client.name}</div>
                        <div className="text-sm text-gray-500">{client.goalCategory}</div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {client.tags.map(tag => (
                            <span key={tag} className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{client.email}</div>
                    <div className="text-sm text-gray-500">{client.phone}</div>
                    <div className="text-sm text-gray-500 flex items-center">
                      <MapPin size={12} className="mr-1" />
                      {client.location}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(client.status)}`}>
                      {client.status}
                    </span>
                    <div className="text-xs text-gray-500 mt-1">
                      {client.sessionsCompleted} sessions
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2 min-w-[60px]">
                        <div 
                          className={`h-2 rounded-full ${getProgressColor(client.progress)}`}
                          style={{ width: `${client.progress}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-900">{client.progress}%</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Last active: {client.lastActivity}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    {client.nextSession ? (
                      <div className="text-sm text-gray-900">{client.nextSession}</div>
                    ) : (
                      <span className="text-sm text-gray-500">No upcoming session</span>
                    )}
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <button className="p-1 hover:bg-gray-100 rounded">
                        <MessageSquare size={16} className="text-gray-600" />
                      </button>
                      <button className="p-1 hover:bg-gray-100 rounded">
                        <Calendar size={16} className="text-gray-600" />
                      </button>
                      <button className="p-1 hover:bg-gray-100 rounded">
                        <Phone size={16} className="text-gray-600" />
                      </button>
                      <button className="p-1 hover:bg-gray-100 rounded">
                        <MoreVertical size={16} className="text-gray-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredClients.length === 0 && (
          <div className="text-center py-12">
            <User size={48} className="text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No clients found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
          </div>
        )}
      </div>

      {/* Add Client Modal */}
      {showAddClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold">Add New Client</h3>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Enter client name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Enter email address"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Enter phone number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="City, State"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Goal Category</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500">
                    <option>Life Coaching</option>
                    <option>Career Development</option>
                    <option>Wellness</option>
                    <option>Business Coaching</option>
                    <option>Leadership</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500">
                    <option value="trial">Trial</option>
                    <option value="active">Active</option>
                  </select>
                </div>
              </div>
              
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                <textarea
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Any additional notes about the client..."
                />
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowAddClient(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowAddClient(false)}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Add Client
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientManagement;