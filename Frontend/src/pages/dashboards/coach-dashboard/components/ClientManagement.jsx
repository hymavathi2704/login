import React, { useState, useEffect } from 'react';
import { User, Search } from 'lucide-react';
import { getMyClients } from '@/auth/authApi';

const ClientManagement = () => {
  const [clients, setClients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await getMyClients();
        setClients(response.data);
      } catch (error) {
        console.error("Failed to fetch clients:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchClients();
  }, []);

  const filteredClients = clients.filter(client => 
    `${client.firstName} ${client.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) return <p>Loading your clients...</p>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">My Clients</h2>
        <p className="text-gray-600">View and manage clients who have booked sessions with you.</p>
      </div>

      <div className="relative">
        <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search clients..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border rounded-lg"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClients.length > 0 ? filteredClients.map(client => (
          <div key={client.id} className="bg-white p-6 rounded-xl border">
            <h3 className="font-bold text-lg">{client.firstName} {client.lastName}</h3>
            <p className="text-sm text-gray-500">{client.email}</p>
            {/* FIX: Changed client.client_profile to client.ClientProfile */}
            {client.ClientProfile && (
              <p className="text-sm text-gray-700 mt-2 italic">
                Goals: {client.ClientProfile.coachingGoals || 'Not set'}
              </p>
            )}
          </div>
        )) : (
          <p className="col-span-full text-center text-gray-500">No clients have booked a session with you yet.</p>
        )}
      </div>
    </div>
  );
};

export default ClientManagement;