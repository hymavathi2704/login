import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, DollarSign, Video, MapPin, Filter } from 'lucide-react';
import { getEvents, bookEvent } from '@/auth/authApi';

const BookNewSession = () => {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await getEvents();
        setEvents(response.data);
      } catch (error) {
        console.error("Failed to fetch events:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const handleBookSession = async () => {
    if (!selectedEvent) {
      alert('Please select an event to book.');
      return;
    }
    
    try {
      await bookEvent(selectedEvent.id);
      alert(`Successfully booked your spot for: ${selectedEvent.title}`);
      setSelectedEvent(null);
      // Optionally, refresh events or update UI to show booking
    } catch (error) {
      console.error("Booking failed:", error);
      alert('There was an issue booking this event. Please try again.');
    }
  };
  
  // Update filters if needed, or remove if not applicable to events
  // For simplicity, I'm removing the old coach-based filters here

  if (isLoading) {
    return <div>Loading available sessions...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Book a New Session</h2>
      <p className="text-gray-600">Browse and book upcoming webinars, workshops, and consultations.</p>

      {/* Event List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {events.map((event) => (
          <div 
            key={event.id}
            className={`bg-white rounded-xl border-2 p-6 cursor-pointer transition-all ${
              selectedEvent?.id === event.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => setSelectedEvent(event)}
          >
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-lg">{event.title}</h4>
                <div className="text-right">
                  <div className="font-bold text-blue-600">${event.price}</div>
                  <div className="text-sm text-gray-500">{event.duration} min</div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="text-sm text-blue-600 font-medium capitalize">{event.type} with {event.coach.firstName} {event.coach.lastName}</div>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span><Calendar size={14} className="inline mr-1" /> {new Date(event.date).toLocaleDateString()}</span>
                  <span><Clock size={14} className="inline mr-1" /> {event.time}</span>
                </div>
                <p className="text-sm text-gray-600">{event.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Booking Confirmation Section */}
      {selectedEvent && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 sticky bottom-0">
          <h3 className="text-lg font-semibold mb-4">Confirm Booking for: {selectedEvent.title}</h3>
          <div className="flex items-center justify-between">
            <div className="text-lg">
              <span className="text-gray-600">Total: </span>
              <span className="font-bold text-blue-600">${selectedEvent.price}</span>
            </div>
            
            <button
              onClick={handleBookSession}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Confirm & Book
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookNewSession;