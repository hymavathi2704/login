// Frontend/src/pages/dashboards/shared/coach-public-profile/index.jsx

import React, { useState, useEffect, useCallback } from 'react'; 
import { useParams, useNavigate } from 'react-router-dom'; 
// 🔑 UPDATED IMPORTS: Added checkClientReviewEligibility and useAuth
import { getCoachById, checkClientReviewEligibility } from '@/auth/authApi'; 
import { useAuth } from '@/auth/AuthContext'; 

import NavigationLoadingStates from '@/components/ui/NavigationLoadingStates';
import Button from '@/components/ui/Button'; 
import ProfileHeader from './components/ProfileHeader';
import AboutSection from './components/AboutSection';
import ServicesSection from './components/ServicesSection';
import TestimonialsSection from './components/TestimonialsSection';

const CoachPublicProfile = ({ coachId: propCoachId }) => {
  // Use useParams to extract the 'id' from the URL (used when navigating directly)
  const { id: urlCoachId } = useParams(); 
  // ADDED: Initialize navigation hook
  const navigate = useNavigate();
    
  // 🔑 NEW: Use AuthContext to get user status and roles
  const { user, isAuthenticated, roles } = useAuth();
    
  // FIX: Determine the final coachId: prefer prop over URL param
  const finalCoachId = propCoachId || urlCoachId;
    
  // 🔑 NEW: Derived state for clarity
  const isClient = isAuthenticated && roles?.includes('client');
  const isCoachSelf = isAuthenticated && user?.id === finalCoachId;
    
  const [coach, setCoach] = useState(null);
  const [testimonials, setTestimonials] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // 🔑 NEW STATE: Review eligibility
  const [isReviewEligible, setIsReviewEligible] = useState(false);


  // 🚨 MODIFIED: Wrapped fetchCoachData in useCallback to prevent infinite useEffect loop
  const fetchCoachData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Use the determined finalCoachId
      if (!finalCoachId) {
        throw new Error('Coach ID is missing from the URL.');
      }
      
      // 1. Fetch Coach Profile Data
      const response = await getCoachById(finalCoachId);
      const fetchedCoach = response.data.coach;

      setCoach(fetchedCoach);
      setTestimonials(fetchedCoach.testimonials || []); 
      
      // 2. 🔑 NEW LOGIC: Fetch Review Eligibility (Only for logged-in clients viewing another coach)
      if (isAuthenticated && isClient && !isCoachSelf) {
          const eligibilityResponse = await checkClientReviewEligibility(finalCoachId);
          setIsReviewEligible(eligibilityResponse.data.isEligible);
      } else {
          setIsReviewEligible(false);
      }
      
    } catch (err) {
      console.error("Failed to fetch coach data:", err);
      // Backend should return 404, which is handled here
      const errorMessage = err.response?.status === 404 
        ? 'Coach profile not found. The profile record may not exist in the database yet.' 
        : (err?.message || 'Failed to load profile.');
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
    // 🔑 UPDATED DEPENDENCIES
  }, [finalCoachId, isAuthenticated, isClient, isCoachSelf]); 

  // 🚨 NEW: Function to re-fetch data after a session is successfully booked OR a testimonial is submitted
  const handleSessionBooked = () => {
      // Re-run the fetch logic to update the coach data and eligibility status
      fetchCoachData();
  };

  useEffect(() => {
    // Depend on finalCoachId and fetchCoachData (due to useCallback)
    fetchCoachData();
  }, [finalCoachId, fetchCoachData]); 

  // --- Handlers for interactivity (CLEANED UP) ---
  // ❌ REMOVED: handleBookSession and handleServiceClick as logic moved to child components
  const handleContact = (type, value) => console.log('Contact action:', { type, value });

  // ADDED: Handler for new button
  const handleExploreMore = () => {
    // FIX: Navigating to the correct, existing client dashboard route
    navigate('/dashboard/client/explore-coaches'); // Assuming 'explore-coaches' is the proper destination
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
  
  // The rest of the component uses the 'coach' state, which now holds real data
  return (
    <div className="space-y-8">
      {/* Profile Header */}
      <ProfileHeader 
        coach={coach}
        // Removed onBookSession prop
        onContact={handleContact}
      />

      {/* Main Content Sections - Now full width, stacked */}
      <div className="space-y-8">
        <AboutSection coach={coach} />
        <ServicesSection 
          coach={coach} 
          // 🚨 NEW PROP: Pass the callback to refresh the coach data
          onSessionBooked={handleSessionBooked}
          // Removed onServiceClick prop
        />
        {/* 🔑 MODIFIED: Pass eligibility status, coach ID, and callback */}
        <TestimonialsSection 
            testimonials={testimonials} 
            coachId={finalCoachId}
            isReviewEligible={isReviewEligible}
            onTestimonialSubmitted={fetchCoachData} 
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