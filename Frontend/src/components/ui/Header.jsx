import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Icon from '../AppIcon';
import Button from './Button';

const Header = ({ isAuthenticated = false, userProfile = null }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const handleAuthAction = (action) => {
    console.log(`Authentication action: ${action}`);
    // Handle authentication actions here
  };

  const handleLogout = () => {
    console.log('Logout action');
    // Handle logout logic here
  };

  const CoachFlowLogo = () => (
    <Link to="/homepage" className="flex items-center space-x-2">
      <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
        <Icon name="Zap" size={20} color="white" strokeWidth={2.5} />
      </div>
      <span className="text-xl font-semibold text-foreground">CoachFlow</span>
    </Link>
  );

  const AuthenticationActions = () => {
    if (isAuthenticated && userProfile) {
      return (
        <div className="relative">
          <div className="hidden md:flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => handleAuthAction('profile')}
              className="flex items-center space-x-2"
            >
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <Icon name="User" size={16} color="white" />
              </div>
              <span className="text-sm font-medium">{userProfile?.name || 'Profile'}</span>
            </Button>
            <Button
              variant="outline"
              onClick={handleLogout}
              iconName="LogOut"
              iconPosition="left"
              iconSize={16}
            >
              Sign Out
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="hidden md:flex items-center space-x-3">
        <Button
          variant="ghost"
          onClick={() => handleAuthAction('login')}
          asChild
        >
          <Link to="/user-login">Sign In</Link>
        </Button>
        <Button
          variant="default"
          onClick={() => handleAuthAction('register')}
          asChild
        >
          <Link to="/user-registration">Get Started</Link>
        </Button>
      </div>
    );
  };

  const MobileMenu = () => (
    <div className={`md:hidden ${isMobileMenuOpen ? 'block' : 'hidden'}`}>
      <div className="absolute top-full left-0 right-0 bg-card border-t border-border shadow-soft-md z-50">
        <div className="px-4 py-4 space-y-3">
          {isAuthenticated && userProfile ? (
            <>
              <div className="flex items-center space-x-3 p-3 bg-muted rounded-lg">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                  <Icon name="User" size={20} color="white" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{userProfile?.name || 'User'}</p>
                  <p className="text-sm text-muted-foreground">{userProfile?.email || 'user@example.com'}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                fullWidth
                onClick={() => handleAuthAction('profile')}
                iconName="Settings"
                iconPosition="left"
                asChild
              >
                <Link to="/user-profile-management">Profile Settings</Link>
              </Button>
              <Button
                variant="outline"
                fullWidth
                onClick={handleLogout}
                iconName="LogOut"
                iconPosition="left"
              >
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                fullWidth
                onClick={() => handleAuthAction('login')}
                asChild
              >
                <Link to="/user-login">Sign In</Link>
              </Button>
              <Button
                variant="default"
                fullWidth
                onClick={() => handleAuthAction('register')}
                asChild
              >
                <Link to="/user-registration">Get Started</Link>
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
          {/* Logo */}
          <div className="flex-shrink-0">
            <CoachFlowLogo />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <AuthenticationActions />
          </nav>

          {/* Mobile Menu Button */}
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

      {/* Mobile Menu */}
      <MobileMenu />
    </header>
  );
};

export default Header;