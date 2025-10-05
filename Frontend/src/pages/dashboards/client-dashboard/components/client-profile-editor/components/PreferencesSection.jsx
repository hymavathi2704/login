import React, { useState } from 'react';
import { Plus, X, Tag, MessageSquare, DollarSign, Users, Video, MapPin } from 'lucide-react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const PreferencesSection = ({ data, errors, updateData, updateNestedData, setUnsavedChanges }) => {
  const [newFocusArea, setNewFocusArea] = useState('');

  const focusAreas = [
    'Life Coaching', 'Career Development', 'Leadership', 'Health & Wellness',
    'Relationship Coaching', 'Financial Coaching', 'Business Coaching',
    'Personal Growth', 'Stress Management', 'Goal Setting', 'Time Management',
    'Communication Skills', 'Confidence Building', 'Work-Life Balance'
  ];

  const sessionFormats = [
    { value: 'individual', label: 'Individual 1-on-1', icon: <Users className="w-4 h-4" /> },
    { value: 'group', label: 'Group Sessions', icon: <Users className="w-4 h-4" /> },
    { value: 'online', label: 'Online/Video', icon: <Video className="w-4 h-4" /> },
    { value: 'in-person', label: 'In-Person', icon: <MapPin className="w-4 h-4" /> }
  ];

  const sessionFrequencies = [
    { value: 'weekly', label: 'Weekly' },
    { value: 'bi-weekly', label: 'Every 2 weeks' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'as-needed', label: 'As needed' },
    { value: 'flexible', label: 'Flexible schedule' }
  ];

  // Focus Areas Management
  const addFocusArea = () => {
    if (newFocusArea?.trim() && !data?.coachingFocusAreas?.includes(newFocusArea?.trim())) {
      const updatedAreas = [...(data?.coachingFocusAreas || []), newFocusArea?.trim()];
      updateData('coachingFocusAreas', updatedAreas);
      setNewFocusArea('');
      setUnsavedChanges(true);
    }
  };

  const removeFocusArea = (index) => {
    const updatedAreas = data?.coachingFocusAreas?.filter((_, i) => i !== index) || [];
    updateData('coachingFocusAreas', updatedAreas);
    setUnsavedChanges(true);
  };

  const addPopularFocusArea = (area) => {
    if (!data?.coachingFocusAreas?.includes(area)) {
      const updatedAreas = [...(data?.coachingFocusAreas || []), area];
      updateData('coachingFocusAreas', updatedAreas);
      setUnsavedChanges(true);
    }
  };

  // Communication Preferences
  const updateCommunicationPref = (type, value) => {
    updateNestedData(`communicationPreferences.${type}`, value);
    setUnsavedChanges(true);
  };

  // Session Preferences
  const updateSessionFrequency = (frequency) => {
    updateData('sessionFrequency', frequency);
    setUnsavedChanges(true);
  };

  const updateSessionFormat = (format) => {
    updateData('preferredSessionFormat', format);
    setUnsavedChanges(true);
  };

  // Budget Management
  const updateBudget = (type, value) => {
    updateNestedData(`budget.${type}`, value);
    setUnsavedChanges(true);
  };

  return (
    <div className="space-y-8">
      {/* Coaching Focus Areas */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Coaching Focus Areas</h3>
        <p className="text-sm text-gray-600">
          Select the areas you'd like to work on with a coach. This helps us match you with specialists.
        </p>
        
        {/* Current Focus Areas */}
        <div className="flex flex-wrap gap-2">
          {data?.coachingFocusAreas?.map((area, index) => (
            <span
              key={index}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
            >
              <Tag className="w-3 h-3 mr-1" />
              {area}
              <button
                onClick={() => removeFocusArea(index)}
                className="ml-2 text-blue-600 hover:text-blue-800"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>

        {/* Add Custom Focus Area */}
        <div className="flex space-x-2">
          <Input
            value={newFocusArea}
            onChange={(e) => setNewFocusArea(e?.target?.value)}
            placeholder="Add a custom focus area"
            className="flex-1"
            onKeyPress={(e) => e?.key === 'Enter' && addFocusArea()}
          />
          <Button
            onClick={addFocusArea}
            disabled={!newFocusArea?.trim()}
            size="sm"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add
          </Button>
        </div>

        {/* Popular Focus Areas */}
        <div>
          <p className="text-sm font-medium text-gray-700 mb-3">Popular focus areas:</p>
          <div className="flex flex-wrap gap-2">
            {focusAreas
              ?.filter(area => !(data?.coachingFocusAreas || [])?.includes(area))
              ?.slice(0, 8)
              ?.map((area) => (
                <button
                  key={area}
                  onClick={() => addPopularFocusArea(area)}
                  className="text-xs px-3 py-1 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-50 hover:border-blue-300 hover:text-blue-600 transition-colors"
                >
                  + {area}
                </button>
              )) || []}
          </div>
        </div>
      </div>
      {/* Communication Preferences */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Communication Preferences</h3>
        <p className="text-sm text-gray-600">
          How would you like coaches to communicate with you?
        </p>
        
        <div className="space-y-4">
          <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
            <div className="flex items-center space-x-3">
              <MessageSquare className="w-5 h-5 text-gray-500" />
              <div>
                <p className="font-medium text-gray-900">Email Messages</p>
                <p className="text-sm text-gray-600">Receive coach messages via email</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={data?.communicationPreferences?.email ?? true}
              onChange={(e) => updateCommunicationPref('email', e?.target?.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          </label>

          <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
            <div className="flex items-center space-x-3">
              <MessageSquare className="w-5 h-5 text-gray-500" />
              <div>
                <p className="font-medium text-gray-900">SMS Notifications</p>
                <p className="text-sm text-gray-600">Receive urgent updates via text</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={data?.communicationPreferences?.sms ?? false}
              onChange={(e) => updateCommunicationPref('sms', e?.target?.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          </label>

          <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
            <div className="flex items-center space-x-3">
              <MessageSquare className="w-5 h-5 text-gray-500" />
              <div>
                <p className="font-medium text-gray-900">Push Notifications</p>
                <p className="text-sm text-gray-600">In-app notifications for messages and reminders</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={data?.communicationPreferences?.push ?? true}
              onChange={(e) => updateCommunicationPref('push', e?.target?.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          </label>
        </div>
      </div>
      {/* Session Preferences */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900">Session Preferences</h3>
        
        {/* Session Frequency */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            Preferred Session Frequency
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {sessionFrequencies?.map((freq) => (
              <label
                key={freq?.value}
                className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
              >
                <input
                  type="radio"
                  name="sessionFrequency"
                  value={freq?.value}
                  checked={data?.sessionFrequency === freq?.value}
                  onChange={() => updateSessionFrequency(freq?.value)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">{freq?.label}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Session Format */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            Preferred Session Format
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {sessionFormats?.map((format) => (
              <label
                key={format?.value}
                className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
              >
                <input
                  type="radio"
                  name="sessionFormat"
                  value={format?.value}
                  checked={data?.preferredSessionFormat === format?.value}
                  onChange={() => updateSessionFormat(format?.value)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <div className="ml-3 flex items-center space-x-3">
                  {format?.icon}
                  <p className="text-sm font-medium text-gray-900">{format?.label}</p>
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>
      {/* Budget Preferences */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Budget Range</h3>
        <p className="text-sm text-gray-600">
          Set your preferred budget range to help coaches understand your expectations.
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
              <DollarSign className="w-4 h-4" />
              <span>Minimum per session</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                value={data?.budget?.min || ''}
                onChange={(e) => updateBudget('min', e?.target?.value)}
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="50"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
              <DollarSign className="w-4 h-4" />
              <span>Maximum per session</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                value={data?.budget?.max || ''}
                onChange={(e) => updateBudget('max', e?.target?.value)}
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="200"
              />
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-700">
            💡 <strong>Budget Tip:</strong> Setting a realistic budget range helps coaches tailor their services to your needs. Many coaches offer package deals or sliding scale pricing.
          </p>
        </div>
      </div>
      {/* Preferences Summary */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h4 className="font-medium text-blue-900 mb-4">Your Coaching Preferences Summary</h4>
        <div className="text-sm text-blue-800 space-y-2">
          <p>
            <strong>Focus Areas:</strong> {
              data?.coachingFocusAreas?.length 
                ? data?.coachingFocusAreas?.join(', ')
                : 'Not specified'
            }
          </p>
          <p>
            <strong>Session Frequency:</strong> {
              sessionFrequencies?.find(f => f?.value === data?.sessionFrequency)?.label || 'Not specified'
            }
          </p>
          <p>
            <strong>Session Format:</strong> {
              sessionFormats?.find(f => f?.value === data?.preferredSessionFormat)?.label || 'Not specified'
            }
          </p>
          <p>
            <strong>Budget Range:</strong> {
              data?.budget?.min || data?.budget?.max 
                ? `$${data?.budget?.min || '0'} - $${data?.budget?.max || '∞'} per session`
                : 'Not specified'
            }
          </p>
          <p>
            <strong>Communication:</strong> {
              [
                data?.communicationPreferences?.email && 'Email',
                data?.communicationPreferences?.sms && 'SMS',
                data?.communicationPreferences?.push && 'Push Notifications'
              ]?.filter(Boolean)?.join(', ') || 'None selected'
            }
          </p>
        </div>
      </div>
    </div>
  );
};

export default PreferencesSection;