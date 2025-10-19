import React, { useState, useEffect } from "react"; 
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
// ✅ FIX: Import useLocation and useNavigate
import { useLocation, useNavigate } from "react-router-dom";

import DashboardLayout from "../shared/DashboardLayout";
import ClientOverview from "./components/ClientOverview";
import UpcomingSessions from "./components/UpcomingSessions";

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
    // ✅ FIX: Use location to read the current URL path
    const location = useLocation();
    const navigate = useNavigate();
    const currentPath = location.pathname;
    const clientBasePath = "/dashboard/client";

    // Helper to extract the active tab ID from the URL path (e.g., '/dashboard/client/profile' -> 'profile')
    const getActiveTabFromUrl = (path) => {
        const parts = path.split('/');
        const lastPart = parts[parts.length - 1];
        // Ensure the tab exists in the navigation items, defaulting to 'overview'
        const itemIds = navigationItems.map(item => item.id);
        return itemIds.includes(lastPart) ? lastPart : 'overview';
    };

    // ✅ FIX: activeTab is now derived from the URL and updated via URL change
    const [activeTab, setActiveTab] = useState(getActiveTabFromUrl(currentPath));

    // Update activeTab whenever the URL changes
    useEffect(() => {
        setActiveTab(getActiveTabFromUrl(currentPath));
    }, [currentPath]);

    // ✅ FIX: New handler to change tab by updating the URL
    const handleTabChange = (newTabId) => {
        // If they click the 'overview' tab, navigate to the base path
        if (newTabId === 'overview') {
            navigate(clientBasePath);
        } else {
            navigate(`${clientBasePath}/${newTabId}`);
        }
    };
    
  const navigationItems = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "profile", label: "My Profile", icon: User },
    { id: "explore", label: "Explore Coaches", icon: Search },
    { id: "sessions", label: "My Sessions", icon: Calendar },
    { id: "progress", label: "Progress", icon: Target },
    { id: "resources", label: "Resources", icon: BookOpen },
    { id: "communication", label: "Messages", icon: MessageSquare },
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
        return <ComingSoon sectionName="Progress Tracker" />; 
      case "resources":
        return <ComingSoon sectionName="My Resources" />; 
      case "communication":
        return <ComingSoon sectionName="Messages" />; 
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
      onTabChange={handleTabChange} // ✅ Use the new handler
      userName="Client Alex"
      userType="client"
    >
      {renderContent()}
    </DashboardLayout>
  );
};

export default ClientDashboard;