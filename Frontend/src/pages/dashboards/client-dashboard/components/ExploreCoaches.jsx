import React, { useState, useEffect, useCallback } from 'react';
import { Search, Eye, Filter, X } from 'lucide-react';
import { useBreadcrumb } from '@/components/ui/BreadcrumbNavigation';
import { useAuth } from '@/auth/AuthContext';
import CoachPublicProfile from '../../shared/coach-public-profile';
import axios from 'axios';

// === Specialty List (Reused from Coach Profile Editor) ===
const popularSpecialties = [
    'Life Coaching', 'Business Coaching', 'Career Coaching', 'Executive Coaching',
    'Health & Wellness', 'Relationship Coaching', 'Leadership Development',
    'Performance Coaching', 'Financial Coaching', 'Mindfulness & Meditation'
];
// =====================================================================

// === Debounce hook ===
const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
};

// === Backend URLs ===
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:4028";
const PUBLIC_PROFILES_URL = `${API_BASE_URL}/api/profiles/coaches`;

// Helper for full image URLs
const getFullImageSrc = (path) => {
    if (typeof path === 'string' && path.startsWith('/uploads/')) {
        return `${API_BASE_URL}${path}`;
    }
    return path;
}

const ExploreCoaches = () => {
    const { setBreadcrumb } = useBreadcrumb();
    const { isAuthenticated, user } = useAuth();

    const [coaches, setCoaches] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedCoach, setSelectedCoach] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    // RENAMED: from selectedAudience to selectedSpecialty
    const [selectedSpecialty, setSelectedSpecialty] = useState(''); 
    const [activeTab, setActiveTab] = useState('all');
    const [error, setError] = useState(null);

    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    // === Fetch Coaches (UPDATED: to use selectedSpecialty state) ===
    const fetchCoaches = useCallback(async () => {
        setError(null);
        setIsLoading(true);
        setCoaches([]);

        let url = '';
        let headers = {};

        if (activeTab === 'all') {
            // UPDATED: Pass selectedSpecialty (backend parameter is 'audience')
            url = `${PUBLIC_PROFILES_URL}?search=${debouncedSearchTerm}&audience=${selectedSpecialty}`;
        } else {
            // Followed coaches
            url = `${API_BASE_URL}/api/profiles/followed`;
            const token = localStorage.getItem('accessToken');
            headers = token ? { Authorization: `Bearer ${token}` } : {};

            if (!token) {
                setError("Please log in to view your followed coaches.");
                setIsLoading(false);
                return;
            }
        }

        try {
            const response = await axios.get(url, { headers, withCredentials: true });
            const coachList = response.data.coaches || [];
            setCoaches(coachList);

        } catch (err) {
            console.error(`Failed to fetch ${activeTab} coaches:`, err);
            // Use generic error message in case of deep failure like RangeError
            setError(`Failed to load coaches: ${err.response?.data?.error || err.message}`);
            setCoaches([]);
        } finally {
            setIsLoading(false);
        }
    // UPDATED dependencies to include the new specialty state
    }, [activeTab, isAuthenticated, debouncedSearchTerm, selectedSpecialty, user]); 

    useEffect(() => {
        if (!selectedCoach) {
            fetchCoaches();
            setBreadcrumb([]); // Clear breadcrumb when viewing the list
        } else {
            setBreadcrumb({
                parent: 'Explore Coaches',
                current: `${selectedCoach.firstName} ${selectedCoach.lastName}`,
                onBack: () => setSelectedCoach(null)
            });
        }
        
        // Cleanup function
        return () => {
            setBreadcrumb([]);
        };

    }, [fetchCoaches, selectedCoach, setBreadcrumb]);

    if (selectedCoach) {
        return <CoachPublicProfile coachId={selectedCoach.id} />;
    }

    const isFilterDisabled = activeTab === 'followed';
    
    // --- NEW HANDLER for clearing search ---
    const handleClearSearch = () => {
        setSearchTerm('');
    };

    return (
        <div className="space-y-6">

            {/* Tabs */}
            <div className="flex border-b border-gray-200 mb-4">
                <button
                    className={`px-4 py-2 text-base font-medium transition-colors duration-200 cursor-pointer ${
                        activeTab === 'all'
                            ? 'text-purple-700 border-b-2 border-purple-700'
                            : 'text-gray-500 hover:text-purple-600'
                    }`}
                    onClick={() => setActiveTab('all')}
                >
                    All Coaches
                </button>
                <button
                    className={`px-4 py-2 text-base font-medium transition-colors duration-200 cursor-pointer ${
                        activeTab === 'followed'
                            ? 'text-purple-700 border-b-2 border-purple-700'
                            : 'text-gray-500 hover:text-purple-600'
                    }`}
                    onClick={() => setActiveTab('followed')}
                >
                    Followed Coaches
                </button>
            </div>

            {/* Search & Filter */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                        <label className="text-sm font-medium text-gray-700">Search by Name, Title, or Specialty Keyword</label>
                        <div className="relative mt-1">
                            <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder={isFilterDisabled ? "Search/Filter disabled for Followed Coaches" : "e.g., Jane Doe, Leadership, or Life Coaching..."}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-10 py-2 border rounded-lg"
                                disabled={isFilterDisabled}
                            />
                            {/* NEW: Clear button (X) */}
                            {searchTerm && !isFilterDisabled && (
                                <button 
                                    type="button" 
                                    onClick={handleClearSearch}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-800"
                                    aria-label="Clear search"
                                >
                                    <X size={16} />
                                </button>
                            )}
                        </div>
                        
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700">Filter by Specialty</label>
                        <div className="relative mt-1">
                            <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <select
                                // UPDATED: Use selectedSpecialty
                                value={selectedSpecialty}
                                onChange={(e) => setSelectedSpecialty(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 border rounded-lg appearance-none"
                                disabled={isFilterDisabled}
                            >
                                <option value="">All Specialties</option>
                                {/* Populate options from the popularSpecialties list */}
                                {popularSpecialties.map(specialty => (
                                    <option key={specialty} value={specialty}>{specialty}</option>
                                ))}
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
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name & Title</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Specialties</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {coaches.length > 0 ? coaches.map(coach => (
                                <tr key={coach.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <img className="h-10 w-10 rounded-full"
                                            src={getFullImageSrc(coach.profilePicture) || `https://ui-avatars.com/api/?name=${coach.firstName}+${coach.lastName}&background=random`}
                                            alt={`${coach.firstName} ${coach.lastName}`}
                                        />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{coach.firstName} {coach.lastName}</div>
                                        <div className="text-sm text-purple-600">{coach.title}</div>
                                    </td>
                                    {/* 🔑 NEW CELL: Specialties List */}
                                    <td className="px-6 py-4 text-sm text-gray-700">
                                        {(coach.specialties || []).slice(0, 2).map((s, i) => (
                                            <span key={i} className="inline-block bg-blue-100 text-blue-800 px-2 py-0.5 text-xs rounded-full mr-1 mb-1">{s}</span>
                                        ))}
                                        {(coach.specialties?.length || 0) > 2 && (
                                            <span className="inline-block text-xs text-gray-500 mt-1">
                                                +{coach.specialties.length - 2} more
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => setSelectedCoach(coach)}
                                            className="w-full flex items-center justify-center py-2 px-4 border rounded-md text-sm font-medium bg-purple-600 text-white hover:bg-purple-700"
                                        >
                                            <Eye size={16} className="mr-2" /> View Profile
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="4" className="px-6 py-4 whitespace-nowrap text-center text-gray-500">
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