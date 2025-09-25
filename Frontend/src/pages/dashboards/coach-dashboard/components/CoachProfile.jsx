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
    // Attempt to parse JSON, if it fails, treat it as a single string item
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : (value ? [String(value)] : []);
    } catch (e) {
      // If parsing fails, and value exists, return it as a single item in an array.
      // Otherwise, return an empty array.
      return value ? [String(value)] : [];
    }
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

  // State for new list items
  const [newSpecialty, setNewSpecialty] = useState('');
  const [newCertification, setNewCertification] = useState('');
  const [newLanguage, setNewLanguage] = useState('');
  const [newSessionType, setNewSessionType] = useState('');

  useEffect(() => {
    if (user) {
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddToList = (listName, newItem, setNewItem) => {
    if (newItem.trim() && !formData[listName].includes(newItem.trim())) {
      setFormData(prev => ({
        ...prev,
        [listName]: [...prev[listName], newItem.trim()]
      }));
      setNewItem('');
    }
  };

  const handleRemoveFromList = (listName, itemToRemove) => {
    setFormData(prev => ({
      ...prev,
      [listName]: prev[listName].filter(item => item !== itemToRemove)
    }));
  };

  const handleSaveProfile = async () => {
    setIsLoading(true);

    let dataToSave = { ...formData };

    // Check and add any unsaved input to the specialties list
    if (newSpecialty.trim() && !dataToSave.specialties.includes(newSpecialty.trim())) {
      dataToSave.specialties = [...dataToSave.specialties, newSpecialty.trim()];
    }

    // Check and add any unsaved input to the certifications list
    if (newCertification.trim() && !dataToSave.certifications.includes(newCertification.trim())) {
      dataToSave.certifications = [...dataToSave.certifications, newCertification.trim()];
    }
    
    // Check and add any unsaved input to the languages list
    if (newLanguage.trim() && !dataToSave.languages.includes(newLanguage.trim())) {
      dataToSave.languages = [...dataToSave.languages, newLanguage.trim()];
    }

    // Check and add any unsaved input to the sessionTypes list
    if (newSessionType.trim() && !dataToSave.sessionTypes.includes(newSessionType.trim())) {
      dataToSave.sessionTypes = [...dataToSave.sessionTypes, newSessionType.trim()];
    }

    try {
      const response = await authApi.updateProfile(dataToSave);
      setUser(response.data.user);
      setEditingSection(null);
      setNewSpecialty('');
      setNewCertification('');
      setNewLanguage('');
      setNewSessionType('');
      alert('Profile saved successfully!');
    } catch (err) {
      console.error('Failed to update profile:', err);
      alert('Failed to save profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const coachData = {
    personalInfo: {
      name: user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : user?.email || '',
      title: formData.title || "Certified Coach",
      email: formData.email || '',
      phone: formData.phone || '',
      location: formData.location || '',
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
            <h2 className="text-xl font-bold">
              {editingSection === 'personal' ? (
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="w-full px-2 py-1 border rounded"
                />
              ) : (
                coachData.personalInfo.name
              )}
            </h2>
            <p className="text-gray-600">
              {editingSection === 'personal' ? (
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-2 py-1 border rounded"
                />
              ) : (
                coachData.personalInfo.title
              )}
            </p>
          </div>
          <button
            onClick={() => setEditingSection(editingSection === 'personal' ? null : 'personal')}
            className="text-purple-600 hover:text-purple-700"
          >
            <Edit size={16} />
          </button>
        </div>
        {editingSection === 'personal' && (
          <div className="mt-4 flex justify-end space-x-2">
            <button onClick={() => setEditingSection(null)} className="px-3 py-1 text-sm rounded border">Cancel</button>
            <button onClick={handleSaveProfile} disabled={isLoading} className="px-3 py-1 text-sm rounded bg-purple-600 text-white">Save</button>
          </div>
        )}
      </div>

      {/* Contact & Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Contact Information</h3>
            <button
              onClick={() => setEditingSection(editingSection === 'contact' ? null : 'contact')}
              className="text-purple-600 hover:text-purple-700"
            >
              <Edit size={16} />
            </button>
          </div>
          <ul className="space-y-3 text-gray-700">
            {editingSection === 'contact' ? (
              <>
                <li className="flex items-center space-x-2">
                  <Mail size={16} />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-2 py-1 border rounded"
                  />
                </li>
                <li className="flex items-center space-x-2">
                  <Phone size={16} />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-2 py-1 border rounded"
                  />
                </li>
                <li className="flex items-center space-x-2">
                  <MapPin size={16} />
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="w-full px-2 py-1 border rounded"
                  />
                </li>
                <li className="flex items-center space-x-2">
                  <Globe size={16} />
                  <input
                    type="text"
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    className="w-full px-2 py-1 border rounded"
                  />
                </li>
              </>
            ) : (
              <>
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
              </>
            )}
          </ul>
          {editingSection === 'contact' && (
            <div className="mt-4 flex justify-end space-x-2">
              <button onClick={() => setEditingSection(null)} className="px-3 py-1 text-sm rounded border">Cancel</button>
              <button onClick={handleSaveProfile} disabled={isLoading} className="px-3 py-1 text-sm rounded bg-purple-600 text-white">Save</button>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">About</h3>
            <button
              onClick={() => setEditingSection(editingSection === 'bio' ? null : 'bio')}
              className="text-purple-600 hover:text-purple-700"
            >
              <Edit size={16} />
            </button>
          </div>
          {editingSection === 'bio' ? (
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              rows="4"
              className="w-full px-2 py-1 border rounded"
            />
          ) : (
            <p className="text-gray-700">{coachData.bio}</p>
          )}
          {editingSection === 'bio' && (
            <div className="mt-4 flex justify-end space-x-2">
              <button onClick={() => setEditingSection(null)} className="px-3 py-1 text-sm rounded border">Cancel</button>
              <button onClick={handleSaveProfile} disabled={isLoading} className="px-3 py-1 text-sm rounded bg-purple-600 text-white">Save</button>
            </div>
          )}
        </div>
      </div>

      {/* Specialties & Certifications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Specialties</h3>
            <button
              onClick={() => setEditingSection(editingSection === 'specialties' ? null : 'specialties')}
              className="text-purple-600 hover:text-purple-700"
            >
              <Edit size={16} />
            </button>
          </div>
          {editingSection === 'specialties' ? (
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <input
                  type="text"
                  value={newSpecialty}
                  onChange={(e) => setNewSpecialty(e.target.value)}
                  placeholder="Add new specialty"
                  className="flex-1 px-2 py-1 border rounded"
                />
                <button
                  onClick={() => handleAddToList('specialties', newSpecialty, setNewSpecialty)}
                  className="p-1 bg-gray-100 rounded"
                >
                  <Plus size={16} />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.specialties.map((specialty, index) => (
                  <span key={index} className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm flex items-center space-x-2">
                    <span>{specialty}</span>
                    <button onClick={() => handleRemoveFromList('specialties', specialty)} className="hover:text-purple-900">
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
              <div className="mt-4 flex justify-end space-x-2">
                <button onClick={() => setEditingSection(null)} className="px-3 py-1 text-sm rounded border">Cancel</button>
                <button onClick={handleSaveProfile} disabled={isLoading} className="px-3 py-1 text-sm rounded bg-purple-600 text-white">Save</button>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {coachData.specialties.length > 0 ? (
                coachData.specialties.map((specialty, index) => (
                  <span key={index} className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
                    {specialty}
                  </span>
                ))
              ) : (
                <p className="text-gray-500 text-sm">No specialties added yet.</p>
              )}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Certifications</h3>
            <button
              onClick={() => setEditingSection(editingSection === 'certifications' ? null : 'certifications')}
              className="text-purple-600 hover:text-purple-700"
            >
              <Edit size={16} />
            </button>
          </div>
          {editingSection === 'certifications' ? (
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <input
                  type="text"
                  value={newCertification}
                  onChange={(e) => setNewCertification(e.target.value)}
                  placeholder="Add new certification"
                  className="flex-1 px-2 py-1 border rounded"
                />
                <button
                  onClick={() => handleAddToList('certifications', newCertification, setNewCertification)}
                  className="p-1 bg-gray-100 rounded"
                >
                  <Plus size={16} />
                </button>
              </div>
              <div className="space-y-3">
                {formData.certifications.map((cert, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex items-center space-x-3">
                      <Award size={16} className="text-yellow-600" />
                      <div className="font-medium text-gray-900">{cert}</div>
                    </div>
                    <button onClick={() => handleRemoveFromList('certifications', cert)} className="hover:text-red-600">
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex justify-end space-x-2">
                <button onClick={() => setEditingSection(null)} className="px-3 py-1 text-sm rounded border">Cancel</button>
                <button onClick={handleSaveProfile} disabled={isLoading} className="px-3 py-1 text-sm rounded bg-purple-600 text-white">Save</button>
              </div>
            </div>
          ) : (
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
          )}
        </div>
      </div>
    </div>
  );

  const renderServicesTab = () => (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Session Types</h3>
        <button
          onClick={() => setEditingSection(editingSection === 'sessionTypes' ? null : 'sessionTypes')}
          className="text-purple-600 hover:text-purple-700"
        >
          <Edit size={16} />
        </button>
      </div>
      {editingSection === 'sessionTypes' ? (
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <input
              type="text"
              value={newSessionType}
              onChange={(e) => setNewSessionType(e.target.value)}
              placeholder="Add new session type"
              className="flex-1 px-2 py-1 border rounded"
            />
            <button
              onClick={() => handleAddToList('sessionTypes', newSessionType, setNewSessionType)}
              className="p-1 bg-gray-100 rounded"
            >
              <Plus size={16} />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.sessionTypes.map((type, index) => (
              <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center space-x-2">
                <span>{type}</span>
                <button onClick={() => handleRemoveFromList('sessionTypes', type)} className="hover:text-blue-900">
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
          <div className="mt-4 flex justify-end space-x-2">
            <button onClick={() => setEditingSection(null)} className="px-3 py-1 text-sm rounded border">Cancel</button>
            <button onClick={handleSaveProfile} disabled={isLoading} className="px-3 py-1 text-sm rounded bg-purple-600 text-white">Save</button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {coachData.sessionTypes.length > 0 ? (
            coachData.sessionTypes.map((session, idx) => (
              <span key={idx} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                {session}
              </span>
            ))
          ) : (
            <p className="text-gray-500 text-sm">No session types added yet.</p>
          )}
        </div>
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