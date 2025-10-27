// Frontend/src/pages/dashboards/client-dashboard/components/UpcomingSessions.jsx

// Ensure all necessary hooks and icons are imported
import React, { useState, useEffect, useCallback } from 'react';
import {
  Calendar,
  Clock,
  User,
  Tag,
  Video,
  X,
  IndianRupee,
  Star as StarIcon,
  MessageCircle,
  XCircle,
} from 'lucide-react';
// 🔑 ADDED: External UI components needed for the Review Modal
import Button from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
// 🔑 MODIFIED: API imports to include Review functions
// 🛑 UPDATED IMPORTS
import { getMyClientSessions, checkBookingReviewEligibility, submitTestimonial } from '@/auth/authApi';
import { toast } from 'sonner';

// ===========================================
// Review Modal Component
// ===========================================
const ReviewModal = ({ isOpen, onClose, eligibleSessions, refreshList }) => {
  const [form, setForm] = useState({
    rating: 5,
    clientTitle: '',
    content: '',
    coachId: '', // Derived from the selected booking
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
        coachId: firstBooking.coachId,
        content: firstBooking.existingReview?.content || '', // Pre-fill if editing
        rating: firstBooking.existingReview?.rating || 5, // Pre-fill if editing
        clientTitle: firstBooking.existingReview?.clientTitle || '', // Pre-fill if editing
      }));
    }
  }, [isOpen, eligibleSessions]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setValidationError('');
  };

  const handleSelectChange = (value) => {
    // Ensure value is parsed as an integer for comparison if IDs are numbers
    const selectedBookingId = parseInt(value, 10);
    const selectedBooking = eligibleSessions.find(s => s.id === selectedBookingId);
    if (selectedBooking) {
      setForm((prev) => ({ ...prev, bookingId: selectedBookingId, coachId: selectedBooking.coachId }));
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
        sessionId: bookingId, // Backend expects sessionId, which is bookingId here
      };

      // Call submitTestimonial with coachId and submissionData
      await submitTestimonial(coachId, submissionData);

      toast.success('Thank you! Your testimonial has been submitted successfully.');
      onClose();
      refreshList();
    } catch (error) {
      console.error('Testimonial submission failed:', error);
      if (error.response && error.response.status === 401) {
        toast.error("Your login session has expired. Please log in again.");
        onClose();
        return;
      }
      toast.error(error.response?.data?.error || 'Failed to submit testimonial. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || eligibleSessions.length === 0) return null;

  // Find the currently selected booking to check for existing review data
  const currentSelectedBooking = eligibleSessions.find(s => s.id === form.bookingId);
  const currentReview = currentSelectedBooking?.existingReview; // Safely access existingReview
  const isEditing = !!currentReview;
  const modalTitle = isEditing ? 'Edit Your Testimonial' : 'Write a Testimonial';

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 space-y-4 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <X size={24} />
        </button>
        <h3 className="text-2xl font-bold text-gray-900 pr-10 border-b pb-3">
          {modalTitle}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Session Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Session <span className="text-red-500">*</span>
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
                  {session.title} (Coach: {session.coachName})
                </option>
              ))}
            </select>
          </div>

          {/* Rating Input */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Rating <span className="text-red-500">*</span></label>
            <div className="flex items-center space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <StarIcon
                  key={star}
                  size={32}
                  onClick={() => handleRatingChange(star)}
                  className={`cursor-pointer ${
                    star <= form.rating
                      ? 'text-yellow-500 fill-current' : 'text-gray-300 hover:text-yellow-400'
                  } transition-colors`}
                />
              ))}
              <span className="ml-3 text-lg font-semibold">{form.rating} / 5</span>
            </div>
          </div>

          {/* Testimonial Content */}
          <Textarea
            label="Your Testimonial <span class='text-red-500'>*</span>"
            name="content"
            value={form.content}
            onChange={handleFormChange}
            rows={4}
            placeholder="Write your detailed review here..."
            required
          />

          {/* Optional Client Title */}
          <input
            type="text"
            name="clientTitle"
            value={form.clientTitle}
            onChange={handleFormChange}
            placeholder="Your Title (Optional) e.g. Executive"
            className="w-full rounded-md border py-2 px-3 text-sm h-[42px]"
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
              className="bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? 'Submitting...' : (isEditing ? 'Save Changes' : 'Submit Review')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};


