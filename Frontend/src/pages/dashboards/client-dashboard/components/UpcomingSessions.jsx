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
// UI components
import Button from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
// API functions - Make sure checkBookingReviewEligibility is imported
import { getMyClientSessions, checkBookingReviewEligibility, submitTestimonial } from '@/auth/authApi';
import { toast } from 'sonner';

// ===========================================
// Review Modal Component
// ===========================================
const ReviewModal = ({ isOpen, onClose, eligibleSessions, refreshList }) => {
  // Initialize state for the form fields
  const [form, setForm] = useState({
    rating: 5,
    clientTitle: '',
    content: '',
    coachId: '', // Will be set from eligibleSessions
    bookingId: '', // Will be set from eligibleSessions
  });
  const [validationError, setValidationError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Effect to populate form when modal opens or eligibleSessions changes
  useEffect(() => {
    if (isOpen && eligibleSessions.length > 0) {
      const firstBooking = eligibleSessions[0]; // Assuming only one session passed for review/edit
      setForm({ // Reset form with data from the eligible session
        rating: firstBooking.existingReview?.rating || 5,
        clientTitle: firstBooking.existingReview?.clientTitle || '',
        content: firstBooking.existingReview?.content || '',
        coachId: firstBooking.coachId, // Crucial: Get coachId from the passed data
        bookingId: firstBooking.id, // Crucial: Get bookingId from the passed data
      });
      setValidationError(''); // Clear previous errors
    }
  }, [isOpen, eligibleSessions]);

  // Handle changes in form inputs/textarea
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setValidationError(''); // Clear error on change
  };

  // Handle changes in the session selection dropdown (if multiple were possible)
  const handleSelectChange = (value) => {
    const selectedBookingId = parseInt(value, 10);
    const selectedBooking = eligibleSessions.find(s => s.id === selectedBookingId);
    if (selectedBooking) {
      // Update form based on selection, including pre-filling existing review data if any
      setForm({
         rating: selectedBooking.existingReview?.rating || 5,
         clientTitle: selectedBooking.existingReview?.clientTitle || '',
         content: selectedBooking.existingReview?.content || '',
         coachId: selectedBooking.coachId,
         bookingId: selectedBookingId,
      });
    }
    setValidationError('');
  };

  // Handle clicks on the rating stars
  const handleRatingChange = (newRating) => {
    setForm((prev) => ({ ...prev, rating: newRating }));
    setValidationError('');
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    const { rating, content, clientTitle, bookingId, coachId } = form;

    // Basic validation
    if (rating < 1 || rating > 5 || !content.trim() || !bookingId || !coachId) {
      setValidationError('Please select a rating (1-5) and write your testimonial.');
      return;
    }

    setIsSubmitting(true);
    setValidationError(''); // Clear errors before submitting

    try {
      // Data structure expected by the backend controller
      const submissionData = {
        rating,
        content,
        clientTitle,
        sessionId: bookingId, // Backend's addTestimonial expects 'sessionId' which is our bookingId
      };

      // Call the API function to submit/update the testimonial
      await submitTestimonial(coachId, submissionData); // Pass coach's User ID

      toast.success('Thank you! Your testimonial has been submitted successfully.');
      onClose(); // Close the modal
      refreshList(); // Refresh the list of sessions to show updated status (isReviewed)
    } catch (error) {
      console.error('Testimonial submission failed:', error);
      // Handle specific errors like unauthorized or display a generic message
      if (error.response && error.response.status === 401) {
        toast.error("Your login session has expired. Please log in again.");
        onClose(); // Close modal on auth error
      } else {
        toast.error(error.response?.data?.error || 'Failed to submit testimonial. Please try again.');
      }
    } finally {
      setIsSubmitting(false); // Re-enable submit button
    }
  };

  // Don't render modal if not open or no eligible session data
  if (!isOpen || eligibleSessions.length === 0) return null;

  // Determine if editing based on the initial data passed
  const currentSelectedBooking = eligibleSessions.find(s => s.id === form.bookingId);
  const isEditing = !!currentSelectedBooking?.existingReview; // Check if existing review data exists
  const modalTitle = isEditing ? 'Edit Your Testimonial' : 'Write a Testimonial';

  // Modal JSX
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 space-y-4 relative"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
      >
        {/* Close button */}
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <X size={24} />
        </button>
        {/* Modal Title */}
        <h3 className="text-2xl font-bold text-gray-900 pr-10 border-b pb-3">
          {modalTitle}
        </h3>

        {/* Testimonial Form */}
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Session Info (Read-only display for context) */}
          {currentSelectedBooking && (
             <div className="p-3 bg-gray-50 rounded border border-gray-200">
                <p className="text-sm font-medium text-gray-800">Reviewing Session:</p>
                <p className="text-sm text-gray-600">{currentSelectedBooking.title}</p>
                <p className="text-sm text-gray-600">Coach: {currentSelectedBooking.coachName}</p>
             </div>
          )}
          {/* Hidden input or just rely on state for bookingId */}
          <input type="hidden" name="bookingId" value={form.bookingId} />

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
                  aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                />
              ))}
              <span className="ml-3 text-lg font-semibold">{form.rating} / 5</span>
            </div>
          </div>

          {/* Testimonial Content Textarea */}
          <Textarea
            label="Your Testimonial <span class='text-red-500'>*</span>"
            name="content"
            value={form.content}
            onChange={handleFormChange}
            rows={4}
            placeholder="Share your experience with this session and coach..."
            required
            aria-required="true"
          />

          {/* Optional Client Title Input */}
          <div className="space-y-1">
             <label htmlFor="clientTitleInput" className="block text-sm font-medium text-gray-700">Your Title (Optional)</label>
             <input
               id="clientTitleInput"
               type="text"
               name="clientTitle"
               value={form.clientTitle}
               onChange={handleFormChange}
               placeholder="e.g., Marketing Manager, Small Business Owner"
               className="w-full rounded-md border py-2 px-3 text-sm h-[42px]"
             />
          </div>


          {/* Validation Error Display */}
          {validationError && (
            <div className="text-red-600 text-sm flex items-center space-x-1 p-2 bg-red-50 rounded border border-red-200">
              <XCircle size={16} /> <span>{validationError}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-4 flex justify-end space-x-3 border-t">
            <Button
              variant="outline"
              onClick={onClose}
              type="button"
              disabled={isSubmitting} // Disable cancel while submitting
            >
              Cancel
            </Button>
            <Button
              type="submit"
              // Disable if submitting, rating invalid, content empty, or missing IDs
              disabled={isSubmitting || form.rating < 1 || form.rating > 5 || !form.content.trim() || !form.bookingId || !form.coachId}
              loading={isSubmitting}
              iconName="MessageCircle"
              iconPosition="left"
              className="bg-green-600 hover:bg-green-700 text-white" // Ensure text color for custom bg
            >
              {isSubmitting ? 'Submitting...' : (isEditing ? 'Update Review' : 'Submit Review')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};


// ===========================================
// Main UpcomingSessions Component
// ===========================================
const UpcomingSessions = () => {
  const [allBookings, setAllBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal State
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null); // For details modal
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [eligibleReviewData, setEligibleReviewData] = useState([]); // Data for review modal

  // Handler to open details modal
  const handleDetailsClick = (session) => {
    setSelectedSession(session);
    setIsDetailsModalOpen(true);
  };

  // Handler to check eligibility and open review modal
  const handleReviewClick = useCallback(async (sessionToReview) => {
    // Basic check if session object and ID exist
    if (!sessionToReview || !sessionToReview.id) {
        toast.error("Booking details missing, cannot check review status.");
        return;
    }

    try {
        // Call the specific booking eligibility check API
        const response = await checkBookingReviewEligibility(sessionToReview.id);

        if (response.data.eligible) {
             // Backend confirmed eligibility (session completed)
             // Prepare data for the modal, including existing review if provided
             const modalData = [{
                 id: sessionToReview.id,
                 title: sessionToReview.title,
                 coachName: sessionToReview.coachName,
                 coachId: sessionToReview.coachId, // Needed for submission
                 // Use existing testimonial data from API response
                 existingReview: response.data.existingTestimonial || null
             }];
             setEligibleReviewData(modalData); // Set data for the modal
             setIsReviewModalOpen(true); // Open the modal
        } else {
            // Backend indicated not eligible (e.g., session not completed)
            toast.info(response.data.message || "This session is not yet eligible for review.");
        }
    } catch (error) {
        console.error("Eligibility check error:", error);
        // Handle specific errors like 401 Unauthorized
        if (error.response && error.response.status === 401) {
            toast.error("Your login session has expired. Please log in again.");
            // Optionally: Trigger logout context action
        } else {
            // Display error from API response or a generic message
            toast.error(error.response?.data?.error || error.response?.data?.message || 'Failed to check review eligibility.');
        }
    }
  }, []); // Empty dependency array as it relies on sessionToReview argument


  // UI Helper Functions
  const typeLabels = [ /* ... as before ... */
    { value: 'individual', label: '1:1 Session' },
    { value: 'group', label: 'Group Session' },
    { value: 'workshop', label: 'Workshop' },
    { value: 'online', label: 'Online Session' },
    { value: 'in-person', label: 'In-Person Session' },
  ];

  const getTypeHighlight = (type) => { /* ... as before ... */
    switch (type) {
      case 'individual': return 'bg-purple-100 text-purple-800';
      case 'group': return 'bg-blue-100 text-blue-800';
      case 'workshop': return 'bg-pink-100 text-pink-800';
      case 'online': return 'bg-teal-100 text-teal-800';
      case 'in-person': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Function to fetch bookings
  const fetchBookings = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getMyClientSessions();
      // Map and sort data as before...
      const sessionsData = response.data
        .map(b => ({
          id: b.id,
          title: b.Session?.title || 'Session Booking',
          coachName: b.Session?.coachProfile?.user ? `${b.Session.coachProfile.user.firstName} ${b.Session.coachProfile.user.lastName}` : 'Unknown Coach',
          coachId: b.Session?.coachProfile?.userId,
          date: b.Session?.defaultDate,
          time: b.Session?.defaultTime,
          duration: b.Session?.duration || 'N/A',
          type: b.Session?.type || 'individual',
          price: b.Session?.price || 0,
          status: b.status,
          meetingLink: b.Session?.meetingLink,
          isReviewed: b.isReviewed,
        }))
        .filter(item => item.date); // Ensure item has a date

      // Sorting logic (example: upcoming first, then past)
       const sortedBookings = sessionsData.sort((a, b) => {
          const dateA = new Date(a.date + ' ' + (a.time || '00:00'));
          const dateB = new Date(b.date + ' ' + (b.time || '00:00'));
          const now = new Date();

          if (dateA >= now && dateB < now) return -1; // a is upcoming, b is past
          if (dateA < now && dateB >= now) return 1;  // a is past, b is upcoming

          if (dateA >= now && dateB >= now) return dateA - dateB; // both upcoming, sort earliest first
          if (dateA < now && dateB < now) return dateB - dateA; // both past, sort latest first

          return 0;
      });

      setAllBookings(sortedBookings);
    } catch (err) { // Error handling as before...
      console.error("Failed to fetch client sessions:", err);
        if (err.response && err.response.status === 401) {
            setError("Your session has expired. Please log in to view your sessions.");
            setAllBookings([]); // Clear stale data
            toast.error("Your session has expired. Please log in.");
        } else {
             setError("Could not load your sessions at this time."); // Slightly better message
             toast.error("Could not load your sessions.");
        }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch bookings on component mount
  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // Render loading state
  if (isLoading) {
    return <div className="text-center p-8"><p>Loading your sessions...</p></div>;
  }

  // Render error state only if loading is finished and there are no bookings to show
  if (!isLoading && error && allBookings.length === 0) {
     return <div className="text-center p-8 text-red-600 bg-red-50 border border-red-200 rounded-md">{error}</div>;
  }

  // Main Render
  return (
    <div className="space-y-8">
      {/* Heading */}
      <h1 className="text-3xl font-bold text-gray-800">My Sessions</h1>
      <p className="text-lg text-gray-600 mt-2 mb-6">
        View details for all your scheduled coaching sessions, past and future.
      </p>

      {/* Session List or "No Sessions" message */}
      {allBookings.length > 0 ? (
        allBookings.map((session) => {
          const formatLabel = typeLabels.find(opt => opt.value === session.type)?.label || 'Session';
          const isCompleted = session.status === 'completed'; // Check if completed
          const reviewButtonText = session.isReviewed ? 'Edit Review' : 'Add Review';

          return (
            // Session Card
            <div key={session.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow duration-200 ease-in-out">
              <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                {/* Session Info (Left Side) */}
                <div className="flex-1 min-w-0">
                  {/* Title and Badges */}
                  <div className="flex items-center flex-wrap gap-x-3 gap-y-1 mb-2">
                    <h4 className="font-semibold text-lg text-gray-900 truncate" title={session.title}>{session.title}</h4>
                    <span className={`px-2 py-0.5 text-xs rounded-full whitespace-nowrap ${getTypeHighlight(session.type)}`}>
                      <Tag size={12} className="inline mr-1" /> {formatLabel}
                    </span>
                    <span className={`px-2 py-0.5 text-xs rounded-full font-medium capitalize whitespace-nowrap ${
                      session.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                      session.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      session.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {session.status}
                    </span>
                  </div>

                  {/* Date and Time */}
                  <div className="space-y-1 text-base font-semibold text-blue-600 mb-3">
                    <div className="flex items-center space-x-2">
                      <Calendar size={16} className="text-blue-500 flex-shrink-0" />
                      <span>{session.date ? new Date(session.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock size={16} className="text-blue-500 flex-shrink-0" />
                      <span>{session.time || 'N/A'} ({session.duration} min)</span>
                    </div>
                  </div>

                  {/* Coach and Price */}
                  <div className="space-y-1 text-sm text-gray-600 border-t pt-3 mt-3">
                    <div className="flex items-center space-x-2">
                      <User size={14} className="flex-shrink-0"/>
                      <span>Coach: {session.coachName}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <IndianRupee size={14} className="flex-shrink-0"/>
                      <span>Price: ₹{session.price}</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons (Right Side) */}
                <div className="flex flex-col space-y-2 w-full sm:w-auto sm:flex-shrink-0">
                  {/* JOIN Button */}
                  {session.meetingLink && session.status === 'confirmed' ? (
                    <a href={session.meetingLink} target="_blank" rel="noopener noreferrer"
                       className="w-full bg-blue-600 text-white px-3 py-1.5 rounded text-sm font-medium hover:bg-blue-700 transition-colors text-center flex items-center justify-center space-x-1"
                       title="Join via meeting link">
                      <Video size={16} /> <span>JOIN</span>
                    </a>
                  ) : (
                    <Button size="sm" variant="outline" disabled className="w-full">
                       {session.status === 'completed' ? 'Completed' : (session.status === 'cancelled' ? 'Cancelled' : 'No Link')}
                    </Button>
                  )}

                  {/* Details Button */}
                  <Button size="sm" variant="outline" onClick={() => handleDetailsClick(session)} className="w-full">
                    Details
                  </Button>

                  {/* REVIEW Button - Show only if session is completed */}
                  {isCompleted && (
                    <Button
                      size="sm"
                      variant={session.isReviewed ? 'outline' : 'warning'} // Style differently if already reviewed
                      onClick={() => handleReviewClick(session)} // Pass the full session object
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
        // "No Sessions" message shown only if loading is done, no error, and list is empty
        !isLoading && !error && (
          <div className="text-center py-12">
            <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
            <h4 className="text-xl font-medium text-gray-800">No Sessions Found</h4>
            <p className="text-gray-500 mt-2">Book your first session to see it listed here!</p>
            {/* Optional: Add a button/link to explore coaches */}
            {/* <Button className="mt-4">Explore Coaches</Button> */}
          </div>
        )
      )}

      {/* Details Modal */}
      {isDetailsModalOpen && selectedSession && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
           <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
             <div className="p-6">
               <div className="flex justify-between items-center mb-4 border-b pb-3">
                 <h3 className="text-xl font-semibold text-gray-900">{selectedSession.title}</h3>
                 <button onClick={() => setIsDetailsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                   <X size={24} />
                 </button>
               </div>

               <div className="space-y-3 text-sm text-gray-700">
                 {/* Type & Status Badges */}
                 <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 text-xs rounded-full font-medium ${getTypeHighlight(selectedSession.type)}`}>
                        {typeLabels.find(opt => opt.value === selectedSession.type)?.label || 'Session'}
                    </span>
                    <span className={`font-medium capitalize px-2.5 py-0.5 rounded-full text-xs ${
                      selectedSession.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                      selectedSession.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      selectedSession.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {selectedSession.status}
                    </span>
                 </div>

                 {/* Date & Time */}
                 <div className="flex items-center gap-2 font-medium text-blue-700">
                   <Calendar size={16} />
                   <span>{selectedSession.date ? new Date(selectedSession.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}</span>
                 </div>
                 <div className="flex items-center gap-2 font-medium text-blue-700">
                   <Clock size={16} />
                   <span>{selectedSession.time || 'N/A'} ({selectedSession.duration} min)</span>
                 </div>

                 {/* Coach & Price */}
                 <div className="border-t pt-3 mt-3 space-y-2">
                    <div className="flex items-center gap-2">
                       <User size={16} />
                       <span>Coach: <span className="font-medium">{selectedSession.coachName}</span></span>
                     </div>
                    <div className="flex items-center gap-2">
                       <IndianRupee size={16} />
                       <span>Price: <span className="font-medium">₹{selectedSession.price}</span></span>
                     </div>
                 </div>


                 {/* Meeting Link */}
                 {selectedSession.status === 'confirmed' && selectedSession.meetingLink && (
                   <div className="flex items-center gap-2 pt-3 border-t">
                     <Video size={16} />
                     <a href={selectedSession.meetingLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium">
                       Join Meeting Link
                     </a>
                   </div>
                 )}

                 {/* Review Status/Edit Link */}
                 {selectedSession.isReviewed && (
                   <div className="flex items-center gap-2 pt-3 border-t text-sm">
                     <StarIcon size={16} className="text-yellow-500 flex-shrink-0" />
                     <span>
                       You've already reviewed this session.
                       <button
                         onClick={() => { setIsDetailsModalOpen(false); handleReviewClick(selectedSession); }}
                         className="text-blue-600 hover:underline ml-1 font-medium"
                       >
                         Edit Review
                       </button>
                     </span>
                   </div>
                 )}
               </div>

               {/* Close Button */}
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
          eligibleSessions={eligibleReviewData} // Pass the single session data prepared by handleReviewClick
          refreshList={fetchBookings} // Callback to refresh the main list
        />
      )}
    </div>
  );
};

export default UpcomingSessions;