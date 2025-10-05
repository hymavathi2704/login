import React, { useState } from 'react';
import Icon from '@/components/AppIcon';
import Button from '@/components/ui/Button';

const ServicesSection = ({ coach, onServiceClick }) => {
  const [activeTab, setActiveTab] = useState('sessions');

  const tabs = [
    { id: 'sessions', label: 'One-on-One Sessions', icon: 'User' },
    { id: 'events', label: 'Events & Workshops', icon: 'Users' }
  ];

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    })?.format(price);
  };

  const formatDuration = (minutes) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  return (
    <div className="bg-card rounded-card p-6 shadow-soft">
      <h2 className="text-2xl font-heading font-semibold text-foreground mb-6">
        Services & Offerings
      </h2>
      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 bg-muted rounded-soft p-1">
        {tabs?.map((tab) => (
          <button
            key={tab?.id}
            onClick={() => setActiveTab(tab?.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-soft text-sm font-medium transition-smooth flex-1 justify-center ${
              activeTab === tab?.id
                ? 'bg-card text-foreground shadow-soft'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon name={tab?.icon} size={16} />
            <span>{tab?.label}</span>
          </button>
        ))}
      </div>
      {/* Tab Content */}
      <div className="min-h-[300px]">
        {activeTab === 'sessions' && (
          <div className="space-y-4">
            {coach?.sessions && coach?.sessions?.length > 0 ? (
              coach?.sessions?.map((session) => (
                <div
                  key={session?.id}
                  className="border border-border rounded-card p-4 hover:shadow-soft transition-smooth cursor-pointer"
                  onClick={() => onServiceClick('session', session)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground mb-1">
                        {session?.title}
                      </h3>
                      <p className="text-muted-foreground text-sm mb-2">
                        {session?.description}
                      </p>
                    </div>
                    <div className="text-right ml-4">
                      <div className="text-lg font-bold text-primary">
                        {formatPrice(session?.price)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {formatDuration(session?.duration)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Icon name="Clock" size={14} />
                        <span>{formatDuration(session?.duration)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Icon name="Video" size={14} />
                        <span>{session?.format}</span>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      iconName="ArrowRight"
                      iconPosition="right"
                    >
                      Book Now
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <Icon name="Calendar" size={48} className="text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No sessions available at the moment.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'events' && (
          <div className="space-y-4">
            {coach?.events && coach?.events?.length > 0 ? (
              coach?.events?.map((event) => (
                <div
                  key={event?.id}
                  className="border border-border rounded-card p-4 hover:shadow-soft transition-smooth cursor-pointer"
                  onClick={() => onServiceClick('event', event)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground mb-1">
                        {event?.title}
                      </h3>
                      <p className="text-muted-foreground text-sm mb-2">
                        {event?.description}
                      </p>
                    </div>
                    <div className="text-right ml-4">
                      <div className="text-lg font-bold text-primary">
                        {formatPrice(event?.price)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {event?.maxParticipants} spots
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Icon name="Calendar" size={14} />
                        <span>{new Date(event.date)?.toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Icon name="Clock" size={14} />
                        <span>{event?.time}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Icon name="Users" size={14} />
                        <span>{event?.enrolledCount}/{event?.maxParticipants}</span>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      iconName="ArrowRight"
                      iconPosition="right"
                      disabled={event?.enrolledCount >= event?.maxParticipants}
                    >
                      {event?.enrolledCount >= event?.maxParticipants ? 'Full' : 'Register'}
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <Icon name="Users" size={48} className="text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No upcoming events or workshops.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ServicesSection;