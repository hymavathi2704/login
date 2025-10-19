// Frontend/src/pages/dashboards/client-dashboard/components/ClientOverview.jsx

import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  Calendar,
  Clock,
  MessageSquare,
  Star,
  Target,
  BookOpen,
  Video
} from 'lucide-react';
import { useAuth } from '../../../../auth/AuthContext';
import { getMyClientSessions, getFollowedCoachesClient } from '@/auth/authApi';
import { toast } from 'sonner';

// REMOVED IMPORT: Import of UpcomingSessions is no longer needed


const ClientOverview = () => {
  const { user } = useAuth();
  
  // ✅ NEW STATE: To hold dynamic counts
  const [sessionCount, setSessionCount] = useState({
      allBooked: "...", // Total Sessions I Booked
      completed: "...",
      upcoming: "...",
  });
  const [followedCoachesCount, setFollowedCoachesCount] = useState("...");
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  // Utility function to calculate session counts (kept local to this component for independence)
  const calculateSessionCounts = (sessionsData) => {
      const today = new Date();
      // Set time to 00:00:00 for accurate day-based comparison
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
              // Count pending/cancelled sessions towards total if they have a scheduled date
              allBooked++;
          }
      });
      
      return { allBooked, upcoming, completed };
  };

  // ✅ NEW: Fetch all required stats on mount
  const fetchClientStats = useCallback(async () => {
    setIsLoadingStats(true);
    try {
        // 1. Fetch all bookings for session counts
        const bookingsResponse = await getMyClientSessions();
        const counts = calculateSessionCounts(bookingsResponse.data);
        setSessionCount({
            allBooked: counts.allBooked.toString(),
            completed: counts.completed.toString(),
            upcoming: counts.upcoming.toString(),
        });

        // 2. Fetch Followed Coaches Count
        const followedResponse = await getFollowedCoachesClient();
        // Assuming the response data contains a 'coaches' array
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

  // MODIFIED: Use dynamic values in the stats array
  const stats = [
    {
      // ✅ 1. Sessions I booked (Total count of all bookings)
      title: "Total Booked Sessions", 
      value: sessionCount.allBooked,
      change: "All time total",
      changeType: "neutral",
      icon: Target, 
      color: "bg-yellow-500" 
    },
    {
      // ✅ 2. No of coaches I follow
      title: "Coaches Followed", 
      value: followedCoachesCount,
      change: "Explore More", 
      changeType: "neutral",
      icon: Users, 
      color: "bg-purple-500" 
    },
    {
      // ✅ 3. Upcoming sessions
      title: "Upcoming Sessions",
      value: sessionCount.upcoming, 
      change: sessionCount.upcoming > 0 ? "Check schedule" : "Time to book!",
      changeType: sessionCount.upcoming > 0 ? "positive" : "negative",
      icon: Clock,
      color: "bg-blue-500"
    },
    {
      // ✅ 4. Completed sessions
      title: "Completed Sessions",
      value: sessionCount.completed,
      change: "+2 this month", // Kept mock for change delta
      changeType: "positive",
      icon: Calendar,
      color: "bg-green-500"
    }
  ];

  // REMOVED: The recentActivities array definition has been removed.

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">
           Welcome back, {user?.firstName || 'Client'}!
        </h2>
        {/* MODIFIED: Display the dynamic upcoming sessions count */}
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

      {/* Main Content Grid REMOVED */}
    </div>
  );
};

export default ClientOverview;