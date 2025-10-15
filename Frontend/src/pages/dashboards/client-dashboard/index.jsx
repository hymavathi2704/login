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

import DashboardLayout from "../shared/DashboardLayout";
import ClientOverview from "./components/ClientOverview";
import UpcomingSessions from "./components/UpcomingSessions";
import ProgressTracker from "./components/ProgressTracker";
import MyResources from "./components/MyResources";
import CoachCommunication from "./components/CoachCommunication";
// REMOVED: import BookNewSession from "./components/BookNewSession"; 
import AccountSettings from "../shared/AccountSettings";
import ExploreCoaches from "./components/ExploreCoaches";
import ClientProfileEditor from "./components/ClientProfileEditor";

const ClientDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");

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
        // This remains, ensuring My Sessions works with sessions-only API
        return <UpcomingSessions />; 
      case "progress":
        return <ProgressTracker />;
      case "resources":
        return <MyResources />;
      case "communication":
        return <CoachCommunication />;
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