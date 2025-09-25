import React, { useState, useEffect } from 'react';
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
import { useAuth } from '../../../../auth/AuthContext';
import authApi from '../../../../auth/authApi';

const CoachProfile = () => {
  const { user, setUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [editingSection, setEditingSection] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Normalize helper to make sure we always get an array
  function normalizeArray(value) {
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') return value.split(',').map(item => item.trim()).filter(Boolean);
    return [];
  }

  // Initialize form data with safe defaults
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    title: user?.CoachProfile?.title || '',
    bio: user?.CoachProfile?.bio || '',
    email: user?.email || '',
    phone: user?.phone || '',
    location: user?.CoachProfile?.location || '',
    website: user?.CoachProfile?.website || '',
    timezone: user?.CoachProfile?.timezone || 'Pacific Time (PT)',
    specialties: normalizeArray(user?.CoachProfile?.specialties),
    certifications: normalizeArray(user?.CoachProfile?.certifications),
    languages: normalizeArray(user?.CoachProfile?.languages),
    sessionTypes: normalizeArray(user?.CoachProfile?.sessionTypes),
    availability: user?.CoachProfile?.availability || {},
  });

  useEffect(() => {
    if (user) {
      console.log("Updated user data:", user);
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        title: user.CoachProfile?.title || '',
        bio: user.CoachProfile?.bio || '',
        email: user.email || '',
        phone: user.phone || '',
        location: user.CoachProfile?.location || '',
        website: user.CoachProfile?.website || '',
        timezone: user.CoachProfile?.timezone || 'Pacific Time (PT)',
        specialties: normalizeArray(user.CoachProfile?.specialties),
        certifications: normalizeArray(user.CoachProfile?.certifications),
        languages: normalizeArray(user.CoachProfile?.languages),
        sessionTypes: normalizeArray(user.CoachProfile?.sessionTypes),
        availability: user.CoachProfile?.availability || {},
      });
    }
  }, [user]);

  const coachData = {
    personalInfo: {
      name: user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : user?.email || '',
      title: formData.title || "Certified Coach",
      email: formData.email || '',
      phone: formData.phone || '',
      location: formData.location || '',
      timezone: formData.timezone || 'Pacific Time (PT)',
      website: formData.website || '',
      avatar: "/api/placeholder/120/120"
    },
    bio: formData.bio || "No bio provided.",
    specialties: normalizeArray(formData.specialties),
    certifications: normalizeArray(formData.certifications),
    languages: normalizeArray(formData.languages),
    sessionTypes: normalizeArray(formData.sessionTypes),
    availability: formData.availability,
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

  const handleSaveProfile = async () => {
    setIsLoading(true);
    try {
      const response = await authApi.updateProfile({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        title: formData.title,
        bio: formData.bio,
        location: formData.location,
        website: formData.website,
        timezone: formData.timezone,
        specialties: formData.specialties || [],
        certifications: formData.certifications || [],
        languages: formData.languages || [],
        sessionTypes: formData.sessionTypes || [],
        availability: formData.availability,
      });
      setUser(response.data.user);
      setEditingSection(null);
      alert('Profile saved successfully!');
    } catch (err) {
      console.error('Failed to update profile:', err);
      alert('Failed to save profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderProfileTab = () => (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center space-x-4">
          <img
            src={coachData.personalInfo.avatar}
            alt="Coach Avatar"
            className="w-20 h-20 rounded-full object-cover"
          />
          <div className="flex-1">
            <h2 className="text-xl font-bold">{coachData.personalInfo.name}</h2>
            <p className="text-gray-600">{coachData.personalInfo.title}</p>
          </div>
          <button className="text-purple-600 hover:text-purple-700">
            <Edit size={16} />
          </button>
        </div>
      </div>

      {/* Contact & Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
          <ul className="space-y-3 text-gray-700">
            {coachData.personalInfo.email && (
              <li className="flex items-center space-x-2">
                <Mail size={16} /> <span>{coachData.personalInfo.email}</span>
              </li>
            )}
            {coachData.personalInfo.phone && (
              <li className="flex items-center space-x-2">
                <Phone size={16} /> <span>{coachData.personalInfo.phone}</span>
              </li>
            )}
            {coachData.personalInfo.location && (
              <li className="flex items-center space-x-2">
                <MapPin size={16} /> <span>{coachData.personalInfo.location}</span>
              </li>
            )}
            {coachData.personalInfo.website && (
              <li className="flex items-center space-x-2">
                <Globe size={16} /> <span>{coachData.personalInfo.website}</span>
              </li>
            )}
          </ul>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">About</h3>
          <p className="text-gray-700">{coachData.bio}</p>
        </div>
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
            {coachData.specialties.length > 0 ? (
              coachData.specialties.map((specialty, index) => (
                <span key={index} className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm flex items-center space-x-2">
                  <span>{specialty}</span>
                  <button className="hover:text-purple-900">
                    <X size={12} />
                  </button>
                </span>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No specialties added yet.</p>
            )}
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
            {coachData.certifications.length > 0 ? (
              coachData.certifications.map((cert, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <Award size={16} className="text-yellow-600" />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{cert.name || cert}</div>
                    {cert.year && <div className="text-sm text-gray-500">{cert.year}</div>}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No certifications added yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderServicesTab = () => (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-lg font-semibold mb-4">Session Types</h3>
      {coachData.sessionTypes.length > 0 ? (
        <ul className="list-disc pl-5 space-y-2">
          {coachData.sessionTypes.map((session, idx) => (
            <li key={idx}>{session}</li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500 text-sm">No session types added yet.</p>
      )}
    </div>
  );

  const renderReviewsTab = () => (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-lg font-semibold mb-4">Client Testimonials</h3>
      {coachData.testimonials.length > 0 ? (
        <div className="space-y-4">
          {coachData.testimonials.map((review) => (
            <div key={review.id} className="border-b border-gray-200 pb-3">
              <div className="flex items-center justify-between">
                <span className="font-medium">{review.client}</span>
                <span className="text-sm text-gray-500">{review.date}</span>
              </div>
              <p className="text-gray-700">{review.text}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-sm">No reviews available yet.</p>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header with Tabs */}
      <div className="flex space-x-4 border-b border-gray-200 pb-2">
        <button
          className={`px-4 py-2 ${activeTab === 'profile' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-600'}`}
          onClick={() => setActiveTab('profile')}
        >
          Profile
        </button>
        <button
          className={`px-4 py-2 ${activeTab === 'services' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-600'}`}
          onClick={() => setActiveTab('services')}
        >
          Services
        </button>
        <button
          className={`px-4 py-2 ${activeTab === 'reviews' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-600'}`}
          onClick={() => setActiveTab('reviews')}
        >
          Reviews
        </button>
      </div>

      {activeTab === 'profile' && renderProfileTab()}
      {activeTab === 'services' && renderServicesTab()}
      {activeTab === 'reviews' && renderReviewsTab()}
    </div>
  );
};

export default CoachProfile;
