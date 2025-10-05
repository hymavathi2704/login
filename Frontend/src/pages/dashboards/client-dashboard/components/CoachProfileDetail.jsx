import React from 'react';
import { Mail, Globe, Star, Briefcase, Calendar, Clock } from 'lucide-react';
import Button from '@/components/ui/Button';

const CoachProfileDetail = ({ coach, onBack }) => {
  if (!coach) return null;

  return (
    <div>
      {/* Breadcrumb Navigation */}
      <div className="mb-4">
        <button onClick={onBack} className="text-sm text-blue-600 hover:underline">
          &larr; Back to Coaches
        </button>
      </div>

      <div className="bg-white p-8 rounded-lg shadow-md">
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row items-center md:items-start text-center md:text-left">
          <img
            className="h-32 w-32 rounded-full object-cover mb-4 md:mb-0 md:mr-8"
            src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=4&w=256&h=256&q=60"
            alt={`${coach.firstName} ${coach.lastName}`}
          />
          <div>
            <h1 className="text-3xl font-bold text-gray-800">{coach.firstName} {coach.lastName}</h1>
            <p className="text-purple-600 font-medium text-lg">{coach.coach_profile?.title || 'Coach'}</p>
            <div className="flex justify-center md:justify-start items-center space-x-4 mt-2 text-gray-600">
              <span className="flex items-center"><Mail size={16} className="mr-1" /> {coach.email}</span>
              {coach.coach_profile?.website && (
                <a href={coach.coach_profile.website} target="_blank" rel="noopener noreferrer" className="flex items-center text-blue-600 hover:underline">
                  <Globe size={16} className="mr-1" /> Website
                </a>
              )}
            </div>
            <div className="flex justify-center md:justify-start items-center space-x-2 mt-2">
              <Star size={18} className="text-yellow-400 fill-current" />
              <span className="font-semibold">4.9</span>
              <span className="text-gray-500">(127 reviews)</span>
            </div>
            <Button className="mt-4">Book a Session</Button>
          </div>
        </div>

        {/* About Section */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">About Me</h2>
          <p className="text-gray-600 leading-relaxed">{coach.coach_profile?.bio || 'No biography provided.'}</p>
        </div>

        {/* Specialties Section */}
        {coach.coach_profile?.targetAudience && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Specialties</h2>
            <div className="flex flex-wrap gap-2">
              {JSON.parse(coach.coach_profile.targetAudience).map(audience => (
                <span key={audience} className="bg-purple-100 text-purple-800 text-sm font-medium px-3 py-1 rounded-full">{audience}</span>
              ))}
            </div>
          </div>
        )}

        {/* Upcoming Events Section */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Upcoming Events & Workshops</h2>
          <div className="space-y-4">
            {/* This is mock data. In a real application, you would fetch this from the backend. */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900">Leadership Workshop</h3>
              <p className="text-sm text-gray-600">An interactive workshop on effective leadership.</p>
              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                <span className="flex items-center"><Calendar size={14} className="mr-1" /> Oct 25, 2025</span>
                <span className="flex items-center"><Clock size={14} className="mr-1" /> 10:00 AM</span>
              </div>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900">Wellness Webinar</h3>
              <p className="text-sm text-gray-600">A webinar on mindfulness and stress reduction techniques.</p>
              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                <span className="flex items-center"><Calendar size={14} className="mr-1" /> Nov 12, 2025</span>
                <span className="flex items-center"><Clock size={14} className="mr-1" /> 2:00 PM</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoachProfileDetail;
