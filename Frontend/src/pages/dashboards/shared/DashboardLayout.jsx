import React, { useState, useEffect, useRef } from 'react';
import { LogOut, Menu, User, Settings, X, ChevronDown, PanelLeft } from 'lucide-react';
import { useAuth } from '@/auth/AuthContext';
import BreadcrumbNavigation, { BreadcrumbProvider } from '@/components/ui/BreadcrumbNavigation';
import { cn } from '@/utils/cn';
// ✅ FIX: Import useNavigate for routing
import { useNavigate } from 'react-router-dom';

// Load backend URL from .env (fallback to localhost:4028)
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:4028";

// Helper to construct the full image source URL
const getFullImageSrc = (pathOrBase64) => {
  // If the string is a backend path (starting with /uploads/), prepend the full API URL
  if (typeof pathOrBase64 === 'string' && pathOrBase64.startsWith('/uploads/')) {
      return `${API_BASE_URL}${pathOrBase64}`;
  }
  return pathOrBase64;
};

/**
 * A hook to detect clicks outside a specified element.
 */
function useOutsideAlerter(handler) {
// ... (omitted useOutsideAlerter logic)
  const ref = useRef(null);
  useEffect(() => {
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        handler();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref, handler]);
  return ref;
}

const DashboardLayout = ({
  children,
  navigationItems = [],
  activeTab,
  onTabChange = () => {},
  userType,
}) => {
  const { user, roles = [], currentRole, switchRole, logout } = useAuth() || {};
  const [sidebarOpen, setSidebarOpen] = useState(false); // For mobile
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false); // For desktop
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  // Removed: const [notificationsOpen, setNotificationsOpen] = useState(false);
  // ✅ FIX: Initialize useNavigate
  const navigate = useNavigate(); 

  const userDropdownRef = useOutsideAlerter(() => setUserDropdownOpen(false));
  // Removed: const notificationsRef = useOutsideAlerter(() => setNotificationsOpen(false));

  const handleLogout = () => {
    if (logout) logout();
  };

