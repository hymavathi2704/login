// Frontend/src/pages/dashboards/coach-dashboard/components/coach-profile-editor/components/ProfessionalSection.jsx
import React, { useState } from 'react';
import { Plus, X, Tag } from 'lucide-react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

const ProfessionalSection = ({ data, errors, updateData, setUnsavedChanges, onAddListItem, onRemoveListItem }) => {
  const [newSpecialty, setNewSpecialty] = useState('');
  const [newCertification, setNewCertification] = useState({ name: '', issuer: '', year: '', expiryYear: '' });
  const [newEducation, setNewEducation] = useState({ degree: '', institution: '', year: '', field: '' });

  const popularSpecialties = [
    'Life Coaching', 'Business Coaching', 'Career Coaching', 'Executive Coaching',
    'Health & Wellness', 'Relationship Coaching', 'Leadership Development',
    'Performance Coaching', 'Financial Coaching', 'Mindfulness & Meditation'
  ];

  // *** CRITICAL FIX: Ensure all arrays are treated defensively ***
  const currentSpecialties = Array.isArray(data.specialties) ? data.specialties : [];
  const currentCertifications = Array.isArray(data.certifications) ? data.certifications : [];
  const currentEducation = Array.isArray(data.education) ? data.education : [];


  // ===== Helpers =====
  const handleChange = (field, value) => {
    updateData({ [field]: value });
    setUnsavedChanges(true);
  };

  const editItemInLocalState = (field, id, key, value) => {
    // Only updates the item locally for a better UX while the main save is pending
    const currentList = Array.isArray(data[field]) ? data[field] : [];
    updateData({
      [field]: currentList.map(x => x.id === id ? { ...x, [key]: value } : x)
    });
    setUnsavedChanges(true);
  };
  
  // Uses API handler passed from index.jsx
  const removeListItem = (field, id) => {
      onRemoveListItem(field, id); 
  }


  // ===== Specialties - Uses API Handler =====
  const addSpecialty = (specialty) => {
    const trimmed = specialty.trim();
    if (trimmed && !currentSpecialties.includes(trimmed)) {
      // NOTE: Specialties array is managed via API to ensure persistence
      onAddListItem('specialties', trimmed); 
      setNewSpecialty('');
    }
  };

  // ===== Certifications - Uses API Handler =====
  const addCertification = () => {
    const { name, issuer } = newCertification;
    if (name.trim() && issuer.trim()) {
      // NOTE: Certifications array is managed via API
      onAddListItem('certifications', newCertification); 
      setNewCertification({ name: '', issuer: '', year: '', expiryYear: '' });
    }
  };

  // ===== Education - Uses API Handler =====
  const addEducation = () => {
    const { degree, institution } = newEducation;
    if (degree.trim() && institution.trim()) {
      // NOTE: Education array is managed via API
      onAddListItem('education', newEducation);
      setNewEducation({ degree: '', institution: '', year: '', field: '' });
    }
  };

  return (
    <div className="space-y-8">
      {/* Bio */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Professional Bio</h3>
        <textarea
          value={data.bio || ''}
          onChange={(e) => handleChange('bio', e.target.value)}
          rows={6}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
          placeholder="Share your coaching philosophy, approach, and what makes you unique."
        />
        <div className="flex justify-between items-center mt-2">
          <p className="text-xs text-gray-500">Recommended: 150-500 characters</p>
          <span className={`text-xs ${(data.bio?.length || 0) > 500 ? 'text-red-500' : 'text-gray-400'}`}>
            {data.bio?.length || 0}/500
          </span>
        </div>
      </div>

      {/* Specialties */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Coaching Specialties</h3>
        <div className="flex flex-wrap gap-2">
          {/* Use currentSpecialties for safe mapping */}
          {currentSpecialties.map((s, i) => (
            <span key={i} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
              <Tag className="w-3 h-3 mr-1" /> {s}
              <button onClick={() => onRemoveListItem('specialties', s)} className="ml-2 text-blue-600 hover:text-blue-800">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex space-x-2 mt-2">
          <Input
            value={newSpecialty}
            onChange={(e) => setNewSpecialty(e.target.value)}
            placeholder="Add a specialty"
            className="flex-1"
            onKeyPress={(e) => e.key === 'Enter' && addSpecialty(newSpecialty)}
          />
          <Button onClick={() => addSpecialty(newSpecialty)} disabled={!newSpecialty.trim()} size="sm">
            <Plus className="w-4 h-4 mr-1" /> Add
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {popularSpecialties.map(s => (
            <button
              key={s}
              type="button"
              onClick={() => addSpecialty(s)}
              className="px-2 py-1 text-xs rounded-full border border-gray-300 hover:bg-blue-100"
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Experience */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Experience</h3>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Years of Coaching Experience: {data.yearsOfExperience || 0} years
        </label>
        <input
          type="range" min="0" max="30" step="1"
          value={data.yearsOfExperience || 0}
          onChange={(e) => handleChange('yearsOfExperience', parseInt(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg cursor-pointer"
        />
      </div>

      {/* Certifications */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Certifications</h3>
        {/* Use currentCertifications for safe mapping */}
        {currentCertifications.map(cert => (
          <div key={cert.id} className="flex items-start justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex flex-col space-y-2 w-full">
              <Input
                label="Certification Name"
                value={cert.name}
                onChange={(e) => editItemInLocalState('certifications', cert.id, 'name', e.target.value)}
                required
              />
              <Input
                label="Issuer"
                value={cert.issuer}
                onChange={(e) => editItemInLocalState('certifications', cert.id, 'issuer', e.target.value)}
                required
              />
              <div className="grid grid-cols-2 gap-2">
                <Input
                  label="Year Obtained"
                  type="number"
                  value={cert.year}
                  onChange={(e) => editItemInLocalState('certifications', cert.id, 'year', e.target.value)}
                />
                <Input
                  label="Expiry Year"
                  type="number"
                  value={cert.expiryYear}
                  onChange={(e) => editItemInLocalState('certifications', cert.id, 'expiryYear', e.target.value)}
                />
              </div>
            </div>
            <button onClick={() => removeListItem('certifications', cert.id)} className="text-gray-400 hover:text-red-500 ml-2">
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
        <div className="p-4 border border-dashed rounded-lg">
          <h4 className="font-medium text-gray-900">Add Certification</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            <Input
              label="Name"
              value={newCertification.name}
              onChange={(e) => setNewCertification(prev => ({ ...prev, name: e.target.value }))}
            />
            <Input
              label="Issuer"
              value={newCertification.issuer}
              onChange={(e) => setNewCertification(prev => ({ ...prev, issuer: e.target.value }))}
            />
            <Input
              label="Year Obtained"
              type="number"
              value={newCertification.year}
              onChange={(e) => setNewCertification(prev => ({ ...prev, year: e.target.value }))}
            />
            <Input
              label="Expiry Year"
              type="number"
              value={newCertification.expiryYear}
              onChange={(e) => setNewCertification(prev => ({ ...prev, expiryYear: e.target.value }))}
            />
          </div>
          <Button onClick={addCertification} disabled={!newCertification.name.trim() || !newCertification.issuer.trim()} size="sm" className="mt-2">
            <Plus className="w-4 h-4 mr-1" /> Add
          </Button>
        </div>
      </div>

      {/* Education */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Education</h3>
        {/* Use currentEducation for safe mapping */}
        {currentEducation.map(edu => (
          <div key={edu.id} className="flex items-start justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex flex-col space-y-2 w-full">
              <Input
                label="Degree"
                value={edu.degree}
                onChange={(e) => editItemInLocalState('education', edu.id, 'degree', e.target.value)}
                required
              />
              <Input
                label="Institution"
                value={edu.institution}
                onChange={(e) => editItemInLocalState('education', edu.id, 'institution', e.target.value)}
                required
              />
              <Input
                label="Field of Study"
                value={edu.field}
                onChange={(e) => editItemInLocalState('education', edu.id, 'field', e.target.value)}
              />
              <Input
                label="Year Completed"
                type="number"
                value={edu.year}
                onChange={(e) => editItemInLocalState('education', edu.id, 'year', e.target.value)}
              />
            </div>
            <button onClick={() => removeListItem('education', edu.id)} className="text-gray-400 hover:text-red-500 ml-2">
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
        <div className="p-4 border border-dashed rounded-lg">
          <h4 className="font-medium text-gray-900">Add Education</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            <Input
              label="Degree"
              value={newEducation.degree}
              onChange={(e) => setNewEducation(prev => ({ ...prev, degree: e.target.value }))}
            />
            <Input
              label="Institution"
              value={newEducation.institution}
              onChange={(e) => setNewEducation(prev => ({ ...prev, institution: e.target.value }))}
            />
            <Input
              label="Field"
              value={newEducation.field}
              onChange={(e) => setNewEducation(prev => ({ ...prev, field: e.target.value }))}
            />
            <Input
              label="Year"
              type="number"
              value={newEducation.year}
              onChange={(e) => setNewEducation(prev => ({ ...prev, year: e.target.value }))}
            />
          </div>
          <Button onClick={addEducation} disabled={!newEducation.degree.trim() || !newEducation.institution.trim()} size="sm" className="mt-2">
            <Plus className="w-4 h-4 mr-1" /> Add
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalSection;