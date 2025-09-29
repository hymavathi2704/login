import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Calendar, 
  Users, 
  Search, 
  Filter,
  MapPin,
  Clock,
  Edit,
  ExternalLink,
  Copy,
  Eye
} from 'lucide-react';
import { getMyEvents, createEvent } from '@/auth/authApi'; // Make sure this path is correct

const EventManagement = () => {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  
  // State for the new event form
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    type: 'webinar',
    date: '',
    time: '',
    duration: 90, // Default duration in minutes
    price: '',
    status: 'draft',
  });

  // Fetch events from the backend when the component mounts
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await getMyEvents();
        setEvents(response.data);
      } catch (error) {
        console.error("Failed to fetch events:", error);
        // You could add a user-facing error message here
      } finally {
        setIsLoading(false);
      }
    };
    fetchEvents();
  }, []);

  // Handle input changes in the create event form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEvent(prev => ({ ...prev, [name]: value }));
  };

  // Handle the creation of a new event
  const handleCreateEvent = async (status) => {
    // Basic validation
    if (!newEvent.title || !newEvent.date || !newEvent.time || !newEvent.price || !newEvent.duration) {
      alert('Please fill in all required fields.');
      return;
    }
    
    try {
      const eventToCreate = { ...newEvent, status };
      const response = await createEvent(eventToCreate);
      setEvents(prev => [...prev, response.data]); // Add the new event to the list
      setShowCreateEvent(false); // Close the modal
      // Reset the form for the next event
      setNewEvent({
        title: '', description: '', type: 'webinar', date: '',
        time: '', duration: 90, price: '', status: 'draft'
      });
    } catch (error) {
      console.error("Failed to create event:", error);
      alert('Failed to create event. Please check the console for details.');
    }
  };

  // Filter events based on search and filter criteria
  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (event.description && event.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = filterStatus === 'all' || event.status === filterStatus;
    const matchesType = filterType === 'all' || event.type === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'webinar': return '🎥';
      case 'workshop': return '🛠️';
      case 'course': return '📚';
      case 'consultation': return '💬';
      default: return '📅';
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <p>Loading your events...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Event Management</h2>
          <p className="text-gray-600">Create and manage your coaching events, workshops, and webinars</p>
        </div>
        <button
          onClick={() => setShowCreateEvent(true)}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>Create Event</span>
        </button>
      </div>
      
      {/* Stats Cards - Note: These stats are now calculated from the live data */}
       <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="text-3xl font-bold text-blue-600 mb-2">
            {events.filter(e => e.status === 'published').length}
          </div>
          <div className="text-gray-600">Published Events</div>
        </div>
        {/* Add other stat cards if needed, fetching registration data would be a next step */}
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
          {/* ... existing search and filter JSX ... */}
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredEvents.map((event) => (
          <div key={event.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative">
              <img
                src="/api/placeholder/300/200" // Replace with event.image if you add image uploads
                alt={event.title}
                className="w-full h-48 object-cover bg-gray-200"
              />
              <div className="absolute top-4 left-4 flex space-x-2">
                <span className={`px-2 py-1 text-xs rounded-full font-medium capitalize ${getStatusColor(event.status)}`}>
                  {event.status}
                </span>
                <span className="bg-white/90 text-gray-800 px-2 py-1 text-xs rounded-full capitalize">
                  {getTypeIcon(event.type)} {event.type}
                </span>
              </div>
              {parseFloat(event.price) > 0 && (
                <div className="absolute top-4 right-4 bg-green-500 text-white px-2 py-1 text-sm font-medium rounded">
                  ${event.price}
                </div>
              )}
              {parseFloat(event.price) === 0 && (
                <div className="absolute top-4 right-4 bg-blue-500 text-white px-2 py-1 text-sm font-medium rounded">
                  FREE
                </div>
              )}
            </div>

            <div className="p-6">
              <h3 className="font-semibold text-lg line-clamp-2 mb-2">{event.title}</h3>
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">{event.description}</p>
              
              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <div className="flex items-center space-x-2">
                  <Calendar size={16} />
                  <span>{new Date(event.date).toLocaleDateString()} at {event.time}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock size={16} />
                  <span>{event.duration} minutes</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-2">
                <button className="flex-1 bg-purple-600 text-white px-3 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center space-x-1 text-sm">
                  <Edit size={16} />
                  <span>Edit</span>
                </button>
                <button className="bg-gray-100 text-gray-600 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors">
                  <Copy size={16} />
                </button>
                <button className="bg-gray-100 text-gray-600 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors">
                  <Eye size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredEvents.length === 0 && !isLoading && (
        <div className="text-center py-12 col-span-full">
          <Calendar size={48} className="text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
          <p className="text-gray-500">Click "Create Event" to get started.</p>
        </div>
      )}

      {/* Create Event Modal */}
      {showCreateEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold">Create New Event</h3>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Event Title *</label>
                <input
                  type="text"
                  name="title"
                  value={newEvent.title}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g., Leadership Skills Workshop"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  rows="4"
                  name="description"
                  value={newEvent.description}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Describe your event..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Event Type *</label>
                  <select 
                    name="type"
                    value={newEvent.type}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="webinar">Webinar</option>
                    <option value="workshop">Workshop</option>
                    <option value="consultation">Consultation</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price ($) *</label>
                  <input
                    type="number"
                    name="price"
                    min="0"
                    step="0.01"
                    value={newEvent.price}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="0 for a free event"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date *</label>
                  <input
                    type="date"
                    name="date"
                    value={newEvent.date}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Time *</label>
                  <input
                    type="time"
                    name="time"
                    value={newEvent.time}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Duration (min) *</label>
                  <input
                    type="number"
                    name="duration"
                    min="1"
                    value={newEvent.duration}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowCreateEvent(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button onClick={() => handleCreateEvent('draft')} className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
                Save as Draft
              </button>
              <button
                onClick={() => handleCreateEvent('published')}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Publish Event
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventManagement;