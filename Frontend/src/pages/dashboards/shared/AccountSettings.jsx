// Create a new file at: Frontend/src/pages/dashboards/shared/AccountSettings.jsx

import React, { useState } from 'react';
import { useAuth } from '../../../auth/AuthContext';
import { createProfile } from '../../../auth/authApi';
import Button from '../../../components/ui/Button'; // Assuming default export
import Icon from '../../../components/AppIcon';

const AccountSettings = () => {
  const { user, roles, refreshUserData } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleAddRole = async (role) => {
    setIsLoading(true);
    setError('');
    setSuccess('');
    try {
      await createProfile({ role });
      setSuccess(`You are now also a ${role}! Your page will refresh.`);
      
      // Refresh user data in the context to update roles
      await refreshUserData();
      
      // Optional: force a reload to ensure all components update
      setTimeout(() => window.location.reload(), 2000);

    } catch (err) {
      setError(err.response?.data?.error || `Failed to become a ${role}.`);
    } finally {
      setIsLoading(false);
    }
  };

  const hasClientRole = roles.includes('client');
  const hasCoachRole = roles.includes('coach');

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Account Roles</h1>
      <p className="text-gray-600 mb-6">Add new roles to your account to expand your capabilities on the platform.</p>

      {error && <p className="text-red-500 text-center mb-4">{error}</p>}
      {success && <p className="text-green-500 text-center mb-4">{success}</p>}

      <div className="space-y-4">
        {/* Card for becoming a Client */}
        {!hasClientRole && (
          <div className="border border-gray-200 rounded-lg p-6 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold flex items-center">
                <Icon name="User" className="mr-2" />
                Become a Client
              </h2>
              <p className="text-gray-500 mt-1">Find coaches and start your personal growth journey.</p>
            </div>
            <Button 
              onClick={() => handleAddRole('client')}
              disabled={isLoading}
            >
              {isLoading ? 'Adding...' : 'Add Client Role'}
            </Button>
          </div>
        )}

        {/* Card for becoming a Coach */}
        {!hasCoachRole && (
          <div className="border border-gray-200 rounded-lg p-6 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold flex items-center">
                <Icon name="Briefcase" className="mr-2" />
                Become a Coach
              </h2>
              <p className="text-gray-500 mt-1">Start your own coaching business and manage clients.</p>
            </div>
            <Button 
              onClick={() => handleAddRole('coach')}
              disabled={isLoading}
            >
              {isLoading ? 'Adding...' : 'Add Coach Role'}
            </Button>
          </div>
        )}

        {/* Message shown when user has both roles */}
        {hasClientRole && hasCoachRole && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
            <h2 className="text-lg font-semibold text-green-800 flex items-center justify-center">
              <Icon name="CheckCircle" className="mr-2" />
              You have all available roles!
            </h2>
            <p className="text-green-700 mt-1">You can now switch between your Client and Coach dashboards using the switcher in the sidebar.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountSettings;