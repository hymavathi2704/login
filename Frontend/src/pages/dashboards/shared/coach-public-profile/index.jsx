import React, { useState, useEffect } from 'react';

// Corrected imports using the '@' alias for your UI components
import NavigationLoadingStates from '@/components/ui/NavigationLoadingStates';
import ProfileHeader from './components/ProfileHeader';
import AboutSection from './components/AboutSection';
import ServicesSection from './components/ServicesSection';
import TestimonialsSection from './components/TestimonialsSection';
import ContactSidebar from './components/ContactSidebar';

// This component now receives `coachId` as a prop instead of using useParams
const CoachPublicProfile = ({ coachId }) => {
  const [coach, setCoach] = useState(null);
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- MOCK DATA IS INCLUDED AS REQUESTED ---
  const mockCoachData = {
    id: 'coach-001',
    name: 'Dr. Sarah Mitchell',
    title: 'Executive Leadership Coach & Business Strategist',
    shortBio: 'Empowering leaders to unlock their potential and drive organizational transformation through strategic coaching and mentorship.',
    fullBio: `Dr. Sarah Mitchell is a seasoned executive coach with over 15 years of experience helping C-suite executives and emerging leaders navigate complex business challenges. Her unique approach combines psychological insights with practical business acumen to create lasting behavioral change.\n\nWith a Ph.D. in Organizational Psychology and an MBA from Wharton, Sarah has worked with Fortune 500 companies, startups, and non-profit organizations across various industries. Her coaching methodology focuses on authentic leadership development, strategic thinking, and building high-performing teams.`,
    profileImage: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face',
    rating: 4.9,
    totalReviews: 127,
    totalClients: 450,
    yearsExperience: 15,
    email: 'sarah.mitchell@coachprofile.com',
    phone: '+1 (555) 123-4567',
    website: 'https://sarahmitchellcoaching.com',
    isAvailable: true,
    avgResponseTime: '2 hours',
    timezone: 'EST (UTC-5)',
    startingPrice: 150,
    specialties: [
      'Executive Leadership','Strategic Planning','Team Development','Change Management','Performance Coaching','Career Transition'
    ],
    languages: ['English', 'Spanish', 'French'],
    coachingApproach: 'My coaching approach is rooted in positive psychology and systems thinking. I believe in creating a safe, supportive environment where leaders can explore their challenges, identify their strengths, and develop actionable strategies for growth.',
    certifications: [
      { title: 'Certified Executive Coach (CEC)', institution: 'International Coach Federation', year: '2018' },
      { title: 'Ph.D. in Organizational Psychology', institution: 'Stanford University', year: '2009' },
    ],
    sessions: [
      { id: 'session-001', title: 'Executive Leadership Intensive', description: 'Comprehensive one-on-one coaching session.', duration: 90, price: 250, format: 'Video Call' },
      { id: 'session-002', title: 'Career Transition Coaching', description: 'Specialized coaching for executives navigating career changes.', duration: 60, price: 180, format: 'Video Call' },
    ],
    events: [
      { id: 'event-001', title: 'Leadership Excellence Workshop', description: 'Interactive workshop for mid-level managers.', date: '2025-11-15', time: '2:00 PM - 5:00 PM EST', price: 150, maxParticipants: 20, enrolledCount: 12 },
      { id: 'event-002', title: 'Women in Leadership Masterclass', description: 'Empowering workshop for women leaders.', date: '2025-11-22', time: '10:00 AM - 1:00 PM EST', price: 120, maxParticipants: 15, enrolledCount: 8 },
    ]
  };

  const mockTestimonials = [
    { id: 'testimonial-001', clientName: 'Michael Rodriguez', clientTitle: 'CEO, TechVision Inc.', clientAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face', rating: 5, content: `Sarah's coaching transformed my leadership approach completely.`, date: '2025-09-15', sessionType: 'Executive Leadership Intensive' },
    { id: 'testimonial-002', clientName: 'Jennifer Chen', clientTitle: 'VP of Operations, Global Solutions', clientAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face', rating: 5, content: `Working with Sarah during my career transition was invaluable.`, date: '2025-08-28', sessionType: 'Career Transition Coaching' },
  ];
  // --- END OF MOCK DATA ---

  useEffect(() => {
    const fetchCoachData = async () => {
      setLoading(true);
      setError(null);
      try {
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
        
        // This logic uses the mock data. In the future, you would replace this with your API call.
        if (coachId) {
          setCoach(mockCoachData);
          setTestimonials(mockTestimonials);
        } else {
          throw new Error('Coach not found');
        }
      } catch (err) {
        setError(err?.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCoachData();
  }, [coachId]);

  // --- Handlers for interactivity ---
  const handleBookSession = () => alert('Booking functionality would be implemented here');
  const handleContact = (type, value) => console.log('Contact action:', { type, value });
  const handleServiceClick = (type, service) => console.log('Service selected:', { type, service });

  if (loading) {
    return <NavigationLoadingStates isLoading={true} loadingType="profile" />;
  }

  if (error) {
    return <NavigationLoadingStates 
              error={error} 
              retryAction={fetchCoachData} 
              loadingType="profile"
           />;
  }
  
  // This component no longer renders a <Header> or a full-page layout div.
  // It only renders the profile content, which will be placed inside the DashboardLayout's main area.
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

