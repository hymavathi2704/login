import React from 'react';
import { X, Mail, Globe, UserCheck } from 'lucide-react';

const CoachProfileModal = ({ coach, onClose }) => {
  if (!coach) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full">
        <div className="p-6 border-b flex justify-between items-center">
          <h3 className="text-xl font-semibold">Coach Profile</h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100">
            <X size={20} />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold">{coach.firstName} {coach.lastName}</h2>
            <p className="text-purple-600 font-medium">{coach.coach_profile?.title || 'Coach'}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg border">
            <h4 className="font-semibold mb-2">Biography</h4>
            <p className="text-gray-600">{coach.coach_profile?.bio || 'No biography provided.'}</p>
          </div>
          <div className="space-y-2">
            <p className="flex items-center text-gray-700"><Mail size={16} className="mr-2 text-gray-500" /> {coach.email}</p>
            {coach.coach_profile?.website && (
              <p className="flex items-center text-gray-700"><Globe size={16} className="mr-2 text-gray-500" /> <a href={coach.coach_profile.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{coach.coach_profile.website}</a></p>
            )}
          </div>
          {coach.coach_profile?.targetAudience && (
            <div>
                <h4 className="font-semibold mb-2">Specializes In:</h4>
                <div className="flex flex-wrap gap-2">
                    {JSON.parse(coach.coach_profile.targetAudience).map(audience => (
                        <span key={audience} className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded-full">{audience}</span>
                    ))}
                </div>
            </div>
          )}
        </div>
        <div className="p-6 bg-gray-50 border-t">
          <button onClick={onClose} className="w-full py-2 px-4 border rounded-md text-sm font-medium hover:bg-gray-100">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default CoachProfileModal;
