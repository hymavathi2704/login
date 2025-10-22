import React, { useState, useEffect } from 'react'; // 🔑 ADDED useEffect
import Icon from '@/components/AppIcon';
import Image from '@/components/AppImage';
// 🔑 ADDED IMPORTS
import Button from '@/components/ui/Button'; 
import Input from '@/components/ui/Input'; 
import Select from '@/components/ui/Select'; // 🔑 NEW: Import Select component
import { Textarea } from '@/components/ui/Textarea'; 
import { Check, X, Star as StarIcon, MessageCircle, XCircle } from 'lucide-react'; 
import { toast } from 'sonner';

// ===================================
// 🔑 MOCK API IMPLEMENTATION (REPLACE WITH REAL AXIOS/FETCH LOGIC)
// NOTE: You must replace 'api' with your actual Axios instance or fetch logic.
// ===================================
const api = { 
    // Mock POST for submitting the testimonial
    post: (url, data) => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (Math.random() > 0.1) {
                    console.log(`API POST Success: ${url}`, data);
                    resolve({ data: { message: 'Testimonial created successfully' } });
                } else {
                    reject(new Error("Failed to connect to server."));
                }
            }, 1000);
        });
    },
    // Mock GET for checking eligibility and fetching completed sessions
    get: (url) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                // Mock response from the backend: List of completed, unreviewed sessions
                const mockSessions = [
                    { id: 'session-a-123', title: 'Career Strategy Session (Booking: 15-01-2025)' },
                    { id: 'session-b-456', title: '3-Month Coaching Package (Booking: 20-05-2025)' },
                ];
                
                resolve({ 
                    data: { 
                        eligibleSessions: mockSessions
                    } 
                });
            }, 500);
        });
    }
};

