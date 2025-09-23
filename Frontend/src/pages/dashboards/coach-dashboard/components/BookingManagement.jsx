import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  User, 
  DollarSign, 
  Video, 
  MapPin, 
  Search, 
  Filter,
  CheckCircle,
  XCircle,
  Edit,
  MessageSquare,
  Phone
} from 'lucide-react';

const BookingManagement = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const bookings = [
    {
      id: 1,
      client: {
        name: "Sarah Johnson",
        email: "sarah.johnson@email.com",
        avatar: "/api/placeholder/40/40"
      },
      date: "2025-01-15",
      time: "10:00 AM",
      endTime: "11:00 AM",
      duration: "60 min",
      type: "Life Coaching Session",
      sessionType: "video",
      status: "confirmed",
      price: 150,
      notes: "Follow-up on work-life balance goals",
      meetingLink: "https://zoom.us/j/123456789",
      bookedAt: "2025-01-10T14:30:00"
    },
    {
      id: 2,
      client: {
        name: "Michael Chen",
        email: "michael.chen@email.com", 
        avatar: "/api/placeholder/40/40"
      },
      date: "2025-01-15",
      time: "2:00 PM",
      endTime: "2:45 PM",
      duration: "45 min",
      type: "Career Development",
      sessionType: "video",
      status: "pending",
      price: 120,
      notes: "Executive presentation preparation",
      meetingLink: null,
      bookedAt: "2025-01-12T09:15:00"
    },
    {
      id: 3,
      client: {
        name: "Emma Wilson",
        email: "emma.wilson@email.com",
        avatar: "/api/placeholder/40/40"
      },
      date: "2025-01-15",
      time: "4:30 PM", 
      endTime: "5:30 PM",
      duration: "60 min",
      type: "Wellness Coaching",
      sessionType: "in-person",
      status: "confirmed",
      price: 100,
      notes: "Nutrition planning and stress management",
      location: "Downtown Office, Room 201",
      bookedAt: "2025-01-08T16:45:00"
    },
    {
      id: 4,
      client: {
        name: "David Rodriguez",
        email: "david.rodriguez@email.com",
        avatar: "/api/placeholder/40/40"
      },
      date: "2025-01-16",
      time: "11:00 AM",
      endTime: "12:00 PM", 
      duration: "60 min",
      type: "Leadership Coaching",
      sessionType: "video",
      status: "cancelled",
      price: 175,
      notes: "Team management challenges",
      meetingLink: null,
      bookedAt: "2025-01-09T11:20:00"
    },
    {
      id: 5,
      client: {
        name: "Lisa Thompson",
        email: "lisa.thompson@email.com",
        avatar: "/api/placeholder/40/40"
      },
      date: "2025-01-17",
      time: "9:00 AM",
      endTime: "9:30 AM",
      duration: "30 min",
      type: "Free Consultation",
      sessionType: "video",
      status: "confirmed",
      price: 0,
      notes: "Initial consultation for new client",
      meetingLink: "https://meet.google.com/abc-defg-hij",
      bookedAt: "2025-01-13T19:30:00"
    }
  ];

  const filteredBookings = bookings.filter(booking => {
    const matchesDate = booking.date === selectedDate;
    const matchesSearch = booking.client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || booking.status === filterStatus;
    return matchesDate && matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSessionTypeIcon = (type) => {
    return type === 'video' ? Video : MapPin;
  };

  const handleStatusChange = (bookingId, newStatus) => {
    // Here you would update the booking status in your backend
    console.log(`Updating booking ${bookingId} to status: ${newStatus}`);
  };

  const todayBookings = bookings.filter(b => b.date === new Date().toISOString().split('T')[0]);
  const upcomingBookings = bookings.filter(b => new Date(b.date) > new Date());
  const pendingBookings = bookings.filter(b => b.status === 'pending');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Booking Management</h2>
          <p className="text-gray-600">Manage your session bookings and availability</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="text-3xl font-bold text-blue-600 mb-2">
            {todayBookings.length}
          </div>
          <div className="text-gray-600">Today's Sessions</div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="text-3xl font-bold text-green-600 mb-2">
            {upcomingBookings.length}
          </div>
          <div className="text-gray-600">Upcoming Sessions</div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="text-3xl font-bold text-yellow-600 mb-2">
            {pendingBookings.length}
          </div>
          <div className="text-gray-600">Pending Approval</div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="text-3xl font-bold text-purple-600 mb-2">
            ${bookings.filter(b => b.status === 'confirmed').reduce((acc, booking) => acc + booking.price, 0)}
          </div>
          <div className="text-gray-600">Confirmed Revenue</div>
        </div>
      </div>

      {/* Filters and Date Selection */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <div className="relative">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by client name or session type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <div className="flex items-center space-x-2">
              <Filter size={20} className="text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">All Status</option>
                <option value="confirmed">Confirmed</option>
                <option value="pending">Pending</option>
                <option value="cancelled">Cancelled</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Bookings List */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold">
            Sessions for {new Date(selectedDate).toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </h3>
        </div>

        {filteredBookings.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {filteredBookings.map((booking) => {
              const SessionIcon = getSessionTypeIcon(booking.sessionType);
              
              return (
                <div key={booking.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <img
                        src={booking.client.avatar}
                        alt={booking.client.name}
                        className="w-12 h-12 rounded-full"
                      />
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="font-semibold text-lg">{booking.client.name}</h4>
                          <span className={`px-3 py-1 text-sm rounded-full border ${getStatusColor(booking.status)}`}>
                            {booking.status}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <Clock size={16} />
                              <span>{booking.time} - {booking.endTime} ({booking.duration})</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <SessionIcon size={16} />
                              <span>{booking.sessionType === 'video' ? 'Video Call' : booking.location}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <User size={16} />
                              <span>{booking.type}</span>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <DollarSign size={16} />
                              <span>{booking.price > 0 ? `$${booking.price}` : 'Free'}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Calendar size={16} />
                              <span>Booked: {new Date(booking.bookedAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                        
                        {booking.notes && (
                          <div className="mt-3">
                            <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                              <strong>Notes:</strong> {booking.notes}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col space-y-2 ml-4">
                      {booking.status === 'pending' && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleStatusChange(booking.id, 'confirmed')}
                            className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 flex items-center space-x-1"
                          >
                            <CheckCircle size={14} />
                            <span>Confirm</span>
                          </button>
                          <button
                            onClick={() => handleStatusChange(booking.id, 'cancelled')}
                            className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 flex items-center space-x-1"
                          >
                            <XCircle size={14} />
                            <span>Decline</span>
                          </button>
                        </div>
                      )}
                      
                      {booking.status === 'confirmed' && (
                        <div className="flex space-x-2">
                          {booking.meetingLink && (
                            <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">
                              Join Session
                            </button>
                          )}
                          <button className="bg-gray-100 text-gray-600 px-3 py-1 rounded text-sm hover:bg-gray-200">
                            <Edit size={14} />
                          </button>
                        </div>
                      )}
                      
                      <div className="flex space-x-2">
                        <button className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-sm hover:bg-gray-200">
                          <MessageSquare size={14} />
                        </button>
                        <button className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-sm hover:bg-gray-200">
                          <Phone size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <Calendar size={48} className="text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No sessions scheduled</h3>
            <p className="text-gray-500">No sessions found for the selected date and filters.</p>
          </div>
        )}
      </div>

      {/* Quick Stats for Selected Date */}
      {filteredBookings.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Day Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {filteredBookings.length}
              </div>
              <div className="text-sm text-gray-600">Total Sessions</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {filteredBookings.filter(b => b.status === 'confirmed').length}
              </div>
              <div className="text-sm text-gray-600">Confirmed</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-600">
                {filteredBookings.filter(b => b.status === 'pending').length}
              </div>
              <div className="text-sm text-gray-600">Pending</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                ${filteredBookings.filter(b => b.status === 'confirmed').reduce((acc, booking) => acc + booking.price, 0)}
              </div>
              <div className="text-sm text-gray-600">Revenue</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingManagement;