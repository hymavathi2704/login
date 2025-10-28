// Frontend/src/pages/dashboards/client-dashboard/components/ClientOverview.jsx

import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  Calendar,
  Clock,
  Target,
} from 'lucide-react';
import { useAuth } from '../../../../auth/AuthContext';
// FIX: Import the two working functions that fetch all required data separately
import { getMyClientSessions, getFollowedCoachesClient } from '@/auth/authApi';
import { toast } from 'sonner';

const ClientOverview = () => {
  const { user } = useAuth();
  
  const [sessionCount, setSessionCount] = useState({
      allBooked: "...",
      completed: "...",
      upcoming: "...",
  });
  const [followedCoachesCount, setFollowedCoachesCount] = useState("...");
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  // Utility function to calculate session counts
  const calculateSessionCounts = (sessionsData) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      let upcoming = 0;
      let completed = 0;
      let allBooked = 0;

      sessionsData.forEach(booking => {
          // Only process bookings that are confirmed and have a date
          if (booking.status === 'confirmed' && booking.Session?.defaultDate) {
              allBooked++;
              const sessionDate = new Date(booking.Session.defaultDate);
              sessionDate.setHours(0, 0, 0, 0);

              if (sessionDate >= today) {
                  upcoming++;
              } else {
                  completed++;
              }
          } else if (booking.Session?.defaultDate) {
              allBooked++;
          }
      });
      
      return { allBooked, upcoming, completed };
  };

  // FIX: Use the two working API calls to fetch the data
  const fetchClientStats = useCallback(async () => {
    setIsLoadingStats(true);
    try {
        // 1. Fetch all bookings for session counts
        const bookingsResponse = await getMyClientSessions(); // Calls GET /api/bookings/client-sessions
        const counts = calculateSessionCounts(bookingsResponse.data);
        setSessionCount({
            allBooked: counts.allBooked.toString(),
            completed: counts.completed.toString(),
            upcoming: counts.upcoming.toString(),
        });

        // 2. Fetch Followed Coaches Count
        const followedResponse = await getFollowedCoachesClient(); // Calls GET /api/profiles/followed
        setFollowedCoachesCount(followedResponse.data?.coaches?.length?.toString() || '0');

    } catch (error) {
        console.error("Failed to fetch client dashboard stats:", error);
        toast.error("Failed to load dashboard statistics.");
        setSessionCount({ allBooked: "N/A", completed: "N/A", upcoming: "N/A" });
        setFollowedCoachesCount("N/A");
    } finally {
        setIsLoadingStats(false);
    }
  }, []);

  useEffect(() => {
      fetchClientStats();
  }, [fetchClientStats]);

  const stats = [
    {
      title: "Total Booked Sessions", 
      value: sessionCount.allBooked,
      change: "All time total",
      changeType: "neutral",
      icon: Target, 
      color: "bg-yellow-500" 
    },
    {
      title: "Coaches Followed", 
      value: followedCoachesCount,
      change: "Explore More", 
      changeType: "neutral",
      icon: Users, 
      color: "bg-purple-500" 
    },
    {
      title: "Upcoming Sessions",
      value: sessionCount.upcoming, 
      change: sessionCount.upcoming > 0 ? "Check schedule" : "Time to book!",
      changeType: sessionCount.upcoming > 0 ? "positive" : "negative",
      icon: Clock,
      color: "bg-blue-500"
    },
    {
      title: "Completed Sessions",
      value: sessionCount.completed,
      change: "Ready to review?",
      changeType: "positive",
      icon: Calendar,
      color: "bg-green-500"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">
           Welcome back, {user?.firstName || 'Client'}!
        </h2>
        <p className="text-blue-100">
            You have {isLoadingStats ? '...' : sessionCount.upcoming} upcoming session(s)
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white p-6 rounded-xl border border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mb-2">{stat.value}</p>
                  <p className={`text-sm ${
                    stat.changeType === 'positive' ? 'text-green-600' :
                    stat.changeType === 'negative' ? 'text-red-600' : 'text-gray-500'
                  }`}>
                    {stat.change}
                  </p>
                </div>
                <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                  <Icon size={24} className="text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ClientOverview;