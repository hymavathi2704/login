// Frontend/src/pages/dashboards/coach-dashboard/components/coach-profile-editor/components/ProfessionalSection.jsx
import React, { useState } from 'react';
import { Plus, X, Award, GraduationCap, Tag } from 'lucide-react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

const ProfessionalSection = ({ data, errors, updateData, updateNestedData, setUnsavedChanges }) => {
  const [newSpecialty, setNewSpecialty] = useState('');
  const [newCertification, setNewCertification] = useState({
    name: '',
    issuer: '',
    year: '',
    expiryYear: ''
  });
  // Removed [newEducation] state

  const handleBioChange = (value) => {
    updateData('bio', value);
    setUnsavedChanges(true);
  };

  // 🔑 FIX: Ensures the value from the slider/input is treated as an integer
  const handleExperienceChange = (value) => {
    updateData('yearsOfExperience', parseInt(value) || 0);
    setUnsavedChanges(true);
  };

  // Specialty Management
  const addSpecialty = () => {
    if (newSpecialty?.trim() && !data?.specialties?.includes(newSpecialty?.trim())) {
      // NOTE: Frontend still prepares the array locally before sending to main save
      const updatedSpecialties = [...(data?.specialties || []), newSpecialty?.trim()];
      updateData('specialties', updatedSpecialties);
      setNewSpecialty('');
      setUnsavedChanges(true);
    }
  };

  const removeSpecialty = (index) => {
    const updatedSpecialties = data?.specialties?.filter((_, i) => i !== index) || [];
    updateData('specialties', updatedSpecialties);
    setUnsavedChanges(true);
  };

  // Certification Management
  const addCertification = () => {
    if (newCertification?.name?.trim() && newCertification?.issuer?.trim()) {
      // NOTE: Frontend still prepares the array locally before sending to main save
      const updatedCertifications = [
        ...(data?.certifications || []),
        { ...newCertification, id: Date.now() }
      ];
      updateData('certifications', updatedCertifications);
      setNewCertification({ name: '', issuer: '', year: '', expiryYear: '' });
      setUnsavedChanges(true);
    }
  };

  const removeCertification = (id) => {
    const updatedCertifications = data?.certifications?.filter(cert => cert?.id !== id) || [];
    updateData('certifications', updatedCertifications);
    setUnsavedChanges(true);
  };

  // Removed Education Management handlers (addEducation, removeEducation)

  const popularSpecialties = [
    'Life Coaching', 'Business Coaching', 'Career Coaching', 'Executive Coaching',
    'Health & Wellness', 'Relationship Coaching', 'Leadership Development',
    'Performance Coaching', 'Financial Coaching', 'Mindfulness & Meditation'
  ];

  return (
    <div className="space-y-8">
      {/* Bio Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Professional Bio</h3>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tell clients about your coaching approach and experience
          </label>
          <textarea
            value={data?.bio || ''}
            onChange={(e) => handleBioChange(e?.target?.value)}
            rows={6}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
            placeholder="Share your coaching philosophy, approach, and what makes you unique as a coach. This will be one of the first things potential clients see on your profile."
          />
          <div className="flex justify-between items-center mt-2">
            <p className="text-xs text-gray-500">
              Recommended: 150-500 characters
            </p>
            <span className={`text-xs ${
              (data?.bio?.length || 0) > 500 ? 'text-red-500' : 'text-gray-400'
            }`}>
              {data?.bio?.length || 0}/500
            </span>
          </div>
        </div>
      </div>
      {/* Specialties Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Coaching Specialties</h3>
        
        {/* Current Specialties */}
        <div className="flex flex-wrap gap-2">
          {data?.specialties?.map((specialty, index) => (
            <span
              key={index}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
            >
              <Tag className="w-3 h-3 mr-1" />
              {specialty}
              <button
                onClick={() => removeSpecialty(index)}
                className="ml-2 text-blue-600 hover:text-blue-800"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>

        {/* Add New Specialty */}
        <div className="flex space-x-2">
          <Input
            value={newSpecialty}
            onChange={(e) => setNewSpecialty(e?.target?.value)}
            placeholder="Add a specialty (e.g., Life Coaching)"
            className="flex-1"
            onKeyPress={(e) => e?.key === 'Enter' && addSpecialty()}
          />
          <Button
            onClick={addSpecialty}
            disabled={!newSpecialty?.trim()}
            size="sm"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add
          </Button>
        </div>

        {/* Popular Specialties */}
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Popular specialties:</p>
          <div className="flex flex-wrap gap-2">
            {popularSpecialties?.filter(specialty => !data?.specialties?.includes(specialty))?.slice(0, 6)?.map((specialty) => (
                <button
                  key={specialty}
                  onClick={() => {
                    setNewSpecialty(specialty);
                    setTimeout(addSpecialty, 0);
                  }}
                  className="text-xs px-2 py-1 rounded border border-gray-300 text-gray-600 hover:bg-gray-50"
                >
                  + {specialty}
                </button>
              ))}
          </div>
        </div>
      </div>
      {/* Years of Experience */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Experience</h3>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-4">
            Years of Coaching Experience: {data?.yearsOfExperience || 0} years
          </label>
          <input
            type="range"
            min="0"
            max="30"
            step="1"
            value={data?.yearsOfExperience || 0}
            onChange={(e) => handleExperienceChange(e?.target?.value)}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>0 years</span>
            <span>15+ years</span>
            <span>30+ years</span>
          </div>
        </div>
      </div>
      {/* Certifications */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Certifications</h3>
        
        {/* Current Certifications */}
        <div className="space-y-3">
          {data?.certifications?.map((cert) => (
            <div key={cert?.id} className="flex items-start justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <Award className="w-5 h-5 text-yellow-500 mt-1" />
                <div>
                  <h4 className="font-medium text-gray-900">{cert?.name}</h4>
                  <p className="text-sm text-gray-600">{cert?.issuer}</p>
                  <p className="text-xs text-gray-500">
                    {cert?.year && `Obtained: ${cert?.year}`}
                    {cert?.expiryYear && ` | Expires: ${cert?.expiryYear}`}
                  </p>
                </div>
              </div>
              <button
                onClick={() => removeCertification(cert?.id)}
                className="text-gray-400 hover:text-red-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Add Certification Form */}
        <div className="border border-dashed border-gray-300 rounded-lg p-4 space-y-4">
          <h4 className="font-medium text-gray-900">Add New Certification</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Certification Name"
              value={newCertification?.name}
              onChange={(e) => setNewCertification(prev => ({ ...prev, name: e?.target?.value }))}
              placeholder="e.g., Certified Professional Coach"
              required
            />
            <Input
              label="Issuing Organization"
              value={newCertification?.issuer}
              onChange={(e) => setNewCertification(prev => ({ ...prev, issuer: e?.target?.value }))}
              placeholder="e.g., International Coach Federation"
              required
            />
            <Input
              label="Year Obtained"
              type="number"
              value={newCertification?.year}
              onChange={(e) => setNewCertification(prev => ({ ...prev, year: e?.target?.value }))}
              placeholder="2023"
            />
            <Input
              label="Expiry Year (if applicable)"
              type="number"
              value={newCertification?.expiryYear}
              onChange={(e) => setNewCertification(prev => ({ ...prev, expiryYear: e?.target?.value }))}
              placeholder="2026"
            />
          </div>
          <Button
            onClick={addCertification}
            disabled={!newCertification?.name?.trim() || !newCertification?.issuer?.trim()}
            size="sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Certification
          </Button>
        </div>
      </div>
      {/* Removed Education Section */}
    </div>
  );
};

export default ProfessionalSection;