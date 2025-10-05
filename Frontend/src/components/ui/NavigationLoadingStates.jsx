import React from 'react';
import Icon from '../AppIcon';
import Button from './Button';

const NavigationLoadingStates = ({ 
  isLoading = false, 
  error = null, 
  retryAction = null,
  loadingType = 'profile' // 'profile', 'search', 'navigation'
}) => {
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <div className="w-16 h-16 bg-error/10 rounded-full flex items-center justify-center mb-4">
          <Icon name="AlertCircle" size={32} className="text-error" />
        </div>
        <h3 className="text-lg font-heading font-semibold text-foreground mb-2">
          {loadingType === 'profile' ? 'Coach Profile Not Found' : 'Something went wrong'}
        </h3>
        <p className="text-muted-foreground text-center mb-6 max-w-md">
          {error || 'We encountered an issue loading the content. Please try again.'}
        </p>
        {retryAction && (
          <Button 
            variant="outline" 
            onClick={retryAction}
            iconName="RefreshCw" 
            iconPosition="left"
          >
            Try Again
          </Button>
        )}
      </div>
    );
  }

  if (!isLoading) return null;

  if (loadingType === 'profile') {
    return (
      <div className="animate-pulse">
        {/* Profile Header Skeleton */}
        <div className="bg-card rounded-card p-6 mb-6 shadow-soft">
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <div className="w-24 h-24 bg-muted rounded-full"></div>
            <div className="flex-1 space-y-3">
              <div className="h-8 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
              <div className="flex space-x-2">
                <div className="h-6 bg-muted rounded w-16"></div>
                <div className="h-6 bg-muted rounded w-20"></div>
              </div>
            </div>
            <div className="flex flex-col space-y-2">
              <div className="h-10 bg-muted rounded w-32"></div>
              <div className="h-8 bg-muted rounded w-28"></div>
            </div>
          </div>
        </div>
        {/* Content Sections Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {[1, 2, 3]?.map((section) => (
              <div key={section} className="bg-card rounded-card p-6 shadow-soft">
                <div className="h-6 bg-muted rounded w-1/3 mb-4"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-muted rounded w-full"></div>
                  <div className="h-4 bg-muted rounded w-5/6"></div>
                  <div className="h-4 bg-muted rounded w-4/5"></div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="space-y-6">
            <div className="bg-card rounded-card p-6 shadow-soft">
              <div className="h-6 bg-muted rounded w-1/2 mb-4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded w-full"></div>
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loadingType === 'search') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
        {[1, 2, 3, 4, 5, 6]?.map((card) => (
          <div key={card} className="bg-card rounded-card p-6 shadow-soft">
            <div className="flex items-start space-x-4 mb-4">
              <div className="w-16 h-16 bg-muted rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-5 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </div>
            </div>
            <div className="space-y-2 mb-4">
              <div className="h-4 bg-muted rounded w-full"></div>
              <div className="h-4 bg-muted rounded w-5/6"></div>
            </div>
            <div className="flex justify-between items-center">
              <div className="h-6 bg-muted rounded w-20"></div>
              <div className="h-8 bg-muted rounded w-24"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Default navigation loading
  return (
    <div className="flex items-center justify-center py-8">
      <div className="flex items-center space-x-3">
        <div className="animate-spin">
          <Icon name="Loader2" size={24} className="text-primary" />
        </div>
        <span className="text-muted-foreground font-medium">Loading...</span>
      </div>
    </div>
  );
};

export default NavigationLoadingStates;