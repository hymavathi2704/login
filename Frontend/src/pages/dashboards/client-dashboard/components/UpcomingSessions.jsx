// Frontend/src/pages/dashboards/client-dashboard/components/UpcomingSessions.jsx

// Ensure all necessary hooks are imported
import React, { useState, useEffect, useCallback } from 'react'; 
import { 
  Calendar, 
  Clock, 
  User, 
  Tag, 
  Video, 
  X, 
  IndianRupee,
  Star as StarIcon, // << NEW IMPORT
  MessageCircle,   // << NEW IMPORT
} from 'lucide-react'; 
import Button from '@/components/ui/Button'; // << NEW IMPORT
import { SelectItem } from '@/components/ui/Select'; // << NEW IMPORT for modal
import { Textarea } from '@/components/ui/Textarea'; // << NEW IMPORT for modal
import { getMyClientSessions, checkClientReviewEligibility, submitTestimonial } from '@/auth/authApi'; // << MODIFIED IMPORT
import { toast } from 'sonner';
//

// (omitted UI Helpers from original file)

// === NEW/ADAPTED: Testimonial Submission Modal Component ===
const ReviewModal = ({ isOpen, onClose, eligibleSessions, refreshList }) => {
    const [form, setForm] = useState({
        rating: 5,
        clientTitle: '',
        content: '',
        coachId: '', // To be derived from the selected booking
        bookingId: '', 
    });
    const [validationError, setValidationError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Auto-select the first eligible session and set coach ID on open/update
    useEffect(() => {
        if (isOpen && eligibleSessions.length > 0) {
            const firstBooking = eligibleSessions[0];
            setForm(prev => ({ 
                ...prev, 
                bookingId: firstBooking.id,
                coachId: firstBooking.coachId, // Ensure coachId is set from the eligibleSessions array
            }));
        }
    }, [isOpen, eligibleSessions]);

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        setValidationError('');
    };

    const handleSelectChange = (value) => {
        const selectedBooking = eligibleSessions.find(s => s.id === parseInt(value));
        if (selectedBooking) {
            setForm((prev) => ({ ...prev, bookingId: parseInt(value), coachId: selectedBooking.coachId }));
        }
        setValidationError('');
    };

    const handleRatingChange = (newRating) => {
        setForm((prev) => ({ ...prev, rating: newRating }));
        setValidationError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { rating, content, clientTitle, bookingId, coachId } = form;

        if (rating < 1 || !content.trim() || !bookingId || !coachId) {
            setValidationError('Please provide a rating, write your testimonial, and ensure a session is selected.');
            return;
        }

        setIsSubmitting(true);

        try {
            const submissionData = {
                rating,
                content,
                clientTitle,
                sessionId: bookingId, // Backend uses sessionId for bookingId
            };
            
            await submitTestimonial(coachId, submissionData);

            toast.success('Thank you! Your testimonial has been submitted successfully and your coach profile updated.');
            onClose();
            // Refreshes the parent session list to remove the review button
            refreshList(); 
        } catch (error) {
            console.error('Testimonial submission failed:', error);
            toast.error(error.response?.data?.error || 'Failed to submit testimonial. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };
    
    if (!isOpen) return null;
    if (eligibleSessions.length === 0) return null; // Or show an error modal

    // Adapt the UI from the old TestimonialsSection.jsx modal
    return (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
            <div 
                className="bg-card rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 space-y-4 relative"
                onClick={(e) => e.stopPropagation()} 
            >
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                    <X size={24} />
                </button>
                <h3 className="text-2xl font-bold text-foreground pr-10 border-b pb-3">
                    Write a Testimonial
                </h3>
                
                <form onSubmit={handleSubmit} className="space-y-5">
                    
                    {/* Session Selection (Dropdown is removed for now, relying on filtering later) */}
                     {/* The current system relies on fetching all eligible bookings from the backend */}
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                            Link to Completed Session <span className="text-red-500">*</span>
                        </label>
                        <select
                            name="bookingId"
                            value={form.bookingId}
                            onChange={(e) => handleSelectChange(e.target.value)}
                            className="w-full rounded-md border py-2 px-3 text-sm h-[42px]"
                            required
                        >
                            {eligibleSessions.map(session => (
                                <option key={session.id} value={session.id}>
                                    {session.title}
                                </option>
                            ))}
                        </select>
                         <p className="text-xs text-muted-foreground mt-1">
                            Select the completed session you are reviewing.
                        </p>
                    </div>

                    {/* Rating Input */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-foreground">Rating <span className="text-red-500">*</span></label>
                        <div className="flex items-center space-x-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <StarIcon
                                    key={star}
                                    size={32}
                                    onClick={() => handleRatingChange(star)}
                                    className={`cursor-pointer ${
                                        star <= form.rating
                                            ? 'text-warning fill-current' : 'text-gray-300 hover:text-warning'
                                    } transition-colors`}
                                />
                            ))}
                            <span className="ml-3 text-lg font-semibold">{form.rating} / 5</span>
                        </div>
                    </div>
                    
                    {/* Testimonial Content */}
                    <Textarea 
                        label="Your Testimonial <span className='text-red-500'>*</span>"
                        name="content"
                        value={form.content}
                        onChange={handleFormChange}
                        rows={4}
                        placeholder="Write your detailed review here..."
                        required
                    />

                    {/* Optional Client Title */}
                    <Input 
                        label="Your Title (Optional)"
                        name="clientTitle"
                        value={form.clientTitle}
                        onChange={handleFormChange}
                        placeholder="e.g., Happy Client, Executive"
                    />
                    
                    {/* Error Message */}
                    {validationError && (
                        <div className="text-red-500 text-sm flex items-center space-x-1">
                            <XCircle size={16} /> <span>{validationError}</span>
                        </div>
                    )}

                    {/* Submit Button */}
                    <div className="pt-4 flex justify-end space-x-3">
                        <Button 
                            variant="outline" 
                            onClick={onClose}
                            type="button"
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button 
                            type="submit"
                            disabled={isSubmitting || form.rating === 0 || !form.content.trim() || !form.bookingId}
                            loading={isSubmitting}
                            iconName="MessageCircle"
                            iconPosition="left"
                        >
                            {isSubmitting ? 'Submitting...' : 'Submit Review'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const UpcomingSessions = () => {
    const [allBookings, setAllBookings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [selectedSession, setSelectedSession] = useState(null);

    // 🔑 NEW STATE for Review Modal
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [eligibleReviews, setEligibleReviews] = useState([]);


    const fetchBookings = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await getMyClientSessions(); 
            
            const sessionsData = response.data
                .map(b => ({
                    id: b.id, // Booking ID
                    title: b.Session?.title || 'Session Booking',
                    coachName: b.Session?.coachProfile?.user ? `${b.Session.coachProfile.user.firstName} ${b.Session.coachProfile.user.lastName}` : 'Unknown Coach',
                    coachId: b.Session?.coachProfile?.userId, // Coach User ID
                    date: b.Session?.defaultDate,
                    time: b.Session?.defaultTime,
                    duration: b.Session?.duration || 'N/A', 
                    type: b.Session?.type || 'individual',
                    price: b.Session?.price || 0, 
                    status: b.status,
                    meetingLink: b.Session?.meetingLink,
                    isReviewed: b.isReviewed, // Get review status
                }))
                .filter(item => item.date); 

            const sortedBookings = sessionsData.sort((a, b) => new Date(a.date) - new Date(b.date));
            setAllBookings(sortedBookings); 

        } catch (err) {
            console.error("Failed to fetch client sessions:", err);
            setError("Could not load your upcoming sessions.");
            toast.error("Could not load your upcoming sessions.");
        } finally {
            setIsLoading(false);
        }
    }, []); 

    // 🔑 NEW HANDLER: Fetches eligible sessions for the combined modal
    const handleReviewClick = async (sessionToReview) => {
        if (!sessionToReview.coachId) {
            toast.error("Cannot find coach details for review.");
            return;
        }

        try {
            const eligibilityResponse = await checkClientReviewEligibility(sessionToReview.coachId);
            const eligible = eligibilityResponse.data.eligibleSessions || [];
            
            // Filter the single session we clicked on, just to be sure (though API should handle this)
            const clickedSessionAsEligible = eligible.filter(e => e.id === sessionToReview.id);

            if (clickedSessionAsEligible.length > 0) {
                 setEligibleReviews(clickedSessionAsEligible);
                 setIsReviewModalOpen(true);
            } else {
                 toast.info("This session is not yet marked as completed or has already been reviewed.");
            }
            
        } catch (error) {
             toast.error(error.response?.data?.error || 'Failed to check review eligibility.');
             console.error("Eligibility check error:", error);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, [fetchBookings]); 

    // (omitted UI helpers from original file)
    const sessionsToDisplay = allBookings;

    if (isLoading) return <div className="text-center p-8"><p>Loading your sessions...</p></div>;
    if (error) return <div className="text-center p-8 text-red-500">{error}</div>;


    return (
        <div className="space-y-8">
            {/* ... (Heading and description omitted for brevity) ... */}
            
            {sessionsToDisplay.length > 0 ? (
                sessionsToDisplay.map((session) => {
                    const isCompletedUnreviewed = session.status === 'completed' && !session.isReviewed;
                    // ... (rest of the session card setup omitted)
                    const formatLabel = typeLabels.find(opt => opt.value === session.type)?.label || 'Session';
          
                        return (
                        <div key={session.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-3 mb-2">
                                  <h4 className="font-semibold text-lg text-gray-900">{session.title}</h4>
                                  <span className={`px-2 py-1 text-xs rounded-full ${getTypeHighlight(session.type)}`}>
                                  <Tag size={12} className="inline mr-1" /> {formatLabel}
                                </span>
                                </div>
                                
                                {/* Status Badge */}
                                <span className={`px-2 py-1 text-xs rounded-full font-medium capitalize ${session.status === 'confirmed' ? 'bg-green-100 text-green-800' : session.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                                    {session.status}
                                </span>


                                {/* Highlighted Date and Time */}
                                <div className="space-y-2 text-base font-semibold text-blue-600 my-3">
                                  <div className="flex items-center space-x-2">
                                  <Calendar size={18} className="text-blue-500" />
                                  <span>{new Date(session.date).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Clock size={18} className="text-blue-500" />
                                  <span>{session.time} ({session.duration} min)</span>
                                </div>
                                </div>

                                {/* Other Details */}
                                <div className="space-y-2 text-sm text-gray-600 border-t pt-3">
                                <div className="flex items-center space-x-2">
                                  <User size={16} />
                                  <span>Coach: {session.coachName}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <IndianRupee size={16} />
                                  <span>Price: ₹{session.price}</span>
                                </div>
                                </div>
                              </div>

                            <div className="flex flex-col space-y-2">
                              {session.status === 'confirmed' && session.meetingLink ? (
                                <a href={session.meetingLink} target="_blank" rel="noopener noreferrer"
                                className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors text-center flex items-center justify-center space-x-1"
                                title="Join via meeting link"
                                >
                                <Video size={16} /> <span>Join</span>
                                </a>
                              ) : (
                                <div className="h-7"></div>
                            )}
                            
                            {/* 🔑 NEW: Review Button */}
                            {isCompletedUnreviewed ? (
                                <Button 
                                    size="sm"
                                    variant="warning"
                                    onClick={() => handleReviewClick(session)} // Pass the entire session object
                                    iconName="Star"
                                    iconPosition="left"
                                >
                                    Review
                                </Button>
                            ) : (
                                <button 
                                    className="border border-gray-300 text-gray-600 px-3 py-1 rounded text-sm opacity-50 cursor-default"
                                    disabled={true}
                                >
                                    {session.isReviewed ? 'Reviewed' : 'Details'}
                                </button>
                            )}

                              <button 
                                className="border border-gray-300 text-gray-600 px-3 py-1 rounded text-sm hover:bg-gray-50 transition-colors"
                                onClick={() => handleDetailsClick(session)}
                              >
                                Details
                              </button>
                            </div>
                            </div>
                        </div>
                        );
                      })
      ) : (
          <div className="text-center py-8">
            <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
            <h4 className="text-lg font-medium text-gray-800">No Sessions Found</h4>
            <p className="text-gray-500">Book your first session to see it here!</p>
          </div>
      )}

      {/* Details Modal (omitted for brevity) */}
      
      {/* 🔑 NEW: Review Modal */}
      {isReviewModalOpen && (
        <ReviewModal 
            isOpen={isReviewModalOpen}
            onClose={() => setIsReviewModalOpen(false)}
            eligibleSessions={eligibleReviews}
            refreshList={fetchBookings}
        />
      )}
    </div>
  );
};

export default UpcomingSessions;