import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, Search, Filter, Tag, Video, MapPin, ListFilter, X, IndianRupee } from 'lucide-react'; 
import { getMyClientSessions } from '@/auth/authApi'; 
import { toast } from 'sonner';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';


// MODIFIED: Re-added 'preview = false' prop to correctly control visibility
const UpcomingSessions = ({ preview = false }) => {
  const [allBookings, setAllBookings] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); 
  const [filterType, setFilterType] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // MODAL STATE ADDED
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);

  // HANDLER ADDED
  const handleDetailsClick = (session) => {
    setSelectedSession(session);
    setIsDetailsModalOpen(true);
  };

  // --- UI Helpers ---
  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'pending', label: 'Pending' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  // MODIFIED: Expanded options based on coach session management types
  const typeOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'individual', label: '1:1 Session' },
    { value: 'group', label: 'Group Session' },
    { value: 'workshop', label: 'Workshop' },
    { value: 'online', label: 'Online Session' },
    { value: 'in-person', label: 'In-Person Session' },
  ];
    
  // UPDATED: Added highlights for new session types
  const getTypeHighlight = (type) => {
    switch (type) {
      case 'individual': return 'bg-purple-100 text-purple-800';
      case 'group': return 'bg-blue-100 text-blue-800';
      case 'workshop': return 'bg-pink-100 text-pink-800';
      case 'online': return 'bg-teal-100 text-teal-800';
      case 'in-person': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // --- Data Fetching ---
  useEffect(() => {
    const fetchBookings = async () => {
      setIsLoading(true);
      try {
        const response = await getMyClientSessions(); 
        
        const sessionsData = response.data
            .map(b => ({
                id: b.id,
                title: b.Session?.title || 'Session Booking',
                coachName: b.Session?.coachProfile?.user ? `${b.Session.coachProfile.user.firstName} ${b.Session.coachProfile.user.lastName}` : 'Unknown Coach',
                date: b.Session?.defaultDate,
                time: b.Session?.defaultTime,
                duration: b.Session?.duration || 'N/A', 
                type: b.Session?.type || 'individual',
                price: b.Session?.price || 0, 
                status: b.status,
                meetingLink: b.Session?.meetingLink,
            }))
            .filter(item => item.date); 

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

  // Logic re-added to slice the list when in preview mode
  const sessionsToDisplay = preview ? filteredSessions.slice(0, 3) : filteredSessions;

  // --- Rendering ---

  if (isLoading) return <div className="text-center p-8"><p>Loading your sessions...</p></div>;
  if (error) return <div className="text-center p-8 text-red-500">{error}</div>;


  return (
    <div className="space-y-8">
      
      {/* 1. Heading (Conditional on !preview) */}
      {!preview && <h1 className="text-3xl font-bold text-gray-800">Upcoming Sessions</h1>}

      {/* 2. Search and Filter Bar (Conditional on !preview - THIS IS THE KEY) */}
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
                        icon={<ListFilter size={16} />}
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
          const formatLabel = typeOptions.find(opt => opt.value === session.type)?.label || 'Session';
          
          return (
            <div key={session.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="font-semibold text-lg text-gray-900">{session.title}</h4>
                        
                    {/* Session Type Highlight Badge */}
                    <span className={`px-2 py-1 text-xs rounded-full ${getTypeHighlight(session.type)}`}>
                      <Tag size={12} className="inline mr-1" /> {formatLabel}
                    </span>
                        
                  </div>
                  
                  {/* Highlighted Date and Time */}
                  <div className="space-y-2 text-base font-semibold text-blue-600 mb-3">
                    <div className="flex items-center space-x-2">
                      <Calendar size={18} className="text-blue-500" />
                      <span>{new Date(session.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock size={18} className="text-blue-500" />
                      <span>{session.time} ({session.duration} min)</span>
                    </div>
                  </div>

                  {/* Other Details */}
                  <div className="space-y-2 text-sm text-gray-600 border-t pt-3">
                    <div className="flex items-center space-x-2">
                      <User size={16} />
                      <span>Coach: {session.coachName}</span>
                    </div>
                    {/* Price icon is IndianRupee */}
                    <div className="flex items-center space-x-2">
                      <IndianRupee size={16} />
                      <span>Price: ₹{session.price}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col space-y-2">
                    {/* Action Button based on status */}
                  {session.status === 'confirmed' && session.meetingLink ? (
                    <a href={session.meetingLink} target="_blank" rel="noopener noreferrer"
                       className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors text-center flex items-center justify-center space-x-1"
                         title="Join via meeting link"
                     >
                         <Video size={16} /> <span>Join</span>
                    </a>
                  ) : session.status === 'confirmed' ? (
                       <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm opacity-50 cursor-not-allowed">
                          Meeting Link N/A
                       </button>
                    ) : (
                        <button 
                            className={`px-3 py-1 rounded text-sm text-center ${session.status === 'pending' ? 'bg-yellow-600 text-white' : 'bg-gray-100 text-gray-600 cursor-not-allowed'}`}
                            disabled
                        >
                            {session.status === 'pending' ? 'Pending Confirmation' : 'Cancelled'}
                        </button>
                    )}
                  {/* Details button opens modal */}
                  <button 
                        className="border border-gray-300 text-gray-600 px-3 py-1 rounded text-sm hover:bg-gray-50 transition-colors"
                        onClick={() => handleDetailsClick(session)}
                    >
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

      {/* MODAL COMPONENT */}
      {isDetailsModalOpen && selectedSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-75 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto transform transition-all">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4 border-b pb-3">
                <h3 className="text-2xl font-bold text-gray-900">{selectedSession.title}</h3>
                <button onClick={() => setIsDetailsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4 text-gray-700">
                {/* Type Highlight */}
                <div className="flex items-center space-x-2">
                  <span className={`px-3 py-1 text-sm rounded-full font-medium ${getTypeHighlight(selectedSession.type)}`}>
                    {typeOptions.find(opt => opt.value === selectedSession.type)?.label || 'Session'}
                  </span>
                </div>

                {/* Date & Time */}
                <div className="flex items-center space-x-2 text-blue-600 font-semibold">
                  <Calendar size={20} />
                  <span>{new Date(selectedSession.date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center space-x-2 text-blue-600 font-semibold">
                  <Clock size={20} />
                  <span>{selectedSession.time} ({selectedSession.duration} min)</span>
                </div>

                {/* Coach */}
                <div className="flex items-center space-x-2 border-t pt-3">
                  <User size={18} />
                  <span>Coach: <span className="font-medium">{selectedSession.coachName}</span></span>
                </div>

                {/* Price */}
                <div className="flex items-center space-x-2">
                  <IndianRupee size={18} />
                  <span>Price: <span className="font-medium">₹{selectedSession.price}</span></span>
                </div>

                {/* Status - Displayed clearly in modal as it's a detail */}
                <div className="flex items-center space-x-2">
                  <Tag size={18} />
                  <span>Status: <span className="font-medium capitalize">{selectedSession.status}</span></span>
                </div>

                {/* Meeting Link (if confirmed) */}
                {selectedSession.status === 'confirmed' && selectedSession.meetingLink && (
                  <div className="flex items-center space-x-2">
                    <Video size={18} />
                    <a href={selectedSession.meetingLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      Join Meeting Link
                    </a>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end">
                <button 
                  className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                  onClick={() => setIsDetailsModalOpen(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UpcomingSessions;