// Frontend/src/pages/dashboards/coach-dashboard/components/coach-profile-editor/components/ProfessionalSection.jsx
import React, { useState } from 'react';
import { Plus, X, Tag } from 'lucide-react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
// FIX: Importing all necessary components as named exports
import Select, { SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/Select'; 

const ProfessionalSection = ({ data, errors, updateData, setUnsavedChanges, onAddListItem, onRemoveListItem }) => {
  const [newCertification, setNewCertification] = useState({ name: '', issuer: '', year: '', expiryYear: '' });
  const [newEducation, setNewEducation] = useState({ degree: '', institution: '', year: '', field: '' });
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [customSpecialty, setCustomSpecialty] = useState('');


  const popularSpecialties = [
    'Life Coaching', 'Business Coaching', 'Career Coaching', 'Executive Coaching',
    'Health & Wellness', 'Relationship Coaching', 'Leadership Development',
    'Performance Coaching', 'Financial Coaching', 'Mindfulness & Meditation'
  ];
  // ✅ FIX: Removed the option with value: '' to comply with Radix Select.Item constraint.
  const specialtyOptions = [
    ...popularSpecialties.map(s => ({ label: s, value: s })),
    { label: 'Other (type below)', value: 'other' }
  ];

  const currentSpecialties = Array.isArray(data.specialties) ? data.specialties : [];
  const currentCertifications = Array.isArray(data.certifications) ? data.certifications : [];
  const currentEducation = Array.isArray(data.education) ? data.education : [];


  // ===== Helpers (omitted for brevity, assume they are correct) =====
  const handleChange = (field, value) => {
    updateData({ [field]: value });
    setUnsavedChanges(true);
  };

  const editItemInLocalState = (field, id, key, value) => {
    const currentList = Array.isArray(data[field]) ? data[field] : [];
    updateData({
      [field]: currentList.map(x => x.id === id ? { ...x, [key]: value } : x)
    });
    setUnsavedChanges(true);
  };
  
  const removeListItem = (field, id) => {
      onRemoveListItem(field, id); 
  }

  const addSpecialty = (specialty) => {
    const specialtyToAdd = specialty.trim();
    if (!specialtyToAdd || currentSpecialties.includes(specialtyToAdd)) return;
    onAddListItem('specialties', specialtyToAdd); 
    setCustomSpecialty('');
    setSelectedSpecialty('');
  };

  const addCertification = () => {
    const { name, issuer } = newCertification;
    if (name.trim() && issuer.trim()) {
      const tempId = Date.now() + Math.random();
      onAddListItem('certifications', { ...newCertification, id: tempId }); 
      setNewCertification({ name: '', issuer: '', year: '', expiryYear: '' });
    }
  };

  const addEducation = () => {
    const { degree, institution } = newEducation;
    if (degree.trim() && institution.trim()) {
      const tempId = Date.now() + Math.random();
      onAddListItem('education', { ...newEducation, id: tempId });
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

      {/* Specialties - FIXED DROPDOWN IMPLEMENTATION */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Coaching Specialties</h3>
        <div className="flex flex-wrap gap-2 mb-4">
          {currentSpecialties.map((s, i) => (
            <span key={i} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
              <Tag className="w-3 h-3 mr-1" /> {s}
              <button onClick={() => onRemoveListItem('specialties', s)} className="ml-2 text-blue-600 hover:text-blue-800">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
        
        {/* Dropdown and Add Field */}
        <div className="flex flex-col space-y-2">
            <label htmlFor="specialty-select-trigger" className="block text-sm font-medium text-gray-700">
                Select from popular list or choose 'Other'
            </label>
            {/* 🔑 CRITICAL FIX: The Radix Select structure needs all its parts */}
            <Select 
                value={selectedSpecialty} 
                onValueChange={(value) => {
                    setSelectedSpecialty(value);
                    setCustomSpecialty(''); 
                    if (value !== 'other' && value !== '') {
                        addSpecialty(value);
                    }
                }}
            >
                <SelectTrigger id="specialty-select-trigger" className="w-full">
                    <SelectValue placeholder="Select a specialty..." />
                </SelectTrigger>
                <SelectContent>
                    {specialtyOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                            {option.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {selectedSpecialty === 'other' && (
                <div className="flex space-x-2">
                    <Input
                        value={customSpecialty}
                        onChange={(e) => setCustomSpecialty(e.target.value)}
                        placeholder="Type your custom specialty here"
                        className="flex-1"
                        onKeyPress={(e) => e.key === 'Enter' && addSpecialty(customSpecialty)}
                    />
                    <Button 
                        onClick={() => addSpecialty(customSpecialty)} 
                        disabled={!customSpecialty.trim()} 
                        size="sm"
                    >
                        <Plus className="w-4 h-4 mr-1" /> Add Custom
                    </Button>
                </div>
            )}
        </div>
      </div>

      {/* Experience - MODIFIED TO INPUT FIELD */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Experience</h3>
        <Input
          label="Years of Coaching Experience"
          type="number"
          name="yearsOfExperience"
          min="0"
          max="50"
          step="1"
          value={data.yearsOfExperience || ''}
          // The onChange handler converts the input string to an integer, matching the old logic.
          onChange={(e) => handleChange('yearsOfExperience', parseInt(e.target.value, 10) || 0)}
          placeholder="Enter number of years"
          description="Enter the total number of years you have been professionally coaching."
        />
      </div>

      {/* Certifications */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Certifications</h3>
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
            {/* Delete Button */}
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
            {/* Delete Button */}
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