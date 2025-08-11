'use client';

import { useUser } from '@/contexts/user-context';
import { useLoginModal } from '@/contexts/login-modal-context';
import { Button } from '@/components/ui/button';
import { auth } from '@/lib/api';

export default function TestOAuth() {
  const { user, isLoading, refreshUser } = useUser();
  const { openLoginModal } = useLoginModal();

  const handleLogin = () => {
    openLoginModal('/test-oauth');
  };

  const handleLogout = async () => {
    try {
      await auth.logout();
      await refreshUser();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            OAuth Test Page
          </h1>
          
          {user ? (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold text-green-600 mb-4">
                ✅ Logged In Successfully!
              </h2>
              <div className="space-y-2 text-left">
                <p><strong>Name:</strong> {user.name || 'N/A'}</p>
                <p><strong>Email:</strong> {user.email || 'N/A'}</p>
                <p><strong>ID:</strong> {user.id || 'N/A'}</p>
                {user.custom_auth_token && (
                  <p><strong>Custom Token:</strong> {user.custom_auth_token.substring(0, 20)}...</p>
                )}
              </div>
              <Button 
                onClick={handleLogout}
                variant="outline"
                className="mt-4 w-full"
              >
                Logout
              </Button>
            </div>
          ) : (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-700 mb-4">
                Not Logged In
              </h2>
              <p className="text-gray-600 mb-6">
                Click the button below to test OAuth login with Google or Apple.
              </p>
              <Button 
                onClick={handleLogin}
                className="w-full"
              >
                Open Login Modal
              </Button>
            </div>
          )}
          
          <div className="mt-8 text-sm text-gray-500">
            <p>This page tests the OAuth implementation using the same configuration as the contact form.</p>
            <div className="mt-4 space-y-1">
              <p><strong>Google Client ID:</strong> {process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ? '✅ Configured' : '❌ Missing'}</p>
              <p><strong>Apple Client ID:</strong> {process.env.NEXT_PUBLIC_APPLE_CLIENT_ID ? '✅ Configured' : '❌ Missing'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 