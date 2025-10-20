import React from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Import useNavigate
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const HeroSection = () => {
  const navigate = useNavigate(); // Initialize useNavigate

  return (
    <section className="relative bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-20 lg:py-32 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent rounded-full blur-3xl"></div>
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
            Transform Your Coaching
            <span className="block text-primary">Into a Thriving Business</span>
          </h1>
          
          {/* Value Proposition */}
          <p className="text-xl sm:text-2xl text-muted-foreground mb-8 max-w-4xl mx-auto leading-relaxed">
            The all-in-one platform for independent coaches to manage clients, automate scheduling, 
            and grow their online presence with professional tools designed for success.
          </p>
          
          {/* Trust Indicators */}
          <div className="flex flex-wrap items-center justify-center gap-6 mb-12 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Icon name="Shield" size={16} className="text-accent" />
              <span>SSL Secured</span>
            </div>
            <div className="flex items-center gap-2">
              <Icon name="Users" size={16} className="text-accent" />
              <span>2,500+ Active Coaches</span>
            </div>
            <div className="flex items-center gap-2">
              <Icon name="Star" size={16} className="text-accent" />
              <span>4.9/5 Rating</span>
            </div>
          </div>
          
          {/* Call-to-Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Button 
              variant="default" 
              size="lg"
              iconName="ArrowRight"
              iconPosition="right"
              className="w-full sm:w-auto px-8 py-4 text-lg"
              onClick={() => navigate('/register')} // ✅ Updated to use navigate
            >
              Get Started Free
            </Button>
            
          </div>
          
          {/* Hero Image/Illustration */}
          <div className="relative max-w-5xl mx-auto">
            <div className="bg-white rounded-2xl shadow-soft-lg p-8 border border-border">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Dashboard Preview */}
                <div className="bg-muted rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Icon name="BarChart3" size={20} className="text-primary" />
                    <span className="font-medium text-sm">Dashboard</span>
                  </div>
                  <div className="space-y-2">
                    <div className="h-2 bg-primary rounded w-3/4"></div>
                    <div className="h-2 bg-accent rounded w-1/2"></div>
                    <div className="h-2 bg-secondary rounded w-2/3"></div>
                  </div>
                </div>
                
                {/* Calendar Preview */}
                <div className="bg-muted rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Icon name="Calendar" size={20} className="text-primary" />
                    <span className="font-medium text-sm">Schedule</span>
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {Array.from({ length: 14 }, (_, i) => (
                      <div 
                        key={i} 
                        className={`h-6 rounded text-xs flex items-center justify-center ${
                          i === 5 || i === 12 ? 'bg-primary text-white' : 'bg-white'
                        }`}
                      >
                        {i + 1}
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Clients Preview */}
                <div className="bg-muted rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Icon name="Users" size={20} className="text-primary" />
                    <span className="font-medium text-sm">Clients</span>
                  </div>
                  <div className="space-y-2">
                    {Array.from({ length: 3 }, (_, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-primary rounded-full"></div>
                        <div className="h-2 bg-white rounded flex-1"></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;