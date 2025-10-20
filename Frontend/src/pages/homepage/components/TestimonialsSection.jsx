import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';

const TestimonialsSection = () => {
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  const testimonials = [
    
    {
      id: 1,
      name: "Marcus Rodriguez",
      role: "Business Coach",
      company: "Executive Excellence",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      quote: `The analytics and growth tracking features helped me understand my business better. I've increased my client retention by 40% and doubled my revenue in just 8 months using CoachFlow's comprehensive platform.`,
      metrics: {
        clients: "200+",
        revenue: "$120K",
        retention: "40% increase"
      },
      rating: 5
    },
    {
      id: 2,
      name: "Jennifer Chen",
      role: "Wellness Coach",
      company: "Holistic Health Hub",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      quote: `As someone who struggled with technology, CoachFlow's intuitive interface was a game-changer. The automated reminders and payment processing eliminated my biggest pain points and improved my client experience dramatically.`,
      metrics: {
        clients: "100+",
        revenue: "$65K",
        satisfaction: "98% client satisfaction"
      },
      rating: 5
    }
  ];

  const nextTestimonial = () => {
    setActiveTestimonial((prev) => (prev + 1) % testimonials?.length);
  };

  const prevTestimonial = () => {
    setActiveTestimonial((prev) => (prev - 1 + testimonials?.length) % testimonials?.length);
  };

  const currentTestimonial = testimonials?.[activeTestimonial];

  return (
    <section className="py-20 lg:py-32 bg-gradient-to-br from-muted/30 to-primary/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Trusted by Coaches
            <span className="block text-primary">Worldwide</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            See how independent coaches are transforming their practices and achieving 
            remarkable growth with CoachFlow.
          </p>
        </div>

        {/* Main Testimonial */}
        <div className="relative max-w-5xl mx-auto">
          <div className="bg-card rounded-3xl shadow-soft-lg border border-border p-8 lg:p-12">
            {/* Navigation Arrows - Desktop */}
            <div className="hidden lg:block">
              <button
                onClick={prevTestimonial}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-soft border border-border flex items-center justify-center hover:bg-muted transition-smooth"
                aria-label="Previous testimonial"
              >
                <Icon name="ChevronLeft" size={20} className="text-muted-foreground" />
              </button>
              
              <button
                onClick={nextTestimonial}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-soft border border-border flex items-center justify-center hover:bg-muted transition-smooth"
                aria-label="Next testimonial"
              >
                <Icon name="ChevronRight" size={20} className="text-muted-foreground" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 items-center">
              {/* Testimonial Content */}
              <div className="lg:col-span-2 order-2 lg:order-1">
                {/* Quote */}
                <div className="mb-8">
                  <Icon name="Quote" size={48} className="text-primary/20 mb-4" />
                  <blockquote className="text-lg lg:text-xl text-foreground leading-relaxed">
                    "{currentTestimonial?.quote}"
                  </blockquote>
                </div>

                {/* Author Info */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="lg:hidden">
                    <Image
                      src={currentTestimonial?.image}
                      alt={currentTestimonial?.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground text-lg">
                      {currentTestimonial?.name}
                    </h4>
                    <p className="text-muted-foreground">
                      {currentTestimonial?.role} at {currentTestimonial?.company}
                    </p>
                  </div>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-6">
                  {Array.from({ length: currentTestimonial?.rating }, (_, i) => (
                    <Icon key={i} name="Star" size={20} className="text-warning fill-current" />
                  ))}
                  <span className="text-sm text-muted-foreground ml-2">
                    {currentTestimonial?.rating}.0 out of 5
                  </span>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-4">
                  {Object.entries(currentTestimonial?.metrics)?.map(([key, value]) => (
                    <div key={key} className="text-center lg:text-left">
                      <div className="font-bold text-primary text-xl lg:text-2xl">
                        {value}
                      </div>
                      <div className="text-sm text-muted-foreground capitalize">
                        {key?.replace('_', ' ')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Author Image - Desktop */}
              <div className="hidden lg:block order-1 lg:order-2">
                <div className="relative">
                  <Image
                    src={currentTestimonial?.image}
                    alt={currentTestimonial?.name}
                    className="w-full max-w-xs mx-auto rounded-2xl object-cover shadow-soft-md"
                  />
                  <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-primary rounded-full flex items-center justify-center shadow-soft-md">
                    <Icon name="Quote" size={24} className="text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="flex lg:hidden items-center justify-center gap-4 mt-8">
            <button
              onClick={prevTestimonial}
              className="w-12 h-12 bg-card rounded-full shadow-soft border border-border flex items-center justify-center"
              aria-label="Previous testimonial"
            >
              <Icon name="ChevronLeft" size={20} className="text-muted-foreground" />
            </button>
            
            <div className="flex gap-2">
              {testimonials?.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveTestimonial(index)}
                  className={`w-2 h-2 rounded-full transition-smooth ${
                    index === activeTestimonial ? 'bg-primary' : 'bg-border'
                  }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>
            
            <button
              onClick={nextTestimonial}
              className="w-12 h-12 bg-card rounded-full shadow-soft border border-border flex items-center justify-center"
              aria-label="Next testimonial"
            >
              <Icon name="ChevronRight" size={20} className="text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Stats Section */}
        <div className="mt-20 grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-3xl lg:text-4xl font-bold text-primary mb-2">2,500+</div>
            <div className="text-muted-foreground">Active Coaches</div>
          </div>
          <div>
            <div className="text-3xl lg:text-4xl font-bold text-primary mb-2">50K+</div>
            <div className="text-muted-foreground">Sessions Booked</div>
          </div>
          <div>
            <div className="text-3xl lg:text-4xl font-bold text-primary mb-2">98%</div>
            <div className="text-muted-foreground">Satisfaction Rate</div>
          </div>
          <div>
            <div className="text-3xl lg:text-4xl font-bold text-primary mb-2">24/7</div>
            <div className="text-muted-foreground">Support Available</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;