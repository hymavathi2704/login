import React, { useState } from 'react';
import { 
  Plus, 
  Calendar, 
  Users, 
  DollarSign, 
  Search, 
  Filter,
  MapPin,
  Clock,
  Edit,
  Trash2,
  Eye,
  Copy,
  ExternalLink
} from 'lucide-react';

const EventManagement = () => {
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');

  const events = [
    {
      id: 1,
      title: "Work-Life Balance Masterclass",
      description: "Learn essential strategies to achieve better work-life balance in today's fast-paced world.",
      type: "webinar",
      category: "Life Coaching",
      date: "2025-02-15",
      time: "2:00 PM",
      duration: "90 minutes",
      venue: "Online (Zoom)",
      capacity: 50,
      registered: 42,
      waitlist: 8,
      price: 49,
      status: "published",
      image: "/api/placeholder/300/200",
      registrationUrl: "https://katha.com/events/work-life-balance-masterclass"
    },
    {
      id: 2,
      title: "Leadership Skills Workshop",
      description: "Interactive workshop focused on developing core leadership competencies for emerging managers.",
      type: "workshop",
      category: "Career Development",
      date: "2025-02-20",
      time: "10:00 AM",
      duration: "4 hours",
      venue: "Downtown Conference Center, Room A",
      capacity: 25,
      registered: 18,
      waitlist: 0,
      price: 150,
      status: "published",
      image: "/api/placeholder/300/200",
      registrationUrl: "https://katha.com/events/leadership-skills-workshop"
    },
    {
      id: 3,
      title: "Mindfulness & Stress Management",
      description: "Practical techniques for managing stress and incorporating mindfulness into daily life.",
      type: "course",
      category: "Wellness",
      date: "2025-03-01",
      time: "6:00 PM",
      duration: "6 weeks",
      venue: "Online (Interactive Platform)",
      capacity: 30,
      registered: 15,
      waitlist: 0,
      price: 200,
      status: "draft",
      image: "/api/placeholder/300/200",
      registrationUrl: null
    },
    {
      id: 4,
      title: "Free Consultation Hour",
      description: "Free group consultation session for potential coaching clients to ask questions.",
      type: "consultation",
      category: "General",
      date: "2025-01-25",
      time: "7:00 PM",
      duration: "60 minutes",
      venue: "Online (Google Meet)",
      capacity: 20,
      registered: 14,
      waitlist: 0,
      price: 0,
      status: "published",
      image: "/api/placeholder/300/200",
      registrationUrl: "https://katha.com/events/free-consultation-hour"
    }
  ];

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || event.status === filterStatus;
    const matchesType = filterType === 'all' || event.type === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'webinar':
        return '🎥';
      case 'workshop':
        return '🛠️';
      case 'course':
        return '📚';
      case 'consultation':
        return '💬';
      default:
        return '📅';
    }
  };

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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="text-3xl font-bold text-blue-600 mb-2">
            {events.filter(e => e.status === 'published').length}
          </div>
          <div className="text-gray-600">Published Events</div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="text-3xl font-bold text-green-600 mb-2">
            {events.reduce((acc, event) => acc + event.registered, 0)}
          </div>
          <div className="text-gray-600">Total Registrations</div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="text-3xl font-bold text-purple-600 mb-2">
            ${events.reduce((acc, event) => acc + (event.price * event.registered), 0).toLocaleString()}
          </div>
          <div className="text-gray-600">Revenue Generated</div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="text-3xl font-bold text-orange-600 mb-2">
            {events.reduce((acc, event) => acc + event.waitlist, 0)}
          </div>
          <div className="text-gray-600">Waitlist Total</div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-4">
          <div className="flex-1 relative">
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          
          <div className="flex space-x-4">
            <div className="flex items-center space-x-2">
              <Filter size={20} className="text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">All Status</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Types</option>
              <option value="webinar">Webinars</option>
              <option value="workshop">Workshops</option>
              <option value="course">Courses</option>
              <option value="consultation">Consultations</option>
            </select>
          </div>
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredEvents.map((event) => (
          <div key={event.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative">
              <img
                src={event.image}
                alt={event.title}
                className="w-full h-48 object-cover"
              />
              <div className="absolute top-4 left-4 flex space-x-2">
                <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(event.status)}`}>
                  {event.status}
                </span>
                <span className="bg-white/90 text-gray-800 px-2 py-1 text-xs rounded-full">
                  {getTypeIcon(event.type)} {event.type}
                </span>
              </div>
              {event.price > 0 && (
                <div className="absolute top-4 right-4 bg-green-500 text-white px-2 py-1 text-sm font-medium rounded">
                  ${event.price}
                </div>
              )}
              {event.price === 0 && (
                <div className="absolute top-4 right-4 bg-blue-500 text-white px-2 py-1 text-sm font-medium rounded">
                  FREE
                </div>
              )}
            </div>

            <div className="p-6">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-lg line-clamp-2">{event.title}</h3>
              </div>
              
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">{event.description}</p>
              
              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <div className="flex items-center space-x-2">
                  <Calendar size={16} />
                  <span>{new Date(event.date).toLocaleDateString()} at {event.time}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock size={16} />
                  <span>{event.duration}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin size={16} />
                  <span className="line-clamp-1">{event.venue}</span>
                </div>
              </div>

              {/* Registration Stats */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2 text-sm">
                  <Users size={16} className="text-gray-400" />
                  <span>{event.registered}/{event.capacity} registered</span>
                </div>
                {event.waitlist > 0 && (
                  <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                    {event.waitlist} waitlisted
                  </span>
                )}
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                <div 
                  className="bg-purple-500 h-2 rounded-full"
                  style={{ width: `${Math.min((event.registered / event.capacity) * 100, 100)}%` }}
                />
              </div>

              {/* Actions */}
              <div className="flex space-x-2">
                <button className="flex-1 bg-purple-600 text-white px-3 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center space-x-1 text-sm">
                  <Edit size={16} />
                  <span>Edit</span>
                </button>
                
                {event.registrationUrl && (
                  <button className="bg-gray-100 text-gray-600 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors">
                    <ExternalLink size={16} />
                  </button>
                )}
                
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

      {filteredEvents.length === 0 && (
        <div className="text-center py-12">
          <Calendar size={48} className="text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
          <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
        </div>
      )}

      {/* Create Event Modal */}
      {showCreateEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold">Create New Event</h3>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Event Title *</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Enter event title"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                    <textarea
                      rows="4"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Describe your event..."
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Event Type *</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500">
                        <option value="webinar">Webinar</option>
                        <option value="workshop">Workshop</option>
                        <option value="course">Course</option>
                        <option value="consultation">Consultation</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500">
                        <option value="Life Coaching">Life Coaching</option>
                        <option value="Career Development">Career Development</option>
                        <option value="Wellness">Wellness</option>
                        <option value="Business Coaching">Business Coaching</option>
                        <option value="Leadership">Leadership</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Date *</label>
                      <input
                        type="date"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Time *</label>
                      <input
                        type="time"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Duration *</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="e.g., 90 minutes, 2 hours, 4 weeks"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Venue *</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Online (Zoom) or physical address"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Capacity *</label>
                      <input
                        type="number"
                        min="1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Max attendees"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Price ($) *</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="0 for free event"
                      />
                    </div>
                  </div>
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
              <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
                Save as Draft
              </button>
              <button
                onClick={() => setShowCreateEvent(false)}
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