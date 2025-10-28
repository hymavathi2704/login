import React, { useState, useEffect } from 'react'; // 🛑 ADD useEffect
import Icon from '@/components/AppIcon';
import Button from '@/components/ui/Button';
// ✅ ADD Calendar and X for pop-up UI
import { Clock, Tag, DollarSign, TrendingUp, ArrowRight, CheckCircle, Calendar, X } from 'lucide-react';
import { useAuth } from '@/auth/AuthContext';
import { bookSession } from '@/auth/authApi';
import { toast } from 'sonner';

// 🛑 NEW IMPORT: Cashfree SDK
import { load } from "@cashfreepayments/cashfree-js";

// 🚨 Must accept onSessionBooked prop
const ServicesSection = ({ coach, onSessionBooked }) => {
  // Access isAuthenticated and user object for debugging
  const { isAuthenticated, roles, user } = useAuth(); 
  const [bookingSessionId, setBookingSessionId] = useState(null); 
  const [selectedSession, setSelectedSession] = useState(null); 
  // 🛑 NEW STATE: To hold the initialized Cashfree SDK instance
  const [cashfree, setCashfree] = useState(null);

  // 🛑 NEW EFFECT: Initialize Cashfree SDK once on component mount
  useEffect(() => {
    const initializeCashfree = async () => {
        // Use sandbox mode for testing (you must define VITE_CASHFREE_MODE in .env)
        const mode = import.meta.env.VITE_CASHFREE_MODE || "sandbox"; 
        try {
            const cf = await load({ mode });
            setCashfree(cf);
        } catch (error) {
            console.error("Failed to load Cashfree SDK:", error);
        }
    };
    initializeCashfree();
  }, []);
  // -----------------------------------------------------------

  const formatPrice = (price) => {
    const p = parseFloat(price);
    if (p === 0) return 'FREE';
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(p);
  };

  const formatDuration = (minutes) => {
    const m = parseInt(minutes, 10);
    if (m < 60) return `${m} min`;
    const hours = Math.floor(m / 60);
    const remaining = m % 60;
    return remaining > 0 ? `${hours}h ${remaining}m` : `${hours}h`;
  };

  const getScheduledDateTime = (session) => {
    if (session?.defaultDate && session?.defaultTime) {
        return `${session.defaultDate}T${session.defaultTime}`; 
    }
    return null;
  };

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


  const getButtonConfig = (sessionType, isBooked) => {
    if (isBooked) {
        return { 
          label: 'Purchased / Booked', 
          icon: 'CheckCircle', 
          variant: 'success', 
          disabled: true, 
          className: 'opacity-80 cursor-default'
        };
    }
    
    if (!sessionType) return { label: 'Purchase/Book', icon: 'ArrowRight', variant: 'default', disabled: false, className: '' };
    const type = sessionType.toLowerCase();
    if (type.includes('subscription') || type.includes('package')) {
      return { label: 'Subscribe Now', icon: 'TrendingUp', variant: 'success', disabled: false, className: '' };
    }
    return { label: 'Purchase/Book', icon: 'ArrowRight', variant: 'default', disabled: false, className: '' };
  };

  // 🛑 CRITICAL MODIFICATION: Updated function signature and logic for payment flow
  const handleBookSession = async (session) => {
    const { id: sessionId, title: sessionTitle, price } = session;
    const sessionPrice = parseFloat(price);
    
    // --------------------------------------------------------
    // 🛑 DEBUGGING LOG 🛑
    console.log("DEBUG: Purchase Attempt:", sessionTitle);
    console.log("DEBUG: Is Authenticated:", isAuthenticated);
    console.log("DEBUG: User object (to check roles/ID):", user);
    // --------------------------------------------------------
    
    if (!isAuthenticated) {
        toast.error("Please log in to purchase this service."); 
        return;
    }

    if (sessionPrice > 0 && !cashfree) {
        toast.error("Payment system not initialized. Please wait a moment or refresh.");
        return;
    }

    if (!window.confirm(`Confirm purchase and booking for: ${sessionTitle} (${formatPrice(price)})?`)) return;

    setBookingSessionId(sessionId); 

    try {
      // 1. Call Backend API to Create Order (Must now return payment_session_id)
      const bookResponse = await bookSession(sessionId);
      const paymentSessionId = bookResponse?.data?.payment_session_id; 
      
      if (sessionPrice > 0 && paymentSessionId) {
          // 2. Initiate Cashfree Checkout Flow
          const checkoutOptions = {
            paymentSessionId: paymentSessionId,
            redirectTarget: "_self", // Redirect in the current window
          };
          
          console.log("Initiating payment with options:", checkoutOptions);
          // Launch the Cashfree Payment Gateway screen
          cashfree.checkout(checkoutOptions); 
          
      } else if (sessionPrice === 0) {
          // 3. Handle Free Sessions
          toast.success(`Successfully booked: ${sessionTitle}! View it in My Sessions.`);
          if (onSessionBooked) {
            onSessionBooked(); 
          }
      } else {
          throw new Error("Server failed to initiate payment session.");
      }
      
    } catch (err) {
      console.error("Booking Error:", err);
      const errorMsg = err.response?.data?.error || err.message || 'Purchase/Booking failed due to server error.';
      toast.error(errorMsg);
    } finally {
      if (sessionPrice === 0 || !cashfree || (cashfree && bookingSessionId === sessionId)) {
         setBookingSessionId(null);
      }
    }
  };
  
  const handleSessionClick = (session) => {
    setSelectedSession(session);
  };
  
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
            const isBooked = session?.isBooked;
            const scheduledDateTimeString = getScheduledDateTime(session);
            const { label, icon, variant, disabled: configDisabled, className: configClassName } = getButtonConfig(session?.type, isBooked);
            
            const isPaidSession = parseFloat(session?.price) > 0;
            const isPaymentDisabled = isPaidSession && !cashfree;

            const isLoading = bookingSessionId === session?.id;
            const isDisabled = isLoading || configDisabled || isPaymentDisabled; 

            return (
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
                    <div className="flex items-center space-x-1">
                      <Calendar size={14} /> 
                      <span>
                        {scheduledDateTimeString 
                           ? new Date(scheduledDateTimeString).toLocaleString('en-US', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) 
                           : 'Flexible'}
                      </span>
                    </div>
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
                    // 🛑 CRITICAL: Pass the entire session object to the handler
                    onClick={(e) => { e.stopPropagation(); handleBookSession(session); }} 
                    iconName={icon}
                    iconPosition="right"
                    loading={isLoading} 
                    disabled={isDisabled} 
                    className={configClassName}
                  >
                    {isLoading 
                        ? 'Processing...' 
                        : isPaymentDisabled ? 'Payment Unavailable' : label}
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

      {/* 🛑 Session Details Modal */}
      {selectedSession && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={handleCloseModal}>
          <div 
            className="bg-card rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 space-y-4 relative"
            onClick={(e) => e.stopPropagation()}
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
              
              {/* Date and Time Display */}
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

              {/* Booking CTA */}
              <div className="pt-4 border-t border-border mt-4">
                  <p className="text-xs text-muted-foreground mb-2">Ready to book this service?</p>
                   <Button
                      variant={getButtonConfig(selectedSession.type, selectedSession.isBooked).variant}
                      fullWidth
                      // 🛑 CRITICAL: Pass the entire session object to the handler
                      onClick={(e) => { e.stopPropagation(); handleBookSession(selectedSession); handleCloseModal(); }}
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