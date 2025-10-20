import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const CallToActionSection = () => {
  const trustSignals = [
    {
      icon: "Shield",
      text: "Bank-level Security"
    },
    {
      icon: "Clock",
      text: "5-minute Setup"
    },
    {
      icon: "CreditCard",
      text: "No Credit Card Required"
    },
    {
      icon: "Users",
      text: "Join 2,500+ Coaches"
    }
  ];

  return (
    <section className="py-20 lg:py-32 bg-gradient-to-br from-primary to-primary/90 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-20 left-20 w-64 h-64 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-white rounded-full blur-3xl"></div>
        </div>
      </div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Main Headline */}
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
            Ready to Transform Your
            <span className="block">Coaching Practice?</span>
          </h2>
          
          {/* Subheadline */}
          <p className="text-xl sm:text-2xl text-white/90 mb-12 max-w-4xl mx-auto leading-relaxed">
            Join thousands of successful coaches who have streamlined their business, 
            increased their revenue, and reclaimed their time with The Katha.
          </p>

          

          {/* Trust Signals */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 mb-12">
            {trustSignals?.map((signal, index) => (
              <div key={index} className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <Icon 
                    name={signal?.icon} 
                    size={24} 
                    className="text-white" 
                    strokeWidth={1.5}
                  />
                </div>
                <span className="text-white/90 text-sm font-medium text-center">
                  {signal?.text}
                </span>
              </div>
            ))}
          </div>

          {/* Additional Trust Elements */}
          <div className="border-t border-white/20 pt-12">
            <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16">
              {/* Money Back Guarantee */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center">
                  <Icon name="CheckCircle" size={20} className="text-white" />
                </div>
                <div className="text-left">
                  <div className="text-white font-semibold">30-Day Money Back</div>
                  <div className="text-white/80 text-sm">100% Satisfaction Guaranteed</div>
                </div>
              </div>

              {/* Free Support */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center">
                  <Icon name="Headphones" size={20} className="text-white" />
                </div>
                <div className="text-left">
                  <div className="text-white font-semibold">Free Setup & Training</div>
                  <div className="text-white/80 text-sm">Personal onboarding included</div>
                </div>
              </div>

              {/* Migration Help */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center">
                  <Icon name="Download" size={20} className="text-white" />
                </div>
                <div className="text-left">
                  <div className="text-white font-semibold">Free Data Migration</div>
                  <div className="text-white/80 text-sm">We'll move your existing data</div>
                </div>
              </div>
            </div>
          </div>

          {/* Final Encouragement */}
          <div className="mt-12 text-center">
            <p className="text-white/80 text-lg mb-4">
              Still have questions? We're here to help.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-white/90">
              <div className="flex items-center gap-2">
                <Icon name="Phone" size={16} />
                <span className="text-sm">Call us: (+91) 12345-67890</span>
              </div>
              <div className="flex items-center gap-2">
                <Icon name="Mail" size={16} />
                <span className="text-sm">Email: hello@thekatha.com</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CallToActionSection;