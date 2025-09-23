import React from 'react';
import { Calendar, Clock, Video, MapPin, User } from 'lucide-react';

const UpcomingSessions = ({ preview = false }) => {
  const sessions = [
    {
      id: 1,
      title: "Life Coaching Session",
      coach: "Dr. Emily Chen",
      date: "2025-01-15",
      time: "10:00 AM",
      duration: "60 min",
      type: "video",
      status: "confirmed",
      meetingLink: "https://zoom.us/j/123456789"
    },
    {
      id: 2,
      title: "Career Development Session", 
      coach: "Michael Rodriguez",
      date: "2025-01-17",
      time: "2:00 PM", 
      duration: "45 min",
      type: "in-person",
      status: "pending",
      location: "Downtown Office"
    },
    {
      id: 3,
      title: "Wellness Coaching",
      coach: "Sarah Williams",
      date: "2025-01-20",
      time: "9:00 AM",
      duration: "60 min", 
      type: "video",
      status: "confirmed",
      meetingLink: "https://meet.google.com/abc-defg-hij"
    }
  ];

  const displaySessions = preview ? sessions.slice(0, 2) : sessions;

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type) => {
    return type === 'video' ? Video : MapPin;
  };

  return (
    <div className="space-y-4">
      {displaySessions.map((session) => {
        const TypeIcon = getTypeIcon(session.type);
        
        return (
          <div key={session.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h4 className="font-medium text-gray-900">{session.title}</h4>
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(session.status)}`}>
                    {session.status}
                  </span>
                </div>
                
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <User size={16} />
                    <span>{session.coach}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar size={16} />
                    <span>{new Date(session.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock size={16} />
                    <span>{session.time} ({session.duration})</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <TypeIcon size={16} />
                    <span>{session.type === 'video' ? 'Video Call' : session.location}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col space-y-2">
                {session.status === 'confirmed' && session.meetingLink && (
                  <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors">
                    Join Session
                  </button>
                )}
                <button className="border border-gray-300 text-gray-600 px-3 py-1 rounded text-sm hover:bg-gray-50 transition-colors">
                  Reschedule
                </button>
              </div>
            </div>
          </div>
        );
      })}

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