// Main Component
const UpcomingSessions = () => {
  const [allBookings, setAllBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal State
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [eligibleReviews, setEligibleReviews] = useState([]); // Holds data for the modal

  // Handler to open details modal
  const handleDetailsClick = (session) => {
    setSelectedSession(session);
    setIsDetailsModalOpen(true);
  };

  // Handler to check eligibility and open review modal
  const handleReviewClick = useCallback(async (sessionToReview) => {
    // Ensure we have the necessary ID to make the API call
    if (!sessionToReview.id) {
        toast.error("Booking details are missing.");
        return;
    }

    try {
        // Call the API to check eligibility for this specific booking
        const eligibilityResponse = await checkBookingReviewEligibility(sessionToReview.id);

        if (eligibilityResponse.data.eligible) {
            // Prepare the data needed by the ReviewModal
            const eligibleSessionData = [{
                id: sessionToReview.id,
                title: sessionToReview.title,
                coachName: sessionToReview.coachName,
                coachId: sessionToReview.coachId, // Pass coachId for submission
                // You might need to fetch existing review details if editing is implemented
                // existingReview: sessionToReview.existingReviewData || null
            }];
            setEligibleReviews(eligibleSessionData);
            setIsReviewModalOpen(true);
        } else {
             // Check if already reviewed (allowing edit)
             if (sessionToReview.status === 'completed' && sessionToReview.isReviewed) {
                toast.info("This session has already been reviewed. You can edit it now.");
                 const eligibleSessionData = [{
                    id: sessionToReview.id,
                    title: sessionToReview.title,
                    coachName: sessionToReview.coachName,
                    coachId: sessionToReview.coachId,
                    // existingReview: sessionToReview.existingReviewData || null // Pass existing data if available
                }];
                setEligibleReviews(eligibleSessionData);
                setIsReviewModalOpen(true);
            } else {
                // Not eligible and not reviewed yet, show API message or default
                toast.info(eligibilityResponse.data.message || "This session is not eligible for review (must be completed).");
            }
        }

    } catch (error) {
        console.error("Eligibility check error:", error);
        if (error.response && error.response.status === 401) {
            toast.error("Your login session has expired. Please log in again.");
            // Potentially trigger logout logic here if needed
            return;
        }
        // Display error message from API response or a default message
        toast.error(error.response?.data?.error || error.response?.data?.message || 'Failed to check review eligibility.');
    }
  }, []); // Empty dependency array as it doesn't depend on component state directly


  // UI Helpers
  const typeLabels = [
    { value: 'individual', label: '1:1 Session' },
    { value: 'group', label: 'Group Session' },
    { value: 'workshop', label: 'Workshop' },
    { value: 'online', label: 'Online Session' },
    { value: 'in-person', label: 'In-Person Session' },
  ];

  const getTypeHighlight = (type) => {
    switch (type) {
      case 'individual': return 'bg-purple-100 text-purple-800';
      case 'group': return 'bg-blue-100 text-blue-800';
      case 'workshop': return 'bg-pink-100 text-pink-800';
      case 'online': return 'bg-teal-100 text-teal-800';
      case 'in-person': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Data Fetching
  const fetchBookings = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getMyClientSessions();
      const sessionsData = response.data
        .map(b => ({
          id: b.id, // Booking ID
          title: b.Session?.title || 'Session Booking',
          coachName: b.Session?.coachProfile?.user ? `${b.Session.coachProfile.user.firstName} ${b.Session.coachProfile.user.lastName}` : 'Unknown Coach',
          coachId: b.Session?.coachProfile?.userId, // Coach User ID needed for review submission
          date: b.Session?.defaultDate,
          time: b.Session?.defaultTime,
          duration: b.Session?.duration || 'N/A',
          type: b.Session?.type || 'individual',
          price: b.Session?.price || 0,
          status: b.status,
          meetingLink: b.Session?.meetingLink,
          isReviewed: b.isReviewed, // Flag from Booking model
          // Add any other necessary fields from b.Session or b.Session.coachProfile.user
        }))
        .filter(item => item.date); // Filter out bookings without a session date

      // Sort: Upcoming first, then past completed, then others
      const sortedBookings = sessionsData.sort((a, b) => {
          const dateA = new Date(a.date + ' ' + (a.time || '00:00'));
          const dateB = new Date(b.date + ' ' + (b.time || '00:00'));
          const now = new Date();

          // Prioritize upcoming sessions
          if (dateA >= now && dateB < now) return -1;
          if (dateA < now && dateB >= now) return 1;

          // If both upcoming or both past, sort by date (earliest upcoming first, latest past first)
          if (dateA >= now && dateB >= now) return dateA - dateB; // Earliest upcoming first
          if (dateA < now && dateB < now) return dateB - dateA; // Most recent past first

          return 0; // Should not happen if logic is correct
      });


      setAllBookings(sortedBookings);
    } catch (err) {
      console.error("Failed to fetch client sessions:", err);
      if (err.response && err.response.status === 401) {
        setError("Your session has expired. Please log in to view your sessions.");
        setAllBookings([]);
        toast.error("Your session has expired. Please log in.");
      } else {
        setError("Could not load your upcoming sessions.");
        toast.error("Could not load your upcoming sessions.");
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // Always display all fetched bookings
  const sessionsToDisplay = allBookings;

  // --- Rendering ---
  if (isLoading) return <div className="text-center p-8"><p>Loading your sessions...</p></div>;

  // Show error only if there are no sessions and loading is finished
  if (!isLoading && error && sessionsToDisplay.length === 0) {
    return <div className="text-center p-8 text-red-500">{error}</div>;
  }

  return (
    <div className="space-y-8">
      {/* Heading */}
      <h1 className="text-3xl font-bold text-gray-800">My Sessions</h1>
      <p className="text-lg text-gray-600 mt-2 mb-6">
        View details for all your scheduled coaching sessions, past and future.
      </p>

      {/* Session List or No Sessions Message */}
      {sessionsToDisplay.length > 0 ? (
        sessionsToDisplay.map((session) => {
          const formatLabel = typeLabels.find(opt => opt.value === session.type)?.label || 'Session';
          const isCompleted = session.status === 'completed';
          const reviewButtonText = session.isReviewed ? 'Edit Review' : 'Add Review';

          return (
            <div key={session.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center flex-wrap gap-x-3 gap-y-1 mb-2">
                    <h4 className="font-semibold text-lg text-gray-900 truncate">{session.title}</h4>
                    <span className={`px-2 py-1 text-xs rounded-full whitespace-nowrap ${getTypeHighlight(session.type)}`}>
                      <Tag size={12} className="inline mr-1" /> {formatLabel}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded-full font-medium capitalize whitespace-nowrap ${
                      session.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                      session.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      session.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {session.status}
                    </span>
                  </div>

                  {/* Date and Time */}
                  <div className="space-y-2 text-base font-semibold text-blue-600 mb-3">
                    <div className="flex items-center space-x-2">
                      <Calendar size={18} className="text-blue-500" />
                      {/* Format date properly */}
                      <span>{session.date ? new Date(session.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock size={18} className="text-blue-500" />
                      <span>{session.time || 'N/A'} ({session.duration} min)</span>
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

                {/* Action Buttons */}
                <div className="flex flex-col space-y-2 flex-shrink-0">
                  {/* JOIN Button */}
                  {session.meetingLink && session.status === 'confirmed' ? (
                    <a href={session.meetingLink} target="_blank" rel="noopener noreferrer"
                       className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors text-center flex items-center justify-center space-x-1"
                       title="Join via meeting link">
                      <Video size={16} /> <span>JOIN</span>
                    </a>
                  ) : (
                    <Button size="sm" variant="outline" disabled>
                      {session.status === 'completed' ? 'Completed' : (session.status === 'cancelled' ? 'Cancelled' : 'No Link')}
                    </Button>
                  )}

                  {/* Details Button */}
                  <Button size="sm" variant="outline" onClick={() => handleDetailsClick(session)}>
                    Details
                  </Button>

                  {/* REVIEW Button - Show only if session is completed */}
                  {isCompleted && (
                    <Button
                      size="sm"
                      variant={session.isReviewed ? 'outline' : 'warning'}
                      onClick={() => handleReviewClick(session)} // Pass the whole session object
                      iconName="Star"
                      iconPosition="left"
                      className="w-full text-sm"
                    >
                      {reviewButtonText}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })
      ) : (
        // Show "No Sessions" only if not loading and no error
        !isLoading && !error && (
          <div className="text-center py-8">
            <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
            <h4 className="text-lg font-medium text-gray-800">No Sessions Found</h4>
            <p className="text-gray-500">Book your first session to see it here!</p>
          </div>
        )
      )}

      {/* Details Modal */}
      {isDetailsModalOpen && selectedSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-75 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto transform transition-all">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4 border-b pb-3">
                <h3 className="text-2xl font-bold text-gray-900">{selectedSession.title}</h3>
                <button onClick={() => setIsDetailsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4 text-gray-700">
                {/* Type Highlight */}
                <div className="flex items-center space-x-2">
                  <span className={`px-3 py-1 text-sm rounded-full font-medium ${getTypeHighlight(selectedSession.type)}`}>
                    {typeLabels.find(opt => opt.value === selectedSession.type)?.label || 'Session'}
                  </span>
                </div>

                {/* Status Badge */}
                <div className="flex items-center space-x-2">
                  <Tag size={18} />
                  <span>Status:
                    <span className={`font-medium capitalize px-2 py-1 ml-1 rounded-full text-xs ${
                      selectedSession.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                      selectedSession.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      selectedSession.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {selectedSession.status}
                    </span>
                  </span>
                </div>

                {/* Date & Time */}
                <div className="flex items-center space-x-2 text-blue-600 font-semibold">
                  <Calendar size={20} />
                  <span>{selectedSession.date ? new Date(selectedSession.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}</span>
                </div>
                <div className="flex items-center space-x-2 text-blue-600 font-semibold">
                  <Clock size={20} />
                  <span>{selectedSession.time || 'N/A'} ({selectedSession.duration} min)</span>
                </div>

                {/* Coach */}
                <div className="flex items-center space-x-2 border-t pt-3">
                  <User size={18} />
                  <span>Coach: <span className="font-medium">{selectedSession.coachName}</span></span>
                </div>

                {/* Price */}
                <div className="flex items-center space-x-2">
                  <IndianRupee size={18} />
                  <span>Price: <span className="font-medium">₹{selectedSession.price}</span></span>
                </div>

                {/* Meeting Link */}
                {selectedSession.status === 'confirmed' && selectedSession.meetingLink && (
                  <div className="flex items-center space-x-2">
                    <Video size={18} />
                    <a href={selectedSession.meetingLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      Join Meeting Link
                    </a>
                  </div>
                )}

                {/* Review Status/Edit Link */}
                {selectedSession.isReviewed && (
                  <div className="flex items-center space-x-2 border-t pt-3 text-sm">
                    <StarIcon size={18} className="text-yellow-500" />
                    <span>
                      You have already left a review.
                      <button
                        onClick={() => { setIsDetailsModalOpen(false); handleReviewClick(selectedSession); }}
                        className="text-blue-600 hover:underline ml-1"
                      >
                        Click here to view/edit it.
                      </button>
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end">
                <Button variant="outline" onClick={() => setIsDetailsModalOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {isReviewModalOpen && (
        <ReviewModal
          isOpen={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
          eligibleSessions={eligibleReviews} // Pass the single eligible session data
          refreshList={fetchBookings} // Pass fetchBookings to refresh list after submission
        />
      )}
    </div>
  );
};

export default UpcomingSessions;