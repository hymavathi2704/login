// Frontend/src/pages/dashboards/shared/coach-public-profile/components/ContactSidebar.jsx

import React from 'react';
import Icon from '@/components/AppIcon';
import Button from '@/components/ui/Button';

const ContactSidebar = ({ coach, onContact, onBookSession }) => {
  const availabilityStatus = coach?.isAvailable ? 'Available' : 'Busy';
  const responseTime = coach?.avgResponseTime || '2 hours';

  return (
    <div className="space-y-6">
      {/* Quick Actions - REMOVED */}
      {/* <div className="bg-card rounded-card p-6 shadow-soft">
        <h3 className="font-semibold text-foreground mb-4">Quick Actions</h3>
        
        <div className="space-y-3">
          <Button
            variant="default"
            fullWidth
            onClick={onBookSession}
            iconName="Calendar"
            iconPosition="left"
          >
            Book a Session
          </Button>
          
          <Button
            variant="outline"
            fullWidth
            onClick={() => onContact('message')}
            iconName="MessageCircle"
            iconPosition="left"
          >
            Send Message
          </Button>
          
          <Button
            variant="ghost"
            fullWidth
            onClick={() => onContact('favorite')}
            iconName="Heart"
            iconPosition="left"
          >
            Add to Favorites
          </Button>
        </div>
      </div> */}
      {/* Availability Status - REMOVED */}
      {/* <div className="bg-card rounded-card p-6 shadow-soft">
        <h3 className="font-semibold text-foreground mb-4">Availability</h3>
        
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${
              coach?.isAvailable ? 'bg-success' : 'bg-warning'
            }`}></div>
            <span className="text-sm font-medium text-foreground">
              {availabilityStatus}
            </span>
          </div>
          
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Icon name="Clock" size={14} />
            <span>Responds within {responseTime}</span>
          </div>
          
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Icon name="MapPin" size={14} />
            <span>{coach?.timezone || 'EST (UTC-5)'}</span>
          </div>
        </div>
      </div> */}
      {/* Contact Information - REMOVED */}
      {/* <div className="bg-card rounded-card p-6 shadow-soft">
        <h3 className="font-semibold text-foreground mb-4">Contact Info</h3>
        
        <div className="space-y-3">
          {coach?.email && (
            <button
              onClick={() => onContact('email', coach?.email)}
              className="flex items-center space-x-3 w-full text-left p-2 rounded-soft hover:bg-muted transition-smooth"
            >
              <Icon name="Mail" size={16} className="text-primary" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-foreground">Email</div>
                <div className="text-xs text-muted-foreground truncate">
                  {coach?.email}
                </div>
              </div>
            </button>
          )}
          
          {coach?.phone && (
            <button
              onClick={() => onContact('phone', coach?.phone)}
              className="flex items-center space-x-3 w-full text-left p-2 rounded-soft hover:bg-muted transition-smooth"
            >
              <Icon name="Phone" size={16} className="text-primary" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-foreground">Phone</div>
                <div className="text-xs text-muted-foreground">
                  {coach?.phone}
                </div>
              </div>
            </button>
          )}
          
          {coach?.website && (
            <button
              onClick={() => onContact('website', coach?.website)}
              className="flex items-center space-x-3 w-full text-left p-2 rounded-soft hover:bg-muted transition-smooth"
            >
              <Icon name="Globe" size={16} className="text-primary" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-foreground">Website</div>
                <div className="text-xs text-muted-foreground">
                  Visit website
                </div>
              </div>
            </button>
          )}
        </div>
      </div> */}
      {/* Pricing Summary - REMOVED */}
      {/* <div className="bg-card rounded-card p-6 shadow-soft">
        <h3 className="font-semibold text-foreground mb-4">Pricing</h3>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Starting from</span>
            <span className="font-semibold text-foreground">
              ${coach?.startingPrice || 75}/session
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Package deals</span>
            <span className="text-sm text-success font-medium">Available</span>
          </div>
          
          <div className="pt-2 border-t border-border">
            <p className="text-xs text-muted-foreground">
              Free 15-minute consultation for new clients
            </p>
          </div>
        </div>
      </div> */}
    </div>
  );
};

export default ContactSidebar;