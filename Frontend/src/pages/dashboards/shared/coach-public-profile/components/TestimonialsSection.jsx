// Frontend/src/pages/dashboards/shared/coach-public-profile/components/TestimonialsSection.jsx
import React, { useState, useEffect, useCallback } from 'react'; 
import Icon from '@/components/AppIcon';
import Image from '@/components/AppImage';
import Button from '@/components/ui/Button'; 
import Input from '@/components/ui/Input'; 
import Select from '@/components/ui/Select'; 
// Assuming you have utility imports for Select subcomponents
// import { SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/Select'; 
import { Textarea } from '@/components/ui/Textarea'; 
import { X, Star as StarIcon, MessageCircle, XCircle } from 'lucide-react'; 
import { toast } from 'sonner';

// ===================================
// 🔑 MOCK API IMPLEMENTATION (REPLACE WITH REAL AXIOS/FETCH LOGIC)
// ===================================

const api = { 
    post: (url, data) => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (Math.random() > 0.1) {
                    resolve({ data: { message: 'Testimonial created successfully' } });
                } else {
                    reject({ response: { data: { error: "Mock submission failed due to server error." }}});
                }
            }, 1000);
        });
    },
    get: (url) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                // 🔑 MOCK: Only return sessions if the coachId is 'coach-123' to simulate eligibility
                const coachId = url.split('/').slice(-2)[0];
                let mockSessions = [];
                // If the coach ID matches a coach with eligible sessions, return data.
                if (coachId === 'coach-123') { 
                     mockSessions = [
                        { id: 101, title: 'Career Strategy Session (Booking: 101)' }, // Booking ID is used here
                        { id: 102, title: '3-Month Coaching Package (Booking: 102)' },
                    ];
                }
                
                resolve({ 
                    data: { 
                        eligibleSessions: mockSessions
                    } 
                });
            }, 500);
        });
    }
};

const checkClientReviewEligibility = async (coachId) => {
    return api.get(`/api/coach/public/${coachId}/review-eligibility`);
}

const submitTestimonial = async (coachId, data) => {
    return api.post(`/api/coach/public/${coachId}/testimonials`, data);
};
// ===================================


