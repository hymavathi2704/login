import React from 'react';
import Icon from '@/components/AppIcon';

const AboutSection = ({ coach }) => {
  return (
    <div className="bg-card rounded-card p-6 shadow-soft">
      <h2 className="text-2xl font-heading font-semibold text-foreground mb-6">
        About the Coach
      </h2>
      {/* Biography */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-foreground mb-3">Biography</h3>
        <div className="prose prose-gray max-w-none">
          <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
            {coach?.fullBio}
          </p>
        </div>
      </div>
      {/* Specialties */}
      {coach?.specialties && coach?.specialties?.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-foreground mb-4">Specialties</h3>
          <div className="flex flex-wrap gap-2">
            {coach?.specialties?.map((specialty, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary border border-primary/20"
              >
                <Icon name="CheckCircle" size={14} className="mr-1" />
                {specialty}
              </span>
            ))}
          </div>
        </div>
      )}
      {/* Certifications & Education */}
      {coach?.certifications && coach?.certifications?.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Certifications & Education
          </h3>
          <div className="space-y-4">
            {coach?.certifications?.map((cert, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-success/10 rounded-full flex items-center justify-center mt-1">
                  <Icon name="Award" size={16} className="text-success" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground">{cert?.title}</h4>
                  <p className="text-muted-foreground text-sm">{cert?.institution}</p>
                  {cert?.year && (
                    <p className="text-muted-foreground text-xs mt-1">
                      Obtained: {cert?.year}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Languages */}
      {coach?.languages && coach?.languages?.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-foreground mb-4">Languages</h3>
          <div className="flex flex-wrap gap-2">
            {coach?.languages?.map((language, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 rounded-soft text-sm font-medium bg-muted text-muted-foreground"
              >
                <Icon name="Globe" size={14} className="mr-1" />
                {language}
              </span>
            ))}
          </div>
        </div>
      )}
      {/* Coaching Approach */}
      {coach?.coachingApproach && (
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-3">
            Coaching Approach
          </h3>
          <p className="text-muted-foreground leading-relaxed">
            {coach?.coachingApproach}
          </p>
        </div>
      )}
    </div>
  );
};

export default AboutSection;