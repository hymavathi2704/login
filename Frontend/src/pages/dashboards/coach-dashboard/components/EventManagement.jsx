import React, { useState, useEffect } from 'react';
import { 
  Plus, Calendar, Users, Search, Filter, MapPin, 
  Clock, Edit, Trash2, Eye, Copy 
} from 'lucide-react';
import { getMyEvents, createEvent, updateEvent, deleteEvent } from '@/auth/authApi';

const EventManagement = () => {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    type: 'webinar',
    date: '',
    time: '',
    duration: 90,
    price: '',
  });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await getMyEvents();
        setEvents(response.data);
      } catch (error) {
        console.error("Failed to fetch events:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const handleInputChange = (e, formType) => {
    const { name, value } = e.target;
    if (formType === 'new') {
      setNewEvent(prev => ({ ...prev, [name]: value }));
    } else {
      setSelectedEvent(prev => ({ ...prev, [name]: value }));
    }
  };

  const openEditModal = (event) => {
    const formattedEvent = {
        ...event,
        date: event.date ? new Date(event.date).toISOString().split('T')[0] : ''
    };
    setSelectedEvent(formattedEvent);
    setShowEditModal(true);
  };

  const handleCreateEvent = async (status) => {
    if (!newEvent.title || !newEvent.date || !newEvent.time || !newEvent.price || !newEvent.duration) {
      alert('Please fill in all required fields.');
      return;
    }
    try {
      const response = await createEvent({ ...newEvent, status });
      setEvents(prev => [...prev, response.data]);
      setShowCreateModal(false);
      setNewEvent({ title: '', description: '', type: 'webinar', date: '', time: '', duration: 90, price: '' });
    } catch (error) {
      console.error("Failed to create event:", error);
      alert('Failed to create event. Please check the console for details.');
    }
  };

  const handleUpdateEvent = async () => {
    if (!selectedEvent) return;
    try {
      const response = await updateEvent(selectedEvent.id, selectedEvent);
      setEvents(prev => prev.map(e => e.id === selectedEvent.id ? response.data : e));
      setShowEditModal(false);
      setSelectedEvent(null);
    } catch (error) {
      console.error("Failed to update event:", error);
      alert('Failed to update event. Please check the console for details.');
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
        try {
            await deleteEvent(eventId);
            setEvents(prev => prev.filter(e => e.id !== eventId));
        } catch (error) {
            console.error("Failed to delete event:", error);
            alert('Failed to delete event. Please check the console for details.');
        }
    }
  };

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

  if (isLoading) return <div className="text-center py-12"><p>Loading your events...</p></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Event Management</h2>
          <p className="text-gray-600">Create and manage your coaching events, workshops, and webinars</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>Create Event</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredEvents.map((event) => (
          <div key={event.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
             <div className="p-6">
              <h3 className="font-semibold text-lg line-clamp-2 mb-2">{event.title}</h3>
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">{event.description || 'No description'}</p>
              <div className="flex space-x-2">
                <button onClick={() => openEditModal(event)} className="flex-1 bg-purple-600 text-white px-3 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center space-x-1 text-sm">
                  <Edit size={16} />
                  <span>Edit</span>
                </button>
                <button onClick={() => handleDeleteEvent(event.id)} className="bg-red-100 text-red-700 p-2 rounded-lg hover:bg-red-200 transition-colors">
                  <Trash2 size={16} />
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

      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b"><h3 className="text-xl font-semibold">Create New Event</h3></div>
            <div className="p-6 space-y-4">
                <input name="title" value={newEvent.title} onChange={(e) => handleInputChange(e, 'new')} placeholder="Event Title" className="w-full px-3 py-2 border rounded-lg"/>
                <textarea name="description" value={newEvent.description} onChange={(e) => handleInputChange(e, 'new')} placeholder="Description" className="w-full px-3 py-2 border rounded-lg"/>
                <select name="type" value={newEvent.type} onChange={(e) => handleInputChange(e, 'new')} className="w-full px-3 py-2 border rounded-lg">
                    <option value="webinar">Webinar</option>
                    <option value="workshop">Workshop</option>
                    <option value="consultation">Consultation</option>
                </select>
                <input name="price" type="number" value={newEvent.price} onChange={(e) => handleInputChange(e, 'new')} placeholder="Price ($)" className="w-full px-3 py-2 border rounded-lg"/>
                <input name="date" type="date" value={newEvent.date} onChange={(e) => handleInputChange(e, 'new')} className="w-full px-3 py-2 border rounded-lg"/>
                <input name="time" type="time" value={newEvent.time} onChange={(e) => handleInputChange(e, 'new')} className="w-full px-3 py-2 border rounded-lg"/>
                <input name="duration" type="number" value={newEvent.duration} onChange={(e) => handleInputChange(e, 'new')} placeholder="Duration (minutes)" className="w-full px-3 py-2 border rounded-lg"/>
            </div>
            <div className="p-6 border-t flex justify-end space-x-3">
              <button onClick={() => setShowCreateModal(false)} className="px-4 py-2 border rounded-lg">Cancel</button>
              <button onClick={() => handleCreateEvent('draft')} className="px-4 py-2 bg-gray-600 text-white rounded-lg">Save as Draft</button>
              <button onClick={() => handleCreateEvent('published')} className="px-4 py-2 bg-purple-600 text-white rounded-lg">Publish Event</button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b"><h3 className="text-xl font-semibold">Edit Event</h3></div>
            <div className="p-6 space-y-4">
                <input name="title" value={selectedEvent.title} onChange={(e) => handleInputChange(e, 'edit')} placeholder="Event Title" className="w-full px-3 py-2 border rounded-lg"/>
                <textarea name="description" value={selectedEvent.description} onChange={(e) => handleInputChange(e, 'edit')} placeholder="Description" className="w-full px-3 py-2 border rounded-lg"/>
                <select name="type" value={selectedEvent.type} onChange={(e) => handleInputChange(e, 'edit')} className="w-full px-3 py-2 border rounded-lg">
                    <option value="webinar">Webinar</option>
                    <option value="workshop">Workshop</option>
                    <option value="consultation">Consultation</option>
                </select>
                <input name="price" type="number" value={selectedEvent.price} onChange={(e) => handleInputChange(e, 'edit')} placeholder="Price ($)" className="w-full px-3 py-2 border rounded-lg"/>
                <input name="date" type="date" value={selectedEvent.date} onChange={(e) => handleInputChange(e, 'edit')} className="w-full px-3 py-2 border rounded-lg"/>
                <input name="time" type="time" value={selectedEvent.time} onChange={(e) => handleInputChange(e, 'edit')} className="w-full px-3 py-2 border rounded-lg"/>
                <input name="duration" type="number" value={selectedEvent.duration} onChange={(e) => handleInputChange(e, 'edit')} placeholder="Duration (minutes)" className="w-full px-3 py-2 border rounded-lg"/>
            </div>
            <div className="p-6 border-t flex justify-end space-x-3">
              <button onClick={() => setShowEditModal(false)} className="px-4 py-2 border rounded-lg">Cancel</button>
              <button onClick={handleUpdateEvent} className="px-4 py-2 bg-purple-600 text-white rounded-lg">Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventManagement;