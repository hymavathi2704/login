import React, { useState } from 'react';
import Icon from '@/components/AppIcon';
import Button from '@/components/ui/Button';
import { Clock, Tag, DollarSign, TrendingUp, ArrowRight } from 'lucide-react';
// We keep useAuth just for clarity, but the core logic relies on the server-side auth check
import { useAuth } from '@/auth/AuthContext'; 
import { bookSession } from '@/auth/authApi';
import { toast } from 'sonner';

const ServicesSection = ({ coach }) => {
  // We keep useAuth to access roles and data, but won't block the button based on it
  const { isAuthenticated, roles, user } = useAuth(); 
  const [bookingSessionId, setBookingSessionId] = useState(null); 

  const formatPrice = (price) => {
    const p = parseFloat(price);
    if (p === 0) return 'FREE';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(p);
  };

  const formatDuration = (minutes) => {
    const m = parseInt(minutes, 10);
    if (m < 60) return `${m} min`;
    const hours = Math.floor(m / 60);
    const remaining = m % 60;
    return remaining > 0 ? `${hours}h ${remaining}m` : `${hours}h`;
  };

  const getButtonConfig = (sessionType) => {
    if (!sessionType) return { label: 'Purchase/Book', icon: 'ArrowRight', variant: 'default' };
    const type = sessionType.toLowerCase();
    if (type.includes('subscription') || type.includes('package')) {
      return { label: 'Subscribe Now', icon: 'TrendingUp', variant: 'success' };
    }
    return { label: 'Purchase/Book', icon: 'ArrowRight', variant: 'default' };
  };

  const handleBookSession = async (sessionId, sessionTitle) => {
    
    // 🚨 REMOVED CHECKS: We are removing the frontend isAuthenticated and isClient checks
    // based on your request that since you are viewing from the dashboard, you are already
    // authorized. The security check (token validity, client role) is now ENFORCED ONLY 
    // by the backend API call itself.
    
    if (!window.confirm(`Confirm booking for: ${sessionTitle}?`)) return;

    setBookingSessionId(sessionId); 

    try {
      // The backend /api/coach/public/:sessionId/book route still validates the token and role.
      await bookSession(sessionId);
      toast.success(`Successfully booked: ${sessionTitle}! View it in My Sessions.`);
    } catch (err) {
      console.error("Booking Error:", err);
      // If the backend fails (e.g., token expired or not a client), this catch block runs.
      const errorMsg = err.response?.data?.error || err.message || 'Booking failed due to authorization or server error.';
      toast.error(errorMsg);
    } finally {
      setBookingSessionId(null);
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
            const { label, icon, variant } = getButtonConfig(session?.type);
            const isLoading = bookingSessionId === session?.id;

            return (
              <div
                key={session?.id}
                className="border border-border rounded-card p-4 hover:shadow-soft transition-smooth"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 pr-4">
                    <h3 className="font-semibold text-foreground mb-1">{session?.title}</h3>
                    <p className="text-muted-foreground text-sm mb-2">{session?.description}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-xl font-bold text-primary">{formatPrice(session?.price)}</div>
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

                  <Button
                    variant={variant}
                    size="sm"
                    onClick={() => handleBookSession(session?.id, session?.title)}
                    iconName={icon}
                    iconPosition="right"
                    loading={isLoading} 
                    // We rely on the handleBookSession function and the loading state only.
                    disabled={isLoading} 
                  >
                    {isLoading ? 'Processing...' : label}
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