import React from 'react';
import RoleCard from './RoleCard';

const RoleSelectionSection = () => {
  const roles = [
    {
      id: 'coach',
      title: 'Coach',
      description: 'Manage clients, create events, and grow your coaching business',
      icon: 'Users',
      iconBgColor: 'bg-gradient-to-r from-purple-500 to-pink-500',
      loginPath: '/dashboard/coach',
      signupPath: '/user-registration?role=coach'
    },
    {
      id: 'client',
      title: 'Client',
      description: 'Book sessions, access resources, and track your progress',
      icon: 'User',
      iconBgColor: 'bg-gradient-to-r from-blue-500 to-cyan-500',
      loginPath: '/dashboard/client',
      signupPath: '/user-registration?role=client'
    },
    {
      id: 'admin',
      title: 'Platform Admin',
      description: 'Manage platform users, analytics, and system settings',
      icon: 'Shield',
      iconBgColor: 'bg-gradient-to-r from-red-500 to-orange-500',
      loginPath: '/dashboard/admin',
      signupPath: '/user-registration?role=admin'
    }
  ];

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-3">
          Choose Your Role
        </h2>
        <p className="text-gray-600 text-lg">
          Select how you'll be using The Katha to get started with the right dashboard and features.
        </p>
      </div>

      <div className="space-y-4">
        {roles.map((role) => (
          <RoleCard key={role.id} role={role} />
        ))}
      </div>

      <div className="text-center mt-8 pt-6 border-t border-gray-100">
        <p className="text-sm text-gray-500 mb-4">
          Don't have an account yet?
        </p>
        <a
          href="/user-registration"
          className="inline-flex items-center px-6 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium"
        >
          Create New Account
        </a>
      </div>
    </div>
  );
};

export default RoleSelectionSection;