import React, { useState, useEffect, useCallback } from 'react'; // <-- ADD hooks
import Icon from '@/components/AppIcon';
import Image from '@/components/AppImage';
import Button from '@/components/ui/Button';
import { useAuth } from '@/auth/AuthContext'; // Assuming AuthContext provides user info
import axios from 'axios'; 

// Load backend URL from .env (fallback to localhost:4028)
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:4028";
const API_URL = `${API_BASE_URL}/api/coach/public`; // Base for public coach profile routes

// Helper to construct the full image source URL for server-uploaded files
const getFullImageSrc = (path) => {
    // Check if the path is a string and starts with the expected upload prefix
    if (typeof path === 'string' && path.startsWith('/uploads/')) {
        return `${API_BASE_URL}${path}`;
    }
    return path;
};

// Helper function to fetch the user's token (must be consistent with authApi.js)
const getAuthToken = () => {
    return localStorage.getItem('accessToken'); 
};

const ProfileHeader = ({ coach, onBookSession, onContact }) => {
    const { user, roles, logout } = useAuth() || {}; 
    const isAuthenticated = !!user;
    // Check if the current user is a client (assuming 'client' role is set up)
    const isClient = isAuthenticated && roles?.includes('client'); 

    // State to manage the follow status
    const [isFollowing, setIsFollowing] = useState(false);
    const [isLoadingFollow, setIsLoadingFollow] = useState(false);
    
    // Determine if the current user is the coach themselves
    const isCoachSelf = isAuthenticated && user?.id === coach?.id;
    
    // --- API Call Functions ---
    const fetchFollowStatus = useCallback(async () => {
        if (!isAuthenticated || !isClient || !coach?.id || isCoachSelf) {
            return;
        }

        setIsLoadingFollow(true);
        try {
            const token = getAuthToken();
            const response = await axios.get(`${API_URL}/${coach.id}/follow-status`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                withCredentials: true
            });
            
            setIsFollowing(response.data.isFollowing);
        } catch (error) {
            console.error('Failed to fetch follow status:', error);
            // Optionally set error state or keep isFollowing false
        } finally {
            setIsLoadingFollow(false);
        }
    }, [isAuthenticated, isClient, coach?.id, isCoachSelf]);

    // Function to handle follow/unfollow action
    const handleFollowToggle = async () => {
        if (!isAuthenticated || !isClient || isCoachSelf) {
            alert('Please log in as a client to follow a coach.');
            return;
        }

        setIsLoadingFollow(true);
        const token = getAuthToken();
        const method = isFollowing ? 'DELETE' : 'POST';
        const url = `${API_URL}/${coach.id}/follow`;

        try {
            const response = await axios({
                method: method,
                url: url,
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                withCredentials: true
            });
            
            // The backend returns a status flag, which is definitive
            setIsFollowing(response.data.isFollowing);
        } catch (error) {
            console.error('Failed to toggle follow status:', error);
            alert(error.response?.data?.message || 'Failed to update follow status.');
        } finally {
            setIsLoadingFollow(false);
        }
    };
    // --- End API Call Functions ---


    // Effect to fetch initial follow status
    useEffect(() => {
        fetchFollowStatus();
    }, [fetchFollowStatus]);

    const formatRating = (rating) => {
        return rating ? parseFloat(rating)?.toFixed(1) : '0.0';
    };

    const formatExperience = (years) => {
        return years === 1 ? '1 year' : `${years} years`;
    };

    return (
        <div className="bg-card rounded-card p-6 mb-6 shadow-soft">
            <div className="flex flex-col lg:flex-row items-start lg:items-center space-y-6 lg:space-y-0 lg:space-x-8">
                {/* Profile Image */}
                <div className="flex-shrink-0">
                    <div className="w-32 h-32 lg:w-40 lg:h-40 rounded-full overflow-hidden shadow-elevated">
                        <Image
                            src={getFullImageSrc(coach?.profileImage)}
                            alt={`${coach?.name} - Professional Coach`}
                            className="w-full h-full object-cover"
                        />
                    </div>
                </div>

                {/* Profile Info */}
                <div className="flex-1 min-w-0">
                    <div className="mb-4">
                        <h1 className="text-3xl lg:text-4xl font-heading font-bold text-foreground mb-2">
                            {coach?.name}
                        </h1>
                        <p className="text-xl text-secondary font-medium mb-3">
                            {coach?.title}
                        </p>
                        <p className="text-muted-foreground leading-relaxed">
                            {coach?.shortBio}
                        </p>
                    </div>

                    {/* Key Metrics */}
                    <div className="flex flex-wrap items-center gap-6 mb-6">
                        {/* ... (Rating and other metrics display remains the same) ... */}
                        <div className="flex items-center space-x-2">
                            <div className="flex items-center">
                                {/* Star Rating Icons */}
                                {[1, 2, 3, 4, 5]?.map((star) => (
                                    <Icon
                                        key={star}
                                        name="Star"
                                        size={18}
                                        className={`${
                                            star <= Math.floor(coach?.rating)
                                                ? 'text-warning fill-current' :'text-border'
                                        }`}
                                    />
                                ))}
                            </div>
                            <span className="font-semibold text-foreground">
                                {formatRating(coach?.rating)}
                            </span>
                            <span className="text-muted-foreground">
                                ({coach?.totalReviews} reviews)
                            </span>
                        </div>

                        <div className="flex items-center space-x-2 text-muted-foreground">
                            <Icon name="Users" size={18} className="text-primary" />
                            <span className="font-medium">
                                {coach?.totalClients?.toLocaleString()} clients helped
                            </span>
                        </div>

                        <div className="flex items-center space-x-2 text-muted-foreground">
                            <Icon name="Calendar" size={18} className="text-primary" />
                            <span className="font-medium">
                                {formatExperience(coach?.yearsExperience)} experience
                            </span>
                        </div>
                    </div>

                    {/* Contact Information */}
                    <div className="flex flex-wrap items-center gap-4 mb-6">
                        {coach?.email && (
                            <button
                                onClick={() => onContact('email', coach?.email)}
                                className="flex items-center space-x-2 text-muted-foreground hover:text-primary transition-smooth"
                            >
                                <Icon name="Mail" size={16} />
                                <span className="text-sm font-medium">{coach?.email}</span>
                            </button>
                        )}
                        
                        {coach?.phone && (
                            <button
                                onClick={() => onContact('phone', coach?.phone)}
                                className="flex items-center space-x-2 text-muted-foreground hover:text-primary transition-smooth"
                            >
                                <Icon name="Phone" size={16} />
                                <span className="text-sm font-medium">{coach?.phone}</span>
                            </button>
                        )}

                        {coach?.website && (
                            <button
                                onClick={() => onContact('website', coach?.website)}
                                className="flex items-center space-x-2 text-muted-foreground hover:text-primary transition-smooth"
                            >
                                <Icon name="Globe" size={16} />
                                <span className="text-sm font-medium">Website</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col space-y-3 w-full lg:w-auto">
                    {/* FOLLOW / UNFOLLOW Button - Only visible for logged-in clients, not for self */}
                    {isAuthenticated && isClient && !isCoachSelf && (
                        <Button
                            variant={isFollowing ? "outline" : "primary"}
                            size="default"
                            onClick={handleFollowToggle}
                            iconName={isFollowing ? "UserMinus" : "UserPlus"}
                            iconPosition="left"
                            isLoading={isLoadingFollow}
                            disabled={isLoadingFollow}
                            className="w-full lg:w-48 order-1 lg:order-1" 
                        >
                            {isFollowing ? "Unfollow Coach" : "Follow Coach"}
                        </Button>
                    )}

                </div>
            </div>
        </div>
    );
};

export default ProfileHeader;