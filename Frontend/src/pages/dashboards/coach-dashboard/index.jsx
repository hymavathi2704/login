import React, { useState, useEffect } from "react"; 
import {
  LayoutDashboard,
  Users,
  Calendar,
  MessageSquare,
  BookOpen,
  PieChart,
  Settings,
  User,
  DollarSign, 
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom"; 

import DashboardLayout from "../shared/DashboardLayout";
import CoachOverview from "./components/CoachOverview";
import ClientManagement from "./components/ClientManagement";
import BookingManagement from "./components/BookingManagement";
import CommunicationCenter from "./components/CommunicationCenter";
import ResourcesLibrary from "./components/ResourcesLibrary";
import CoachAnalytics from "./components/CoachAnalytics";
import AccountSettings from "../shared/AccountSettings";
import CoachProfileEditor from "./components/coach-profile-editor";
import SessionManagement from "./components/SessionManagement"; 

const CoachDashboard = () => {
    // ✅ FIX: Define navigationItems first so helpers can access it immediately
    const navigationItems = [
        { id: "overview", label: "Overview", icon: LayoutDashboard },
        { id: "clients", label: "Client Management", icon: Users },
        { id: "bookings", label: "Bookings", icon: Calendar },
        { id: "communication", label: "Communication", icon: MessageSquare },
        { id: "resources", label: "Resources", icon: BookOpen },
        { id: "analytics", label: "Analytics", icon: PieChart },
        { id: "sessions", label: "Session Management", icon: DollarSign }, 
        { id: "profile", label: "Edit Profile", icon: User },
        { id: "settings", label: "Settings", icon: Settings },
    ];
    
    const location = useLocation();
    const navigate = useNavigate();
    const currentPath = location.pathname;
    const coachBasePath = "/dashboard/coach";

    // Helper to extract the active tab ID from the URL path
    const getActiveTabFromUrl = (path) => {
        const parts = path.split('/');
        const lastPart = parts[parts.length - 1];
        // navigationItems is now in scope
        const itemIds = navigationItems.map(item => item.id);
        return itemIds.includes(lastPart) ? lastPart : 'overview';
    };

    // Initialize state using the helper function
    const [activeTab, setActiveTab] = useState(getActiveTabFromUrl(currentPath));
    
    // Update activeTab whenever the URL changes
    useEffect(() => {
        setActiveTab(getActiveTabFromUrl(currentPath));
    }, [currentPath]);

    // Handler to change tab by updating the URL
    const handleTabChange = (newTabId) => {
        if (newTabId === 'overview') {
            navigate(coachBasePath);
        } else {
            navigate(`${coachBasePath}/${newTabId}`);
        }
    };


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
      case "sessions": 
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
      onTabChange={handleTabChange} 
      userName="Coach Emily"
      userType="coach"
    >
      {renderContent()}
    </DashboardLayout>
  );
};

export default CoachDashboard;