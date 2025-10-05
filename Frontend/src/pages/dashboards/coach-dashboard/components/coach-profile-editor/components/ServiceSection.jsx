import React, { useState } from 'react';
import { Plus, X, DollarSign, Clock, Calendar, Users } from 'lucide-react';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';

const ServiceSection = ({ data, errors, updateData, updateNestedData, setUnsavedChanges }) => {
  const [newSessionType, setNewSessionType] = useState({
    name: '',
    duration: '',
    description: '',
    format: 'individual'
  });

  const daysOfWeek = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
  ];

  const timezones = [
    'UTC', 'EST', 'CST', 'MST', 'PST', 'GMT', 'CET', 'JST', 'AEST'
  ];

  const sessionFormats = [
    { value: 'individual', label: '1-on-1 Individual', icon: '👤' },
    { value: 'group', label: 'Group Sessions', icon: '👥' },
    { value: 'workshop', label: 'Workshops', icon: '🎯' },
    { value: 'online', label: 'Online Only', icon: '💻' },
    { value: 'in-person', label: 'In-Person', icon: '🏢' }
  ];

  // Session Types Management
  const addSessionType = () => {
    if (newSessionType?.name?.trim()) {
      const updatedSessionTypes = [
        ...(data?.sessionTypes || []),
        { ...newSessionType, id: Date.now() }
      ];
      updateData('sessionTypes', updatedSessionTypes);
      setNewSessionType({ name: '', duration: '', description: '', format: 'individual' });
      setUnsavedChanges(true);
    }
  };

  const removeSessionType = (id) => {
    const updatedSessionTypes = data?.sessionTypes?.filter(session => session?.id !== id) || [];
    updateData('sessionTypes', updatedSessionTypes);
    setUnsavedChanges(true);
  };

  // Pricing Management
  const updatePricing = (type, value) => {
    updateNestedData(`pricing.${type}`, value);
    setUnsavedChanges(true);
  };

  // Availability Management
  const updateWorkingHours = (field, value) => {
    updateNestedData(`availability.workingHours.${field}`, value);
    setUnsavedChanges(true);
  };

  const toggleWorkingDay = (day) => {
    const currentDays = data?.availability?.workingDays || [];
    const updatedDays = currentDays?.includes(day)
      ? currentDays?.filter(d => d !== day)
      : [...currentDays, day];
    
    updateNestedData('availability.workingDays', updatedDays);
    setUnsavedChanges(true);
  };

  const updateTimezone = (timezone) => {
    updateNestedData('availability.timezone', timezone);
    setUnsavedChanges(true);
  };

  return (
    <div className="space-y-8">
      {/* Session Types */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Session Types</h3>
        <p className="text-sm text-gray-600">
          Define the different coaching sessions you offer to clients.
        </p>
        
        {/* Current Session Types */}
        <div className="space-y-3">
          {data?.sessionTypes?.map((session) => (
            <div key={session?.id} className="flex items-start justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  {sessionFormats?.find(f => f?.value === session?.format)?.icon || '💼'}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{session?.name}</h4>
                  <p className="text-sm text-gray-600 mt-1">{session?.description}</p>
                  <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{session?.duration} minutes</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      {session?.format === 'individual' ? <Users className="w-3 h-3" /> : <Users className="w-3 h-3" />}
                      <span>{sessionFormats?.find(f => f?.value === session?.format)?.label}</span>
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => removeSessionType(session?.id)}
                className="text-gray-400 hover:text-red-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Add Session Type Form */}
        <div className="border border-dashed border-gray-300 rounded-lg p-4 space-y-4">
          <h4 className="font-medium text-gray-900">Add New Session Type</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Session Name"
              value={newSessionType?.name}
              onChange={(e) => setNewSessionType(prev => ({ ...prev, name: e?.target?.value }))}
              placeholder="e.g., Discovery Session"
              required
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Session Format
              </label>
              <select
                value={newSessionType?.format}
                onChange={(e) => setNewSessionType(prev => ({ ...prev, format: e?.target?.value }))}
                className="w-full rounded-md border border-gray-300 py-2 px-3 text-sm focus:ring-blue-500 focus:border-blue-500"
              >
                {sessionFormats?.map((format) => (
                  <option key={format?.value} value={format?.value}>
                    {format?.icon} {format?.label}
                  </option>
                ))}
              </select>
            </div>
            <Input
              label="Duration (minutes)"
              type="number"
              value={newSessionType?.duration}
              onChange={(e) => setNewSessionType(prev => ({ ...prev, duration: e?.target?.value }))}
              placeholder="60"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={newSessionType?.description}
              onChange={(e) => setNewSessionType(prev => ({ ...prev, description: e?.target?.value }))}
              rows={2}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="Brief description of this session type..."
            />
          </div>
          <Button
            onClick={addSessionType}
            disabled={!newSessionType?.name?.trim()}
            size="sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Session Type
          </Button>
        </div>
      </div>
      {/* Pricing */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Pricing</h3>
        <p className="text-sm text-gray-600">
          Set your rates for different session types. You can always negotiate custom rates with clients.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
              <DollarSign className="w-4 h-4" />
              <span>Individual Session Rate</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                value={data?.pricing?.individual || ''}
                onChange={(e) => updatePricing('individual', e?.target?.value)}
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="100"
              />
            </div>
            <p className="text-xs text-gray-500">Per hour</p>
          </div>

          <div className="space-y-2">
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
              <Users className="w-4 h-4" />
              <span>Group Session Rate</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                value={data?.pricing?.group || ''}
                onChange={(e) => updatePricing('group', e?.target?.value)}
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="75"
              />
            </div>
            <p className="text-xs text-gray-500">Per person per hour</p>
          </div>

          <div className="space-y-2">
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
              <Calendar className="w-4 h-4" />
              <span>Package Rate</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                value={data?.pricing?.package || ''}
                onChange={(e) => updatePricing('package', e?.target?.value)}
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="500"
              />
            </div>
            <p className="text-xs text-gray-500">Multi-session package</p>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <p className="text-sm text-yellow-800">
            💡 <strong>Pricing Tip:</strong> Research competitors in your area and specialty. 
            Consider offering introductory rates for new clients or package discounts for committed clients.
          </p>
        </div>
      </div>
      {/* Availability */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900">Availability Settings</h3>
        
        {/* Timezone */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Your Timezone
          </label>
          <select
            value={data?.availability?.timezone || 'UTC'}
            onChange={(e) => updateTimezone(e?.target?.value)}
            className="w-full md:w-1/3 rounded-md border border-gray-300 py-2 px-3 text-sm focus:ring-blue-500 focus:border-blue-500"
          >
            {timezones?.map((tz) => (
              <option key={tz} value={tz}>{tz}</option>
            ))}
          </select>
        </div>

        {/* Working Hours */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-900">Working Hours</h4>
          <div className="flex items-center space-x-4">
            <div className="space-y-1">
              <label className="block text-xs font-medium text-gray-600">Start Time</label>
              <input
                type="time"
                value={data?.availability?.workingHours?.start || '09:00'}
                onChange={(e) => updateWorkingHours('start', e?.target?.value)}
                className="rounded-md border border-gray-300 py-2 px-3 text-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-medium text-gray-600">End Time</label>
              <input
                type="time"
                value={data?.availability?.workingHours?.end || '17:00'}
                onChange={(e) => updateWorkingHours('end', e?.target?.value)}
                className="rounded-md border border-gray-300 py-2 px-3 text-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Working Days */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-900">Available Days</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-7 gap-2">
            {daysOfWeek?.map((day) => (
              <label
                key={day}
                className="flex items-center space-x-2 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
              >
                <input
                  type="checkbox"
                  checked={data?.availability?.workingDays?.includes(day) || false}
                  onChange={() => toggleWorkingDay(day)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  {day?.substring(0, 3)}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Availability Summary */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3">Availability Summary</h4>
          <div className="text-sm text-gray-700 space-y-1">
            <p>
              <strong>Working Days:</strong> {
                data?.availability?.workingDays?.length 
                  ? data?.availability?.workingDays?.join(', ')
                  : 'No days selected'
              }
            </p>
            <p>
              <strong>Working Hours:</strong> {
                data?.availability?.workingHours?.start || '09:00'
              } - {
                data?.availability?.workingHours?.end || '17:00'
              } ({data?.availability?.timezone || 'UTC'})
            </p>
            <p>
              <strong>Individual Rate:</strong> {
                data?.pricing?.individual 
                  ? `$${data?.pricing?.individual}/hour`
                  : 'Not set'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceSection;