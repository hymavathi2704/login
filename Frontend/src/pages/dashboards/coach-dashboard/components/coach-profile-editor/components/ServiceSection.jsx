// Frontend/src/pages/dashboards/coach-dashboard/components/coach-profile-editor/components/ServiceSection.jsx
import React, { useState } from 'react';
import { Plus, X, DollarSign, Clock, Calendar, Users } from 'lucide-react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

const ServiceSection = ({ data, errors, updateData, setUnsavedChanges }) => {
  const [newSessionType, setNewSessionType] = useState({
    name: '',
    duration: '',
    description: '',
    format: 'individual'
  });

  const daysOfWeek = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
  const timezones = ['UTC','EST','CST','MST','PST','GMT','CET','JST','AEST'];

  const sessionFormats = [
    { value: 'individual', label: '1-on-1 Individual', icon: '👤' },
    { value: 'group', label: 'Group Sessions', icon: '👥' },
    { value: 'workshop', label: 'Workshops', icon: '🏫' },
    { value: 'online', label: 'Online Only', icon: '💻' },
    { value: 'in-person', label: 'In-Person', icon: '🏢' }
  ];

  // --- Handlers ---
  const addSessionType = () => {
    if (!newSessionType.name.trim()) return;
    const updated = [...(data.sessionTypes || []), { ...newSessionType, id: Date.now() }];
    updateData('sessionTypes', updated);
    setNewSessionType({ name: '', duration: '', description: '', format: 'individual' });
    setUnsavedChanges(true);
  };

  const removeSessionType = (id) => {
    const updated = (data.sessionTypes || []).filter(s => s.id !== id);
    updateData('sessionTypes', updated);
    setUnsavedChanges(true);
  };

  const updatePricing = (type, value) => {
    updateData({ pricing: { ...data.pricing, [type]: value } });
    setUnsavedChanges(true);
  };

  const toggleWorkingDay = (day) => {
    const currentDays = data.availability?.workingDays || [];
    const updatedDays = currentDays.includes(day)
      ? currentDays.filter(d => d !== day)
      : [...currentDays, day];
    updateData({ availability: { ...data.availability, workingDays: updatedDays } });
    setUnsavedChanges(true);
  };

  const updateWorkingHours = (field, value) => {
    updateData({
      availability: {
        ...data.availability,
        workingHours: { ...data.availability?.workingHours, [field]: value }
      }
    });
    setUnsavedChanges(true);
  };

  const updateTimezone = (tz) => {
    updateData({ availability: { ...data.availability, timezone: tz } });
    setUnsavedChanges(true);
  };

  return (
    <div className="space-y-8">
      {/* Session Types */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Session Types</h3>
        <div className="space-y-3">
          {data.sessionTypes?.map(session => (
            <div key={session.id} className="flex items-start justify-between p-4 border rounded-lg">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  {sessionFormats.find(f => f.value === session.format)?.icon || '❓'}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">{session.name}</h4>
                  <p className="text-sm text-gray-600">{session.description}</p>
                  <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                    <span className="flex items-center space-x-1"><Clock className="w-3 h-3" /><span>{session.duration} min</span></span>
                    <span className="flex items-center space-x-1"><Users className="w-3 h-3" /><span>{sessionFormats.find(f => f.value === session.format)?.label}</span></span>
                  </div>
                </div>
              </div>
              <button onClick={() => removeSessionType(session.id)} className="text-gray-400 hover:text-red-500">
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Add Session Form */}
        <div className="border border-dashed rounded-lg p-4 space-y-4">
          <h4 className="font-medium">Add New Session Type</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input 
              label="Session Name"
              value={newSessionType.name}
              onChange={e => setNewSessionType(p => ({ ...p, name: e.target.value }))}
              placeholder="e.g., Discovery"
              required
            />
            <div>
              <label className="block text-sm font-medium mb-2">Session Format</label>
              <select
                value={newSessionType.format}
                onChange={e => setNewSessionType(p => ({ ...p, format: e.target.value }))}
                className="w-full rounded-md border py-2 px-3 text-sm"
              >
                {sessionFormats.map(f => (
                  <option key={f.value} value={f.value}>{f.icon} {f.label}</option>
                ))}
              </select>
            </div>
            <Input
              label="Duration (minutes)"
              type="number"
              value={newSessionType.duration}
              onChange={e => setNewSessionType(p => ({ ...p, duration: e.target.value }))}
              placeholder="60"
            />
          </div>
          <textarea
            value={newSessionType.description}
            onChange={e => setNewSessionType(p => ({ ...p, description: e.target.value }))}
            rows={2}
            className="w-full rounded-md border px-3 py-2 text-sm"
            placeholder="Brief description..."
          />
          <Button
            onClick={addSessionType}
            disabled={!newSessionType.name.trim()}
            size="sm"
          >
            <Plus className="w-4 h-4 mr-2" /> Add Session Type
          </Button>
        </div>
      </div>

      {/* Pricing */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Pricing</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {['individual', 'group', 'package'].map(type => (
            <div key={type} className="space-y-2">
              <label className="flex items-center space-x-2 text-sm font-medium">
                {type === 'individual' && <DollarSign className="w-4 h-4" />}
                {type === 'group' && <Users className="w-4 h-4" />}
                {type === 'package' && <Calendar className="w-4 h-4" />}
                <span>{type.charAt(0).toUpperCase() + type.slice(1)} Rate</span>
              </label>
              <input
                type="number"
                value={data.pricing?.[type] || ''}
                onChange={e => updatePricing(type, e.target.value)}
                className="w-full pl-8 pr-3 py-2 border rounded-md text-sm"
                placeholder="0"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Availability */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Availability</h3>
        <div className="space-y-2">
          <label className="block text-sm font-medium">Timezone</label>
          <select
            value={data.availability?.timezone || 'UTC'}
            onChange={e => updateTimezone(e.target.value)}
            className="w-1/3 rounded-md border py-2 px-3 text-sm"
          >
            {timezones.map(tz => <option key={tz} value={tz}>{tz}</option>)}
          </select>
        </div>
        <div className="flex items-center space-x-4">
          <div className="space-y-1">
            <label className="text-xs font-medium">Start Time</label>
            <input
              type="time"
              value={data.availability?.workingHours?.start || '09:00'}
              onChange={e => updateWorkingHours('start', e.target.value)}
              className="rounded-md border py-2 px-3 text-sm"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium">End Time</label>
            <input
              type="time"
              value={data.availability?.workingHours?.end || '17:00'}
              onChange={e => updateWorkingHours('end', e.target.value)}
              className="rounded-md border py-2 px-3 text-sm"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-7 gap-2">
          {daysOfWeek.map(day => (
            <label key={day} className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="checkbox"
                checked={data.availability?.workingDays?.includes(day) || false}
                onChange={() => toggleWorkingDay(day)}
                className="rounded border-gray-300 text-blue-600"
              />
              <span className="text-sm font-medium">{day.substring(0,3)}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ServiceSection;
