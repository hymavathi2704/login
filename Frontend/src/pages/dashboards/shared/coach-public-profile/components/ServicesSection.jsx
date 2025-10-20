import React, { useState } from 'react';
import Icon from '@/components/AppIcon';
import Button from '@/components/ui/Button';
// ✅ ADD Calendar and X for pop-up UI
import { Clock, Tag, DollarSign, TrendingUp, ArrowRight, CheckCircle, Calendar, X } from 'lucide-react';
import { useAuth } from '@/auth/AuthContext'; // CORRECTED IMPORT
import { bookSession } from '@/auth/authApi';
import { toast } from 'sonner';

// 🚨 Must accept onSessionBooked prop
const ServicesSection = ({ coach, onSessionBooked }) => {
  const { isAuthenticated, roles, user } = useAuth(); 
  const [bookingSessionId, setBookingSessionId] = useState(null); 
  // ✅ NEW STATE: To control the session detail pop-up
  const [selectedSession, setSelectedSession] = useState(null); 

  const formatPrice = (price) => {
    const p = parseFloat(price);
    if (p === 0) return 'FREE';
    // START OF CHANGE: Updated currency to Indian Rupees (INR) and locale to 'en-IN'
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(p);
    // END OF CHANGE
  };

  const formatDuration = (minutes) => {
    const m = parseInt(minutes, 10);
    if (m < 60) return `${m} min`;
    const hours = Math.floor(m / 60);
    const remaining = m % 60;
    return remaining > 0 ? `${hours}h ${remaining}m` : `${hours}h`;
  };

  // ✅ NEW HELPER: Combines separate defaultDate and defaultTime fields from the backend
  const getScheduledDateTime = (session) => {
    // If both date and time exist, combine them into an ISO-like string
    if (session?.defaultDate && session?.defaultTime) {
        return `${session.defaultDate}T${session.defaultTime}`; 
    }
    return null;
  };

  // ✅ MODIFIED FUNCTION: Formats the date and time using the helper
  const formatDateTime = (session) => {
    const dateTimeString = getScheduledDateTime(session);
    if (!dateTimeString) return 'No fixed date/time (Flexible Booking)';
    try {
      const date = new Date(dateTimeString);
      return new Intl.DateTimeFormat('en-US', {
        dateStyle: 'full',
        timeStyle: 'short',
      }).format(date);
    } catch {
      return 'Invalid date/time format';
    }
  };


  // 🚨 Must accept isBooked argument
  const getButtonConfig = (sessionType, isBooked) => {
    // 1. Logic for already booked session
    if (isBooked) {
        return { 
            label: 'Purchased / Booked', // The required text change
            icon: 'CheckCircle', 
            variant: 'success', 
            disabled: true, // Disable button
            className: 'opacity-80 cursor-default' // Style for booked state
        };
    }
    
    // 2. Original logic for unbooked sessions
    if (!sessionType) return { label: 'Purchase/Book', icon: 'ArrowRight', variant: 'default', disabled: false, className: '' };
    const type = sessionType.toLowerCase();
    if (type.includes('subscription') || type.includes('package')) {
      return { label: 'Subscribe Now', icon: 'TrendingUp', variant: 'success', disabled: false, className: '' };
    }
    return { label: 'Purchase/Book', icon: 'ArrowRight', variant: 'default', disabled: false, className: '' };
  };

  const handleBookSession = async (sessionId, sessionTitle) => {
    
    if (!window.confirm(`Confirm booking for: ${sessionTitle}?`)) return;

    setBookingSessionId(sessionId); 

    try {
      await bookSession(sessionId);
      toast.success(`Successfully booked: ${sessionTitle}! View it in My Sessions.`);
      
      // 🚨 CRITICAL: Call the callback to force the parent component to re-fetch coach data
      if (onSessionBooked) {
        onSessionBooked(); 
      }

    } catch (err) {
      console.error("Booking Error:", err);
      const errorMsg = err.response?.data?.error || err.message || 'Booking failed due to server error.';
      toast.error(errorMsg);
    } finally {
      setBookingSessionId(null);
    }
  };
  
  // ✅ NEW FUNCTION: Handles the click on the session card to open the modal
  const handleSessionClick = (session) => {
    setSelectedSession(session);
  };
  
  // ✅ NEW FUNCTION: Closes the session detail modal
  const handleCloseModal = () => {
    setSelectedSession(null);
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
            // 🚨 CRITICAL: Read the isBooked flag passed from the backend
            const isBooked = session?.isBooked;

            // ✅ Use the helper function here
            const scheduledDateTimeString = getScheduledDateTime(session);

            // 🚨 CRITICAL: Pass isBooked to getButtonConfig
            const { label, icon, variant, disabled: configDisabled, className: configClassName } = getButtonConfig(session?.type, isBooked);
            
            const isLoading = bookingSessionId === session?.id;
            // Combine loading state with configured disabled state
            const isDisabled = isLoading || configDisabled; 

            return (
              // ✅ MODIFIED: Added onClick handler to the container div
              <div
                key={session?.id}
                className="border border-border rounded-card p-4 hover:shadow-soft transition-smooth cursor-pointer"
                onClick={() => handleSessionClick(session)}
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
                    {/* ✅ MODIFIED: Use the scheduledDateTimeString */}
                    <div className="flex items-center space-x-1">
                      <Calendar size={14} /> 
                      <span>
                        {scheduledDateTimeString 
                           ? new Date(scheduledDateTimeString).toLocaleString('en-US', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) 
                           : 'Flexible'}
                      </span>
                    </div>
                    {/* Existing Duration and Type */}
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
                    onClick={(e) => { e.stopPropagation(); handleBookSession(session?.id, session?.title); }} // 💡 Stop propagation to prevent modal trigger
                    iconName={icon}
                    iconPosition="right"
                    loading={isLoading} 
                    disabled={isDisabled} 
                    className={configClassName}
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

      {/* 🛑 NEW: Session Details Modal */}
      {selectedSession && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={handleCloseModal}>
          <div 
            className="bg-card rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 space-y-4 relative"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
          >
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Close"
            >
              <X size={24} />
            </button>
            <h3 className="text-2xl font-bold text-foreground pr-10">{selectedSession.title} Details</h3>
            
            <div className="space-y-3">
              {/* Price and Type */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-lg font-bold text-primary">
                  <DollarSign size={20} />
                  <span>{formatPrice(selectedSession.price)}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Tag size={16} />
                  <span className="capitalize">{selectedSession.type || 'Individual'}</span>
                </div>
              </div>
              
              {/* ✅ CRITICAL: Date and Time Display - Passing the full session object */}
              <div className="flex items-center space-x-2 text-foreground font-medium">
                <Calendar size={18} />
                <span className="text-sm">
                  {formatDateTime(selectedSession)}
                </span>
              </div>
              
              {/* Duration */}
              <div className="flex items-center space-x-2 text-foreground font-medium">
                <Clock size={18} />
                <span className="text-sm">
                  Duration: {formatDuration(selectedSession.duration)}
                </span>
              </div>
              
              {/* Description (Full Details) */}
              <div>
                <h4 className="font-semibold text-base text-foreground mt-3 mb-1">Description:</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-line">{selectedSession.description}</p>
              </div>

              {/* Booking CTA - Optional, but helpful for user flow */}
              <div className="pt-4 border-t border-border mt-4">
                 <p className="text-xs text-muted-foreground mb-2">Ready to book this service?</p>
                 <Button
                    variant={getButtonConfig(selectedSession.type, selectedSession.isBooked).variant}
                    fullWidth
                    onClick={(e) => { e.stopPropagation(); handleBookSession(selectedSession.id, selectedSession.title); handleCloseModal(); }}
                    iconName={getButtonConfig(selectedSession.type, selectedSession.isBooked).icon}
                    iconPosition="right"
                    disabled={selectedSession.isBooked}
                 >
                   {getButtonConfig(selectedSession.type, selectedSession.isBooked).label}
                 </Button>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServicesSection;