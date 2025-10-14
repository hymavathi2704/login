// Frontend/src/pages/user-login/components/SocialLoginButtons.jsx
import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import Icon from '../../../components/AppIcon';

const SocialLoginButtons = ({ isLoading }) => {
  // ⚠️ TEMPORARILY DISABLED SOCIAL LOGIN UI
  /*
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
    }
  ];

  const handleSocialLogin = (provider) => {
    // Auth0 handles the OAuth flow automatically
    loginWithRedirect({
      connection: 'google-oauth2' // Auth0 connection name for Google
    });
  };

  return (
    <div className="space-y-3">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-card text-muted-foreground">Or continue with</span>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3">
        {socialProviders?.map((provider) => (
          <button
            key={provider?.id}
            type="button"
            onClick={() => handleSocialLogin(provider?.id)}
            disabled={isLoading}
            className={`
              w-full inline-flex justify-center items-center px-4 py-2.5 border rounded-lg text-sm font-medium
              transition-smooth focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2
              disabled:opacity-50 disabled:cursor-not-allowed
              ${provider?.bgColor} ${provider?.textColor} ${provider?.borderColor} ${provider?.hoverBg}
            `}
          >
            <Icon
              name={provider?.icon}
              size={18}
              className="mr-2"
              color={provider?.id === 'google' ? '#4285f4' : 'currentColor'}
            />
            Sign in with {provider?.name}
          </button>
        ))}
      </div>
    </div>
  );
  */
 return null; // <--- ADDED: Hide the component entirely
};

export default SocialLoginButtons;