import React from 'react';
import Icon from '@/components/AppIcon';
import { Linkedin, Twitter, Instagram, Facebook } from 'lucide-react';

// Helper function to render a key-value fact
const Fact = ({ label, value }) => (
    value ? (
        <p className="text-sm">
            <span className="font-semibold text-foreground mr-1">{label}:</span>
            <span className="text-muted-foreground">{value}</span>
        </p>
    ) : null
);

// Helper function to safely format social URLs
const formatSocialUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `https://${url}`;
};

// Helper component for rendering a single achievement item
const AchievementItem = ({ item, iconName, iconClass, type }) => {
    // Dynamically map fields based on type (Education uses degree, Certifications use name)
    const title = item?.degree || item?.name;
    const institution = item?.institution || item?.issuer;
    
    if (!title && !institution) return null;

    return (
        <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-8 h-8 bg-success/10 rounded-full flex items-center justify-center mt-1">
                <Icon name={iconName} size={16} className={iconClass} /> 
            </div>
            <div className="flex-1">
                <h4 className="font-semibold text-foreground">{title}</h4>
                <p className="text-muted-foreground text-sm">{institution} {item?.field && type === 'education' && `(${item.field})`}</p>
                {item?.year && (
                    <p className="text-muted-foreground text-xs mt-1">
                        {type === 'education' ? 'Graduated:' : 'Obtained:'} {item?.year}
                    </p>
                )}
            </div>
        </div>
    );
};


const AboutSection = ({ coach }) => {
    // CRITICAL FIX: Ensure all data points are treated as arrays defensively
    const specialties = Array.isArray(coach?.specialties) ? coach.specialties : [];
    const certifications = Array.isArray(coach?.certifications) ? coach.certifications : [];
    const education = Array.isArray(coach?.education) ? coach.education : [];

    const socialLinks = [
        { id: 'linkedinUrl', icon: Linkedin, url: coach?.linkedinUrl },
        { id: 'twitterUrl', icon: Twitter, url: coach?.twitterUrl },
        { id: 'instagramUrl', icon: Instagram, url: coach?.instagramUrl },
        { id: 'facebookUrl', icon: Facebook, url: coach?.facebookUrl },
    ].filter(link => link.url); 

    return (
        <div className="bg-card rounded-card p-6 shadow-soft">
            <h2 className="text-2xl font-heading font-semibold text-foreground mb-6">
                About the Coach
            </h2>

            {/* Biography */}
            <div className="mb-8 border-b pb-6">
                <h3 className="text-lg font-semibold text-foreground mb-3">Biography</h3>
                <div className="prose prose-gray max-w-none">
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                        {coach?.fullBio}
                    </p>
                </div>
            </div>

            {/* Demographics & General Info (Quick Facts) */}
            <div className="mb-8 border-b pb-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Quick Facts</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                    <Fact label="Years of Experience" value={coach?.yearsExperience > 0 ? `${coach.yearsExperience} years` : 'N/A'} />
                    <Fact label="Country" value={coach?.country} />
                    <Fact label="Gender" value={coach?.gender} />
                    <Fact label="Date of Birth" value={coach?.dateOfBirth} />
                    <Fact label="Ethnicity" value={coach?.ethnicity} />
                </div>
            </div>

            {/* Social Links */}
            {socialLinks.length > 0 && (
                <div className="mb-8 border-b pb-6">
                    <h3 className="text-lg font-semibold text-foreground mb-4">Connect</h3>
                    <div className="flex flex-wrap gap-4">
                        {socialLinks.map(({ id, icon: IconComponent, url }) => (
                            <a
                                key={id}
                                href={formatSocialUrl(url)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-muted-foreground hover:text-blue-600 transition-colors flex items-center space-x-2"
                            >
                                <IconComponent size={24} />
                                <span className="sr-only">{id.replace('Url', '')}</span>
                            </a>
                        ))}
                    </div>
                </div>
            )}

            {/* Education Section (FIXED: Separate rendering and data mapping) */}
            {education.length > 0 && (
                <div className="mb-8 border-b pb-6">
                    <h3 className="text-lg font-semibold text-foreground mb-4">Education</h3>
                    <div className="space-y-4">
                        {education.map((item, index) => (
                            <AchievementItem 
                                key={`edu-${index}`} 
                                item={item} 
                                type="education" // Pass type to help with field mapping
                                iconName="BookOpen" 
                                iconClass="text-indigo-500" 
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Certifications Section (FIXED: Separate rendering and data mapping) */}
            {certifications.length > 0 && (
                <div className="mb-8 border-b pb-6">
                    <h3 className="text-lg font-semibold text-foreground mb-4">Certifications</h3>
                    <div className="space-y-4">
                        {certifications.map((item, index) => (
                            <AchievementItem 
                                key={`cert-${index}`} 
                                item={item} 
                                type="certification" // Pass type to help with field mapping
                                iconName="Award" 
                                iconClass="text-success" 
                            />
                        ))}
                    </div>
                </div>
            )}
            
            {/* Specialties */}
            {specialties.length > 0 && (
                <div className="mb-8 pb-6">
                    <h3 className="text-lg font-semibold text-foreground mb-4">Specialties</h3>
                    <div className="flex flex-wrap gap-2">
                        {specialties.map((specialty, index) => (
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

            {/* Coaching Approach */}
            {coach?.coachingApproach && (
                <div className="pt-6">
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