const TestimonialsSection = ({ 
    testimonials, 
    coachId, 
    onTestimonialSubmitted 
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [eligibleSessions, setEligibleSessions] = useState([]);
  const [isCheckingEligibility, setIsCheckingEligibility] = useState(true);

  // Button visibility depends on having sessions to review
  const isReviewEligible = eligibleSessions.length > 0;
  
  const [form, setForm] = useState({
      rating: 5,
      clientTitle: '',
      content: '',
      sessionId: '', // Stores the Booking ID
  });
  const [validationError, setValidationError] = useState('');


  const fetchEligibleSessions = useCallback(async () => {
    if (!coachId) return;
    setIsCheckingEligibility(true);
    try {
        const response = await checkClientReviewEligibility(coachId);
        
        const sessions = response.data.eligibleSessions || []; 
        setEligibleSessions(sessions);
        
        if (sessions.length > 0) {
            setForm(prev => ({ ...prev, sessionId: sessions[0].id }));
        } else {
            setForm(prev => ({ ...prev, sessionId: '' }));
        }
    } catch (error) {
        console.error("Failed to fetch review eligibility and sessions:", error);
        setEligibleSessions([]);
    } finally {
        setIsCheckingEligibility(false);
    }
  }, [coachId]);
  
  useEffect(() => {
      fetchEligibleSessions();
  }, [fetchEligibleSessions]);

  const formatDate = (dateString) => {
    return new Date(dateString)?.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleFormChange = (e) => {
      const { name, value } = e.target;
      setForm(prev => ({ ...prev, [name]: value }));
      setValidationError('');
  };
  
  // Generic handler for the Select component
  const handleSelectChange = (name, value) => {
    setForm(prev => ({ ...prev, [name]: value }));
    setValidationError('');
  };

  const handleRatingChange = (newRating) => {
      setForm(prev => ({ ...prev, rating: newRating }));
      setValidationError('');
  };

  const handleSubmit = async (e) => {
      e.preventDefault();
      
      // 🔑 CRITICAL VALIDATION: Must have a rating, content, and selected session (Booking ID)
      if (form.rating < 1 || !form.content.trim() || !form.sessionId) {
          setValidationError('Please provide a rating, write your testimonial, and select a completed session.');
          return;
      }
      
      setIsSubmitting(true);
      
      try {
          const submissionData = {
              rating: form.rating,
              content: form.content,
              clientTitle: form.clientTitle,
              sessionId: form.sessionId, // This is the Booking ID
          };

          await submitTestimonial(coachId, submissionData);
          
          toast.success('Thank you! Your testimonial has been submitted successfully.');
          setIsModalOpen(false);
          
          if (onTestimonialSubmitted) {
              onTestimonialSubmitted(); 
          }
          
          await fetchEligibleSessions(); // Re-check eligibility to update the button count
          
          setForm({ rating: 5, clientTitle: '', content: '', sessionId: eligibleSessions[0]?.id || '' });
          
      } catch (error) {
          console.error("Testimonial submission failed:", error);
          toast.error(error.response?.data?.error || "Failed to submit testimonial. Please try again."); 
      } finally {
          setIsSubmitting(false);
      }
  };


  // --- Render Logic ---
  if (!testimonials || testimonials?.length === 0) {
    return (
      <div className="bg-card rounded-card p-6 shadow-soft">
        <h2 className="text-2xl font-heading font-semibold text-foreground mb-6">
          Client Testimonials
        </h2>
        
        {/* 🔑 DYNAMIC ELIGIBILITY CHECK & MESSAGE */}
        {isReviewEligible ? (
            <div className="border border-dashed border-primary/50 bg-primary/5 p-4 rounded-lg text-center mb-6">
                <p className="text-primary text-sm font-medium mb-3">
                    You have **{eligibleSessions.length} completed session{eligibleSessions.length > 1 ? 's' : ''}** eligible for review.
                </p>
                <Button 
                    variant="primary" 
                    onClick={() => setIsModalOpen(true)}
                    iconName="Edit"
                    iconPosition="left"
                    size="sm"
                >
                    Write a Testimonial
                </Button>
            </div>
        ) : isCheckingEligibility ? (
              <p className="text-center text-muted-foreground py-4">Checking review eligibility...</p>
        ) : (
            <div className="text-center py-4 text-muted-foreground">You must complete a session with this coach to write a testimonial.</div>
        )}

        <div className="text-center py-12">
          <Icon name="MessageSquare" size={48} className="text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No testimonials available yet.</p>
        </div>
        
        {renderTestimonialModal(isModalOpen, setIsModalOpen, form, handleFormChange, handleRatingChange, handleSubmit, validationError, isSubmitting, eligibleSessions, handleSelectChange)}
      </div>
    );
  }

  // ... (rest of the component structure)

  return (
    <div className="bg-card rounded-card p-6 shadow-soft">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-heading font-semibold text-foreground">
          Client Testimonials
        </h2>
        
        {isReviewEligible && (
            <Button 
                variant="primary" 
                onClick={() => setIsModalOpen(true)}
                iconName="Edit"
                iconPosition="left"
                size="sm"
            >
                Write a Testimonial
            </Button>
        )}
      </div>
      {/* ... (Testimonial List Rendering) */}
      {renderTestimonialModal(isModalOpen, setIsModalOpen, form, handleFormChange, handleRatingChange, handleSubmit, validationError, isSubmitting, eligibleSessions, handleSelectChange)}
    </div>
  );
};

// ===================================
// 🔑 UPDATED: Testimonial Modal Component
// ===================================
const renderTestimonialModal = (isOpen, setIsOpen, form, handleFormChange, handleRatingChange, handleSubmit, validationError, isSubmitting, eligibleSessions, handleSelectChange) => {
    if (!isOpen) return null;

    const sessionOptions = eligibleSessions.map(session => ({
        value: session.id,
        label: session.title,
    }));

    return (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setIsOpen(false)}>
            <div 
                className="bg-card rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 space-y-4 relative"
                onClick={(e) => e.stopPropagation()} 
            >
                {/* ... (Modal Header) */}
                <h3 className="text-2xl font-bold text-foreground pr-10 border-b pb-3">
                    Write a Testimonial
                </h3>
                
                <form onSubmit={handleSubmit} className="space-y-5">
                    
                    {/* 🔑 FIXED: Session Selection */}
                    {sessionOptions.length > 0 && (
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">
                                Link to Completed Session <span className="text-red-500">*</span>
                            </label>
                            <Select
                                name="sessionId"
                                value={form.sessionId}
                                // Assuming onValueChange is the method to handle changes in your Select component
                                onValueChange={(value) => handleSelectChange('sessionId', value)} 
                                options={sessionOptions}
                                placeholder="Select a completed session..."
                                required
                            />
                             <p className="text-xs text-muted-foreground mt-1">
                                This review will be linked to this specific completed booking.
                            </p>
                        </div>
                    )}
                    
                    {/* ... (Rating Input, Content, Optional Fields remain unchanged) */}
                    
                    {/* Error Message */}
                    {validationError && (
                        <div className="text-red-500 text-sm flex items-center space-x-1">
                            <XCircle size={16} /> <span>{validationError}</span>
                        </div>
                    )}

                    {/* Submit Button */}
                    <div className="pt-4 flex justify-end space-x-3">
                        <Button 
                            variant="outline" 
                            onClick={() => setIsOpen(false)}
                            type="button"
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button 
                            type="submit"
                            // 🔑 FINAL VALIDATION CHECK
                            disabled={isSubmitting || form.rating === 0 || !form.content.trim() || !form.sessionId}
                            loading={isSubmitting}
                            iconName="MessageCircle"
                            iconPosition="left"
                        >
                            {isSubmitting ? 'Submitting...' : 'Submit Review'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TestimonialsSection;