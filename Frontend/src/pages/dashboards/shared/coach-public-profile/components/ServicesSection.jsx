import React, { useState } from 'react'; // <-- ADDED useState
import Icon from '@/components/AppIcon';
import Button from '@/components/ui/Button';
import { Clock, DollarSign, Users, Tag, TrendingUp, ArrowRight } from 'lucide-react'; // Added ArrowRight
// IMPORT NECESSARY HOOKS AND API
import { useAuth } from '@/auth/AuthContext';
import { bookSession } from '@/auth/authApi'; 
import { toast } from 'sonner';

const ServicesSection = ({ coach, onServiceClick }) => {
  const { isAuthenticated, roles } = useAuth();
  const isClient = isAuthenticated && roles?.includes('client');
  const [isBooking, setIsBooking] = useState(false); // New loading state

  const formatPrice = (price) => {
    const p = parseFloat(price);
    if (p === 0) return 'FREE';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    })?.format(p);
  };

  const formatDuration = (minutes) => {
    const m = parseInt(minutes, 10);
    if (m < 60) return `${m} min`;
    const hours = Math.floor(m / 60);
    const remainingMinutes = m % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };
  
  // Helper to determine button text based on session type
  const getButtonConfig = (sessionType) => {
    if (sessionType.toLowerCase().includes('subscription') || sessionType.toLowerCase().includes('package')) {
      return { label: 'Subscribe Now', icon: 'TrendingUp', variant: 'success' };
    }
    return { label: 'Purchase/Book', icon: 'ArrowRight', variant: 'default' };
  }

  // NEW: Handle the booking action
  const handleBookSession = async (sessionId, sessionTitle) => {
      if (!isAuthenticated) {
          toast.error("Please log in to book a session.");
          return;
      }
      if (!isClient) {
          toast.error("Only clients can book sessions.");
          return;
      }

      if (!window.confirm(`Confirm booking for: ${sessionTitle}?`)) return;

      setIsBooking(true);
      try {
          // This call triggers the backend API you implemented in step 2
          await bookSession(sessionId);
          toast.success(`Successfully booked: ${sessionTitle}! View it in My Sessions.`);
          // OPTIONAL: Optionally redirect to the client's dashboard or refresh the coach profile
      } catch (error) {
          console.error("Booking failed:", error);
          toast.error(error.response?.data?.error || 'Failed to book session. Please try again.');
      } finally {
          setIsBooking(false);
      }
  };

  const availableSessions = Array.isArray(coach?.availableSessions) ? coach.availableSessions : [];

  return (
    <div className="bg-card rounded-card p-6 shadow-soft">
      <h2 className="text-2xl font-heading font-semibold text-foreground mb-6">
        Digital Services Offered
      </h2>
      
      <div className="space-y-4">
        {availableSessions.length > 0 ? (
          availableSessions.map((session) => {
            const { label: buttonLabel, icon: buttonIconName, variant: buttonVariant } = getButtonConfig(session?.type);
            
            return (
              <div
                key={session?.id}
                className="border border-border rounded-card p-4 hover:shadow-soft transition-smooth"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 pr-4">
                    <h3 className="font-semibold text-foreground mb-1">
                      {session?.title}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-2">
                      {session?.description}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-xl font-bold text-primary">
                      {formatPrice(session?.price)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {session?.price > 0 ? 'per session' : 'free offer'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-dashed border-border">
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Clock size={14} />
                      <span>{formatDuration(session?.duration)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Tag size={14} />
                      <span className="capitalize">{session?.type || 'Individual'}</span>
                    </div>
                  </div>
                  {/* NEW: Use the booking handler */}
                  <Button
                    variant={buttonVariant}
                    size="sm"
                    onClick={() => handleBookSession(session?.id, session?.title)} 
                    iconName={buttonIconName}
                    iconPosition="right"
                    isLoading={isBooking}
                    disabled={isBooking || !isClient}
                  >
                    {isBooking ? 'Processing...' : buttonLabel}
                  </Button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-12">
            <Icon name="DollarSign" size={48} className="text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              This coach has not yet listed any digital services.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServicesSection;