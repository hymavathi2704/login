import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Header from "../../components/ui/Header";
import RegistrationForm from "./components/RegistrationForm";
import SocialLoginButtons from "./components/SocialLoginButtons";
import CaptchaVerification from "./components/CaptchaVerification";
import RegistrationSuccess from "./components/RegistrationSuccess";
import Icon from "../../components/AppIcon";
import { registerUser } from "../../auth/authApi";

const UserRegistration = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const role = searchParams.get("role") || "client";

  const [isLoading, setIsLoading] = useState(false);
  const [showCaptcha, setShowCaptcha] = useState(false);
  const [registrationStep, setRegistrationStep] = useState("form");
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [rateLimitMessage, setRateLimitMessage] = useState("");
  const [formDataForCaptcha, setFormDataForCaptcha] = useState(null);
  const [isResendingEmail, setIsResendingEmail] = useState(false);

  const handleFormSubmit = async (formData) => {
    // Parse full name into first and last name
    const [firstName, ...lastNameParts] = formData.fullName.split(' ');
    const lastName = lastNameParts.join(' ');

    setFormDataForCaptcha({ ...formData, firstName, lastName, role });
    setShowCaptcha(true);
  };

  const handleCaptchaVerification = async (captchaResponse) => {
    setShowCaptcha(false);
    setIsLoading(true);
    setRateLimitMessage("");

    if (!formDataForCaptcha) {
      setRateLimitMessage("An error occurred. Please try again.");
      setIsLoading(false);
      return;
    }

    const { firstName, lastName, email, password, role } = formDataForCaptcha;

    try {
      const response = await registerUser({
        firstName, // Use firstName
        lastName, // Use lastName
        email,
        password,
        role,
        captcha: captchaResponse,
      });

      if (response?.status === 201 || response?.status === 200) {
        navigate(`/email-verification?email=${encodeURIComponent(email)}`);
      }
    } catch (error) {
      console.error("Registration error:", error.response?.data);
      setRateLimitMessage(
        error.response?.data?.error || "Registration failed. Please try again."
      );
    } finally {
      setIsLoading(false);
      setFormDataForCaptcha(null);
    }
  };
  const handleSocialLogin = async (provider) => {
    setIsLoading(true);

    try {
      // Simulating OAuth flow - This would eventually connect to a backend endpoint
      await new Promise((resolve) => setTimeout(resolve, 1500));
      const mockEmail = `user@${provider}.com`;
      setRegisteredEmail(mockEmail);
      setRegistrationStep("success");
    } catch (error) {
      console.error(`${provider} registration error:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setIsResendingEmail(true);
    try {
      // This would call your backend's resend verification email endpoint
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log("Verification email resent to:", registeredEmail);
    } catch (error) {
      console.error("Resend verification error:", error);
    } finally {
      setIsResendingEmail(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-md w-full space-y-8">
            {registrationStep === "form" ? (
              <>
                <div className="text-center">
                  <div className="mx-auto w-12 h-12 bg-primary rounded-lg flex items-center justify-center mb-4">
                    <Icon name="UserPlus" size={24} color="white" />
                  </div>
                  <h1 className="text-3xl font-bold text-foreground">
                    Create Your Account
                  </h1>
                  <p className="mt-2 text-muted-foreground">
                    Join thousands of coaches building their online presence
                  </p>
                </div>
                {rateLimitMessage && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <Icon name="AlertTriangle" size={16} className="text-red-600" />
                      <p className="text-sm text-red-700">{rateLimitMessage}</p>
                    </div>
                  </div>
                )}
                <div className="bg-card shadow-soft-lg rounded-lg p-8">
                  <RegistrationForm
                    onSubmit={handleFormSubmit}
                    isLoading={isLoading}
                  />
                  <div className="mt-8">
                    <SocialLoginButtons
                      onSocialLogin={handleSocialLogin}
                      isLoading={isLoading}
                    />
                  </div>
                </div>
                <div className="bg-muted rounded-lg p-4">
                  <div className="flex items-center justify-center space-x-6 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Icon name="Shield" size={14} />
                      <span>SSL Secured</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Icon name="Lock" size={14} />
                      <span>GDPR Compliant</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Icon name="Eye" size={14} />
                      <span>Privacy Protected</span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-card shadow-soft-lg rounded-lg p-8">
                <RegistrationSuccess
                  userEmail={registeredEmail}
                  onResendVerification={handleResendVerification}
                  isResending={isResendingEmail}
                />
              </div>
            )}
          </div>
        </div>
      </main>
      <CaptchaVerification
        isVisible={showCaptcha}
        onVerify={handleCaptchaVerification}
        onClose={() => setShowCaptcha(false)}
      />
    </div>
  );
};

export default UserRegistration;