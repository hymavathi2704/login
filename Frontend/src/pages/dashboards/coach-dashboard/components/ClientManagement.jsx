import React, { useState, useEffect } from 'react';
import { User, Search, Users, Heart } from 'lucide-react'; // Added Heart for followers
import { getMyClients } from '@/auth/authApi';
// NEW IMPORT: for followed clients
import { getClientsWhoFollow } from '@/auth/authApi'; 
import { cn } from '@/utils/cn'; // Assuming you have a utility for combining class names
import { toast } from 'sonner'; // 🚨 FIX: ADDED MISSING IMPORT

// Constants to separate client types
const CLIENT_TYPE_BOOKED = 'booked';
const CLIENT_TYPE_FOLLOWERS = 'followers';

const ClientManagement = () => {
  const [bookedClients, setBookedClients] = useState([]);
  const [followerClients, setFollowerClients] = useState([]); 
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState(CLIENT_TYPE_BOOKED); 

  useEffect(() => {
    const fetchClients = async () => {
      setIsLoading(true);
      try {
        // 1. Fetch clients who have booked sessions (existing)
        const bookedResponse = await getMyClients();
        setBookedClients(bookedResponse.data);

        // 2. Fetch clients who follow this coach (NEW)
        const followerResponse = await getClientsWhoFollow(); 
        setFollowerClients(followerResponse.data.clients); // Backend returns { clients: [...] }

      } catch (error) {
        console.error("Failed to fetch clients:", error);
        toast.error("Failed to fetch client data.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchClients();
  }, []);
  
  // Select the current list based on the active tab
  const currentClientList = activeTab === CLIENT_TYPE_BOOKED ? bookedClients : followerClients;
  
  // Apply search filtering to the currently active list
  const filteredClients = currentClientList.filter(client => 
    `${client.firstName} ${client.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderClientCard = (client, isFollower = false) => {
    const goals = client.ClientProfile?.coachingGoals || 'Not set';
    return (
      <div key={client.id} className="bg-white p-6 rounded-xl border relative">
        <h3 className="font-bold text-lg">{client.firstName} {client.lastName}</h3>
        <p className="text-sm text-gray-500">{client.email}</p>
        
        {isFollower && (
             <span className="absolute top-4 right-4 text-purple-600 flex items-center space-x-1 text-xs font-medium px-2 py-1 bg-purple-50 rounded-full">
                 <Heart size={14} fill="currentColor" /> Follower
             </span>
        )}
        
        {/* FIX: Ensure ClientProfile exists before accessing goals */}
        {client.ClientProfile && (
          <p className="text-sm text-gray-700 mt-2 italic line-clamp-2">
            Goals: {goals}
          </p>
        )}
        
        <div className="mt-4 pt-3 border-t">
          <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
             View Client Profile
          </button>
        </div>
      </div>
    );
  };


  if (isLoading) return <p className="text-center p-8">Loading your client data...</p>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Client Management</h2>
        <p className="text-gray-600">Manage clients who have booked sessions and those who follow your profile.</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab(CLIENT_TYPE_BOOKED)}
          className={cn(
            "px-4 py-2 text-base font-medium transition-colors",
            activeTab === CLIENT_TYPE_BOOKED
              ? 'text-purple-700 border-b-2 border-purple-700'
              : 'text-gray-500 hover:text-purple-600'
          )}
        >
          <Users size={16} className="inline mr-2" /> Booked Clients ({bookedClients.length})
        </button>
        <button
          onClick={() => setActiveTab(CLIENT_TYPE_FOLLOWERS)}
          className={cn(
            "px-4 py-2 text-base font-medium transition-colors",
            activeTab === CLIENT_TYPE_FOLLOWERS
              ? 'text-purple-700 border-b-2 border-purple-700'
              : 'text-gray-500 hover:text-purple-600'
          )}
        >
          <Heart size={16} className="inline mr-2" fill="currentColor" /> Followers ({followerClients.length})
        </button>
      </div>

      <div className="relative pt-6">
        <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder={`Search ${activeTab === CLIENT_TYPE_BOOKED ? 'booked clients' : 'followers'} by name or email...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border rounded-lg"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClients.length > 0 ? filteredClients.map(client => (
          renderClientCard(client, activeTab === CLIENT_TYPE_FOLLOWERS)
        )) : (
          <p className="col-span-full text-center text-gray-500 py-4">
             {activeTab === CLIENT_TYPE_BOOKED 
                 ? "No clients have booked a session with you yet that match the search criteria."
                 : "No clients are currently following your profile that match the search criteria."}
          </p>
        )}
      </div>
    </div>
  );
};

export default ClientManagement;