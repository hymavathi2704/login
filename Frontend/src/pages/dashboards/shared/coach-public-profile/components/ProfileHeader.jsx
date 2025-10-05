import React from 'react';
import Icon from '@/components/AppIcon';
import Image from '@/components/AppImage';
import Button from '@/components/ui/Button';

const ProfileHeader = ({ coach, onBookSession, onContact }) => {
  const formatRating = (rating) => {
    return rating ? rating?.toFixed(1) : '0.0';
  };

  const formatExperience = (years) => {
    return years === 1 ? '1 year' : `${years} years`;
  };

  return (
    <div className="bg-card rounded-card p-6 mb-6 shadow-soft">
      <div className="flex flex-col lg:flex-row items-start lg:items-center space-y-6 lg:space-y-0 lg:space-x-8">
        {/* Profile Image */}
        <div className="flex-shrink-0">
          <div className="w-32 h-32 lg:w-40 lg:h-40 rounded-full overflow-hidden shadow-elevated">
            <Image
              src={coach?.profileImage}
              alt={`${coach?.name} - Professional Coach`}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Profile Info */}
        <div className="flex-1 min-w-0">
          <div className="mb-4">
            <h1 className="text-3xl lg:text-4xl font-heading font-bold text-foreground mb-2">
              {coach?.name}
            </h1>
            <p className="text-xl text-secondary font-medium mb-3">
              {coach?.title}
            </p>
            <p className="text-muted-foreground leading-relaxed">
              {coach?.shortBio}
            </p>
          </div>

          {/* Key Metrics */}
          <div className="flex flex-wrap items-center gap-6 mb-6">
            <div className="flex items-center space-x-2">
              <div className="flex items-center">
                {[1, 2, 3, 4, 5]?.map((star) => (
                  <Icon
                    key={star}
                    name="Star"
                    size={18}
                    className={`${
                      star <= Math.floor(coach?.rating)
                        ? 'text-warning fill-current' :'text-border'
                    }`}
                  />
                ))}
              </div>
              <span className="font-semibold text-foreground">
                {formatRating(coach?.rating)}
              </span>
              <span className="text-muted-foreground">
                ({coach?.totalReviews} reviews)
              </span>
            </div>

            <div className="flex items-center space-x-2 text-muted-foreground">
              <Icon name="Users" size={18} className="text-primary" />
              <span className="font-medium">
                {coach?.totalClients?.toLocaleString()} clients helped
              </span>
            </div>

            <div className="flex items-center space-x-2 text-muted-foreground">
              <Icon name="Calendar" size={18} className="text-primary" />
              <span className="font-medium">
                {formatExperience(coach?.yearsExperience)} experience
              </span>
            </div>
          </div>

          {/* Contact Information */}
          <div className="flex flex-wrap items-center gap-4 mb-6">
            {coach?.email && (
              <button
                onClick={() => onContact('email', coach?.email)}
                className="flex items-center space-x-2 text-muted-foreground hover:text-primary transition-smooth"
              >
                <Icon name="Mail" size={16} />
                <span className="text-sm font-medium">{coach?.email}</span>
              </button>
            )}
            
            {coach?.phone && (
              <button
                onClick={() => onContact('phone', coach?.phone)}
                className="flex items-center space-x-2 text-muted-foreground hover:text-primary transition-smooth"
              >
                <Icon name="Phone" size={16} />
                <span className="text-sm font-medium">{coach?.phone}</span>
              </button>
            )}

            {coach?.website && (
              <button
                onClick={() => onContact('website', coach?.website)}
                className="flex items-center space-x-2 text-muted-foreground hover:text-primary transition-smooth"
              >
                <Icon name="Globe" size={16} />
                <span className="text-sm font-medium">Website</span>
              </button>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col space-y-3 w-full lg:w-auto">
          <Button
            variant="default"
            size="lg"
            onClick={onBookSession}
            iconName="Calendar"
            iconPosition="left"
            className="w-full lg:w-48"
          >
            Book a Session
          </Button>
          
          <Button
            variant="outline"
            size="default"
            onClick={() => onContact('message')}
            iconName="MessageCircle"
            iconPosition="left"
            className="w-full lg:w-48"
          >
            Send Message
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;