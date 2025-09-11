import React from 'react';
import Icon from '../../../components/AppIcon';

const VerificationStatus = ({ status, message, progress }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'pending':
        return {
          icon: 'Clock',
          color: 'var(--color-warning)',
          bgColor: 'bg-warning/10',
          borderColor: 'border-warning/20',
          title: 'Verification Pending'
        };
      case 'success':
        return {
          icon: 'CheckCircle',
          color: 'var(--color-success)',
          bgColor: 'bg-success/10',
          borderColor: 'border-success/20',
          title: 'Email Verified'
        };
      case 'error':
        return {
          icon: 'XCircle',
          color: 'var(--color-error)',
          bgColor: 'bg-error/10',
          borderColor: 'border-error/20',
          title: 'Verification Failed'
        };
      case 'expired':
        return {
          icon: 'AlertTriangle',
          color: 'var(--color-warning)',
          bgColor: 'bg-warning/10',
          borderColor: 'border-warning/20',
          title: 'Code Expired'
        };
      default:
        return {
          icon: 'Info',
          color: 'var(--color-primary)',
          bgColor: 'bg-primary/10',
          borderColor: 'border-primary/20',
          title: 'Verification Required'
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className="w-full max-w-md mx-auto">
      <div className={`${config?.bgColor} ${config?.borderColor} border rounded-lg p-6`}>
        <div className="text-center">
          <div className="w-16 h-16 bg-card rounded-full flex items-center justify-center mx-auto mb-4 shadow-soft">
            <Icon name={config?.icon} size={32} color={config?.color} />
          </div>
          
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {config?.title}
          </h3>
          
          {message && (
            <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
              {message}
            </p>
          )}

          {/* Progress Indicator */}
          {progress !== undefined && (
            <div className="mb-4">
              <div className="flex justify-between text-xs text-muted-foreground mb-2">
                <span>Progress</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Status Steps */}
          <div className="flex items-center justify-center space-x-2 text-xs">
            <div className={`flex items-center space-x-1 ${
              status === 'pending' || status === 'success' ? 'text-success' : 'text-muted-foreground'
            }`}>
              <Icon 
                name={status === 'success' ? 'CheckCircle' : 'Circle'} 
                size={12} 
                color="currentColor" 
              />
              <span>Email Sent</span>
            </div>
            
            <div className="w-4 h-px bg-border" />
            
            <div className={`flex items-center space-x-1 ${
              status === 'success' ? 'text-success' : 'text-muted-foreground'
            }`}>
              <Icon 
                name={status === 'success' ? 'CheckCircle' : 'Circle'} 
                size={12} 
                color="currentColor" 
              />
              <span>Verified</span>
            </div>
            
            <div className="w-4 h-px bg-border" />
            
            <div className={`flex items-center space-x-1 ${
              status === 'success' ? 'text-success' : 'text-muted-foreground'
            }`}>
              <Icon 
                name={status === 'success' ? 'CheckCircle' : 'Circle'} 
                size={12} 
                color="currentColor" 
              />
              <span>Complete</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerificationStatus;