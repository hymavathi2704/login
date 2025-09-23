import React, { useState } from 'react';
import { Calendar, Clock, User, DollarSign, Video, MapPin, Filter } from 'lucide-react';

const BookNewSession = () => {
  const [selectedCoach, setSelectedCoach] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [sessionType, setSessionType] = useState('video');
  const [filters, setFilters] = useState({
    specialty: '',
    priceRange: '',
    rating: ''
  });

  const coaches = [
    {
      id: 1,
      name: "Dr. Emily Chen",
      specialty: "Life Coaching",
      rating: 4.9,
      reviews: 127,
      price: 150,
      duration: 60,
      image: "/api/placeholder/80/80",
      nextAvailable: "Today",
      bio: "Certified life coach with 8+ years experience helping clients achieve work-life balance.",
      languages: ["English", "Mandarin"],
      timeSlots: ["9:00 AM", "10:30 AM", "2:00 PM", "3:30 PM"]
    },
    {
      id: 2,
      name: "Michael Rodriguez",
      specialty: "Career Development",
      rating: 4.8,
      reviews: 98,
      price: 120,
      duration: 45,
      image: "/api/placeholder/80/80",
      nextAvailable: "Tomorrow",
      bio: "Executive coach specializing in leadership development and career transitions.",
      languages: ["English", "Spanish"],
      timeSlots: ["11:00 AM", "1:00 PM", "4:00 PM", "5:30 PM"]
    },
    {
      id: 3,
      name: "Sarah Williams",
      specialty: "Wellness Coaching",
      rating: 4.9,
      reviews: 156,
      price: 100,
      duration: 50,
      image: "/api/placeholder/80/80",
      nextAvailable: "Today",
      bio: "Holistic wellness coach focusing on mindfulness, nutrition, and stress management.",
      languages: ["English"],
      timeSlots: ["8:00 AM", "12:00 PM", "6:00 PM", "7:30 PM"]
    }
  ];

  const specialties = ["Life Coaching", "Career Development", "Wellness Coaching", "Business Coaching", "Fitness Coaching"];
  const priceRanges = ["$50-100", "$100-150", "$150-200", "$200+"];

  const filteredCoaches = coaches.filter(coach => {
    if (filters.specialty && coach.specialty !== filters.specialty) return false;
    if (filters.priceRange) {
      const [min, max] = filters.priceRange.replace('$', '').split('-').map(p => p.replace('+', ''));
      if (max && coach.price > parseInt(max)) return false;
      if (coach.price < parseInt(min)) return false;
    }
    if (filters.rating && coach.rating < parseFloat(filters.rating)) return false;
    return true;
  });

  const handleBookSession = () => {
    if (!selectedCoach || !selectedDate || !selectedTime) {
      alert('Please select a coach, date, and time');
      return;
    }
    
    // Here you would integrate with payment system
    alert(`Booking session with ${selectedCoach.name} on ${selectedDate} at ${selectedTime}`);
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Filter size={20} className="text-gray-600" />
          <h3 className="text-lg font-semibold">Find Your Coach</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Specialty</label>
            <select 
              value={filters.specialty}
              onChange={(e) => setFilters({...filters, specialty: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Specialties</option>
              {specialties.map(specialty => (
                <option key={specialty} value={specialty}>{specialty}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
            <select 
              value={filters.priceRange}
              onChange={(e) => setFilters({...filters, priceRange: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Any Price</option>
              {priceRanges.map(range => (
                <option key={range} value={range}>{range}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Min Rating</label>
            <select 
              value={filters.rating}
              onChange={(e) => setFilters({...filters, rating: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Any Rating</option>
              <option value="4.5">4.5+ Stars</option>
              <option value="4.0">4.0+ Stars</option>
              <option value="3.5">3.5+ Stars</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Session Type</label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="video"
                  checked={sessionType === 'video'}
                  onChange={(e) => setSessionType(e.target.value)}
                  className="mr-2"
                />
                <Video size={16} className="mr-1" />
                Video
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="in-person"
                  checked={sessionType === 'in-person'}
                  onChange={(e) => setSessionType(e.target.value)}
                  className="mr-2"
                />
                <MapPin size={16} className="mr-1" />
                In-Person
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Coach List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredCoaches.map((coach) => (
          <div 
            key={coach.id}
            className={`bg-white rounded-xl border-2 p-6 cursor-pointer transition-all ${
              selectedCoach?.id === coach.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => setSelectedCoach(coach)}
          >
            <div className="flex items-start space-x-4">
              <img 
                src={coach.image} 
                alt={coach.name}
                className="w-20 h-20 rounded-full object-cover"
              />
              
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-lg">{coach.name}</h4>
                  <div className="text-right">
                    <div className="font-bold text-blue-600">${coach.price}</div>
                    <div className="text-sm text-gray-500">{coach.duration} min</div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="text-sm text-blue-600 font-medium">{coach.specialty}</div>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span>⭐ {coach.rating} ({coach.reviews} reviews)</span>
                    <span>📅 {coach.nextAvailable}</span>
                  </div>
                  <p className="text-sm text-gray-600">{coach.bio}</p>
                  
                  <div className="flex flex-wrap gap-1">
                    {coach.languages.map(lang => (
                      <span key={lang} className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Booking Form */}
      {selectedCoach && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Book Session with {selectedCoach.name}</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Time</label>
              <select
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Choose time</option>
                {selectedCoach.timeSlots.map(time => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Session Notes (Optional)</label>
              <textarea
                placeholder="Any specific topics or goals for this session?"
                rows="2"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-lg">
              <span className="text-gray-600">Total: </span>
              <span className="font-bold text-blue-600">${selectedCoach.price}</span>
            </div>
            
            <button
              onClick={handleBookSession}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Book & Pay
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookNewSession;