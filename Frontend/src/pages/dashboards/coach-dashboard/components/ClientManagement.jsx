// Frontend/src/pages/dashboards/coach-dashboard/components/ClientManagement.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { User, Search, Users, Heart, Calendar, Clock, Mail } from 'lucide-react'; 
// 🚨 FIX: Import the new, correct functions from authApi (assuming authApi.js was updated)
import { getBookedClients, getFollowedClients } from '@/auth/authApi'; 
import { cn } from '@/utils/cn'; 
import { toast } from 'sonner'; 

// Load backend URL from .env (fallback to localhost:4028)
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:4028";

// Helper to construct the full image source URL
const getFullImageSrc = (path) => {
    if (typeof path === 'string' && path.startsWith('/uploads/')) {
        return `${API_BASE_URL}${path}`;
    }
    return path;
};

const CLIENT_TYPE_BOOKED = 'booked';
const CLIENT_TYPE_FOLLOWERS = 'followers';

const ClientManagement = () => {
  const [bookedClients, setBookedClients] = useState([]);
  const [followerClients, setFollowerClients] = useState([]); 
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState(CLIENT_TYPE_BOOKED); 

  // 🚨 FIX 1: Update fetchClients to use the correct API names/calls
  const fetchClients = useCallback(async () => {
    setIsLoading(true);
    try {
      // 1. Fetch clients who have booked sessions 
      const bookedResponse = await getBookedClients();
      
      // The backend returns processed data in { clients: [...] }
      setBookedClients(bookedResponse.data.clients || []); 

      // 2. Fetch clients who follow this coach
      const followerResponse = await getFollowedClients(); 
      setFollowerClients(followerResponse.data.clients || []); 

    } catch (error) {
      // 🚨 FIX 2: Log the full error object to help debug the actual network failure!
      console.error("Failed to fetch clients:", error);
      console.error("Full Error Details:", error.response || error.message);
      
      const errorMessage = error.response?.data?.error || error.message || 'Failed to fetch client data.';
      toast.error(errorMessage);

    } finally {
      setIsLoading(false);
    }
  }, []); 

  useEffect(() => {
    fetchClients();
  }, [fetchClients, activeTab]); // Re-fetch on tab change is cleaner

  
  // Select the current list based on the active tab
  const currentClientList = activeTab === CLIENT_TYPE_BOOKED ? bookedClients : followerClients;
  
  // Apply search filtering to the currently active list
  const filteredClients = currentClientList.filter(client => 
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const renderClientCard = (client, isFollower = false) => {
    // Generate fallback profile image if path is missing
    const fallbackAvatar = `https://ui-avatars.com/api/?name=${client.name.replace(' ', '+')}&background=random`;
    // Note: The backend in a previous step was updated to provide the correct image path
    const profileImage = getFullImageSrc(client.profilePicture) || fallbackAvatar;

    if (isFollower) {
      // Follower Clients Card (with profile image, name, age, mail, following since)
      return (
        <div key={client.id} className="bg-white p-6 rounded-xl border relative flex items-start space-x-4">
            <div className="flex-shrink-0 w-16 h-16 rounded-full overflow-hidden">
                <img src={profileImage} alt={client.name} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
                <h3 className="font-bold text-lg truncate">{client.name}</h3>
                <div className="text-sm text-gray-500 space-y-1 mt-1">
                    {/* Mail */}
                    <p className="flex items-center">
                        <Mail size={14} className="mr-2 flex-shrink-0 text-gray-400" /> 
                        {client.email}
                    </p>
                    {/* Age */}
                    <p className="flex items-center">
                        <Clock size={14} className="mr-2 flex-shrink-0 text-gray-400" /> 
                        Age: {client.age || 'N/A'}
                    </p>
                    {/* Following Since */}
                    <p className="flex items-center text-purple-600">
                        <Heart size={14} className="mr-2 flex-shrink-0" fill="currentColor" /> 
                        Following since: {client.followingSince || 'N/A'}
                    </p>
                </div>
                
                <div className="mt-4 pt-3 border-t">
                    <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                        View Public Profile
                    </button>
                </div>
            </div>
        </div>
      );
    }

    // Booked Client Card (with profile image, name, sessions booked, view sessions button)
    return (
      <div key={client.id} className="bg-white p-6 rounded-xl border relative flex items-start space-x-4">
        <div className="flex-shrink-0 w-16 h-16 rounded-full overflow-hidden">
            <img src={profileImage} alt={client.name} className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg truncate">{client.name}</h3>
            <p className="text-sm text-gray-500 mb-2 truncate">{client.email}</p>

            {/* Sessions Booked Till Now */}
            <p className="text-sm text-purple-600 font-medium flex items-center mb-4">
                <Calendar size={14} className="mr-2 flex-shrink-0" /> 
                Sessions Booked Till Now: {client.sessionsBookedTillNow || 0}
            </p>
            
            {/* View Client Sessions Button */}
            <div className="pt-3 border-t">
                <button className="bg-purple-600 text-white px-3 py-2 rounded-lg hover:bg-purple-700 text-sm font-medium flex items-center">
                    <Calendar size={16} className="mr-2" /> View Client Sessions
                </button>
            </div>
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

      {/* 🚨 FIX 3: Search Bar Alignment Fix */}
      <div className="relative">
        {/* Remove the redundant 'pt-6' and rely on the input padding.
            The position of the icon's container needs to match the height of the input.
            By wrapping the input and icon in a div and using flex-1, we get better alignment.
            Instead of absolute positioning relative to an outer div, we'll keep the relative/absolute position
            but ensure the container's padding is correct.
        */}
        <div className="relative">
            <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={`Search ${activeTab === CLIENT_TYPE_BOOKED ? 'booked clients' : 'followers'} by name or email...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg"
            />
        </div>
      </div>
      {/* 🚨 END FIX 3 */}


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