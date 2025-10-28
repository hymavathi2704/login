// Frontend/src/pages/dashboards/shared/coach-public-profile/components/TestimonialsSection.jsx

import React, { useState, useEffect, useCallback } from 'react'; 
import Icon from '@/components/AppIcon';
import Image from '@/components/AppImage';
import Button from '@/components/ui/Button'; 
import Input from '@/components/ui/Input'; 
import Select from '@/components/ui/Select'; 
import { Textarea } from '@/components/ui/Textarea'; 
import { X, Star as StarIcon, MessageCircle, XCircle } from 'lucide-react'; 
import { toast } from 'sonner';
//

// ===================================
// 🛑 REMOVED MOCK API IMPLEMENTATION (and import of submitTestimonial, checkClientReviewEligibility)
// The functionality is moved to Client Dashboard.
// ===================================

const TestimonialsSection = ({ 
    testimonials, 
    // 🛑 REMOVED unused props: coachId, onTestimonialSubmitted 
}) => {
  // 🛑 REMOVED all state variables for submission: isModalOpen, isSubmitting, eligibleSessions, etc. 
  
  // 🛑 REMOVED useEffect/useCallback for fetchEligibleSessions
  
  const formatDate = (dateString) => {
    return new Date(dateString)?.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // 🛑 REMOVED all form handlers: handleFormChange, handleSelectChange, handleRatingChange, handleSubmit

  const renderStars = (rating) => {
    return (
        <div className="flex">
            {[1, 2, 3, 4, 5]?.map((star) => (
                <StarIcon
                    key={star}
                    size={16}
                    className={`${
                        star <= rating
                            ? 'text-warning fill-current' :'text-border'
                    }`}
                />
            ))}
        </div>
    );
  }

  // --- Render Logic ---
  if (!testimonials || testimonials?.length === 0) {
    return (
      <div className="bg-card rounded-card p-6 shadow-soft">
        <h2 className="text-2xl font-heading font-semibold text-foreground mb-6">
          Client Testimonials
        </h2>
        
        <div className="text-center py-12">
          <Icon name="MessageSquare" size={48} className="text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
             No testimonials available yet. Only clients who have completed a session can leave a review.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-card p-6 shadow-soft space-y-8">
      <h2 className="text-2xl font-heading font-semibold text-foreground">
        Client Testimonials
      </h2>
      
      {/* Testimonial List Rendering (Adjusted to be boxes) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {testimonials.map((t, index) => (
            <div key={t.id || index} className="p-5 border border-gray-100 rounded-lg shadow-sm bg-white hover:shadow-md transition-shadow">
                {/* Header: Avatar, Name, Rating */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 flex-shrink-0">
                            <Image 
                                src={t.clientAvatar} 
                                alt={t.clientName} 
                                className="w-full h-full object-cover rounded-full"
                            />
                        </div>
                        <div>
                            <p className="font-semibold text-foreground">{t.clientName}</p>
                            <p className="text-xs text-muted-foreground">{t.clientTitle || 'Verified Client'}</p>
                        </div>
                    </div>
                    {renderStars(t.rating)}
                </div>
                
                {/* Content */}
                <blockquote className="text-base text-gray-700 italic mb-4 border-l-4 pl-4 border-primary/50">
                    "{t.content}"
                </blockquote>

                {/* Footer: Date and Session Type */}
                <div className="flex items-center justify-between text-xs text-muted-foreground border-t pt-3">
    {/* Only display the review date */}
    <span>Reviewed on: {formatDate(t.date)}</span> 
    
    {/* The session tag is now removed */}
</div>
            </div>
        ))}
      </div>
      
    </div>
  );
};

// 🛑 REMOVED: renderTestimonialModal component

export default TestimonialsSection;