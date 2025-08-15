'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/language-context';
import { auth } from '@/lib/api';

export function MigrateForm() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobile: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Use the existing auth.register function
      const result = await auth.register(
        formData.firstName, 
        formData.lastName, 
        formData.email, 
        formData.password, 
        formData.mobile
      );

      toast({
        title: "Migration request submitted successfully!",
        description: "You can now start using buycycle and log-in with the password you just created. Welcome to buycycle!",
      });

      // Set success state
      setIsSuccess(true);

      // Redirect after 3 seconds in the same window
      setTimeout(() => {
        window.location.href = 'https://buycycle.com/sell/?utm_source=everide&utm_medium=redirect&utm_campaign=CT';
      }, 5000);

      // Reset form
      setFormData({ firstName: '', lastName: '', email: '', mobile: '', password: '' });
      
    } catch (error) {
      console.error('Migration failed:', error);
      toast({
        title: "Migration Failed",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    // Validate name fields to only allow letters, spaces, hyphens, and apostrophes
    if (field === 'firstName' || field === 'lastName') {
      const nameRegex = /^[a-zA-ZÀ-ÿ\s'-]*$/;
      if (!nameRegex.test(value)) {
        return; // Don't update if invalid characters
      }
    }
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <section id="migrate-section" className="pt-16 pb-8 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-4xl w-full">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                {t.migrateTitle}
              </h2>
              <p className="text-lg text-gray-600">
                {t.migrateSubtitle}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">
                    {t.firstName}
                  </Label>
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="Joe"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    required
                    disabled={isLoading}
                    className="mt-1"
                    pattern="[a-zA-ZÀ-ÿ\s'-]+"
                    title="Please enter a valid first name (letters, spaces, hyphens, and apostrophes only)"
                  />
                </div>

                <div>
                  <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">
                    {t.lastName}
                  </Label>
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    required
                    disabled={isLoading}
                    className="mt-1"
                    pattern="[a-zA-ZÀ-ÿ\s'-]+"
                    title="Please enter a valid last name (letters, spaces, hyphens, and apostrophes only)"
                  />
                </div>

                <div>
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    {t.emailLabel}
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="janedoe@email.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    required
                    disabled={isLoading}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="mobile" className="text-sm font-medium text-gray-700">
                    {t.mobileLabel}
                  </Label>
                  <Input
                    id="mobile"
                    type="tel"
                    placeholder="Mobile Number"
                    value={formData.mobile}
                    onChange={(e) => handleInputChange('mobile', e.target.value)}
                    required
                    disabled={isLoading}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                    {t.passwordLabel}
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Example@123"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    required
                    disabled={isLoading}
                    className="mt-1"
                    minLength={8}
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className={`w-full font-medium py-3 mt-6 ${
                  isSuccess 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-black hover:bg-gray-800'
                } text-white`}
                disabled={isLoading || isSuccess}
              >
                {isSuccess ? (
                  'SUCCESS! - WELCOME TO BUYCYCLE'
                ) : isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    SUBMITTING...
                  </>
                ) : (
                  t.migrateButton.toUpperCase()
                )}
              </Button>
            </form>

            <div className="mt-4 text-center">
              <p className="text-sm text-gray-500">
                {t.alreadyHaveAccount}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
