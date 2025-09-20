import React from 'react';
import Icon from '../../../components/AppIcon';

const BrandingSection = () => {
  const features = [
    'Client relationship management',
    'Event & session scheduling',
    'Payment integration',
    'Automated communications'
  ];

  return (
    <div className="text-white space-y-8">
     {/* Logo and Title */}
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
            <span className="text-white font-bold text-xl">TK</span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold">The Katha</h1>
        </div>
        
        <p className="text-xl lg:text-2xl text-white/90 font-light leading-relaxed">
          All-in-one platform for independent coaches to manage their business
        </p>
      </div>

      {/* Features List */}
      <div className="space-y-4">
        {features?.map((feature, index) => (
          <div key={index} className="flex items-center space-x-4">
            <div className="w-6 h-6 bg-green-400 rounded-full flex items-center justify-center flex-shrink-0">
              <Icon name="Check" size={14} className="text-white" strokeWidth={3} />
            </div>
            <span className="text-lg text-white/95">{feature}</span>
          </div>
        ))}
      </div>

      {/* Trust Indicators */}
      <div className="pt-8 border-t border-white/20">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <Icon name="Shield" size={20} className="text-green-400" />
            <span className="text-white/80 text-sm">Secure & Trusted</span>
          </div>
          <div className="flex items-center space-x-2">
            <Icon name="Users" size={20} className="text-green-400" />
            <span className="text-white/80 text-sm">2,500+ Coaches</span>
          </div>
          <div className="flex items-center space-x-2">
            <Icon name="Star" size={20} className="text-green-400" />
            <span className="text-white/80 text-sm">4.9/5 Rating</span>
          </div>
          <div className="flex items-center space-x-2">
            <Icon name="Clock" size={20} className="text-green-400" />
            <span className="text-white/80 text-sm">5-min Setup</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrandingSection;