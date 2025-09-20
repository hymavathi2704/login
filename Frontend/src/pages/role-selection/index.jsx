import React from 'react';
import { Helmet } from 'react-helmet';
import Header from '../../components/ui/Header';
import RoleSelectionSection from './components/RoleSelectionSection';
import BrandingSection from './components/BrandingSection';

const RoleSelection = () => {
  return (
    <>
      <Helmet>
        <title>Choose Your Role - The Katha</title>
        <meta 
          name="description" 
          content="Select your role on The Katha
           - Coach, Client, or Platform Admin. Join thousands of successful coaches managing their business with our all-in-one platform." 
        />
        <meta name="keywords" content="role selection, coach platform, client access, admin dashboard, coaching business" />
        <meta property="og:title" content="Choose Your Role - The Katha" />
        <meta property="og:description" content="Select how you'll be using The Katha to get started with the right dashboard and features." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="/role-selection" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600">
        {/* Header */}
        <Header isAuthenticated={false} />

        {/* Main Content */}
        <main className="pt-16 min-h-screen">
          <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-7xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                {/* Left Side - Branding */}
                <BrandingSection />

                {/* Right Side - Role Selection */}
                <RoleSelectionSection />
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default RoleSelection;