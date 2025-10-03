import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  User, 
  Search, 
  Info
} from 'lucide-react';
import { getEvents, bookEvent } from '../../../../auth/authApi';

const BookNewSession = () => {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await getEvents();
        setEvents(response.data);
      } catch (err) {
        console.error("Failed to fetch events:", err);
        setError("Could not load available sessions.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []);


  const handleBookSession = async () => {
    if (!selectedEvent) return;

    if (window.confirm(`Are you sure you want to book "${selectedEvent.title}"?`)) {
      try {
        await bookEvent(selectedEvent.id);
        alert(`Successfully booked your spot for: ${selectedEvent.title}!`);
        setSelectedEvent(null); // Close the confirmation section
      } catch (err) {
        console.error("Booking failed:", err);
        alert(err.message || "There was an issue booking this session. Please try again.");
      }
    }
  };

  const filteredEvents = events.filter(event => {
    const coachName = `${event.coach.firstName} ${event.coach.lastName}`.toLowerCase();
    const eventTitle = event.title.toLowerCase();
    
    return eventTitle.includes(searchTerm.toLowerCase()) || coachName.includes(searchTerm.toLowerCase());
  });

  if (isLoading) {
    return <div className="text-center p-8"><p>Loading available sessions...</p></div>;
  }

  if (error) {
    return <div className="text-center p-8 text-red-500">{error}</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Book a New Session</h2>
        <p className="text-gray-600">Browse and book upcoming events from our expert coaches.</p>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="relative">
          <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by event title or coach name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.length > 0 ? filteredEvents.map((event) => (
          <div key={event.id} className="bg-white rounded-xl border border-gray-200 flex flex-col overflow-hidden hover:shadow-lg transition-shadow">
            <div className="p-6 flex-grow">
              <p className="text-sm text-purple-600 font-semibold uppercase tracking-wider">{event.type}</p>
              <h3 className="font-bold text-xl mt-1 mb-2 line-clamp-2">{event.title}</h3>
              <p className="text-gray-600 text-sm mb-4 line-clamp-3">{event.description || 'No description available.'}</p>
              
              <div className="space-y-2 text-sm text-gray-700">
                <p className="flex items-center"><User size={14} className="mr-2 text-gray-500" /> <strong>Coach:</strong> &nbsp;{event.coach.firstName} {event.coach.lastName}</p>
                <p className="flex items-center"><Calendar size={14} className="mr-2 text-gray-500" /> {new Date(event.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                <p className="flex items-center"><Clock size={14} className="mr-2 text-gray-500" /> {event.time} ({event.duration} min)</p>
              </div>
            </div>
            
            <div className="p-6 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
              <p className="text-lg font-bold text-gray-800">
                {parseFloat(event.price) > 0 ? `$${event.price}` : 'Free'}
              </p>
              <button 
                onClick={() => setSelectedEvent(event)}
                className="bg-purple-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
              >
                Book Now
              </button>
            </div>
          </div>
        )) : (
          <div className="col-span-full text-center py-12">
            <Info size={48} className="mx-auto text-gray-300 mb-4" />
            <h4 className="text-lg font-medium text-gray-800">No Events Found</h4>
            <p className="text-gray-500">No events match your search, or no events have been published yet.</p>
          </div>
        )}
      </div>

      {/* Booking Confirmation Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full">
            <div className="p-6 border-b">
              <h3 className="text-xl font-semibold">Confirm Your Booking</h3>
            </div>
            <div className="p-6 space-y-4">
              <p>You are about to book a spot for:</p>
              <div className="bg-gray-50 p-4 rounded-lg border">
                <h4 className="font-bold text-lg">{selectedEvent.title}</h4>
                <p className="text-sm text-gray-600 mt-1">with {selectedEvent.coach.firstName} {selectedEvent.coach.lastName}</p>
              </div>
              <div className="flex justify-between items-center text-lg">
                <span className="text-gray-600">Total Price:</span>
                <span className="font-bold text-purple-700">${selectedEvent.price}</span>
              </div>
            </div>
            <div className="p-6 bg-gray-50 border-t flex justify-end space-x-3">
              <button onClick={() => setSelectedEvent(null)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100">
                Cancel
              </button>
              <button onClick={handleBookSession} className="px-6 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700">
                Confirm & Book
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookNewSession;