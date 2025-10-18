import React, { useState, useEffect, useCallback, memo } from 'react'; 
import { Plus, X, Clock, Users, DollarSign, Calendar, Globe, Edit3, Save } from 'lucide-react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { cn } from '@/utils/cn';
import { createSession, deleteSession, getCoachProfile, updateSession } from '@/auth/authApi'; 
import { toast } from 'sonner';

// Utility function to get today's date in YYYY-MM-DD format for the min attribute
const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const sessionFormats = [
    { value: 'individual', label: '1-on-1 Individual' },
    { value: 'group', label: 'Group Sessions' },
    { value: 'workshop', label: 'Workshops' },
    { value: 'online', label: 'Online Only' },
    { value: 'in-person', label: 'In-Person' }
];

// --- ISOLATED EDIT FORM COMPONENT (Kept local state to maintain input focus) ---
const EditSessionForm = memo(({ session, todayDate, isSubmitting, onSave, onCancel }) => {
    const [formData, setFormData] = useState({});
    
    // Initialize form data when session prop changes (only runs on initial edit click)
    useEffect(() => {
        setFormData({
            ...session,
            price: session.price.toString(),
            duration: session.duration.toString(),
            // Ensure defaultDate is set to match the input format (YYYY-MM-DD)
            defaultDate: session.defaultDate ? new Date(session.defaultDate).toISOString().split('T')[0] : '', 
        });
    }, [session]);
    
    const handleEditChange = (e) => {
        const { name, value } = e.target;
        // Setting state here does NOT trigger a re-render of the parent component,
        // which preserves focus on the input field.
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePriceChange = (e) => {
        const val = e.target.value;
        // Enforce integer input
        if (val === '' || /^\d+$/.test(val)) {
            setFormData(p => ({ ...p, price: val }))
        }
    };
    
    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(session.id, formData);
    };

    return (
        <form onSubmit={handleSubmit} className="p-4 border border-blue-400 rounded-lg bg-blue-50/50 space-y-4 shadow-md">
            <h4 className="font-medium text-lg">Editing: {session.title}</h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                    <Input 
                        label="Session Name"
                        name="title"
                        value={formData.title || ''}
                        onChange={handleEditChange}
                        required
                    />
                </div>

                <Input 
                    label="Price (INR,₹ )" 
                    type="number"
                    name="price"
                    value={formData.price || ''}
                    onChange={handlePriceChange}
                    min="10" 
                    step="10"
                    icon="₹"
                    required
                />

                <Input
                    label="Duration (minutes)"
                    type="number"
                    name="duration"
                    value={formData.duration || ''}
                    onChange={handleEditChange}
                    min="30"
                    step="30"
                    required
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Input
                    label="Default Date (Optional)"
                    type="date"
                    name="defaultDate"
                    value={formData.defaultDate || ''}
                    onChange={handleEditChange}
                    min={todayDate}
                />

                <Input
                    label="Default Time (Optional)"
                    type="time"
                    name="defaultTime"
                    value={formData.defaultTime || ''}
                    onChange={handleEditChange}
                    step="1800"
                />

                <div className="md:col-span-1">
                    <label className="block text-sm font-medium mb-2">Session Format</label>
                    <select
                        name="type"
                        value={formData.type || 'individual'}
                        onChange={handleEditChange}
                        className="w-full rounded-md border py-2 px-3 text-sm h-[42px]"
                    >
                        {sessionFormats.map(f => (
                            <option key={f.value} value={f.value}>{f.label}</option>
                        ))}
                    </select>
                </div>
            </div>

            <Input 
                label="Meeting Link (e.g., Zoom/Meet URL)"
                name="meetingLink"
                value={formData.meetingLink || ''}
                onChange={handleEditChange}
                placeholder="https://zoom.us/j/..."
            />

            <textarea
                name="description"
                value={formData.description || ''}
                onChange={handleEditChange}
                rows={2}
                className="w-full rounded-md border px-3 py-2 text-sm"
                placeholder="Brief description of this session type..."
            />
            
            <div className="flex justify-end space-x-2">
                <Button 
                    onClick={onCancel} 
                    variant="secondary" 
                    size="sm"
                    disabled={isSubmitting}
                >
                    Cancel
                </Button>
                <Button 
                    type="submit"
                    size="sm"
                    disabled={isSubmitting}
                >
                    <Save className="w-4 h-4 mr-2" /> {isSubmitting ? 'Updating...' : 'Save Changes'}
                </Button>
            </div>
        </form>
    );
});
// ----------------------------------------


