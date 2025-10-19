import React, { useState } from "react";
import {
  LayoutDashboard,
  User,
  Heart,
  Target,
  BookOpen,
  Calendar,
  MessageSquare,
  Search,
  Settings,
} from "lucide-react";
// ✅ FIX: Import useLocation
import { useLocation } from "react-router-dom";

import DashboardLayout from "../shared/DashboardLayout";
import ClientOverview from "./components/ClientOverview";
import UpcomingSessions from "./components/UpcomingSessions";
// The original components (ProgressTracker, MyResources, CoachCommunication) 
// are now redundant as they are replaced by ComingSoon. We keep them commented 
// out to prevent import errors but show intent.

// import ProgressTracker from "./components/ProgressTracker";
// import MyResources from "./components/MyResources";
// import CoachCommunication from "./components/CoachCommunication";

import AccountSettings from "../shared/AccountSettings";
import ExploreCoaches from "./components/ExploreCoaches";
import ClientProfileEditor from "./components/ClientProfileEditor";

// New component to display the placeholder message
const ComingSoon = ({ sectionName }) => (
    <div className="flex items-center justify-center h-96 bg-white rounded-xl border border-gray-200">
        <div className="text-center p-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
                {sectionName} - Coming Soon!
            </h2>
            <p className="text-lg text-gray-500">
                This feature is currently under development and will be available shortly.
            </p>
        </div>
    </div>
);


const ClientDashboard = () => {
  // ✅ FIX: Logic to determine active tab from URL path
    const location = useLocation();
    const determineInitialTab = (path) => {
        if (path.includes('/profile')) return 'profile';
        if (path.includes('/settings')) return 'settings';
        return 'overview';
    };
    const [activeTab, setActiveTab] = useState(determineInitialTab(location.pathname));

  const navigationItems = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "profile", label: "My Profile", icon: User },
    { id: "explore", label: "Explore Coaches", icon: Search },
    { id: "sessions", label: "My Sessions", icon: Calendar },
    { id: "progress", label: "Progress", icon: Target },
    { id: "resources", label: "Resources", icon: BookOpen },
    { id: "communication", label: "Messages", icon: MessageSquare },
    // 🚨 REMOVED: The navigation item for 'Book a Session'
    // { id: "book-session", label: "Book a Session", icon: Heart },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return <ClientOverview />;
      case "profile":
        return <ClientProfileEditor />;
      case "explore":
        return <ExploreCoaches />;
      case "sessions":
        return <UpcomingSessions />; 
      case "progress":
        return <ComingSoon sectionName="Progress Tracker" />; // <-- MODIFIED
      case "resources":
        return <ComingSoon sectionName="My Resources" />; // <-- MODIFIED
      case "communication":
        return <ComingSoon sectionName="Messages" />; // <-- MODIFIED
      // 🚨 REMOVED: The content rendering case for 'book-session'
      // case "book-session":
      //   return <BookNewSession />; 
      case "settings":
        return <AccountSettings />;
      default:
        return <ClientOverview />;
    }
  };

  return (
    <DashboardLayout
      navigationItems={navigationItems}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      userName="Client Alex"
      userType="client"
    >
      {renderContent()}
    </DashboardLayout>
  );
};

export default ClientDashboard;