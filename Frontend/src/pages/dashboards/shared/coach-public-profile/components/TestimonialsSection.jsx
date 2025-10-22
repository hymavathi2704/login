import React, { useState } from 'react';
import Icon from '@/components/AppIcon';
import Image from '@/components/AppImage';
// 🔑 ADDED IMPORTS
import Button from '@/components/ui/Button'; 
import Input from '@/components/ui/Input'; 
import { Textarea } from '@/components/ui/Textarea'; 
import { Check, X, Star as StarIcon, MessageCircle, XCircle } from 'lucide-react'; // XCircle for error messages
import { toast } from 'sonner';

// Mock API Call (Replace with your actual API integration for submitting testimonials)
const submitTestimonial = async (coachId, rating, content, title, sessionType) => {
    // In a real app, this would be an axiosInstance.post('/api/testimonials', ...) call
    console.log("Submitting Testimonial:", { coachId, rating, content, title, sessionType });
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API delay
    // Assuming success
    return { success: true };
};


const TestimonialsSection = ({ 
    testimonials, 
    coachId, 
    isReviewEligible : isEligibleProp, // 🔑 NEW PROP: Status from parent
    onTestimonialSubmitted // 🔑 NEW PROP: Callback to refresh data
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const isReviewEligible = true;
  
  // Form State
  const [form, setForm] = useState({
      rating: 5,
      clientTitle: '',
      content: '',
      sessionType: '', // Mock field for now
  });
  const [validationError, setValidationError] = useState('');


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
  
  const handleRatingChange = (newRating) => {
      setForm(prev => ({ ...prev, rating: newRating }));
      setValidationError('');
  };

  const handleSubmit = async (e) => {
      e.preventDefault();
      if (form.rating < 1 || form.rating > 5 || !form.content.trim()) {
          setValidationError('Please provide a rating and write your testimonial.');
          return;
      }
      
      setIsSubmitting(true);
      
      try {
          // Replace with real API call
          await submitTestimonial(coachId, form.rating, form.content, form.clientTitle, form.sessionType);
          
          toast.success('Thank you! Your testimonial has been submitted successfully.');
          setIsModalOpen(false);
          
          // 🔑 Call the parent to re-fetch the profile data and update the list
          if (onTestimonialSubmitted) {
              onTestimonialSubmitted();
          }
          
          // Reset form
          setForm({ rating: 5, clientTitle: '', content: '', sessionType: '' });
          
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
        
        {/* 🔑 CONDITIONAL BUTTON FOR NO TESTIMONIALS */}
        {isReviewEligible && (
            <div className="border border-dashed border-primary/50 bg-primary/5 p-4 rounded-lg text-center mb-6">
                <p className="text-primary text-sm font-medium mb-3">
                    You are eligible to leave a review for this coach!
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
        )}

        <div className="text-center py-12">
          <Icon name="MessageSquare" size={48} className="text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No testimonials available yet.</p>
        </div>
        
        {/* Render Modal */}
        {renderTestimonialModal(isModalOpen, setIsModalOpen, form, handleFormChange, handleRatingChange, handleSubmit, validationError, isSubmitting)}
      </div>
    );
  }

  return (
    <div className="bg-card rounded-card p-6 shadow-soft">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-heading font-semibold text-foreground">
          Client Testimonials
        </h2>
        
        {/* 🔑 CONDITIONAL BUTTON FOR EXISTING TESTIMONIALS */}
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

            {/* Session Type */}
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
      {renderTestimonialModal(isModalOpen, setIsModalOpen, form, handleFormChange, handleRatingChange, handleSubmit, validationError, isSubmitting)}
    </div>
  );
};

// ===================================
// 🔑 NEW: Testimonial Modal Component
// ===================================
const renderTestimonialModal = (isOpen, setIsOpen, form, handleFormChange, handleRatingChange, handleSubmit, validationError, isSubmitting) => {
    if (!isOpen) return null;

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
                    
                    <div>
                        <Input
                            label="Session Type/Focus (Optional)"
                            name="sessionType"
                            value={form.sessionType}
                            onChange={handleFormChange}
                            placeholder="e.g., Career Strategy Session, 3-Month Package"
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
                            disabled={isSubmitting || form.rating === 0 || !form.content.trim()}
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