const SessionManagement = () => {
    const [sessions, setSessions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingSessionId, setEditingSessionId] = useState(null);
    
    // Calculate today's date
    const todayDate = getTodayDate();
    
    // State to manage the input form for new sessions
    const [newSessionData, setNewSessionData] = useState({
        title: '',
        duration: '',
        price: '',           
        description: '',
        type: 'individual', 
        defaultDate: '', 
        defaultTime: '', 
        meetingLink: '',
    });

    // Function to fetch the coach's entire session data
    const fetchSessions = useCallback(async () => {
        setIsLoading(true);
        try {
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

    // --- Validation and Helper Functions ---
    const validateSessionData = (data) => {
        if (!data.title?.trim() || !data.duration || !data.price) {
            toast.error('Session Name, Duration, and Price are required.');
            return false; 
        }

        const priceValue = parseFloat(data.price);
        const durationValue = parseInt(data.duration, 10);
        
        if (!Number.isInteger(priceValue) || priceValue <= 0 || priceValue % 10 !== 0) {
            toast.error('Price must be a whole number, positive, and a multiple of ₹10 (e.g., ₹100, ₹110, ₹150).');
            return false;
        }

        if (!Number.isInteger(durationValue) || durationValue <= 0 || durationValue % 30 !== 0) {
            toast.error('Duration must be a positive whole number, and a multiple of 30 minutes (e.g., 30, 60, 90).');
            return false;
        }

        if (data.defaultDate && data.defaultDate < todayDate) {
            toast.error('Session date cannot be in the past.');
            return false;
        }
        return true;
    };


    // --- CRUD Handlers ---

    const handleAddSession = async () => {
        if (!validateSessionData(newSessionData)) return;

        setIsSubmitting(true);
        try {
            await createSession({
                ...newSessionData,
                duration: parseInt(newSessionData.duration, 10), 
                price: parseFloat(newSessionData.price),
            });

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

    const handleEditStart = (sessionId) => {
        setEditingSessionId(sessionId);
    };

    const handleEditCancel = () => {
        setEditingSessionId(null);
    };

    const handleEditSave = async (sessionId, formData) => {
        if (!validateSessionData(formData)) return;

        // 🚨 CRITICAL STEP TO PREVENT FLICKER: Set both submitting state and the ID of the item being submitted
        setIsSubmitting(true); 
        setEditingSessionId(sessionId); 

        try {
            await updateSession(sessionId, {
                ...formData,
                duration: parseInt(formData.duration, 10), 
                price: parseFloat(formData.price),
            });

            setEditingSessionId(null); // Exit editing mode before fetching to show success
            await fetchSessions(); // Fetch new data
            toast.success('Session updated successfully.');
        } catch (error) {
            console.error("Failed to update session:", error);
            toast.error(error.response?.data?.error || 'Failed to update session.');
            // On failure, return to edit mode
            setEditingSessionId(sessionId); 
        } finally {
            setIsSubmitting(false); 
        }
    };

    // --- Render Content ---

    if (isLoading) {
        return <p className="text-center py-8">Loading session data...</p>;
    }

    // Component to render a single session card or the edit form
    const SessionCard = ({ session }) => {
        const isEditing = editingSessionId === session.id && !isSubmitting;
        const isSaving = editingSessionId === session.id && isSubmitting;
        
        // 1. Show Saving state during API call to prevent flickering back to old data
        if (isSaving) {
            return (
                <div className="flex items-center justify-center p-4 border rounded-lg bg-yellow-50 text-yellow-700">
                    <Save className="w-5 h-5 mr-3 animate-pulse" />
                    <span>Saving changes for {session.title}...</span>
                </div>
            );
        }

        // 2. Show Edit Form
        if (isEditing) {
            return (
                <EditSessionForm 
                    session={session}
                    todayDate={todayDate}
                    isSubmitting={isSubmitting}
                    onSave={handleEditSave}
                    onCancel={handleEditCancel}
                />
            );
        }

        // 3. Render Read-only Card
        const formattedPrice = `₹${parseInt(session.price, 10)}`;
        const formatLabel = sessionFormats.find(f => f.value === session.type)?.label;
        
        let formattedDateAndTime = '';
        if (session.defaultDate) {
            try {
                 const date = new Date(session.defaultDate);
                 if (!isNaN(date.getTime())) { 
                    formattedDateAndTime = `${date.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })} @ ${session.defaultTime}`;
                 }
            } catch {
                formattedDateAndTime = session.defaultDate; 
            }
        }
        
        return (
            <div className="flex items-start justify-between p-4 border rounded-lg bg-white">
                <div className="flex items-start space-x-3 flex-1">
                    <div className="p-2 bg-blue-100 rounded-lg">
                        <Users className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                        <h4 className="font-medium">{session.title}</h4>
                        <p className="text-sm text-gray-600">{session.description}</p>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-gray-500">
                            <span className="flex items-center space-x-1"><Clock className="w-3 h-3" /><span>{session.duration} min</span></span>
<span className="flex items-center space-x-1 text-green-600"><span className="mr-1">₹</span><span>{parseInt(session.price, 10)}</span></span>                            <span className="flex items-center space-x-1"><Users className="w-3 h-3" /><span>{formatLabel}</span></span>
                            {session.defaultDate && formattedDateAndTime && <span className="flex items-center space-x-1"><Calendar className="w-3 h-3" /><span>{formattedDateAndTime}</span></span>}
                            {session.meetingLink && <span className="flex items-center space-x-1"><Globe className="w-3 h-3" /><span>Meeting Link Set</span></span>}
                        </div>
                    </div>
                </div>
                <div className="flex space-x-2">
                    {/* Disable buttons if any other session is being edited or submitted */}
                    <button 
                        onClick={() => handleEditStart(session.id)} 
                        className="text-gray-500 hover:text-blue-500 p-1"
                        title="Edit Session"
                        disabled={isSubmitting || editingSessionId !== null}
                    >
                        <Edit3 className="w-4 h-4" />
                    </button>
                    <button 
                        onClick={() => handleRemoveSession(session.id)} 
                        className="text-gray-400 hover:text-red-500 p-1"
                        title="Delete Session"
                        disabled={isSubmitting || editingSessionId !== null}
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>
        );
    };


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
                        <SessionCard key={session.id} session={session} />
                    )) : (
                        <p className="text-center text-gray-500 py-4 border border-dashed rounded-lg">
                            No sessions defined yet. Use the form below to create your first service offering.
                        </p>
                    )}
                </div>

                {/* Add New Session Form */}
                <div className={cn("border border-dashed rounded-lg p-4 space-y-4", { 'opacity-50 pointer-events-none': editingSessionId })}>
                    <h4 className="font-medium">Add New Session Type</h4>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="md:col-span-2">
                            <Input 
                                label="Session Name"
                                name="title"
                                value={newSessionData.title}
                                onChange={e => setNewSessionData(p => ({ ...p, title: e.target.value }))}
                                placeholder="e.g., Strategy Call"
                                required
                            />
                        </div>

                        <Input 
                            label="Price (INR, ₹ )" 
                            type="number"
                            name="price"
                            value={newSessionData.price}
                            onChange={e => {
                                const val = e.target.value;
                                if (val === '' || /^\d+$/.test(val)) {
                                    setNewSessionData(p => ({ ...p, price: val }))
                                }
                            }}
                            placeholder="e.g., 500"
                            min="10" 
                            step="10"
                            icon="₹"
                            required
                        />

                        <Input
                            label="Duration (minutes)"
                            type="number"
                            name="duration"
                            value={newSessionData.duration}
                            onChange={e => setNewSessionData(p => ({ ...p, duration: e.target.value }))}
                            placeholder="60"
                            min="30"
                            step="30"
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
                            min={todayDate}
                        />

                        <Input
                            label="Default Time (Optional)"
                            type="time"
                            name="defaultTime"
                            value={newSessionData.defaultTime}
                            onChange={e => setNewSessionData(p => ({ ...p, defaultTime: e.target.value }))}
                            step="1800"
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