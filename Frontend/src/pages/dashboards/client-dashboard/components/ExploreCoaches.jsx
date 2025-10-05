import React, { useState, useEffect, useCallback } from 'react';
import { Search, Eye, Filter } from 'lucide-react';
import { getAllCoaches } from '@/auth/authApi';
import CoachPublicProfile from '../../shared/coach-public-profile';

const ExploreCoaches = ({ setBreadcrumb }) => {
  const [coaches, setCoaches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCoach, setSelectedCoach] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAudience, setSelectedAudience] = useState('');
  
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

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
    if (!selectedCoach) {
      fetchCoaches();
      setBreadcrumb(null);
    } else {
      setBreadcrumb({
        parent: 'Explore Coaches',
        current: `${selectedCoach.firstName} ${selectedCoach.lastName}`,
        onBack: () => setSelectedCoach(null)
      });
    }
  }, [fetchCoaches, selectedCoach, setBreadcrumb]);

  if (selectedCoach) {
    return <CoachPublicProfile coachId={selectedCoach.id} />;
  }

  return (
    <div className="space-y-6">
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
                  <option>Life coaches</option>
                </select>
              </div>
            </div>
          </div>
      </div>

      {isLoading ? (
          <p className="text-center py-8">Loading coaches...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-xl border">
            <thead>
                <tr className="w-full bg-gray-50 border-b">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profile Picture</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                </tr>
            </thead>
            <tbody className="divide-y">
              {coaches.length > 0 ? coaches.map(coach => (
                <tr key={coach.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                      <img className="h-10 w-10 rounded-full" src={`https://ui-avatars.com/api/?name=${coach.firstName}+${coach.lastName}&background=random`} alt="" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{coach.firstName} {coach.lastName}</div>
                      <div className="text-sm text-purple-600">{coach.coach_profile?.title || 'Coach'}</div>
                    </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      onClick={() => setSelectedCoach(coach)}
                      className="w-full flex items-center justify-center py-2 px-4 border rounded-md text-sm font-medium hover:bg-gray-50"
                    >
                      <Eye size={16} className="mr-2" /> View Profile
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="3" className="px-6 py-4 whitespace-nowrap text-center text-gray-500">
                    No coaches found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

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

export default ExploreCoaches;