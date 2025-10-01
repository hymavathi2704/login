import React, { useState, useEffect } from 'react';
import { Search, UserCheck } from 'lucide-react';
import { getAllCoaches, subscribeToCoach } from '@/auth/authApi';

const FindCoach = () => {
  const [coaches, setCoaches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCoaches();
  }, []);

  const fetchCoaches = async () => {
    try {
      setIsLoading(true);
      const response = await getAllCoaches();
      setCoaches(response.data);
    } catch (error) {
      console.error("Failed to fetch coaches:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubscribe = async (coachId) => {
    try {
      await subscribeToCoach(coachId);
      // Refresh the list to show the new subscription status
      fetchCoaches(); 
    } catch (error) {
      console.error("Failed to subscribe:", error);
      alert(error.response?.data?.message || "Could not subscribe. You may already be subscribed.");
    }
  };

  if (isLoading) return <p>Loading coaches...</p>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Find a Coach</h2>
        <p className="text-gray-600">Browse and subscribe to coaches that fit your needs.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {coaches.map(coach => (
          <div key={coach.id} className="bg-white p-6 rounded-xl border flex flex-col">
            <div className="flex-grow">
              <h3 className="font-bold text-xl">{coach.firstName} {coach.lastName}</h3>
              <p className="text-sm text-gray-600 mt-2">{coach.coach_profile?.bio || 'No bio available.'}</p>
            </div>
            <div className="mt-4">
              {coach.isSubscribed ? (
                <button disabled className="w-full flex items-center justify-center py-2 px-4 border rounded-md text-sm font-medium bg-gray-100 text-gray-500">
                  <UserCheck size={16} className="mr-2" />
                  Subscribed
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
  );
};

export default FindCoach;