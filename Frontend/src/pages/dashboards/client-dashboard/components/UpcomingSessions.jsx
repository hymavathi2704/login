import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Video, MapPin, User, Search, Filter, DollarSign, Tag } from 'lucide-react';
// FIX: Using the correct, modern export name for client sessions
import { getMyClientSessions } from '@/auth/authApi'; 
import { toast } from 'sonner';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';


const UpcomingSessions = ({ preview = false }) => {
  const [allBookings, setAllBookings] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- UI Helpers ---
  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'pending', label: 'Pending' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  const typeOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'individual', label: '1:1 Session' },
    { value: 'group', label: 'Group Workshop' },
  ];
    
  const getStatusHighlight = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
    
  const getTypeHighlight = (type) => {
    switch (type) {
      case 'individual': return 'bg-purple-100 text-purple-800';
      case 'group': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // --- Data Fetching ---
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await getMyClientSessions(); 
        
        const sessionsData = response.data
            // Map to a consistent display format, focusing only on Session data
            .map(b => ({
                id: b.id,
                title: b.Session?.title || 'Session Booking',
                // Coach details come from Session -> CoachProfile -> User
                coachName: b.Session?.coachProfile?.user ? `${b.Session.coachProfile.user.firstName} ${b.Session.coachProfile.user.lastName}` : 'Unknown Coach',
                date: b.Session?.defaultDate,
                time: b.Session?.defaultTime,
                duration: b.Session?.duration || 'N/A', 
                type: b.Session?.type || 'individual',
                price: b.Session?.price || 0, // ADDED price field for display
                status: b.status,
                meetingLink: b.Session?.meetingLink,
            }))
            .filter(item => item.date); // Filter out items with no discernible date

        // Sort by date/time
        const sortedBookings = sessionsData.sort((a, b) => new Date(a.date) - new Date(b.date));

        setAllBookings(sortedBookings); 

      } catch (err) {
        console.error("Failed to fetch client sessions:", err);
        setError("Could not load your upcoming sessions.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookings();
  }, [preview]); 

  // --- Filtering Logic ---
  const filteredSessions = allBookings.filter(session => {
    const searchLower = searchTerm.toLowerCase();

    const matchesSearch = session.title.toLowerCase().includes(searchLower) ||
                          session.coachName.toLowerCase().includes(searchLower);

    const matchesStatus = filterStatus === 'all' || session.status === filterStatus;
    const matchesType = filterType === 'all' || session.type === filterType;

    return matchesSearch && matchesStatus && matchesType;
  });

  // Apply preview slice if necessary
  const sessionsToDisplay = preview ? filteredSessions.slice(0, 3) : filteredSessions;

  // --- Rendering ---

  if (isLoading) return <div className="text-center p-8"><p>Loading your sessions...</p></div>;
  if (error) return <div className="text-center p-8 text-red-500">{error}</div>;


  return (
    <div className="space-y-8">
      
      {/* 1. Heading */}
      {!preview && <h1 className="text-3xl font-bold text-gray-800">My Sessions</h1>}

      {/* 2. Search and Filter Bar (Only visible outside of preview mode) */}
      {!preview && (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                    <Input
                        label="Search by Session or Coach Name"
                        placeholder="e.g., Workshop or Emily Carter"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        icon={<Search size={20} />}
                    />
                </div>
                <div>
                    <Select
                        label="Filter by Status"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        options={statusOptions}
                        icon={<Filter size={16} />}
                    />
                </div>
                <div>
                    <Select
                        label="Filter by Type"
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        options={typeOptions}
                        icon={<Tag size={16} />}
                    />
                </div>
            </div>
        </div>
      )}

      {/* 3. Session List */}
      {sessionsToDisplay.length > 0 ? (
        sessionsToDisplay.map((session) => {
          const TypeIcon = session.type === 'individual' ? User : Tag; // Use User for 1:1, Tag for group/workshop
          
          return (
            <div key={session.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="font-medium text-gray-900">{session.title}</h4>
                        
                    {/* Type Highlight Badge */}
                    <span className={`px-2 py-1 text-xs rounded-full ${getTypeHighlight(session.type)}`}>
                      {session.type.charAt(0).toUpperCase() + session.type.slice(1)} Session
                    </span>
                        
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <User size={16} />
                      <span>{session.coachName}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar size={16} />
                      <span>{new Date(session.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock size={16} />
                      <span>{session.time} ({session.duration} min)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <DollarSign size={16} />
                      <span>${session.price}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col space-y-2">
                    {/* Status Badge - Moved here, using the separate status highlight logic */}
                    <div className="flex justify-end">
                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${getStatusHighlight(session.status)}`}>
                            {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                        </span>
                    </div>

                  {session.status === 'confirmed' && session.meetingLink && (
                    <a href={session.meetingLink} target="_blank" rel="noopener noreferrer"
                       className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors text-center">
                      Join Session
                    </a>
                  )}
                  <button className="border border-gray-300 text-gray-600 px-3 py-1 rounded text-sm hover:bg-gray-50 transition-colors">
                    Details
                  </button>
                </div>
              </div>
            </div>
          );
        })
      ) : (
          <div className="text-center py-8">
            <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
            <h4 className="text-lg font-medium text-gray-800">No Sessions Found</h4>
            <p className="text-gray-500">Try adjusting your search filters or book a new session.</p>
          </div>
      )}

      {!preview && (
        <div className="text-center pt-4">
          <button className="text-blue-600 hover:text-blue-700 font-medium">
            View All Sessions
          </button>
        </div>
      )}
    </div>
  );
};

export default UpcomingSessions;