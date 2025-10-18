// Frontend/src/pages/dashboards/shared/coach-public-profile/index.jsx

import React, { useState, useEffect, useCallback } from 'react'; // 🚨 MODIFIED: Added useCallback
import { useParams, useNavigate } from 'react-router-dom'; 
import { getCoachById } from '@/auth/authApi'; 

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
    
  // FIX: Determine the final coachId: prefer prop over URL param
  const finalCoachId = propCoachId || urlCoachId;
    
  const [coach, setCoach] = useState(null);
  const [testimonials, setTestimonials] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 🚨 MODIFIED: Wrapped fetchCoachData in useCallback to prevent infinite useEffect loop
  const fetchCoachData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Use the determined finalCoachId
      if (!finalCoachId) {
        throw new Error('Coach ID is missing from the URL.');
      }
      
      // Use the final ID to fetch data
      const response = await getCoachById(finalCoachId);
      const fetchedCoach = response.data.coach;

      setCoach(fetchedCoach);
      setTestimonials(fetchedCoach.testimonials || []); 
      
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
  }, [finalCoachId]); // Dependency on finalCoachId

  // 🚨 NEW: Function to re-fetch data after a session is successfully booked
  const handleSessionBooked = () => {
      // Re-run the fetch logic to update the coach data, including the session booking status
      fetchCoachData();
  };

  useEffect(() => {
    // Depend on finalCoachId and fetchCoachData (due to useCallback)
    fetchCoachData();
  }, [finalCoachId, fetchCoachData]); 

  // --- Handlers for interactivity ---
  // Note: ServicesSection child component now handles its own booking logic directly
  const handleBookSession = () => console.log('Booking functionality would be implemented here'); 
  const handleContact = (type, value) => console.log('Contact action:', { type, value });
  const handleServiceClick = (type, service) => console.log('Service selected:', { type, service });

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
        onBookSession={handleBookSession}
        onContact={handleContact}
      />

      {/* Main Content Sections - Now full width, stacked */}
      <div className="space-y-8">
        <AboutSection coach={coach} />
        <ServicesSection 
          coach={coach} 
          // 🚨 NEW PROP: Pass the callback to refresh the coach data
          onSessionBooked={handleSessionBooked}
          onServiceClick={handleServiceClick}
        />
        <TestimonialsSection testimonials={testimonials} />
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