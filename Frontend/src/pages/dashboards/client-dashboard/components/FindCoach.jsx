import React, { useState, useEffect, useCallback } from 'react';
import { Search, UserCheck, Eye, Filter, UserX, Users, Star } from 'lucide-react';
import { getAllCoaches, subscribeToCoach, unsubscribeFromCoach } from '@/auth/authApi';
import CoachProfileModal from './CoachProfileModal';

// Debounce hook
const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => { clearTimeout(handler); };
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
  const [viewMode, setViewMode] = useState('all');
  
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const fetchCoaches = useCallback(async () => {
    try {
      setIsLoading(true);
      const showSubscribedOnly = viewMode === 'subscribed';
      const response = await getAllCoaches(debouncedSearchTerm, selectedAudience, showSubscribedOnly);
      setCoaches(response.data);
    } catch (error) {
      console.error("Failed to fetch coaches:", error);
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearchTerm, selectedAudience, viewMode]);

  useEffect(() => {
    fetchCoaches();
  }, [fetchCoaches]);

  const handleSubscribe = async (coachId) => {
    try {
      await subscribeToCoach(coachId);
      fetchCoaches(); 
    } catch (error) {
      alert(error.response?.data?.message || "Could not subscribe.");
    }
  };

  const handleUnsubscribe = async (coachId) => {
    if (window.confirm('Are you sure you want to unsubscribe from this coach?')) {
        try {
            await unsubscribeFromCoach(coachId);
            fetchCoaches();
        } catch (error) {
            console.error("Failed to unsubscribe:", error);
            alert(error.response?.data?.message || "Could not unsubscribe.");
        }
    }
  };

  return (
    <>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Find a Coach</h2>
          <p className="text-gray-600">Browse and subscribe to coaches that fit your needs.</p>
        </div>

        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            <button
                onClick={() => setViewMode('all')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'all' ? 'bg-white text-gray-900 shadow' : 'text-gray-500 hover:text-gray-700'
                }`}
            >
                <Users size={16} className="inline mr-2" /> All Coaches
            </button>
            <button
                onClick={() => setViewMode('subscribed')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'subscribed' ? 'bg-white text-gray-900 shadow' : 'text-gray-500 hover:text-gray-700'
                }`}
            >
                <Star size={16} className="inline mr-2" /> My Subscriptions
            </button>
        </div>

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

        {isLoading ? (
            <p className="text-center py-8">Loading coaches...</p>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {coaches.length > 0 ? coaches.map(coach => (
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
                        {/* --- ✅ THIS IS THE FIX --- */}
                        {coach.isSubscribed === 1 ? (
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
                )) : (
                    <div className="col-span-full text-center py-12">
                        <h4 className="text-lg font-medium">No Coaches Found</h4>
                        <p className="text-gray-500">
                            {viewMode === 'subscribed' 
                                ? "You haven't subscribed to any coaches yet." 
                                : "Try adjusting your search or filters."
                            }
                        </p>
                    </div>
                )}
            </div>
        )}
      </div>
      <CoachProfileModal coach={viewingCoach} onClose={() => setViewingCoach(null)} />
    </>
  );
};

export default FindCoach;

