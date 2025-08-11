'use client';

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { auth } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { trackUserLogin, getStoredUTMParams } from "@/lib/analytics";
import { initiateGoogleLogin } from "@/lib/oauth/google";
import { useLanguage } from "@/contexts/language-context";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess?: (userData: any) => void;
  onCreateAccount?: () => void;
}

export function LoginModal({ isOpen, onClose, onLoginSuccess, onCreateAccount }: LoginModalProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      let userData;
      if (isSignUp) {
        // Validate required fields for signup
        if (!firstName || !lastName || !phoneNumber) {
          setError(t.fillAllFields);
          setIsLoading(false);
          return;
        }
        // Registration
        userData = await auth.register(firstName, lastName, email, password, phoneNumber);
      } else {
        // Login
        userData = await auth.login(email, password);
      }

      toast({
        title: isSignUp ? t.registrationSuccess : t.loginSuccess,
        description: isSignUp ? t.accountCreated : t.nowLoggedIn
      });

      // Track successful login/registration
      const utmParams = getStoredUTMParams() || {};
      trackUserLogin('email', utmParams);

      // Call success callback
      if (onLoginSuccess) {
        onLoginSuccess(userData);
      }

      onClose();
    } catch (error) {
      console.error(`${isSignUp ? 'Registration' : 'Login'} failed:`, error);
      
      // Extract specific error message from the error object
      let errorMessage = `${isSignUp ? 'Registration' : 'Login'} failed. Please try again.`;
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      setError(errorMessage);
      
      toast({
        title: `${isSignUp ? 'Registration' : 'Login'} Failed`,
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    try {
      // Store current URL as the return destination after OAuth
      const currentPath = window.location.pathname;
      
      // Store the return URL
      localStorage.setItem('oauth_return_url', currentPath);
      
      // Start Google OAuth flow
      initiateGoogleLogin();
    } catch (error) {
      const errorMessage = "Failed to start Google login. Please try again.";
      setError(errorMessage);
      
      toast({
        title: "Login Failed",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px] p-0">
        <div className="p-6 space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold">
              {isSignUp ? t.signupTitle : t.loginTitle}
            </h2>
            <p className="text-lg text-gray-600">
              {t.loginSubtitle}
            </p>
          </div>

          {/* Social Login Buttons */}
          <div className="space-y-3">
            <Button
              type="button"
              variant="outline"
              className="w-full h-11 text-sm font-medium"
              onClick={handleGoogleLogin}
              disabled={isLoading}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              {t.googleButton}
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-sm uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                {t.orContinueWith}
              </span>
            </div>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <>
                <div>
                  <Label htmlFor="firstName" className="text-sm font-medium">{t.firstName}</Label>
                  <Input
                    id="firstName"
                    type="text"
                    placeholder={t.firstName}
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    disabled={isLoading}
                    className="h-11"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName" className="text-sm font-medium">{t.lastName}</Label>
                  <Input
                    id="lastName"
                    type="text"
                    placeholder={t.lastName}
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    disabled={isLoading}
                    className="h-11"
                  />
                </div>
                <div>
                  <Label htmlFor="phoneNumber" className="text-sm font-medium">{t.phoneNumber}</Label>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    placeholder={t.phoneNumber}
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    required
                    disabled={isLoading}
                    className="h-11"
                  />
                </div>
              </>
            )}
            <div>
              <Label htmlFor="email" className="text-sm font-medium">{t.email}</Label>
              <Input
                id="email"
                type="email"
                placeholder={t.email}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="h-11"
              />
            </div>
            <div>
              <Label htmlFor="password" className="text-sm font-medium">{t.password}</Label>
              <Input
                id="password"
                type="password"
                placeholder={t.password}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                className="h-11"
                minLength={8}
              />
            </div>

            {error && (
              <div className="text-red-600 text-lg bg-red-50 p-3 rounded-md border border-red-200">
                {error}
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full h-11 bg-black hover:bg-gray-800 text-white font-medium"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {isSignUp ? t.signupLoading : t.loginLoading}
                </>
              ) : (
                isSignUp ? t.signupButton : t.loginButton
              )}
            </Button>
          </form>

          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError(null);
                setFirstName("");
                setLastName("");
                setEmail("");
                setPassword("");
                setPhoneNumber("");
              }}
              className="text-blue-600 hover:text-blue-800 font-medium"
              disabled={isLoading}
            >
              {isSignUp ? t.switchToLogin : t.switchToSignup}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 