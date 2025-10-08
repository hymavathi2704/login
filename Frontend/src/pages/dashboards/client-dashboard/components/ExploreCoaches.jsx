import React, { useState, useEffect, useCallback } from 'react';
import { Search, Eye, Filter } from 'lucide-react';
import { useBreadcrumb } from '@/components/ui/BreadcrumbNavigation';
import { useAuth } from '@/auth/AuthContext'; 
// NOTE: Assuming CoachPublicProfile is correctly imported for state-based viewing
import CoachPublicProfile from '../../shared/coach-public-profile'; 
import axios from 'axios'; 

// === Mock Dependencies/Helpers (Ensure these are available/imported correctly) ===
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

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:4028";
const PUBLIC_PROFILES_URL = `${API_BASE_URL}/api/profiles/coaches`; 
const FOLLOWED_PROFILES_URL = `${API_BASE_URL}/api/profiles/followed`; 

// Add this helper function to correctly resolve the image source
const getFullImageSrc = (path) => {
    // If the path starts with /uploads/, prepend the base URL
    if (typeof path === 'string' && path.startsWith('/uploads/')) {
        return `${API_BASE_URL}${path}`;
    }
    // Otherwise, it's already a full URL, Base64, or null, so return it as is
    return path;
}

const ExploreCoaches = () => {
    const { setBreadcrumb } = useBreadcrumb();
    const { isAuthenticated } = useAuth();
    
    const [coaches, setCoaches] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedCoach, setSelectedCoach] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedAudience, setSelectedAudience] = useState('');
    const [activeTab, setActiveTab] = useState('all'); 
    const [error, setError] = useState(null);

    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    const fetchCoaches = useCallback(async () => {
        setError(null);
        setIsLoading(true);
        setCoaches([]);
        
        let url = '';
        let headers = {};

        if (activeTab === 'all') {
            url = `${PUBLIC_PROFILES_URL}?search=${debouncedSearchTerm}&audience=${selectedAudience}`;
        } else {
            if (!isAuthenticated) {
                 setError("Please log in to view your followed coaches.");
                 setIsLoading(false);
                 return;
            }
            url = FOLLOWED_PROFILES_URL; 
            const token = localStorage.getItem('accessToken'); 
            headers = { Authorization: `Bearer ${token}` };
        }

        try {
            const response = await axios.get(url, { headers, withCredentials: true });
            
            setCoaches(response.data.coaches || []);
        } catch (err) {
            console.error(`Failed to fetch ${activeTab} coaches:`, err);
            setError(`Failed to load coaches: ${err.response?.data?.error || err.message}`);
            setCoaches([]); 
        } finally {
            setIsLoading(false);
        }
    }, [activeTab, isAuthenticated, debouncedSearchTerm, selectedAudience]);

    useEffect(() => {
        if (!selectedCoach) {
            fetchCoaches();
            setBreadcrumb([]);
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
    
    const isFilterDisabled = activeTab === 'followed';

    return (
        <div className="space-y-6">
            
            {/* Tabs: All Coaches & Followed Coaches */}
            <div className="flex border-b border-gray-200 mb-4">
                <button
                    className={`px-4 py-2 text-base font-medium transition-colors duration-200 ${
                        activeTab === 'all' 
                            ? 'text-purple-700 border-b-2 border-purple-700' 
                            : 'text-gray-500 hover:text-purple-600'
                    }`}
                    onClick={() => setActiveTab('all')}
                >
                    All Coaches
                </button>
                <button
                    className={`px-4 py-2 text-base font-medium transition-colors duration-200 ${
                        activeTab === 'followed' 
                            ? 'text-purple-700 border-b-2 border-purple-700' 
                            : 'text-gray-500 hover:text-purple-600'
                    }`}
                    onClick={() => setActiveTab('followed')}
                    disabled={!isAuthenticated && activeTab !== 'followed'} 
                >
                    Followed Coaches
                </button>
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
                                placeholder={isFilterDisabled ? "Search/Filter disabled for Followed Coaches" : "e.g., Jane Doe or Life Coaching..."}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border rounded-lg"
                                disabled={isFilterDisabled}
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
                                disabled={isFilterDisabled}
                            >
                                <option value="">All Audiences</option>
                                <option>Life coaches</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                    {error}
                </div>
            )}

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
                                        {/* FIX: Use getFullImageSrc helper */}
                                        <img className="h-10 w-10 rounded-full" 
                                             src={getFullImageSrc(coach.profilePicture) || `https://ui-avatars.com/api/?name=${coach.firstName}+${coach.lastName}&background=random`} 
                                             alt={`${coach.firstName} ${coach.lastName}`} 
                                        />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {/* FIX: Use coach.firstName and coach.lastName property which are now returned by backend */}
                                        <div className="text-sm font-medium text-gray-900">{coach.firstName} {coach.lastName}</div>
                                        {/* FIXED LINE: Access the top-level 'title' property from the processed data */}
                                        <div className="text-sm text-purple-600">{coach.title || 'Coach'}</div> 
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
                                        {activeTab === 'all' 
                                            ? 'No coaches found matching your criteria.' 
                                            : 'You are not currently following any coaches.'}
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


export default ExploreCoaches;