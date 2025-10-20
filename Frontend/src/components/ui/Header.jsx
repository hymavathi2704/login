import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';
import Button from './Button';
import { useAuth } from '../../auth/AuthContext'; // Import useAuth

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth(); // Get user and logout from context

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const CoachFlowLogo = () => (
    <Link to="/" className="flex items-center space-x-2">
      <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
        <Icon name="Zap" size={20} color="white" strokeWidth={2.5} />
      </div>
      <span className="text-xl font-semibold text-foreground">The Katha</span>
    </Link>
  );

  const AuthenticationActions = () => {
    if (user) {
      // User is authenticated
      return (
        <div className="hidden md:flex items-center space-x-4">
          {/* ⚠️ REMOVED BUTTON: "Go to Dashboard" button is removed here */}
          {/* <Button
            variant="primary"
            onClick={() => navigate('/dashboard')}
          >
            Go to Dashboard
          </Button>
          */}
          <Button
            variant="ghost"
            size="icon"
            onClick={logout}
            aria-label="Logout"
          >
            <Icon name="LogOut" size={20} />
          </Button>
        </div>
      );
    }

    // User is not authenticated
    return (
      <div className="hidden md:flex items-center space-x-3">
        <Button
          variant="ghost"
          onClick={() => navigate('/login')}
        >
          Sign In
        </Button>
        <Button
          variant="default"
          onClick={() => navigate('/register')}
        >
          Get Started
        </Button>
      </div>
    );
  };

  const MobileMenu = () => (
    <div className={`md:hidden ${isMobileMenuOpen ? 'block' : 'hidden'}`}>
      <div className="absolute top-full left-0 right-0 bg-card border-t border-border shadow-soft-md z-50">
        <div className="px-4 py-4 space-y-3">
          {user ? (
            <>
              <div className="flex items-center space-x-3 p-3 bg-muted rounded-lg">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                  <Icon name="User" size={20} color="white" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{`${user.firstName} ${user.lastName}`}</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                fullWidth
                // FIX: Navigate directly to the user's current dashboard role for easy access
                onClick={() => navigate(`/dashboard/${user?.currentRole || 'client'}`)} 
                iconName="LayoutDashboard"
                iconPosition="left"
              >
                Go to Dashboard
              </Button>
              <Button
                variant="ghost"
                fullWidth
                onClick={() => navigate('/dashboard/settings')}
                iconName="Settings"
                iconPosition="left"
              >
                Profile Settings
              </Button>
              <Button
                variant="outline"
                fullWidth
                onClick={logout}
                iconName="LogOut"
                iconPosition="left"
              >
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="default"
                fullWidth
                onClick={() => navigate('/register')}
              >
                Get Started
              </Button>
              <Button
                variant="outline"
                fullWidth
                onClick={() => navigate('/login')}
              >
                Sign In
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <header className="fixed top-0 left-0 right-0 bg-card border-b border-border shadow-soft z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <CoachFlowLogo />
          </div>
          <nav className="hidden md:flex items-center space-x-8">
            <AuthenticationActions />
          </nav>
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle mobile menu"
            >
              <Icon
                name={isMobileMenuOpen ? "X" : "Menu"}
                size={24}
                color="currentColor"
              />
            </Button>
          </div>
        </div>
      </div>
      <MobileMenu />
    </header>
  );
};

export default Header;