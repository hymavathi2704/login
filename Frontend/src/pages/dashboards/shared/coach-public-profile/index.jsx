// Frontend/src/pages/dashboards/shared/coach-public-profile/index.jsx

import React, { useState, useEffect, useCallback } from 'react'; 
import { useParams, useNavigate } from 'react-router-dom'; 
import { getCoachById, checkClientReviewEligibility } from '@/auth/authApi'; 
import { useAuth } from '@/auth/AuthContext'; 

import NavigationLoadingStates from '@/components/ui/NavigationLoadingStates';
import Button from '@/components/ui/Button'; 
import ProfileHeader from './components/ProfileHeader';
import AboutSection from './components/AboutSection';
import ServicesSection from './components/ServicesSection';
import TestimonialsSection from './components/TestimonialsSection';

const CoachPublicProfile = ({ coachId: propCoachId }) => {
    const { id: urlCoachId } = useParams(); 
    const navigate = useNavigate();
    
    const { user, isAuthenticated, roles } = useAuth();
    
    const finalCoachId = propCoachId || urlCoachId;
    
    const [coach, setCoach] = useState(null);
    const [testimonials, setTestimonials] = useState([]); 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const [isReviewEligible, setIsReviewEligible] = useState(false);
    const isClient = isAuthenticated && roles?.includes('client');
    const isCoachSelf = isAuthenticated && user?.id === finalCoachId;


    const fetchCoachData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            if (!finalCoachId) {
                throw new Error('Invalid Profile Link: Coach ID is missing.');
            }
            
            // 1. Fetch Coach Profile Data
            const response = await getCoachById(finalCoachId);
            const fetchedCoach = response.data.coach;

            setCoach(fetchedCoach);
            setTestimonials(fetchedCoach.testimonials || []); 
            
            // 2. Fetch Review Eligibility
            if (isAuthenticated && isClient && !isCoachSelf) {
                const eligibilityResponse = await checkClientReviewEligibility(finalCoachId);
                // Check if any eligible sessions were returned
                setIsReviewEligible(eligibilityResponse.data.eligibleSessions?.length > 0); 
            } else {
                setIsReviewEligible(false);
            }
            
        } catch (err) {
            console.error("Failed to fetch coach data:", err);
            const errorMessage = err.response?.status === 404 
                ? 'Coach profile not found. The URL may be incorrect.' 
                : (err?.message || 'Failed to load profile.');
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [finalCoachId, isAuthenticated, isClient, isCoachSelf]); 

    const handleDataRefresh = () => {
        fetchCoachData();
    };

    useEffect(() => {
        fetchCoachData();
    }, [finalCoachId, fetchCoachData]); 

    const handleContact = (type, value) => console.log('Contact action:', { type, value });

    const handleExploreMore = () => {
        navigate('/dashboard/client/explore'); 
    };

    if (loading) {
        return <NavigationLoadingStates isLoading={true} loadingType="profile" />;
    }

    if (error || !coach) {
        return <NavigationLoadingStates 
                  error={error || 'Profile could not be loaded.'} 
                  retryAction={fetchCoachData} 
                  loadingType="profile"
                />;
    }
    
    return (
        <div className="space-y-8">
            {/* Profile Header */}
            <ProfileHeader 
                coach={coach}
                onContact={handleContact}
            />

            {/* Main Content Sections - Now full width, stacked */}
            <div className="space-y-8">
                <AboutSection coach={coach} />
                <ServicesSection 
                    coach={coach} 
                    onSessionBooked={handleDataRefresh}
                />
                <TestimonialsSection 
                    testimonials={testimonials} 
                    coachId={finalCoachId}
                    isReviewEligible={isReviewEligible}
                    onTestimonialSubmitted={handleDataRefresh} 
                />
            </div>

            {/* ADDED: Explore More Coaches Button */}
            <div className="flex justify-center pt-8">
                <Button 
                    variant="secondary" 
                    size="lg"
                    onClick={handleExploreMore}
                    iconName="ArrowRight" 
                >
                    Explore More Coaches
                </Button>
            </div>
        </div>
    );
};

export default CoachPublicProfile;