// Frontend/src/pages/dashboards/client-dashboard/components/ClientOverview.jsx

import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  CalendarCheck2, // Changed from Calendar for completed
  Clock,
  Target,
  // Removed unused icons like MessageSquare, Star, BookOpen, Video
} from 'lucide-react';
import { useAuth } from '../../../../auth/AuthContext';
// 🛑 Import the CORRECT API function
import { getClientDashboardOverview } from '@/auth/authApi';
import { toast } from 'sonner';


const ClientOverview = () => {
  const { user } = useAuth();

  // State to hold dynamic counts fetched from the API
  const [statsData, setStatsData] = useState({
    upcomingSessions: "...",
    completedSessions: "...",
    followedCoaches: "...",
    // Add other stats if your backend provides them
  });
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  // Fetch all required stats on component mount
  const fetchClientStats = useCallback(async () => {
    setIsLoadingStats(true);
    try {
        // 🛑 Call the correct API endpoint
        const response = await getClientDashboardOverview();

        // Update state with data directly from the backend response
        setStatsData({
            upcomingSessions: response.data.upcomingSessions?.toString() || '0',
            completedSessions: response.data.completedSessions?.toString() || '0',
            followedCoaches: response.data.followedCoaches?.toString() || '0',
            // Map other stats if returned by the backend
        });

    } catch (error) {
        console.error("Failed to fetch client dashboard stats:", error);
        toast.error(error.message || "Failed to load dashboard statistics.");
        // Set stats to N/A on error
        setStatsData({
            upcomingSessions: "N/A",
            completedSessions: "N/A",
            followedCoaches: "N/A",
        });
    } finally {
        setIsLoadingStats(false);
    }
  }, []); // Empty dependency array means this runs once on mount

  useEffect(() => {
      fetchClientStats();
  }, [fetchClientStats]);

  // Define the stats structure using fetched data
  const stats = [
    {
      title: "Upcoming Sessions",
      value: isLoadingStats ? "..." : statsData.upcomingSessions,
      // You can add more dynamic change text if needed
      change: statsData.upcomingSessions > 0 ? "Check schedule" : "Time to book!",
      changeType: statsData.upcomingSessions > 0 ? "positive" : "neutral",
      icon: Clock,
      color: "bg-blue-500"
    },
    {
      title: "Completed Sessions",
      value: isLoadingStats ? "..." : statsData.completedSessions,
      change: "Sessions attended", // Simplified change text
      changeType: "neutral",
      icon: CalendarCheck2, // Use updated icon
      color: "bg-green-500"
    },
    {
      title: "Coaches Followed",
      value: isLoadingStats ? "..." : statsData.followedCoaches,
      change: "Explore More",
      changeType: "neutral",
      icon: Users,
      color: "bg-purple-500"
    },
    // You could add a 4th stat here if needed, e.g., total bookings
    {
      title: "Total Bookings", // Example 4th Stat
      // This assumes your backend sends a total, otherwise calculate from upcoming+completed
      value: isLoadingStats ? "..." : (parseInt(statsData.upcomingSessions || 0) + parseInt(statsData.completedSessions || 0)).toString(),
      change: "All sessions",
      changeType: "neutral",
      icon: Target,
      color: "bg-yellow-500"
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white shadow-md">
        <h2 className="text-2xl font-bold mb-2">
            Welcome back, {user?.firstName || 'Client'}!
        </h2>
        {/* Display the dynamic upcoming sessions count */}
        <p className="text-blue-100">
            You have {isLoadingStats ? '...' : statsData.upcomingSessions} upcoming session(s). Stay prepared!
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          // Determine text color based on change type for better contrast/meaning
          let changeTextColor = 'text-gray-500'; // Default neutral
          if (stat.changeType === 'positive') changeTextColor = 'text-green-600';
          if (stat.changeType === 'negative') changeTextColor = 'text-red-600';

          return (
            <div key={index} className="bg-white p-5 rounded-xl border border-gray-200 shadow hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                {/* Text Content */}
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  <p className={`text-xs font-medium ${changeTextColor}`}>
                    {stat.change}
                  </p>
                </div>
                {/* Icon */}
                <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center flex-shrink-0 ml-4`}>
                  <Icon size={20} className="text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Removed the lower section with Recent Activities/Upcoming Sessions Preview */}
      {/* The UpcomingSessions component handles the detailed list separately */}

    </div>
  );
};

export default ClientOverview;