import React, { useState } from "react";
import {
  LayoutDashboard,
  Users,
  Calendar,
  MessageSquare,
  BookOpen,
  PieChart,
  Settings,
  User,
  Zap, // Keep Zap if you want for Sessions, or use a different icon
} from "lucide-react";
import DashboardLayout from "../shared/DashboardLayout";
import CoachOverview from "./components/CoachOverview";
import ClientManagement from "./components/ClientManagement";
import BookingManagement from "./components/BookingManagement";
import CommunicationCenter from "./components/CommunicationCenter";
import ResourcesLibrary from "./components/ResourcesLibrary";
import CoachAnalytics from "./components/CoachAnalytics";
import AccountSettings from "../shared/AccountSettings";
import CoachProfileEditor from "./components/coach-profile-editor";
// REMOVED: import EventManagement from "./components/EventManagement";

const CoachDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");

  const navigationItems = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "clients", label: "Client Management", icon: Users },
    { id: "bookings", label: "Bookings", icon: Calendar },
    { id: "communication", label: "Communication", icon: MessageSquare },
    { id: "resources", label: "Resources", icon: BookOpen },
    { id: "analytics", label: "Analytics", icon: PieChart },
    { id: "profile", label: "Edit Profile", icon: User },
    // 🚨 REMOVED: The navigation item for Events
    // { id: "events", label: "Events", icon: Zap },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return <CoachOverview />;
      case "clients":
        return <ClientManagement />;
      case "bookings":
        return <BookingManagement />;
      case "communication":
        return <CommunicationCenter />;
      case "resources":
        return <ResourcesLibrary />;
      case "analytics":
        return <CoachAnalytics />;
      case "profile":
        return <CoachProfileEditor />;
      // 🚨 REMOVED: The rendering case for Events
      // case "events":
      //   return <EventManagement />;
      case "settings":
        return <AccountSettings />;
      default:
        return <CoachOverview />;
    }
  };

  return (
    <DashboardLayout
      navigationItems={navigationItems}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      userName="Coach Emily"
      userType="coach"
    >
      {renderContent()}
    </DashboardLayout>
  );
};

export default CoachDashboard;