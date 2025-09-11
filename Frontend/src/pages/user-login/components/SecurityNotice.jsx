import React from 'react';
import Icon from '../../../components/AppIcon';

const SecurityNotice = ({ attemptCount, isRateLimited, nextAttemptTime }) => {
  if (attemptCount < 3 && !isRateLimited) return null;

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  return (
    <div className="bg-warning/10 border border-warning/20 rounded-lg p-4 mb-6">
      <div className="flex items-start">
        <Icon name="Shield" size={20} className="text-warning mr-3 mt-0.5" />
        <div className="flex-1">
          <h3 className="text-sm font-medium text-warning mb-1">
            Security Notice
          </h3>
          {isRateLimited ? (
            <p className="text-sm text-warning/80">
              Too many failed attempts. Please wait {formatTime(nextAttemptTime)} before trying again.
            </p>
          ) : (
            <p className="text-sm text-warning/80">
              Multiple failed login attempts detected. Additional security verification may be required.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SecurityNotice;