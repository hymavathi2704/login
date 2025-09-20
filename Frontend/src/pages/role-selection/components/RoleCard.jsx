import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const RoleCard = ({ role }) => {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);

  const handleRoleSelect = (path) => {
    navigate(path);
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="border border-gray-200 rounded-xl hover:border-gray-300 transition-all duration-200 hover:shadow-lg">
      {/* Main Role Card */}
      <div 
        className="p-6 cursor-pointer"
        onClick={toggleExpanded}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Role Icon */}
            <div className={`w-14 h-14 ${role?.iconBgColor} rounded-full flex items-center justify-center`}>
              <Icon 
                name={role?.icon} 
                size={24} 
                className="text-white" 
                strokeWidth={2}
              />
            </div>

            {/* Role Info */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-1">
                {role?.title}
              </h3>
              <p className="text-gray-600">
                {role?.description}
              </p>
            </div>
          </div>

          {/* Arrow Indicator */}
          <div className="flex items-center">
            <Icon 
              name={isExpanded ? "ChevronUp" : "ChevronRight"} 
              size={20} 
              className="text-gray-400"
              strokeWidth={2}
            />
          </div>
        </div>
      </div>

      {/* Expanded Actions */}
      {isExpanded && (
        <div className="px-6 pb-6 border-t border-gray-100">
          <div className="pt-4">
            <p className="text-sm text-gray-600 mb-4">
              {role?.id === 'coach' && "Access your coaching dashboard, manage clients, schedule sessions, and grow your business."}
              {role?.id === 'client' && "Book sessions with your coach, access resources, and track your progress."}
              {role?.id === 'admin' && "Manage platform settings, user accounts, and system administration."}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="default"
                size="sm"
                className="flex-1"
                onClick={() => handleRoleSelect(role?.loginPath)}
              >
                Login as {role?.title}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => handleRoleSelect(role?.signupPath)}
              >
                Sign Up as {role?.title}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoleCard;