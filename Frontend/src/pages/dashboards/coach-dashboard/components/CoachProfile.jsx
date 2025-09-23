import React, { useState } from 'react';
import { 
  User, 
  Camera, 
  Star, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Clock,
  DollarSign,
  Users,
  Award,
  Plus,
  X,
  Edit
} from 'lucide-react';

const CoachProfile = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [editingSection, setEditingSection] = useState(null);

  const coachData = {
    personalInfo: {
      name: "Dr. Emily Chen",
      title: "Certified Life & Executive Coach",
      email: "emily.chen@thekata.com",
      phone: "+1 (555) 123-4567",
      location: "San Francisco, CA",
      timezone: "Pacific Time (PT)",
      website: "www.emilychen-coaching.com",
      avatar: "/api/placeholder/120/120"
    },
    bio: "I'm a certified life and executive coach with over 8 years of experience helping professionals achieve work-life balance and career excellence. My approach combines evidence-based coaching methodologies with mindfulness practices to create sustainable change.",
    specialties: ["Life Coaching", "Executive Coaching", "Work-Life Balance", "Leadership Development", "Stress Management"],
    certifications: [
      { name: "International Coach Federation (ICF) - PCC", year: "2018" },
      { name: "Certified Professional Co-Active Coach (CPCC)", year: "2017" },
      { name: "Mindfulness-Based Stress Reduction (MBSR)", year: "2019" }
    ],
    experience: "8+ years",
    languages: ["English", "Mandarin", "Spanish"],
    sessionTypes: [
      { name: "Life Coaching Session", duration: "60 min", price: 150 },
      { name: "Executive Coaching", duration: "90 min", price: 200 },
      { name: "Initial Consultation", duration: "30 min", price: 0 },
      { name: "Group Coaching", duration: "120 min", price: 75 }
    ],
    availability: {
      monday: { enabled: true, start: "09:00", end: "17:00" },
      tuesday: { enabled: true, start: "09:00", end: "17:00" },
      wednesday: { enabled: true, start: "09:00", end: "17:00" },
      thursday: { enabled: true, start: "09:00", end: "17:00" },
      friday: { enabled: true, start: "09:00", end: "15:00" },
      saturday: { enabled: false, start: "", end: "" },
      sunday: { enabled: false, start: "", end: "" }
    },
    stats: {
      totalSessions: 342,
      activeClients: 24,
      rating: 4.9,
      reviews: 127
    },
    testimonials: [
      {
        id: 1,
        client: "Sarah J.",
        rating: 5,
        text: "Emily helped me achieve a perfect work-life balance. Her insights and techniques are life-changing!",
        date: "2025-01-10"
      },
      {
        id: 2,
        client: "Michael C.",
        rating: 5,
        text: "Outstanding executive coach. Helped me land my dream promotion through her leadership development program.",
        date: "2025-01-08"
      }
    ]
  };

  const renderProfileTab = () => (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-start space-x-6">
          <div className="relative">
            <img
              src={coachData.personalInfo.avatar}
              alt={coachData.personalInfo.name}
              className="w-32 h-32 rounded-full object-cover"
            />
            <button className="absolute bottom-2 right-2 bg-purple-600 text-white p-2 rounded-full hover:bg-purple-700">
              <Camera size={16} />
            </button>
          </div>
          
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{coachData.personalInfo.name}</h2>
                <p className="text-gray-600 mb-2">{coachData.personalInfo.title}</p>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <MapPin size={16} />
                    <span>{coachData.personalInfo.location}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock size={16} />
                    <span>{coachData.personalInfo.timezone}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setEditingSection(editingSection === 'personal' ? null : 'personal')}
                className="bg-gray-100 text-gray-600 px-3 py-2 rounded-lg hover:bg-gray-200 flex items-center space-x-1"
              >
                <Edit size={16} />
                <span>Edit</span>
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{coachData.stats.totalSessions}</div>
                <div className="text-sm text-gray-500">Total Sessions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{coachData.stats.activeClients}</div>
                <div className="text-sm text-gray-500">Active Clients</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center space-x-1">
                  <div className="text-2xl font-bold text-yellow-600">{coachData.stats.rating}</div>
                  <Star size={16} className="text-yellow-500 fill-current" />
                </div>
                <div className="text-sm text-gray-500">Average Rating</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{coachData.stats.reviews}</div>
                <div className="text-sm text-gray-500">Reviews</div>
              </div>
            </div>
          </div>
        </div>

        {editingSection === 'personal' && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  defaultValue={coachData.personalInfo.name}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Professional Title</label>
                <input
                  type="text"
                  defaultValue={coachData.personalInfo.title}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  defaultValue={coachData.personalInfo.email}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                <input
                  type="tel"
                  defaultValue={coachData.personalInfo.phone}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <input
                  type="text"
                  defaultValue={coachData.personalInfo.location}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                <input
                  type="url"
                  defaultValue={coachData.personalInfo.website}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-4">
              <button
                onClick={() => setEditingSection(null)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => setEditingSection(null)}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bio Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Professional Bio</h3>
          <button
            onClick={() => setEditingSection(editingSection === 'bio' ? null : 'bio')}
            className="bg-gray-100 text-gray-600 px-3 py-2 rounded-lg hover:bg-gray-200 flex items-center space-x-1"
          >
            <Edit size={16} />
            <span>Edit</span>
          </button>
        </div>

        {editingSection === 'bio' ? (
          <div>
            <textarea
              rows="4"
              defaultValue={coachData.bio}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Tell potential clients about your background, approach, and expertise..."
            />
            <div className="flex justify-end space-x-3 mt-4">
              <button
                onClick={() => setEditingSection(null)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => setEditingSection(null)}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Save Bio
              </button>
            </div>
          </div>
        ) : (
          <p className="text-gray-700 leading-relaxed">{coachData.bio}</p>
        )}
      </div>

      {/* Specialties & Certifications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Specialties</h3>
            <button className="text-purple-600 hover:text-purple-700">
              <Plus size={16} />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {coachData.specialties.map((specialty, index) => (
              <span key={index} className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm flex items-center space-x-2">
                <span>{specialty}</span>
                <button className="hover:text-purple-900">
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Certifications</h3>
            <button className="text-purple-600 hover:text-purple-700">
              <Plus size={16} />
            </button>
          </div>
          <div className="space-y-3">
            {coachData.certifications.map((cert, index) => (
              <div key={index} className="flex items-center space-x-3">
                <Award size={16} className="text-yellow-600" />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{cert.name}</div>
                  <div className="text-sm text-gray-500">{cert.year}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderServicesTab = () => (
    <div className="space-y-6">
      {/* Session Types */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Session Types & Pricing</h3>
          <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center space-x-2">
            <Plus size={16} />
            <span>Add Session Type</span>
          </button>
        </div>

        <div className="space-y-4">
          {coachData.sessionTypes.map((session, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{session.name}</h4>
                  <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                    <div className="flex items-center space-x-1">
                      <Clock size={14} />
                      <span>{session.duration}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <DollarSign size={14} />
                      <span>{session.price > 0 ? `$${session.price}` : 'Free'}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="bg-gray-100 text-gray-600 px-3 py-1 rounded text-sm hover:bg-gray-200">
                    Edit
                  </button>
                  <button className="text-red-600 hover:text-red-700">
                    <X size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Availability */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4">Weekly Availability</h3>
        
        <div className="space-y-4">
          {Object.entries(coachData.availability).map(([day, schedule]) => (
            <div key={day} className="flex items-center space-x-4">
              <div className="w-24">
                <span className="font-medium text-gray-900 capitalize">{day}</span>
              </div>
              
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={schedule.enabled}
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <span className="text-sm text-gray-600">Available</span>
              </label>
              
              {schedule.enabled && (
                <div className="flex items-center space-x-2">
                  <input
                    type="time"
                    defaultValue={schedule.start}
                    className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <span className="text-gray-500">to</span>
                  <input
                    type="time"
                    defaultValue={schedule.end}
                    className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-end mt-6">
          <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700">
            Save Availability
          </button>
        </div>
      </div>
    </div>
  );

  const renderReviewsTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4">Client Reviews</h3>
        
        <div className="space-y-4">
          {coachData.testimonials.map((testimonial) => (
            <div key={testimonial.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="font-medium text-gray-900">{testimonial.client}</span>
                    <div className="flex items-center">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} size={14} className="text-yellow-500 fill-current" />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-700">{testimonial.text}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    {new Date(testimonial.date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header with Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Profile Management</h2>
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'profile'
                ? 'bg-white text-gray-900 shadow'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <User size={16} className="inline mr-2" />
            Profile Info
          </button>
          <button
            onClick={() => setActiveTab('services')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'services'
                ? 'bg-white text-gray-900 shadow'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Clock size={16} className="inline mr-2" />
            Services & Availability
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'reviews'
                ? 'bg-white text-gray-900 shadow'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Star size={16} className="inline mr-2" />
            Reviews & Testimonials
          </button>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'profile' && renderProfileTab()}
      {activeTab === 'services' && renderServicesTab()}
      {activeTab === 'reviews' && renderReviewsTab()}
    </div>
  );
};

export default CoachProfile;