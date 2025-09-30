import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  User, 
  Mail,
  Search, 
  Filter,
  Tag,
  ListFilter
} from 'lucide-react';
import { getMyBookings } from '@/auth/authApi';

const BookingManagement = () => {
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await getMyBookings();
        const sortedBookings = response.data.sort((a, b) => new Date(b.event.date) - new Date(a.event.date));
        setBookings(sortedBookings);
      } catch (err) {
        console.error("Failed to fetch bookings:", err);
        setError("Could not load your bookings. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const filteredBookings = bookings.filter(booking => {
    const clientName = `${booking.client.firstName} ${booking.client.lastName}`.toLowerCase();
    const eventTitle = booking.event.title.toLowerCase();
    
    const matchesSearch = clientName.includes(searchTerm.toLowerCase()) || eventTitle.includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || booking.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (isLoading) {
    return <div className="text-center p-8"><p>Loading your client bookings...</p></div>;
  }

  if (error) {
    return <div className="text-center p-8 text-red-500">{error}</div>;
  }
  
  const upcomingBookings = bookings.filter(b => new Date(b.event.date) >= new Date() && b.status === 'confirmed');
  const pendingBookings = bookings.filter(b => b.status === 'pending');
  const confirmedRevenue = bookings
    .filter(b => b.status === 'confirmed')
    .reduce((acc, booking) => acc + parseFloat(booking.event.price || 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Booking Management</h2>
        <p className="text-gray-600">View and manage all client registrations for your events.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="text-3xl font-bold text-green-600 mb-2">{upcomingBookings.length}</div>
          <div className="text-gray-600">Upcoming Sessions</div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="text-3xl font-bold text-yellow-600 mb-2">{pendingBookings.length}</div>
          <div className="text-gray-600">Pending Bookings</div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="text-3xl font-bold text-purple-600 mb-2">${confirmedRevenue.toLocaleString()}</div>
          <div className="text-gray-600">Confirmed Revenue</div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Search by Client or Event</label>
            <div className="relative">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="e.g., Sarah Johnson or Work-Life Balance..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
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
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold">All Bookings ({filteredBookings.length})</h3>
        </div>

        {filteredBookings.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {filteredBookings.map((booking) => (
              <div key={booking.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <p className="font-semibold text-purple-700 flex items-center mb-2">
                      <Tag size={16} className="mr-2" />
                      {booking.event.title}
                    </p>
                    <div className="space-y-2 text-sm text-gray-600">
                      <p className="flex items-center"><User size={14} className="mr-2" /> <span className="font-medium mr-1">Client:</span> {booking.client.firstName} {booking.client.lastName}</p>
                      <p className="flex items-center"><Mail size={14} className="mr-2" /> <span className="font-medium mr-1">Email:</span> {booking.client.email}</p>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 md:text-right">
                    <p className="font-medium flex items-center md:justify-end"><Calendar size={14} className="mr-2" />{new Date(booking.event.date).toLocaleDateString()}</p>
                    <p className="text-gray-500 mt-1 flex items-center md:justify-end"><Clock size={14} className="mr-2"/> at {booking.event.time}</p>
                    <div className="mt-2">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full capitalize ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Calendar size={48} className="mx-auto text-gray-300 mb-4" />
            <h4 className="text-lg font-medium text-gray-800">No bookings match your criteria</h4>
            <p className="text-gray-500">Try adjusting your search or filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingManagement;
