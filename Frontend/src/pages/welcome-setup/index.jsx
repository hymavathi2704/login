import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { createProfile } from '../../auth/authApi';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';

const WelcomeSetup = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(null); // 'client' or 'coach'
  const [error, setError] = useState('');

  const handleRoleSelection = async (role) => {
    setIsLoading(role);
    setError('');
    try {
      // Call the backend to create the new profile
      await createProfile({ role });

      // To ensure the user's token is updated with the new role,
      // we'll "re-login" the user on the frontend with the updated user object.
      // This is a clean way to refresh the entire auth state.
      const updatedUser = {
        ...user,
        roles: [...user.roles, role],
      };
      
      // We need a way to get a new token, but for now, let's just update the state
      // A full refresh or re-login would be more robust.
      // For now, let's simulate the login with the updated user data
      // This will set the new role and redirect to the correct dashboard.
      login({ accessToken: localStorage.getItem('accessToken'), user: updatedUser });

    } catch (err) {
      console.error(`Failed to create ${role} profile:`, err);
      setError(`Could not create ${role} profile. Please try again.`);
      setIsLoading(null);
    }
  };
  
  // This is a safety check. If a user with a role lands here, send them away.
  if (user && user.roles && user.roles.length > 0) {
    navigate(`/dashboard/${user.roles[0]}`);
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center">
        <div className="mx-auto w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-6">
          <Icon name="UserPlus" size={32} color="white" />
        </div>
        <h1 className="text-4xl font-bold text-foreground">Welcome, {user?.firstName || 'User'}!</h1>
        <p className="mt-4 text-xl text-muted-foreground">
          Your account is ready. To get started, please choose your primary role on the platform.
        </p>
        <p className="mt-2 text-md text-muted-foreground">
          (Don't worry, you can add other roles later from your account settings.)
        </p>
        
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Client Role Card */}
          <div className="bg-card p-8 rounded-lg border border-border shadow-soft-lg flex flex-col items-center">
            <Icon name="User" size={48} className="text-primary mb-4" />
            <h2 className="text-2xl font-semibold text-foreground">I am a Client</h2>
            <p className="text-muted-foreground mt-2 mb-6">
              I'm here to connect with a coach and achieve my personal or professional goals.
            </p>
            <Button 
              size="lg" 
              className="w-full"
              isLoading={isLoading === 'client'}
              disabled={!!isLoading}
              onClick={() => handleRoleSelection('client')}
            >
              Continue as a Client
            </Button>
          </div>
          
          {/* Coach Role Card */}
          <div className="bg-card p-8 rounded-lg border border-border shadow-soft-lg flex flex-col items-center">
            <Icon name="Zap" size={48} className="text-primary mb-4" />
            <h2 className="text-2xl font-semibold text-foreground">I am a Coach</h2>
            <p className="text-muted-foreground mt-2 mb-6">
              I'm here to manage my coaching business, connect with clients, and grow my practice.
            </p>
            <Button 
              size="lg" 
              className="w-full"
              isLoading={isLoading === 'coach'}
              disabled={!!isLoading}
              onClick={() => handleRoleSelection('coach')}
            >
              Continue as a Coach
            </Button>
          </div>
        </div>
        {error && <p className="mt-6 text-destructive">{error}</p>}
      </div>
    </div>
  );
};

export default WelcomeSetup;