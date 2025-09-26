import React, { useState } from 'react';
// MODIFIED: Added more hooks from the auth context
import { useAuth } from '../../../auth/AuthContext';
import { LogOut, Menu, X } from 'lucide-react';

const DashboardLayout = ({ 
  children, 
  navigationItems = [], // This prevents crashes but doesn't change your layout
  activeTab, 
  onTabChange, 
  title, 
  subtitle, 
  userType 
}) => {
  // MODIFIED: Getting multi-role state from the context
  const { user, roles, currentRole, switchRole, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    // No need for window.location.href, the context handles navigation
  };

  // --- NEW: Role Switcher Component ---
  // This dropdown only appears if the user has more than one role.
  const RoleSwitcher = () => {
    // If the user has only one role, just display it as text.
    if (!roles || roles.length <= 1) {
      return <div className="text-sm text-gray-500 capitalize">{currentRole || userType}</div>;
    }
    
    // If they have multiple roles, show the dropdown.
    return (
      <select
        value={currentRole}
        onChange={(e) => switchRole(e.target.value)}
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

  const getUserTypeColor = (type) => {
    switch (type) {
      case 'client': return 'from-blue-600 to-cyan-600';
      case 'coach': return 'from-purple-600 to-pink-600';
      case 'admin': return 'from-red-600 to-orange-600';
      default: return 'from-gray-600 to-gray-700';
    }
  };

  const getInitials = (firstName, lastName, email) => {
    if (firstName && lastName) return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    if (email) return email.charAt(0).toUpperCase();
    return 'U';
  };

  const displayName = user?.firstName && user?.lastName 
    ? `${user.firstName} ${user.lastName}` 
    : user?.email || 'User';

  // Use the role from the context first, but fall back to the prop for safety.
  const displayRole = currentRole || userType;

  return (
    <div className="flex min-h-screen bg-gray-50">
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out 
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:static lg:translate-x-0 lg:flex-shrink-0
      `}>
        <div className={`h-16 flex items-center justify-between px-6 bg-gradient-to-r ${getUserTypeColor(displayRole)} text-white`}>
          <div className="font-bold text-lg">The Katha</div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 hover:bg-white/20 rounded">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 bg-gradient-to-r ${getUserTypeColor(displayRole)} rounded-full flex items-center justify-center text-white font-medium`}>
              {getInitials(user?.firstName, user?.lastName, user?.email)}
            </div>
            <div>
              <div className="font-medium">{displayName}</div>
              {/* --- MODIFIED: The RoleSwitcher is now here --- */}
              <RoleSwitcher />
            </div>
          </div>
        </div>

        {/* Navigation remains unchanged and is driven by your props */}
        <nav className="flex-1 px-4 py-6">
          <ul className="space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <li key={item.id}>
                  <button
                    onClick={() => {
                      onTabChange(item.id);
                      setSidebarOpen(false);
                    }}
                    className={`
                      w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors
                      ${isActive 
                        ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600 font-semibold' 
                        : 'text-gray-600 hover:bg-gray-50'
                      }
                    `}
                  >
                    <Icon size={20} />
                    <span className="font-medium">{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-gray-200">
          <button onClick={handleLogout} className="w-full flex items-center space-x-3 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col min-h-screen">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
          <div className="flex items-center space-x-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 hover:bg-gray-100 rounded-lg">
              <Menu size={20} />
            </button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
              {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-500">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>
        </header>

        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;