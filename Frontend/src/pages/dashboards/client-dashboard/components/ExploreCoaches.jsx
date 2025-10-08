import React, { useState, useEffect, useCallback } from 'react';
import Icon from '@/components/AppIcon';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import AppImage from '@/components/AppImage';
import { useAuth } from '@/auth/AuthContext'; // Assuming this provides user info and token
import axios from 'axios';

// Load backend URL
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:4028";
const PUBLIC_PROFILES_URL = `${API_BASE_URL}/api/profiles/coaches`; // Endpoint for ALL coaches
// NOTE: We need a NEW endpoint for followed coaches, let's define it here:
const FOLLOWED_PROFILES_URL = `${API_BASE_URL}/api/profiles/followed`; // <-- New endpoint needed

const coachSpecialties = [
    { value: '', label: 'All Specialties' },
    { value: 'career', label: 'Career Development' },
    { value: 'life', label: 'Life Coaching' },
    { value: 'health', label: 'Health & Wellness' },
    // Add more specialties as needed
];

// Helper to format coach data for display
const formatCoach = (coach) => ({
    id: coach.id,
    name: coach.name,
    title: coach.title,
    profileImage: coach.profilePicture,
    shortBio: coach.shortBio,
    specialties: coach.specialties,
    startingPrice: coach.startingPrice,
    rating: coach.rating,
    totalReviews: coach.totalReviews,
});

const ExploreCoaches = () => {
    const { isAuthenticated, user } = useAuth();
    const [activeTab, setActiveTab] = useState('all'); // 'all' or 'followed'
    const [coaches, setCoaches] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSpecialty, setSelectedSpecialty] = useState('');

    const fetchCoaches = useCallback(async (tab) => {
        setIsLoading(true);
        setError(null);
        setCoaches([]);
        
        let url = '';
        let headers = {};
        
        if (tab === 'all') {
            // All Coaches endpoint (public, but can be filtered)
            url = `${PUBLIC_PROFILES_URL}?search=${searchQuery}&audience=${selectedSpecialty}`;
        } else if (tab === 'followed') {
            // Followed Coaches endpoint (requires authentication)
            if (!isAuthenticated) {
                setError("Please log in to see your followed coaches.");
                setIsLoading(false);
                return;
            }
            url = FOLLOWED_PROFILES_URL; // This endpoint will fetch based on the logged-in user
            
            // Assuming your auth system uses an access token in the header
            const token = localStorage.getItem('accessToken'); 
            headers = { Authorization: `Bearer ${token}` };
        }

        try {
            const response = await axios.get(url, { headers, withCredentials: true });
            
            // Both endpoints are expected to return an array of coach objects
            const coachesData = Array.isArray(response.data.coaches) 
                ? response.data.coaches 
                : [];
                
            setCoaches(coachesData.map(formatCoach));

        } catch (err) {
            console.error(`Failed to fetch ${tab} coaches:`, err);
            setError(`Failed to load coaches: ${err.response?.data?.error || err.message}`);
        } finally {
            setIsLoading(false);
        }
    }, [isAuthenticated, searchQuery, selectedSpecialty]);

    // Effect hook to fetch data whenever the activeTab, search, or specialty changes
    useEffect(() => {
        fetchCoaches(activeTab);
    }, [activeTab, fetchCoaches]);

    // Helper to format specialties for display
    const formatSpecialties = (specs) => (
        specs.slice(0, 3).map((spec, index) => (
            <span 
                key={index} 
                className="inline-block bg-primary-100 text-primary-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full"
            >
                {spec}
            </span>
        ))
    );

    const handleSearch = (e) => {
        e.preventDefault();
        fetchCoaches(activeTab); // Re-run fetch with current state
    };

    return (
        <div className="p-6">
            <h1 className="text-3xl font-heading font-bold text-foreground mb-4">
                {activeTab === 'all' ? 'Explore All Coaches' : 'My Followed Coaches'}
            </h1>

            {/* Tab Navigation */}
            <div className="flex border-b border-border mb-6">
                <button
                    className={`px-4 py-2 font-medium text-lg transition-colors duration-200 ${
                        activeTab === 'all' 
                            ? 'text-primary border-b-2 border-primary' 
                            : 'text-muted-foreground hover:text-primary-700'
                    }`}
                    onClick={() => setActiveTab('all')}
                >
                    All Coaches
                </button>
                <button
                    className={`px-4 py-2 font-medium text-lg transition-colors duration-200 ${
                        activeTab === 'followed' 
                            ? 'text-primary border-b-2 border-primary' 
                            : 'text-muted-foreground hover:text-primary-700'
                    }`}
                    onClick={() => setActiveTab('followed')}
                    disabled={!isAuthenticated} // Disable if client is not logged in
                >
                    Followed Coaches
                </button>
            </div>
            
            {/* Search and Filter Bar - Visible only for All Coaches tab */}
            {activeTab === 'all' && (
                <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 mb-6">
                    <Input
                        type="search"
                        placeholder="Search by name or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="flex-1"
                    />
                    <Select
                        value={selectedSpecialty}
                        onChange={(e) => setSelectedSpecialty(e.target.value)}
                        options={coachSpecialties}
                        className="md:w-64"
                    />
                    <Button type="submit" variant="primary">
                        Search
                    </Button>
                </form>
            )}

            {/* Content Area */}
            {isLoading && (
                <div className="text-center py-10 text-lg text-primary">
                    <Icon name="Loader" className="animate-spin mr-2" size={20} />
                    Loading coaches...
                </div>
            )}

            {error && (
                <div className="p-4 bg-danger-100 text-danger-800 rounded-md">
                    Error: {error}
                </div>
            )}

            {!isLoading && coaches.length === 0 && !error && (
                <div className="text-center py-10 text-muted-foreground">
                    {activeTab === 'all' 
                        ? 'No coaches match your search criteria.' 
                        : 'You are not currently following any coaches.'}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {coaches.map((coach) => (
                    <div key={coach.id} className="bg-card border border-border rounded-card shadow-soft p-4 flex flex-col transition-transform hover:shadow-elevated hover:scale-[1.01]">
                        <div className="flex items-center mb-4">
                            <div className="w-16 h-16 rounded-full overflow-hidden mr-4 flex-shrink-0">
                                <AppImage src={coach.profileImage} alt={coach.name} className="w-full h-full object-cover" />
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
                                // Direct to public profile (adjust path as per your routing)
                                onClick={() => window.location.href = `/profile/${coach.id}`} 
                            >
                                View Profile
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ExploreCoaches;