// ✅ FIX: Handlers for Profile and Settings Redirection
// Navigate to the base path + the tab ID ('profile' or 'settings')
  const handleProfileRedirect = () => {
    if (currentRole) {
      navigate(`/dashboard/${currentRole}/profile`); 
      setUserDropdownOpen(false);
    }
  };

  const handleSettingsRedirect = () => {
    if (currentRole) {
      navigate(`/dashboard/${currentRole}/settings`); 
      setUserDropdownOpen(false);
    }
  };
  const getUserTypeColor = (type) => {
    switch (type) {
      case 'client': return 'from-blue-600 to-cyan-600';
      case 'coach': return 'from-purple-600 to-pink-600';
      case 'admin': return 'from-red-600 to-orange-600';
      default: return 'from-gray-600 to-gray-700';
    }
  };

  const displayName = (user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : user?.email) || 'User';
  const displayRole = currentRole || userType;

  // 🔑 FIX: Use the top-level user.profilePicture, which holds the image path.
  const profilePictureSource = user?.profilePicture || null;


  // Removed: Dummy notifications data

  const RoleSwitcher = () => {
    if (!roles || roles.length <= 1) {
      return <div className="text-sm text-gray-500 capitalize">{currentRole || userType}</div>;
    }

    return (
      <select
        value={currentRole}
        onChange={(e) => switchRole && switchRole(e.target.value)}
        className="w-full text-sm text-gray-500 bg-transparent border-none focus:ring-0 p-0"
        aria-label="Switch role"
      >
        {roles.map((role) => (
          <option key={role} value={role} className="text-black">
            {role.charAt(0).toUpperCase() + role.slice(1)} View
          </option>
        ))}
      </select>
    );
  };

  return (
    <BreadcrumbProvider>
      <div className="flex h-screen bg-gray-50 overflow-hidden">
        {/* Sidebar */}
        <div
          className={cn(
            'fixed inset-y-0 left-0 z-50 bg-white border-r border-gray-200 transform transition-all duration-300 ease-in-out flex flex-col',
            'lg:static lg:translate-x-0', // Always static on desktop
            sidebarOpen ? 'translate-x-0' : '-translate-x-full', // Mobile slide-in
            isSidebarCollapsed ? 'lg:w-20' : 'lg:w-64' // Desktop collapse
          )}
        >
          {/* Sidebar Header */}
           <div className="h-16 flex items-center justify-between px-4 flex-shrink-0 border-b">
             {!isSidebarCollapsed && <div className="font-bold text-lg text-gray-800">The Katha</div>}
             <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1">
               <X size={24} />
             </button>
           </div>
          
          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 overflow-y-auto">
            <ul className="space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => {
                        onTabChange(item.id);
                        if (sidebarOpen) setSidebarOpen(false);
                      }}
                      className={cn(
                        'w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200',
                         isSidebarCollapsed && 'justify-center',
                        isActive
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                      )}
                      title={isSidebarCollapsed ? item.label : undefined}
                    >
                      {Icon && <Icon size={20} />}
                      {!isSidebarCollapsed && <span className="font-medium text-sm">{item.label}</span>}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>
           {/* Logout Button */}
           <div className={cn("p-3 border-t border-gray-200", isSidebarCollapsed && 'px-2')}>
             <button
               onClick={handleLogout}
               className={cn(
                 "w-full flex items-center space-x-3 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors",
                 isSidebarCollapsed && 'justify-center'
                )}
                title={isSidebarCollapsed ? "Logout" : undefined}
             >
               <LogOut size={20} />
               {!isSidebarCollapsed && <span className="font-medium text-sm">Logout</span>}
             </button>
           </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className={cn(
              "h-16 flex-shrink-0 bg-white border-b border-gray-200 flex items-center justify-between px-6 transition-all duration-300"
            )}>
             <div className="flex items-center space-x-4">
               <button
                 onClick={() => {
                   if (window.innerWidth < 1024) {
                     setSidebarOpen(true);
                   } else {
                     setIsSidebarCollapsed(!isSidebarCollapsed);
                   }
                 }}
                 className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg"
               >
                 <PanelLeft size={20} />
               </button>
                <BreadcrumbNavigation />
             </div>

            <div className="flex items-center space-x-5">
               {/* Notifications section removed */}

               {/* User Profile Dropdown */}
               <div ref={userDropdownRef} className="relative">
                 <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setUserDropdownOpen(!userDropdownOpen)}>
                   <img
                     className="w-9 h-9 rounded-full"
                     src={getFullImageSrc(profilePictureSource) || `https://ui-avatars.com/api/?name=${displayName.replace(' ', '+')}&background=random`}
                     alt="User Avatar"
                   />
                   <div className="hidden sm:block">
                      <div className="font-semibold text-sm text-gray-800">{displayName}</div>
                      <div className="text-xs text-gray-500 capitalize">{displayRole}</div>
                   </div>
                   <ChevronDown size={16} className="text-gray-500" />
                 </div>
                {userDropdownOpen && (
                   <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg z-20 border border-gray-100">
                     <div className="p-4 border-b">
                        <div className="font-semibold text-gray-800">{displayName}</div>
                        <RoleSwitcher />
                     </div>
                     <ul className="py-1">
                       {/* ✅ FIX: Profile redirects to /dashboard/{role}/profile-editor */}
                       <li>
                            <button 
                                onClick={handleProfileRedirect} 
                                className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                                <User size={16} className="mr-3" />Profile
                            </button>
                        </li>
                       {/* ✅ FIX: Settings redirects to /dashboard/{role}/settings */}
                       <li>
                            <button 
                                onClick={handleSettingsRedirect} 
                                className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                                <Settings size={16} className="mr-3" />Settings
                            </button>
                        </li>
                       <li className="border-t border-gray-100 my-1"></li>
                       <li><button onClick={handleLogout} className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"><LogOut size={16} className="mr-3" />Logout</button></li>
                     </ul>
                   </div>
                )}
               </div>
            </div>
           </header>
          {/* Content Area */}
          <main className="flex-1 p-6 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </BreadcrumbProvider>
  );
};

export default DashboardLayout;