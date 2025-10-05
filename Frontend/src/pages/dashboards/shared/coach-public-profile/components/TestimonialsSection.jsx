import React from 'react';
import Icon from '@/components/AppIcon';
import Image from '@/components/AppImage';

const TestimonialsSection = ({ testimonials }) => {
  const formatDate = (dateString) => {
    return new Date(dateString)?.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!testimonials || testimonials?.length === 0) {
    return (
      <div className="bg-card rounded-card p-6 shadow-soft">
        <h2 className="text-2xl font-heading font-semibold text-foreground mb-6">
          Client Testimonials
        </h2>
        <div className="text-center py-12">
          <Icon name="MessageSquare" size={48} className="text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No testimonials available yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-card p-6 shadow-soft">
      <h2 className="text-2xl font-heading font-semibold text-foreground mb-6">
        Client Testimonials
      </h2>
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
    </div>
  );
};

export default TestimonialsSection;