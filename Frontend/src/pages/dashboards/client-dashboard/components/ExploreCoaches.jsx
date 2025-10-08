import React, { useState, useEffect, useCallback } from 'react';
import { Search, Eye, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom'; // CRITICAL FIX: Import useNavigate
import { useAuth } from '@/auth/AuthContext'; 
import { getAllCoaches } from '@/auth/authApi'; 
import NavigationLoadingStates from '@/components/ui/NavigationLoadingStates';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import AppImage from '@/components/AppImage';

// Load backend URL
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:4028";
const PUBLIC_PROFILES_URL = `${API_BASE_URL}/api/profiles/coaches`; // Endpoint for ALL coaches
const FOLLOWED_PROFILES_URL = `${API_BASE_URL}/api/profiles/followed`; // Endpoint for FOLLOWED coaches

// Helper to construct the full image source URL
const getFullImageSrc = (path) => {
    if (typeof path === 'string' && path.startsWith('/uploads/')) {
        return `${API_BASE_URL}${path}`;
    }
    return path;
};

// Mock specialties for filtering (adjust as needed based on your backend values)
const coachSpecialties = [
    { value: '', label: 'All Specialties' },
    { value: 'Life Coaching', label: 'Life Coaching' },
    { value: 'Career Development', label: 'Career Development' },
    { value: 'Business Coaching', label: 'Business Coaching' },
    { value: 'Wellness', label: 'Wellness' },
];

// Helper to format specialties for display (includes necessary array check fix)
const formatSpecialties = (specs) => {
    const safeSpecs = Array.isArray(specs) ? specs : [];
    
    return safeSpecs.slice(0, 3).map((spec, index) => (
        <span 
            key={index} 
            className="inline-block bg-primary/10 text-primary px-2 py-1 rounded-full text-xs font-medium mr-2"
        >
            {spec}
        </span>
    ));
};

const ExploreCoaches = () => {
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate(); // Initialize hook
    
    const [activeTab, setActiveTab] = useState('all'); 
    const [coaches, setCoaches] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSpecialty, setSelectedSpecialty] = useState('');

    const fetchCoaches = useCallback(async (tab, search, specialty) => {
        setIsLoading(true);
        setError(null);
        setCoaches([]);
        
        let url = '';
        let headers = {};
        
        if (tab === 'all') {
            // ALL COACHES: Apply search and filter params
            url = `${PUBLIC_PROFILES_URL}?search=${search}&audience=${specialty}`;
        } else if (tab === 'followed') {
            // FOLLOWED COACHES: Requires authentication, ignores search/filter params
            if (!isAuthenticated) {
                setError("Please log in to see your followed coaches.");
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
            console.error(`Failed to fetch ${tab} coaches:`, err);
            setError(`Failed to load coaches. Please check your network or try again.`);
        } finally {
            setIsLoading(false);
        }
    }, [isAuthenticated]);

    // Effect hook runs on tab change or search submission
    useEffect(() => {
        // When switching tabs, clear errors and fetch data
        if (activeTab === 'followed') {
            // Fetch followed list directly, ignoring current search/filter state
            fetchCoaches('followed', '', ''); 
        } else {
            // When on 'all', fetch using current search/filter state
            fetchCoaches('all', searchQuery, selectedSpecialty); 
        }
    }, [activeTab]); 


    const handleSearch = (e) => {
        e.preventDefault();
        // Only trigger search when on 'all' tab, otherwise it just filters locally (or shouldn't run)
        if (activeTab === 'all') {
            fetchCoaches('all', searchQuery, selectedSpecialty); 
        }
    };
    
    // FIX: Function to handle navigation to public profile using useNavigate
    const handleViewProfile = (coachId) => {
        navigate(`/profiles/${coachId}`); 
    };

    const isFilterDisabled = activeTab === 'followed';

    return (
        <div className="p-6">
            <h1 className="text-3xl font-heading font-bold text-foreground mb-4">
                Explore Coaches
            </h1>

            {/* Tabs - ALL COACHES & FOLLOWED COACHES */}
            <div className="flex border-b border-border mb-6">
                <button
                    className={`px-4 py-2 font-medium text-lg transition-colors duration-200 ${
                        activeTab === 'all' 
                            ? 'text-primary border-b-2 border-primary' 
                            : 'text-muted-foreground hover:text-primary'
                    }`}
                    onClick={() => setActiveTab('all')}
                >
                    All Coaches
                </button>
                <button
                    className={`px-4 py-2 font-medium text-lg transition-colors duration-200 ${
                        activeTab === 'followed' 
                            ? 'text-primary border-b-2 border-primary' 
                            : 'text-muted-foreground hover:text-primary'
                    }`}
                    onClick={() => setActiveTab('followed')}
                    // Disabled if unauthenticated to clearly communicate intent, though fetcher handles it
                    disabled={!isAuthenticated && activeTab !== 'followed'} 
                >
                    Followed Coaches
                </button>
            </div>
            
            {/* Search and Filter Bar - ALWAYS VISIBLE (Restored Old Layout) */}
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 mb-8 bg-card rounded-xl border border-border p-4">
                
                {/* Search Input (Long) */}
                <div className="flex-1 relative">
                    <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <Input
                        type="search"
                        placeholder={isFilterDisabled ? "Filtering/Search available only in All Coaches tab" : "Search by name or email..."}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2"
                        disabled={isFilterDisabled}
                    />
                </div>
                
                {/* Specialty Filter (Select) */}
                <div className="md:w-64">
                    <Select
                        value={selectedSpecialty}
                        onValueChange={setSelectedSpecialty}
                        options={coachSpecialties}
                        placeholder="Filter by Specialization"
                        className="w-full"
                        disabled={isFilterDisabled}
                    />
                </div>
                
                <Button 
                    type="submit" 
                    variant="default" 
                    disabled={isLoading || isFilterDisabled}
                >
                    Search
                </Button>
            </form>

            {/* Content Area */}
            {isLoading ? (
                <NavigationLoadingStates isLoading={true} loadingType="search" />
            ) : error ? (
                <div className="p-4 bg-danger/10 text-danger rounded-md">
                    Error: {error}
                </div>
            ) : !isAuthenticated && activeTab === 'followed' ? (
                <div className="p-4 bg-warning/10 text-warning-foreground rounded-md text-center">
                    Please **Sign In** to view your followed coaches.
                </div>
            ) : coaches.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                    {activeTab === 'all' 
                        ? 'No coaches match your search criteria.' 
                        : 'You are not currently following any coaches.'}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {coaches.map((coach) => (
                        <div key={coach.id} className="bg-card border border-border rounded-card shadow-soft p-4 flex flex-col transition-transform hover:shadow-soft-md">
                            <div className="flex items-center mb-4">
                                <div className="w-16 h-16 rounded-full overflow-hidden mr-4 flex-shrink-0">
                                    <AppImage 
                                        src={getFullImageSrc(coach.profilePicture || coach.profileImage)} 
                                        alt={coach.name} 
                                        className="w-full h-full object-cover" 
                                    />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-foreground">{coach.name}</h3>
                                    <p className="text-sm text-secondary">{coach.title}</p>
                                </div>
                            </div>

                            <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                                {coach.shortBio}
                            </p>

                            <div className="flex-1 mb-4">
                                {formatSpecialties(coach.specialties)}
                            </div>

                            <div className="flex items-center justify-between border-t border-border pt-3 mt-auto">
                                <div className="flex items-center text-sm">
                                    <Icon name="Star" size={16} className="text-warning fill-current mr-1" />
                                    <span className="font-bold text-foreground mr-2">{coach.rating}</span>
                                    <span className="text-muted-foreground">({coach.totalReviews || 0} reviews)</span>
                                </div>
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => handleViewProfile(coach.id)} 
                                    iconName="Eye"
                                    iconPosition="left"
                                >
                                    View Profile
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ExploreCoaches;