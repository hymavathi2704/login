import React, { useState, useEffect, useCallback } from 'react';
import { Search, UserCheck, Eye, Filter, UserX } from 'lucide-react'; // Added UserX for unsubscribe
import { getAllCoaches, subscribeToCoach, unsubscribeFromCoach } from '@/auth/authApi'; // Added unsubscribeFromCoach
import CoachProfileModal from './CoachProfileModal';

// A simple debounce hook to prevent excessive API calls while typing
const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);
    return debouncedValue;
};

const predefinedAudiences = [
    'Life coaches', 'Business coaches', 'Wellness and fitness trainers',
    'Academic or career coaches', 'Executive coaches', 'Other'
];

const FindCoach = () => {
  const [coaches, setCoaches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewingCoach, setViewingCoach] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAudience, setSelectedAudience] = useState('');
  
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Function to fetch coaches from the backend
  const fetchCoaches = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await getAllCoaches(debouncedSearchTerm, selectedAudience);
      setCoaches(response.data);
    } catch (error) {
      console.error("Failed to fetch coaches:", error);
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearchTerm, selectedAudience]);

  useEffect(() => {
    fetchCoaches();
  }, [fetchCoaches]);

  // Handler for the subscribe action
  const handleSubscribe = async (coachId) => {
    try {
      await subscribeToCoach(coachId);
      fetchCoaches(); // Refresh list to show the new "Subscribed" status
    } catch (error) {
      alert(error.response?.data?.message || "Could not subscribe.");
    }
  };

  // --- NEW: Handler for the unsubscribe action ---
  const handleUnsubscribe = async (coachId) => {
    if (window.confirm('Are you sure you want to unsubscribe from this coach?')) {
        try {
            await unsubscribeFromCoach(coachId);
            fetchCoaches(); // Refresh list to show the updated status
        } catch (error) {
            console.error("Failed to unsubscribe:", error);
            alert(error.response?.data?.message || "Could not unsubscribe.");
        }
    }
  };

  if (isLoading && coaches.length === 0) return <p>Loading coaches...</p>;

  return (
    <>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Find a Coach</h2>
          <p className="text-gray-600">Browse and subscribe to coaches that fit your needs.</p>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-700">Search by Name or Specialty</label>
              <div className="relative mt-1">
                <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="e.g., Jane Doe or Life Coaching..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Filter by Target Audience</label>
              <div className="relative mt-1">
                 <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <select 
                  value={selectedAudience} 
                  onChange={(e) => setSelectedAudience(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border rounded-lg appearance-none"
                >
                  <option value="">All Audiences</option>
                  {predefinedAudiences.map(audience => (
                    <option key={audience} value={audience}>{audience}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Coaches Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coaches.map(coach => (
            <div key={coach.id} className="bg-white p-6 rounded-xl border flex flex-col">
                <div className="flex-grow">
                  <h3 className="font-bold text-xl">{coach.firstName} {coach.lastName}</h3>
                  <p className="text-sm text-purple-600 font-medium">{coach.coach_profile?.title || 'Coach'}</p>
                  <p className="text-sm text-gray-600 mt-2 line-clamp-3">{coach.coach_profile?.bio || 'No bio available.'}</p>
                </div>
                <div className="mt-4 pt-4 border-t space-y-2">
                    <button onClick={() => setViewingCoach(coach)} className="w-full flex items-center justify-center py-2 px-4 border rounded-md text-sm font-medium hover:bg-gray-50">
                        <Eye size={16} className="mr-2" /> View Profile
                    </button>
                    {coach.isSubscribed ? (
                        <button onClick={() => handleUnsubscribe(coach.id)} className="w-full flex items-center justify-center py-2 px-4 border border-red-300 text-red-700 bg-red-50 rounded-md text-sm font-medium hover:bg-red-100">
                            <UserX size={16} className="mr-2" /> Unsubscribe
                        </button>
                    ) : (
                        <button onClick={() => handleSubscribe(coach.id)} className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700">
                            Subscribe
                        </button>
                    )}
                </div>
            </div>
            ))}
        </div>
      </div>
      {/* Profile Modal */}
      <CoachProfileModal coach={viewingCoach} onClose={() => setViewingCoach(null)} />
    </>
  );
};

export default FindCoach;

