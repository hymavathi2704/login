import React from 'react';
import { Helmet } from 'react-helmet';
import Header from '../../components/ui/Header';
import HeroSection from './components/HeroSection';
import FeaturesSection from './components/FeaturesSection';
import TestimonialsSection from './components/TestimonialsSection';
import CallToActionSection from './components/CallToActionSection';

const Homepage = () => {
  return (
    <>
      <Helmet>
        <title>The Katha - Transform Your Coaching Into a Thriving Business</title>
        <meta 
          name="description" 
          content="The all-in-one platform for independent coaches to manage clients, automate scheduling, and grow their online presence. Join 2,500+ successful coaches today." 
        />
        <meta name="keywords" content="coaching platform, client management, scheduling automation, business growth, independent coaches" />
        <meta property="og:title" content="The Katha - Transform Your Coaching Into a Thriving Business" />
        <meta property="og:description" content="Streamline your coaching business with powerful tools designed for success. Start your free trial today." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="/homepage" />
      </Helmet>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <Header isAuthenticated={false} />

        {/* Main Content */}
        <main className="pt-16">
          {/* Hero Section */}
          <HeroSection />

          {/* Features Section */}
          <FeaturesSection />

          {/* Testimonials Section */}
          <TestimonialsSection />

          {/* Call to Action Section */}
          <CallToActionSection />
        </main>

        {/* Footer */}
        <footer className="bg-foreground text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {/* Company Info */}
              <div className="md:col-span-2">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">TK</span>
                  </div>
                  <span className="text-xl font-semibold">The Katha</span>
                </div>
                <p className="text-white/80 mb-4 max-w-md">
                  Empowering independent coaches worldwide with the tools they need to build, 
                  manage, and grow successful coaching practices.
                </p>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-sm text-white/80">
                    <span>📧 thekatha@flow.com</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-white/80">
                    <span>📞 +91 XXXXXXXXXX</span>
                  </div>
                </div>
              </div>

              {/* Quick Links */}
              <div>
                <h4 className="font-semibold mb-4">Platform</h4>
                <ul className="space-y-2 text-white/80">
                  <li><a href="#features" className="hover:text-white transition-smooth">Features</a></li>
                  <li><a href="#pricing" className="hover:text-white transition-smooth">Pricing</a></li>
                  <li><a href="#testimonials" className="hover:text-white transition-smooth">Testimonials</a></li>
                  <li><a href="#demo" className="hover:text-white transition-smooth">Demo</a></li>
                </ul>
              </div>

              {/* Support */}
              <div>
                <h4 className="font-semibold mb-4">Support</h4>
                <ul className="space-y-2 text-white/80">
                  <li><a href="#help" className="hover:text-white transition-smooth">Help Center</a></li>
                  <li><a href="#contact" className="hover:text-white transition-smooth">Contact Us</a></li>
                  <li><a href="#privacy" className="hover:text-white transition-smooth">Privacy Policy</a></li>
                  <li><a href="#terms" className="hover:text-white transition-smooth">Terms of Service</a></li>
                </ul>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-white/20 mt-8 pt-8 flex flex-col md:flex-row items-center justify-between">
              <p className="text-white/80 text-sm">
                © {new Date()?.getFullYear()} The Katha. All rights reserved.
              </p>
              <div className="flex items-center gap-6 mt-4 md:mt-0">
                <div className="flex items-center gap-2 text-sm text-white/80">
                  <span>🔒 SSL Secured</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-white/80">
                  <span>⭐ 4.9/5 Rating</span>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Homepage;