// Frontend/src/pages/user-registration/components/SocialLoginButtons.jsx
import React from 'react';
import { useAuth0 } from '@auth0/auth0-react'; // <-- New import
import Icon from '../../../components/AppIcon';

const SocialLoginButtons = ({ onSocialLogin, isLoading }) => {
  const { loginWithRedirect } = useAuth0();

  const socialProviders = [
    {
      id: 'google',
      name: 'Google',
      icon: 'Chrome',
      bgColor: 'bg-white',
      textColor: 'text-gray-700',
      borderColor: 'border-gray-300',
      hoverBg: 'hover:bg-gray-50'
    },
    {
      id: 'github',
      name: 'GitHub',
      icon: 'Github',
      bgColor: 'bg-gray-900',
      textColor: 'text-white',
      borderColor: 'border-gray-900',
      hoverBg: 'hover:bg-gray-800'
    }
  ];

  const handleSocialLogin = (provider) => {
    console.log(`Initiating ${provider} OAuth login`);
    // Auth0 handles the OAuth flow automatically
    loginWithRedirect({
      connection: provider === 'google' ? 'google-oauth2' : 'github'
    });
  };

  return (
    <div className="space-y-4">
      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-card text-muted-foreground">Or continue with</span>
        </div>
      </div>
      {/* Social Login Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {socialProviders?.map((provider) => (
          <button
            key={provider?.id}
            type="button"
            onClick={() => handleSocialLogin(provider?.id)}
            disabled={isLoading}
            className={`
              flex items-center justify-center px-4 py-3 border rounded-lg font-medium text-sm
              transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
              ${provider?.bgColor} ${provider?.textColor} ${provider?.borderColor} ${provider?.hoverBg}
              focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
              shadow-soft hover:shadow-soft-md
            `}
          >
            <Icon
              name={provider?.icon}
              size={20}
              className="mr-3"
              color={provider?.id === 'google' ? '#4285f4' : 'currentColor'}
            />
            <span>Sign up with {provider?.name}</span>
          </button>
        ))}
      </div>
      {/* Security Notice */}
      <div className="mt-4 p-3 bg-muted rounded-lg">
        <div className="flex items-start space-x-2">
          <Icon name="Shield" size={16} className="text-primary mt-0.5 flex-shrink-0" />
          <p className="text-xs text-muted-foreground">
            Your information is secure and protected. We never share your data with third parties.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SocialLoginButtons;