// 🔑 Updated submitTestimonial to use the new route and payload structure
const submitTestimonial = async (coachId, data) => {
    // This calls the new backend route POST /api/coach/public/:coachId/testimonials
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
    
    // 🔑 NEW: State to store eligible sessions fetched from API
    const [eligibleSessions, setEligibleSessions] = useState([]);
    const [isCheckingEligibility, setIsCheckingEligibility] = useState(true); // Start as true

    // 🔑 Dynamic eligibility: true if there are sessions available to review
    const isReviewEligible = eligibleSessions.length > 0; 
    
    // Form State (Updated: 'sessionType' is now 'sessionId' to link to the session)
    const [form, setForm] = useState({
        rating: 5,
        clientTitle: '',
        content: '',
        sessionId: '', // 🔑 Linked to a specific completed session ID
    });
    const [validationError, setValidationError] = useState('');

    // 🔑 NEW: Function to fetch eligible sessions from the API
    const fetchEligibleSessions = async () => {
        if (!coachId) return;
        
        setIsCheckingEligibility(true);
        try {
            // Hitting the review-eligibility endpoint
            const response = await api.get(`/api/coach/public/${coachId}/review-eligibility`);
            
            // The backend is expected to return a list of eligible sessions/bookings.
            const sessions = response.data.eligibleSessions || []; 
            setEligibleSessions(sessions);
            
            // Set the default selected session to the first one available
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
    };
    
    // 🔑 Fetch eligible sessions when the component mounts/coachId changes
    useEffect(() => {
        fetchEligibleSessions();
    }, [coachId]);
    
    // 🔑 Function to handle modal open/close
    const handleOpenModal = () => {
        if (isReviewEligible) {
            setIsModalOpen(true);
        }
    };


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
    
    // 🔑 handleSelectChange for the session Select component
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
        
        // 🔑 Updated validation: Check for sessionId
        if (form.rating < 1 || form.rating > 5 || !form.content.trim() || !form.sessionId) {
            setValidationError('Please provide a rating, write your testimonial, and select the completed session.');
            return;
        }
        
        setIsSubmitting(true);
        
        try {
            // 🔑 Prepare data for submission, matching Testimonial model fields (using sessionId)
            const submissionData = {
                rating: form.rating,
                content: form.content,
                clientTitle: form.clientTitle,
                sessionId: form.sessionId, 
            };

            await submitTestimonial(coachId, submissionData);
            
            toast.success('Thank you! Your testimonial has been submitted successfully.');
            setIsModalOpen(false);
            
            // Call the parent to re-fetch the coach profile data and update the testimonial list
            if (onTestimonialSubmitted) {
                onTestimonialSubmitted();
            }
            
            // Re-fetch eligible sessions after submission to update the eligibility status
            fetchEligibleSessions();
            
            // Reset form 
            setForm({ rating: 5, clientTitle: '', content: '', sessionId: '' }); 
            
        } catch (error) {
            console.error("Testimonial submission failed:", error);
            toast.error("Failed to submit testimonial. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };


    if (!testimonials || testimonials?.length === 0) {
      return (
        <div className="bg-card rounded-card p-6 shadow-soft">
          <h2 className="text-2xl font-heading font-semibold text-foreground mb-6">
            Client Testimonials
          </h2>
          
          {/* 🔑 CONDITIONAL BUTTON FOR NO TESTIMONIALS (Updated dynamic logic) */}
          {isReviewEligible ? (
              <div className="border border-dashed border-primary/50 bg-primary/5 p-4 rounded-lg text-center mb-6">
                  <p className="text-primary text-sm font-medium mb-3">
                      You have **{eligibleSessions.length} completed session{eligibleSessions.length > 1 ? 's' : ''}** eligible for review.
                  </p>
                  <Button 
                      variant="primary" 
                      onClick={handleOpenModal}
                      iconName="Edit"
                      iconPosition="left"
                      size="sm"
                  >
                      Write a Testimonial
                  </Button>
              </div>
          ) : isCheckingEligibility ? (
                <div className="text-center py-4 text-muted-foreground">Checking eligibility...</div>
          ) : (
                <div className="text-center py-4 text-muted-foreground">You must complete a session with this coach to write a testimonial.</div>
          )}

          <div className="text-center py-12">
            <Icon name="MessageSquare" size={48} className="text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No testimonials available yet.</p>
          </div>
          
          {/* Render Modal */}
          {renderTestimonialModal(isModalOpen, setIsModalOpen, form, handleFormChange, handleRatingChange, handleSubmit, validationError, isSubmitting, eligibleSessions, handleSelectChange)}
        </div>
      );
    }

    return (
      <div className="bg-card rounded-card p-6 shadow-soft">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-heading font-semibold text-foreground">
            Client Testimonials
          </h2>
          
          {/* 🔑 CONDITIONAL BUTTON FOR EXISTING TESTIMONIALS (Updated dynamic logic) */}
          {isReviewEligible && (
              <Button 
                  variant="primary" 
                  onClick={handleOpenModal}
                  iconName="Edit"
                  iconPosition="left"
                  size="sm"
              >
                  Write a Testimonial ({eligibleSessions.length})
              </Button>
          )}
        </div>
        
        {/* ... (rest of the display logic for testimonials remains unchanged) */}
        
        <div className="space-y-6">
          {testimonials?.map((testimonial) => (
            <div
              key={testimonial?.id}
              className="border border-border rounded-card p-6 hover:shadow-soft transition-smooth"
            >
              {/* Rating */}
              <div className="flex items-center mb-4">
                <div className="flex items-center mr-3">
                  {[1, 2, 3, 4, 5]?.map((star) => (
                    <Icon
                      key={star}
                      name="Star"
                      size={16}
                      className={`${
                        star <= testimonial?.rating
                          ? 'text-warning fill-current' :'text-border'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm font-medium text-muted-foreground">
                  {testimonial?.rating}/5
                </span>
              </div>

              {/* Testimonial Content */}
              <blockquote className="text-muted-foreground leading-relaxed mb-4 italic">
                "{testimonial?.content}"
              </blockquote>

              {/* Client Info */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-muted">
                    <Image
                      src={testimonial?.clientAvatar}
                      alt={testimonial?.clientName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="font-medium text-foreground">
                      {testimonial?.clientName}
                    </div>
                    {testimonial?.clientTitle && (
                      <div className="text-sm text-muted-foreground">
                        {testimonial?.clientTitle}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="text-sm text-muted-foreground">
                  {formatDate(testimonial?.date)}
                </div>
              </div>

              {/* Session Type (Mapped from the linked Session model) */}
              {testimonial?.sessionType && (
                <div className="mt-3 pt-3 border-t border-border">
                  <span className="inline-flex items-center px-2 py-1 rounded-soft text-xs font-medium bg-muted text-muted-foreground">
                    <Icon name="Tag" size={12} className="mr-1" />
                    {testimonial?.sessionType}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
        {/* View More Button */}
        {testimonials?.length >= 3 && (
          <div className="text-center mt-6">
            <button className="text-primary hover:text-primary/80 font-medium text-sm transition-smooth">
              View All Reviews ({testimonials?.length + 12} total)
            </button>
          </div>
        )}
        
        {/* Render Modal */}
        {renderTestimonialModal(isModalOpen, setIsModalOpen, form, handleFormChange, handleRatingChange, handleSubmit, validationError, isSubmitting, eligibleSessions, handleSelectChange)}
      </div>
    );
};

// ===================================
// 🔑 UPDATED: Testimonial Modal Component
// ===================================
const renderTestimonialModal = (isOpen, setIsOpen, form, handleFormChange, handleRatingChange, handleSubmit, validationError, isSubmitting, eligibleSessions, handleSelectChange) => {
    if (!isOpen) return null;

    // Map eligible sessions for the Select component
    const sessionOptions = eligibleSessions.map(session => ({
        value: session.id, // Session ID is the value
        label: session.title, // Title is the displayed label
    }));

    return (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setIsOpen(false)}>
            <div 
                className="bg-card rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 space-y-4 relative"
                onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
            >
                <button
                    onClick={() => setIsOpen(false)}
                    className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Close"
                >
                    <X size={24} />
                </button>
                <h3 className="text-2xl font-bold text-foreground pr-10 border-b pb-3">
                    Write a Testimonial
                </h3>
                
                <form onSubmit={handleSubmit} className="space-y-5">
                    
                    {/* 🔑 NEW: Session Selection (REQUIRED) */}
                    {sessionOptions.length > 0 && (
                        <div>
                            {/* Assuming a Select component that accepts an onChange function that receives the value */}
                            <Select
                                label="Completed Session to Review"
                                name="sessionId"
                                value={form.sessionId}
                                onChange={(value) => handleSelectChange('sessionId', value)} 
                                options={sessionOptions}
                                placeholder="Select a completed session"
                                required
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                                Only completed, unreviewed sessions are listed.
                            </p>
                        </div>
                    )}
                    
                    {/* ... (Rating and Content Inputs remain unchanged) */}
                    
                    {/* Rating Input */}
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                            Overall Rating <span className="text-red-500">*</span>
                        </label>
                        <div className="flex space-x-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <StarIcon 
                                    key={star} 
                                    size={30} 
                                    className={`cursor-pointer transition-colors ${
                                        star <= form.rating 
                                            ? 'text-warning fill-current' 
                                            : 'text-gray-300 hover:text-warning/70'
                                    }`}
                                    onClick={() => handleRatingChange(star)}
                                />
                            ))}
                        </div>
                    </div>
                    
                    {/* Testimonial Content */}
                    <div>
                        <Textarea
                            label="Your Feedback"
                            name="content"
                            rows={4}
                            value={form.content}
                            onChange={handleFormChange}
                            placeholder="Share your experience working with this coach..."
                            required
                        />
                    </div>
                    
                    {/* Optional Fields */}
                    <div>
                        <Input
                            label="Your Title/Role (Optional)"
                            name="clientTitle"
                            value={form.clientTitle}
                            onChange={handleFormChange}
                            placeholder="e.g., Marketing Executive, Small Business Owner"
                        />
                    </div>
                    
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
                            // 🔑 Updated validation to include sessionId
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