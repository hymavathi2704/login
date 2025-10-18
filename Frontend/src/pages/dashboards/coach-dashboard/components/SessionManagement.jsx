// Frontend/src/pages/dashboards/coach-dashboard/components/SessionManagement.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { Plus, X, Clock, Users, DollarSign, Calendar, Globe } from 'lucide-react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
// Import necessary API functions for CRUD and fetching
import { createSession, deleteSession, getCoachProfile } from '@/auth/authApi'; 
import { toast } from 'sonner';

const SessionManagement = () => {
    const [sessions, setSessions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // State to manage the input form for new sessions
    const [newSessionData, setNewSessionData] = useState({
        title: '',
        duration: '',
        price: '',           
        description: '',
        type: 'individual', 
        defaultDate: '', 
        defaultTime: '', 
        meetingLink: '', // Field to update Meeting Link
    });

    const sessionFormats = [
        { value: 'individual', label: '1-on-1 Individual' },
        { value: 'group', label: 'Group Sessions' },
        { value: 'workshop', label: 'Workshops' },
        { value: 'online', label: 'Online Only' },
        { value: 'in-person', label: 'In-Person' }
    ];

    // Function to fetch the coach's entire session data
    const fetchSessions = useCallback(async () => {
        setIsLoading(true);
        try {
            // Fetches the entire profile to extract the associated sessions
            const response = await getCoachProfile();
            const fetchedSessions = response.data.user?.CoachProfile?.sessions || [];
            setSessions(fetchedSessions);
        } catch (error) {
            console.error("Failed to load sessions:", error);
            toast.error("Failed to load sessions.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { 
        fetchSessions(); 
    }, [fetchSessions]);

    // --- Handlers ---
    const handleAddSession = async () => {
        if (!newSessionData.title.trim() || !newSessionData.duration || !newSessionData.price) {
            toast.error('Please fill in Session Name, Duration, and Price.');
            return; 
        }

        setIsSubmitting(true);
        try {
            // Calls the dedicated API endpoint for creating a session
            await createSession({
                ...newSessionData,
                duration: parseInt(newSessionData.duration, 10), 
                price: parseFloat(newSessionData.price),
            });

            // Clear form and trigger a re-fetch
            setNewSessionData({ 
                title: '', duration: '', price: '', description: '', 
                type: 'individual', defaultDate: '', defaultTime: '', meetingLink: '' 
            });

            await fetchSessions();
            toast.success('Session created successfully.');

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
            await fetchSessions();
            toast.success('Session deleted successfully.');
        } catch (error) {
            console.error("Failed to delete session:", error);
            toast.error(error.response?.data?.error || 'Failed to delete session.');
        }
    };

    if (isLoading) {
        return <p className="text-center py-8">Loading session data...</p>;
    }

    return (
        <div className="space-y-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Session Management</h1>
                <p className="text-gray-600 mt-2">
                    Define, update, and manage your one-on-one sessions, group calls, or workshops.
                </p>
            </div>
            
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Your Session Types (Service Offerings)</h3>
                
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
                                name="title"
                                value={newSessionData.title}
                                onChange={e => setNewSessionData(p => ({ ...p, title: e.target.value }))}
                                placeholder="e.g., Discovery Call"
                                required
                            />
                        </div>

                        <Input 
                            label="Price" 
                            type="number"
                            name="price"
                            value={newSessionData.price}
                            onChange={e => setNewSessionData(p => ({ ...p, price: e.target.value }))}
                            placeholder="100.00"
                            min="0"
                            step="0.01"
                            icon="$"
                            required
                        />

                        <Input
                            label="Duration (minutes)"
                            type="number"
                            name="duration"
                            value={newSessionData.duration}
                            onChange={e => setNewSessionData(p => ({ ...p, duration: e.target.value }))}
                            placeholder="60"
                            min="1"
                            required
                        />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Input
                            label="Default Date (Optional)"
                            type="date"
                            name="defaultDate"
                            value={newSessionData.defaultDate}
                            onChange={e => setNewSessionData(p => ({ ...p, defaultDate: e.target.value }))}
                        />

                        <Input
                            label="Default Time (Optional)"
                            type="time"
                            name="defaultTime"
                            value={newSessionData.defaultTime}
                            onChange={e => setNewSessionData(p => ({ ...p, defaultTime: e.target.value }))}
                        />
                        
                        <div className="md:col-span-1">
                            <label className="block text-sm font-medium mb-2">Session Format</label>
                            <select
                                name="type"
                                value={newSessionData.type}
                                onChange={e => setNewSessionData(p => ({ ...p, type: e.target.value }))}
                                className="w-full rounded-md border py-2 px-3 text-sm h-[42px]"
                            >
                                {sessionFormats.map(f => (
                                    <option key={f.value} value={f.value}>{f.label}</option>
                                ))}
                            </select>
                        </div>

                        <Input 
                            label="Meeting Link (e.g., Zoom/Meet URL)"
                            name="meetingLink"
                            value={newSessionData.meetingLink}
                            onChange={e => setNewSessionData(p => ({ ...p, meetingLink: e.target.value }))}
                            placeholder="https://zoom.us/j/..."
                            className="md:col-span-4"
                        />
                    </div>

                    <textarea
                        name="description"
                        value={newSessionData.description}
                        onChange={e => setNewSessionData(p => ({ ...p, description: e.target.value }))}
                        rows={2}
                        className="w-full rounded-md border px-3 py-2 text-sm"
                        placeholder="Brief description of this session type..."
                    />
                    
                    <Button
                        onClick={handleAddSession}
                        disabled={isSubmitting || !newSessionData.title.trim() || !newSessionData.duration || !newSessionData.price}
                        size="sm"
                    >
                        <Plus className="w-4 h-4 mr-2" /> {isSubmitting ? 'Adding...' : 'Add Session Type'}
                    </Button>
                </div>
            </div>
        </div>
    );
};


export default SessionManagement;