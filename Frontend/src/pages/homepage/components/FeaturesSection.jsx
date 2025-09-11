import React from 'react';
import Icon from '../../../components/AppIcon';

const FeaturesSection = () => {
  const features = [
    {
      id: 1,
      icon: "Users",
      title: "Client Management",
      description: "Organize client profiles, track progress, and maintain detailed session notes all in one centralized dashboard.",
      benefits: ["Contact management", "Progress tracking", "Session history", "Custom notes"]
    },
    {
      id: 2,
      icon: "Calendar",
      title: "Smart Scheduling",
      description: "Automate appointment booking with calendar integration, automated reminders, and seamless rescheduling options.",
      benefits: ["Calendar sync", "Auto reminders", "Online booking", "Time zone support"]
    },
    {
      id: 3,
      icon: "TrendingUp",
      title: "Business Growth",
      description: "Scale your coaching practice with analytics, payment processing, and marketing tools designed for independent coaches.",
      benefits: ["Revenue analytics", "Payment processing", "Marketing tools", "Growth insights"]
    }
  ];

  return (
    <section className="py-20 lg:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Everything You Need to
            <span className="block text-primary">Succeed as a Coach</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Streamline your coaching business with powerful tools designed specifically 
            for independent coaches across all disciplines.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
          {features?.map((feature) => (
            <div 
              key={feature?.id}
              className="group relative bg-card rounded-2xl p-8 border border-border shadow-soft hover:shadow-soft-md transition-smooth"
            >
              {/* Icon */}
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-smooth">
                <Icon 
                  name={feature?.icon} 
                  size={32} 
                  className="text-primary" 
                  strokeWidth={1.5}
                />
              </div>

              {/* Content */}
              <h3 className="text-2xl font-bold text-foreground mb-4">
                {feature?.title}
              </h3>
              
              <p className="text-muted-foreground mb-6 leading-relaxed">
                {feature?.description}
              </p>

              {/* Benefits List */}
              <ul className="space-y-3">
                {feature?.benefits?.map((benefit, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <Icon 
                      name="Check" 
                      size={16} 
                      className="text-accent flex-shrink-0" 
                      strokeWidth={2.5}
                    />
                    <span className="text-sm text-muted-foreground">{benefit}</span>
                  </li>
                ))}
              </ul>

              {/* Hover Effect */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-smooth pointer-events-none"></div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <p className="text-lg text-muted-foreground mb-6">
            Join thousands of coaches who have transformed their practice
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Icon name="Clock" size={16} className="text-accent" />
              <span>Setup in 5 minutes</span>
            </div>
            <div className="flex items-center gap-2">
              <Icon name="CreditCard" size={16} className="text-accent" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <Icon name="Headphones" size={16} className="text-accent" />
              <span>24/7 support</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;