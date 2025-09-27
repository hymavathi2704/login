import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, User } from 'lucide-react';
import { createProfile } from '../../auth/authApi'; // ✅ CORRECTED IMPORT
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import Header from '../../components/ui/Header';
import { useAuth } from '../../auth/AuthContext';

const WelcomeSetup = () => {
  const [selectedRole, setSelectedRole] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { refreshUserData } = useAuth();

  const handleRoleSelection = (role) => {
    setSelectedRole(role);
    setError('');
  };

  const handleSubmit = async () => {
    if (!selectedRole) {
      setError('Please select a role to continue.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // ✅ CORRECTED FUNCTION CALL
      await createProfile({ role: selectedRole });
      
      await refreshUserData();
      
      navigate(`/dashboard/${selectedRole}`);

    } catch (err) {
      console.error("Error in handleSubmit:", err);
      setError(err.message || 'Failed to set role. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-2xl w-full space-y-8 text-center">
            <div className="mb-8">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Icon name="Users" size={32} color="var(--color-primary)" />
              </div>
              <h1 className="text-3xl font-bold text-foreground">
                Welcome! How will you be using our platform?
              </h1>
              <p className="mt-3 text-lg text-muted-foreground">
                This will help us tailor your experience.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <RoleCard
                icon={Briefcase}
                title="I'm a Coach"
                description="Set up your profile, manage clients, and grow your business."
                isSelected={selectedRole === 'coach'}
                onSelect={() => handleRoleSelection('coach')}
              />
              <RoleCard
                icon={User}
                title="I'm a Client"
                description="Find a coach, book sessions, and track your progress."
                isSelected={selectedRole === 'client'}
                onSelect={() => handleRoleSelection('client')}
              />
            </div>
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}
            <div className="pt-4">
              <Button
                onClick={handleSubmit}
                disabled={!selectedRole || loading}
                loading={loading}
                size="lg"
                className="w-full md:w-auto"
                iconName="ArrowRight"
                iconPosition="right"
              >
                {loading ? 'Setting up your account...' : 'Continue'}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground pt-4">
              You can change this later in your account settings.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

const RoleCard = ({ icon: IconComponent, title, description, isSelected, onSelect }) => (
  <button
    onClick={onSelect}
    className={`p-8 rounded-xl border-2 transition-all duration-200 text-left ${isSelected ? 'bg-primary/5 border-primary shadow-lg scale-105' : 'bg-card border-border hover:border-primary/50 hover:bg-muted/50'}`}
  >
    <div className="flex items-center space-x-4 mb-4">
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center transition-colors ${isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
        <IconComponent size={24} />
      </div>
      <h3 className="text-xl font-semibold text-foreground">{title}</h3>
    </div>
    <p className="text-muted-foreground">{description}</p>
  </button>
);

export default WelcomeSetup;