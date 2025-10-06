// Frontend/src/pages/dashboards/shared/coach-public-profile/index.jsx

import React, { useState, useEffect } from 'react';
// FIX: Ensure useParams is imported and used to read the ID from the URL
import { useParams } from 'react-router-dom'; 
import { getCoachById } from '@/auth/authApi'; 

// Corrected imports using the '@' alias for your UI components
import NavigationLoadingStates from '@/components/ui/NavigationLoadingStates';
import ProfileHeader from './components/ProfileHeader';
import AboutSection from './components/AboutSection';
import ServicesSection from './components/ServicesSection';
import TestimonialsSection from './components/TestimonialsSection';
import ContactSidebar from './components/ContactSidebar';

// This component now uses the ID from the URL params
const CoachPublicProfile = () => {
  // FIX: Use useParams to extract the 'id' from the URL
  const { id } = useParams(); 
  const coachId = id; // Rename for clarity in the rest of the component
    
  const [coach, setCoach] = useState(null);
  const [testimonials, setTestimonials] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCoachData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Use the coachId derived from the URL
      if (!coachId) {
        // If the ID is missing from the URL (e.g., /profiles), throw a local error
        throw new Error('Coach ID is missing from the URL.');
      }
      
      const response = await getCoachById(coachId);
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
  };

  useEffect(() => {
    fetchCoachData();
  }, [coachId]); 

  // --- Handlers for interactivity ---
  const handleBookSession = () => console.log('Booking functionality would be implemented here');
  const handleContact = (type, value) => console.log('Contact action:', { type, value });
  const handleServiceClick = (type, service) => console.log('Service selected:', { type, service });

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

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-8">
          <AboutSection coach={coach} />
          <ServicesSection 
            coach={coach} 
            onServiceClick={handleServiceClick}
          />
          <TestimonialsSection testimonials={testimonials} />
        </div>

        {/* Right Column - Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <ContactSidebar 
              coach={coach}
              onContact={handleContact}
              onBookSession={handleBookSession}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoachPublicProfile;