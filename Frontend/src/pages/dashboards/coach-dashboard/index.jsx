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
  DollarSign, // Imported for the new session management tab
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
import SessionManagement from "./components/SessionManagement"; // ADDED: Import the new component

const CoachDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");

  const navigationItems = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "clients", label: "Client Management", icon: Users },
    { id: "bookings", label: "Bookings", icon: Calendar },
    { id: "communication", label: "Communication", icon: MessageSquare },
    { id: "resources", label: "Resources", icon: BookOpen },
    { id: "analytics", label: "Analytics", icon: PieChart },
    { id: "sessions", label: "Session Management", icon: DollarSign }, // MODIFIED: New Tab for Sessions
    { id: "profile", label: "Edit Profile", icon: User },
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
      case "sessions": // ADDED: Case to render the new component
        return <SessionManagement />;
      case "profile":
        return <CoachProfileEditor />;
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