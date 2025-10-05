import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import BreadcrumbNavigation from '../../components/ui/BreadcrumbNavigation';
import NavigationLoadingStates from '../../components/ui/NavigationLoadingStates';
import ProfileHeader from './components/ProfileHeader';
import AboutSection from './components/AboutSection';
import ServicesSection from './components/ServicesSection';
import TestimonialsSection from './components/TestimonialsSection';
import ContactSidebar from './components/ContactSidebar';

const CoachPublicProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [coach, setCoach] = useState(null);
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Mock coach data
  const mockCoachData = {
    id: 'coach-001',
    name: 'Dr. Sarah Mitchell',
    title: 'Executive Leadership Coach & Business Strategist',
    shortBio: 'Empowering leaders to unlock their potential and drive organizational transformation through strategic coaching and mentorship.',
    fullBio: `Dr. Sarah Mitchell is a seasoned executive coach with over 15 years of experience helping C-suite executives and emerging leaders navigate complex business challenges. Her unique approach combines psychological insights with practical business acumen to create lasting behavioral change.

With a Ph.D. in Organizational Psychology and an MBA from Wharton, Sarah has worked with Fortune 500 companies, startups, and non-profit organizations across various industries. Her coaching methodology focuses on authentic leadership development, strategic thinking, and building high-performing teams.

Sarah's passion lies in helping leaders discover their authentic voice while developing the skills necessary to inspire and motivate others. She believes that great leadership starts with self-awareness and extends through emotional intelligence, strategic vision, and the ability to create meaningful connections with team members.`,
    profileImage: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face',rating: 4.9,totalReviews: 127,totalClients: 450,yearsExperience: 15,email: 'sarah.mitchell@coachprofile.com',phone: '+1 (555) 123-4567',website: 'https://sarahmitchellcoaching.com',isAvailable: true,avgResponseTime: '2 hours',timezone: 'EST (UTC-5)',
    startingPrice: 150,
    specialties: [
      'Executive Leadership','Strategic Planning','Team Development','Change Management','Performance Coaching','Career Transition'
    ],
    languages: ['English', 'Spanish', 'French'],
    coachingApproach: 'My coaching approach is rooted in positive psychology and systems thinking. I believe in creating a safe, supportive environment where leaders can explore their challenges, identify their strengths, and develop actionable strategies for growth. Each coaching relationship is tailored to the individual\'s unique needs and organizational context.',
    certifications: [
      {
        title: 'Certified Executive Coach (CEC)',
        institution: 'International Coach Federation',
        year: '2018'
      },
      {
        title: 'Ph.D. in Organizational Psychology',
        institution: 'Stanford University',
        year: '2009'
      },
      {
        title: 'MBA in Strategic Management',
        institution: 'Wharton School, University of Pennsylvania',
        year: '2006'
      },
      {
        title: 'Certified Team Coach',
        institution: 'Center for Executive Coaching',
        year: '2020'
      }
    ],
    sessions: [
      {
        id: 'session-001',
        title: 'Executive Leadership Intensive',
        description: 'Comprehensive one-on-one coaching session focused on leadership development, strategic thinking, and executive presence.',
        duration: 90,
        price: 250,
        format: 'Video Call'
      },
      {
        id: 'session-002',
        title: 'Career Transition Coaching',
        description: 'Specialized coaching for executives navigating career changes, role transitions, or industry shifts.',
        duration: 60,
        price: 180,
        format: 'Video Call'
      },
      {
        id: 'session-003',
        title: 'Strategic Planning Session',
        description: 'Deep-dive session to develop strategic thinking skills and create actionable business strategies.',
        duration: 120,
        price: 300,
        format: 'Video Call'
      },
      {
        id: 'session-004',
        title: 'Quick Consultation',
        description: 'Brief consultation for specific challenges or questions. Perfect for ongoing coaching clients.',
        duration: 30,
        price: 100,
        format: 'Phone Call'
      }
    ],
    events: [
      {
        id: 'event-001',
        title: 'Leadership Excellence Workshop',
        description: 'Interactive workshop covering essential leadership skills for mid-level managers and emerging leaders.',
        date: '2025-11-15',
        time: '2:00 PM - 5:00 PM EST',
        price: 150,
        maxParticipants: 20,
        enrolledCount: 12
      },
      {
        id: 'event-002',
        title: 'Women in Leadership Masterclass',
        description: 'Empowering workshop specifically designed for women leaders to overcome challenges and accelerate career growth.',
        date: '2025-11-22',
        time: '10:00 AM - 1:00 PM EST',
        price: 120,
        maxParticipants: 15,
        enrolledCount: 8
      },
      {
        id: 'event-003',
        title: 'Strategic Thinking Bootcamp',
        description: 'Intensive two-day program focused on developing strategic thinking capabilities for senior executives.',
        date: '2025-12-05',
        time: '9:00 AM - 4:00 PM EST',
        price: 450,
        maxParticipants: 12,
        enrolledCount: 12
      }
    ]
  };

  const mockTestimonials = [
    {
      id: 'testimonial-001',
      clientName: 'Michael Rodriguez',
      clientTitle: 'CEO, TechVision Inc.',
      clientAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
      rating: 5,
      content: `Sarah's coaching transformed my leadership approach completely. Her insights into strategic thinking and team dynamics helped me navigate a major organizational restructuring successfully. The ROI on her coaching has been immeasurable.`,
      date: '2025-09-15',sessionType: 'Executive Leadership Intensive'
    },
    {
      id: 'testimonial-002',clientName: 'Jennifer Chen',clientTitle: 'VP of Operations, Global Solutions',clientAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
      rating: 5,
      content: `Working with Sarah during my career transition was invaluable. She helped me identify my core strengths and develop a clear strategy for moving into a C-suite role. I'm now thriving in my new position as COO.`,
      date: '2025-08-28',
      sessionType: 'Career Transition Coaching'
    },
    {
      id: 'testimonial-003',
      clientName: 'David Thompson',
      clientTitle: 'Director of Marketing, InnovateCorp',
      clientAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
      rating: 5,
      content: `Sarah's strategic planning sessions revolutionized how I approach business challenges. Her methodology is practical yet profound, and the tools she provided continue to serve me well in my daily leadership responsibilities.`,
      date: '2025-09-02',sessionType: 'Strategic Planning Session'
    },
    {
      id: 'testimonial-004',clientName: 'Lisa Park',clientTitle: 'Founder, StartupSuccess',clientAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',rating: 4,content: `As a first-time CEO, I was overwhelmed with the responsibilities. Sarah's coaching gave me the confidence and skills I needed to lead effectively. Her support during our scaling phase was crucial to our success.`,
      date: '2025-08-10',
      sessionType: 'Executive Leadership Intensive'
    }
  ];

  useEffect(() => {
    const fetchCoachData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // In a real app, this would be an API call
        if (id === 'coach-001' || !id) {
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
  }, [id]);

  const handleBookSession = () => {
    // In a real app, this would navigate to booking flow
    alert('Booking functionality would be implemented here');
  };

  const handleContact = (type, value) => {
    switch (type) {
      case 'email':
        window.location.href = `mailto:${value}`;
        break;
      case 'phone':
        window.location.href = `tel:${value}`;
        break;
      case 'website':
        window.open(value, '_blank');
        break;
      case 'message': alert('Message functionality would be implemented here');
        break;
      case 'favorite': alert('Favorite functionality would be implemented here');
        break;
      default:
        break;
    }
  };

  const handleServiceClick = (type, service) => {
    if (type === 'session') {
      alert(`Booking ${service?.title} - This would navigate to booking page`);
    } else if (type === 'event') {
      alert(`Registering for ${service?.title} - This would navigate to registration page`);
    }
  };

  const handleReturnToExplore = () => {
    navigate('/enhanced-explore-coaches');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <NavigationLoadingStates isLoading={true} loadingType="profile" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <NavigationLoadingStates 
            error={error} 
            retryAction={() => window.location?.reload()} 
            loadingType="profile"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb Navigation */}
        <div className="mb-6">
          <BreadcrumbNavigation 
            coachName={coach?.name}
            onReturn={handleReturnToExplore}
          />
        </div>

        {/* Profile Header */}
        <ProfileHeader 
          coach={coach}
          onBookSession={handleBookSession}
          onContact={handleContact}
        />

        {/* Main Content */}
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
    </div>
  );
};

export default CoachPublicProfile;