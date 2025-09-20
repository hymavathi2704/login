import React from 'react';
import RoleCard from './RoleCard';

const RoleSelectionSection = () => {
  const roles = [
    {
      id: 'coach',
      title: 'Coach',
      description: 'Manage your coaching business',
      icon: 'Briefcase',
      iconBgColor: 'bg-blue-500',
      loginPath: '/user-login?role=coach',
      signupPath: '/user-registration?role=coach'
    },
    {
      id: 'client',
      title: 'Client',
      description: 'Access coaching sessions & resources',
      icon: 'User',
      iconBgColor: 'bg-blue-300',
      loginPath: '/user-login?role=client',
      signupPath: '/user-registration?role=client'
    },
    {
      id: 'admin',
      title: 'Platform Admin',
      description: 'System administration',
      icon: 'Settings',
      iconBgColor: 'bg-gray-700',
      loginPath: '/user-login?role=admin',
      signupPath: '/user-registration?role=admin'
    }
  ];

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-8 lg:p-12">
      <div className="text-center mb-8">
        <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
          Choose Your Role
        </h2>
        <p className="text-lg text-gray-600">
          Select how you'll be using CoachFlow
        </p>
      </div>

      <div className="space-y-4">
        {roles?.map((role) => (
          <RoleCard 
            key={role?.id}
            role={role}
          />
        ))}
      </div>

      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500">
          Not sure which role to choose?{' '}
          <a href="#" className="text-blue-500 hover:text-blue-600 font-medium">
            Learn more about roles
          </a>
        </p>
      </div>
    </div>
  );
};

export default RoleSelectionSection;