// Frontend/src/pages/dashboards/coach-dashboard/components/coach-profile-editor/components/ServiceSection.jsx

import React, { useState, useEffect } from 'react';
import { Plus, X, Clock, Users, DollarSign, Calendar, Globe } from 'lucide-react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
// Use the new API functions
import { createSession, deleteSession } from '@/auth/authApi'; 
import { toast } from 'sonner';

// Pass coachSessions (the actual array of sessions) and onSessionsUpdated (a function to refetch/update the profile state)
const ServiceSection = ({ sessions, onSessionsUpdated }) => {
    
    // FIX 1: Standardize the state field to 'duration' and 'type' to match the backend model/controller
    const [newSessionType, setNewSessionType] = useState({
        name: '',
        duration: '', // CHANGED from durationMinutes
        price: '',           
        description: '',
        type: 'individual', 
        defaultDate: '', 
        defaultTime: '', 
        meetingLink: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const sessionFormats = [
        { value: 'individual', label: '1-on-1 Individual' },
        { value: 'group', label: 'Group Sessions' },
        { value: 'workshop', label: 'Workshops' },
        { value: 'online', label: 'Online Only' },
        { value: 'in-person', label: 'In-Person' }
    ];

    // --- Handlers ---
    const handleAddSession = async () => {
        // FIX 2: Check for the correct 'duration' state field in validation
        if (!newSessionType.name.trim() || !newSessionType.duration || !newSessionType.price) {
            toast.error('Please fill in Session Name, Duration, and Price.');
            return; 
        }

        setIsSubmitting(true);
        try {
            await createSession({
                ...newSessionType,
                // Ensure duration is parsed correctly before sending
                duration: parseInt(newSessionType.duration, 10), 
                price: parseFloat(newSessionType.price),
                // Backend will sanitize date/time to null if empty
            });

            // Clear form on success
            setNewSessionType({ 
                name: '', duration: '', price: '', description: '', 
                type: 'individual', defaultDate: '', defaultTime: '', meetingLink: '' 
            });

            onSessionsUpdated(); 

        } catch (error) {
            console.error("Failed to create session:", error);
            toast.error(error.response?.data?.error || 'Failed to create session.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRemoveSession = async (sessionId) => {
        if (!window.confirm("Are you sure you want to delete this session?")) return;

        try {
            await deleteSession(sessionId);
            onSessionsUpdated();
            toast.success('Session deleted successfully.');
        } catch (error) {
            console.error("Failed to delete session:", error);
            toast.error(error.response?.data?.error || 'Failed to delete session.');
        }
    };

    // --- JSX ---
    return (
        <div className="space-y-8">
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Your Session Types (Service Offerings)</h3>
                <p className="text-sm text-gray-600">
                    Define the types of sessions you offer. These services will be visible on your public profile.
                </p>

                <div className="space-y-3">
                    {sessions && sessions.length > 0 ? sessions.map(session => (
                        <div key={session.id} className="flex items-start justify-between p-4 border rounded-lg">
                            <div className="flex items-start space-x-3">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <Users className="w-5 h-5 text-blue-600" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-medium">{session.title}</h4>
                                    <p className="text-sm text-gray-600">{session.description}</p>
                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-gray-500">
                                        <span className="flex items-center space-x-1"><Clock className="w-3 h-3" /><span>{session.duration} min</span></span>
                                        <span className="flex items-center space-x-1 text-green-600"><DollarSign className="w-3 h-3" /><span>${parseFloat(session.price)?.toFixed(2)}</span></span>
                                        <span className="flex items-center space-x-1"><Users className="w-3 h-3" /><span>{sessionFormats.find(f => f.value === session.type)?.label}</span></span>
                                        
                                        {session.defaultDate && <span className="flex items-center space-x-1"><Calendar className="w-3 h-3" /><span>{session.defaultDate} @ {session.defaultTime}</span></span>}
                                        {session.meetingLink && <span className="flex items-center space-x-1"><Globe className="w-3 h-3" /><span>Meeting Link Set</span></span>}

                                    </div>
                                </div>
                            </div>
                            <button 
                                onClick={() => handleRemoveSession(session.id)} 
                                className="text-gray-400 hover:text-red-500 p-1"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    )) : (
                        <p className="text-center text-gray-500 py-4 border border-dashed rounded-lg">
                            No sessions defined yet. Use the form below to create your first service offering.
                        </p>
                    )}
                </div>

                {/* Add Session Form */}
                <div className="border border-dashed rounded-lg p-4 space-y-4">
                    <h4 className="font-medium">Add New Session Type</h4>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="md:col-span-2">
                            <Input 
                                label="Session Name"
                                value={newSessionType.name}
                                onChange={e => setNewSessionType(p => ({ ...p, name: e.target.value }))}
                                placeholder="e.g., Discovery Call"
                                required
                            />
                        </div>

                        <Input 
                            label="Price" 
                            type="number"
                            value={newSessionType.price}
                            onChange={e => setNewSessionType(p => ({ ...p, price: e.target.value }))}
                            placeholder="100.00"
                            min="0"
                            step="0.01"
                            icon="$"
                            required
                        />

                        <Input
                            label="Duration (minutes)"
                            type="number"
                            // FIX 3: Change value to use the standardized 'duration' field
                            value={newSessionType.duration}
                            // FIX 4: Change onChange to update the standardized 'duration' field
                            onChange={e => setNewSessionType(p => ({ ...p, duration: e.target.value }))}
                            placeholder="60"
                            min="1"
                            required
                        />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Input
                            label="Default Date (Optional)"
                            type="date"
                            value={newSessionType.defaultDate}
                            onChange={e => setNewSessionType(p => ({ ...p, defaultDate: e.target.value }))}
                        />

                        <Input
                            label="Default Time (Optional)"
                            type="time"
                            value={newSessionType.defaultTime}
                            onChange={e => setNewSessionType(p => ({ ...p, defaultTime: e.target.value }))}
                        />
                        
                        <div className="md:col-span-1">
                            <label className="block text-sm font-medium mb-2">Session Format</label>
                            <select
                                // FIX 5: Change value to use the standardized 'type' field
                                value={newSessionType.type}
                                // FIX 6: Change onChange to update the standardized 'type' field
                                onChange={e => setNewSessionType(p => ({ ...p, type: e.target.value }))}
                                className="w-full rounded-md border py-2 px-3 text-sm h-[42px]"
                            >
                                {sessionFormats.map(f => (
                                    <option key={f.value} value={f.value}>{f.label}</option>
                                ))}
                            </select>
                        </div>

                        <Input 
                            label="Meeting Link (e.g., Zoom/Meet URL)"
                            value={newSessionType.meetingLink}
                            onChange={e => setNewSessionType(p => ({ ...p, meetingLink: e.target.value }))}
                            placeholder="https://zoom.us/j/..."
                            className="md:col-span-4"
                        />
                    </div>

                    <textarea
                        value={newSessionType.description}
                        onChange={e => setNewSessionType(p => ({ ...p, description: e.target.value }))}
                        rows={2}
                        className="w-full rounded-md border px-3 py-2 text-sm"
                        placeholder="Brief description of this session type..."
                    />
                    
                    <Button
                        onClick={handleAddSession}
                        disabled={isSubmitting || !newSessionType.name.trim() || !newSessionType.duration || !newSessionType.price}
                        size="sm"
                    >
                        <Plus className="w-4 h-4 mr-2" /> {isSubmitting ? 'Adding...' : 'Add Session Type'}
                    </Button>
                </div>
            </div>
        </div>
    );
};


export default ServiceSection;