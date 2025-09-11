import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const TroubleshootingGuide = ({ onContactSupport }) => {
  const [expandedSection, setExpandedSection] = useState(null);

  const troubleshootingSteps = [
    {
      id: 'spam',
      title: 'Check Your Spam Folder',
      icon: 'AlertTriangle',
      content: `Sometimes verification emails end up in spam or junk folders. Please check these folders and mark our email as "not spam" if found.`
    },
    {
      id: 'delay',
      title: 'Email Delivery Delays',
      icon: 'Clock',
      content: `Email delivery can take up to 10 minutes. If you haven't received it yet, please wait a few more minutes before requesting a new one.`
    },
    {
      id: 'correct',title: 'Verify Email Address',icon: 'Mail',
      content: `Make sure you entered the correct email address during registration. If not, you may need to register again with the correct email.`
    },
    {
      id: 'filters',title: 'Email Filters & Blocking',icon: 'Shield',
      content: `Check if your email provider has filters that might be blocking our emails. Add our domain to your safe sender list.`
    }
  ];

  const toggleSection = (sectionId) => {
    setExpandedSection(expandedSection === sectionId ? null : sectionId);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-warning/10 rounded-full flex items-center justify-center mx-auto mb-3">
            <Icon name="HelpCircle" size={24} color="var(--color-warning)" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Need Help?
          </h3>
          <p className="text-sm text-muted-foreground">
            If you're having trouble receiving your verification email, try these solutions:
          </p>
        </div>

        <div className="space-y-3">
          {troubleshootingSteps?.map((step) => (
            <div key={step?.id} className="border border-border rounded-lg">
              <button
                onClick={() => toggleSection(step?.id)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Icon name={step?.icon} size={16} color="var(--color-primary)" />
                  </div>
                  <span className="font-medium text-foreground">{step?.title}</span>
                </div>
                <Icon 
                  name={expandedSection === step?.id ? "ChevronUp" : "ChevronDown"} 
                  size={20} 
                  color="var(--color-muted-foreground)" 
                />
              </button>
              
              {expandedSection === step?.id && (
                <div className="px-4 pb-4">
                  <div className="pl-11">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {step?.content}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 pt-6 border-t border-border text-center">
          <p className="text-sm text-muted-foreground mb-4">
            Still having issues? Our support team is here to help.
          </p>
          <Button
            variant="outline"
            onClick={onContactSupport}
            iconName="MessageCircle"
            iconPosition="left"
          >
            Contact Support
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TroubleshootingGuide;