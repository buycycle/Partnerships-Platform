'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { auth } from '@/lib/api';
import { trackUserLogin, getStoredUTMParams } from '@/lib/analytics';
import { extractGoogleTokenFromCallback } from '@/lib/oauth/google';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { useLoginModal } from '@/contexts/login-modal-context';
import { useUser } from '@/contexts/user-context';

interface OAuthCallbackProps {
  provider?: string;
}

export function OAuthCallback({ provider: propProvider }: OAuthCallbackProps = {}) {
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const router = useRouter();
  const params = useParams();
  const provider = propProvider || params?.provider;
  const { closeLoginModal } = useLoginModal();
  const { refreshUser } = useUser();
  const processedRef = useRef(false);

  useEffect(() => {
    async function processOAuthCallback() {
      // Prevent double processing
      if (processedRef.current) {
        return;
      }
      processedRef.current = true;
      
      // Define debug outside try/catch so it's accessible in catch block
      const debug: Record<string, any> = {};
      
      try {
        let accessToken: string | null = null;
        
        // Extract access token based on provider
        if (provider === 'google') {
          // Parse parameters from both hash and search
          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          const queryParams = new URLSearchParams(window.location.search);
          
          debug.hashParams = Object.fromEntries(hashParams.entries());
          debug.queryParams = Object.fromEntries(queryParams.entries());
          
          // Get state from appropriate location
          const storedState = localStorage.getItem('google_auth_state');
          const returnedState = hashParams.get('state') || queryParams.get('state');
          
          debug.storedState = storedState;
          debug.returnedState = returnedState;
          
          // Cleanup stored state
          localStorage.removeItem('google_auth_state');
          localStorage.removeItem('google_auth_timestamp');
          
          // Validate state if both are present
          if (storedState && returnedState) {
            if (storedState !== returnedState) {
              debug.stateMatch = false;
              throw new Error('Invalid state parameter. This could be a CSRF attack.');
            }
            debug.stateMatch = true;
          }
          
          // Get access token
          accessToken = extractGoogleTokenFromCallback();
          debug.accessToken = accessToken ? `${accessToken.substring(0, 10)}...` : null;
          
        } else {
          throw new Error(`Unsupported provider: ${provider}`);
        }

        // Send token to API for validation and to get user data
        if (accessToken && provider) {
          const validProvider = provider as 'google';
          
          console.log(`🚀 [OAuth] Attempting ${validProvider} social login...`);
          const userData = await auth.socialLogin(validProvider, accessToken);
          console.log(`✅ [OAuth] Social login successful`);
          
          // Track login event
          const utmParams = getStoredUTMParams() || {};
          trackUserLogin(validProvider, utmParams);
          
          // Refresh user context to update the global user state
          await refreshUser();
          console.log(`✅ [OAuth] User context refreshed`);
          
          // Longer delay to ensure localStorage is properly written and user context is updated
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Get stored return URL
          const returnUrl = localStorage.getItem('oauth_return_url');
          
          // Clean up localStorage items
          localStorage.removeItem('oauth_state');
          localStorage.removeItem('oauth_return_url');
          
          console.log(`🔄 [OAuth] Redirecting to: ${returnUrl || '/'}`);
          
          // Navigate to the return URL or home
          router.push(returnUrl || '/');
          } else {
          throw new Error('No access token received');
          }
        
      } catch (error) {
        console.error('OAuth callback error:', error);
        setError(error instanceof Error ? error.message : 'An unknown error occurred');
        setDebugInfo(debug);
        setIsProcessing(false);
      }
    }

    if (provider) {
    processOAuthCallback();
    }
  }, [provider, router, refreshUser]);

  if (isProcessing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4 mx-auto" />
          <p className="text-lg">Anmeldung wird verarbeitet...</p>
          <p className="text-sm text-gray-600 mt-2">Bitte warten Sie, während wir Ihre Anmeldedaten überprüfen...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
        <div className="max-w-md w-full text-center">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Anmeldung fehlgeschlagen</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          
          <button
            onClick={() => router.push('/')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Zur Startseite zurückkehren
          </button>

          {debugInfo && (
            <details className="mt-6 text-left">
              <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                Debug-Informationen
              </summary>
              <pre className="mt-2 text-xs bg-gray-100 p-3 rounded overflow-auto">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
            </details>
          )}
          </div>
      </div>
    );
  }

  return null;
} 