'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/contexts/user-context';
import { auth } from '@/lib/api';

export default function DebugAuthPage() {
  const { user, isUserLoggedIn } = useUser();
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [apiTestResult, setApiTestResult] = useState<any>(null);

  useEffect(() => {
    // Gather debug information
    const info = {
      localStorage: {
        auth_token: localStorage.getItem('auth_token') ? `${localStorage.getItem('auth_token')?.substring(0, 20)}...` : null,
        custom_auth_token: localStorage.getItem('custom_auth_token') ? `${localStorage.getItem('custom_auth_token')?.substring(0, 20)}...` : null,
        refresh_token: localStorage.getItem('refresh_token') ? `${localStorage.getItem('refresh_token')?.substring(0, 20)}...` : null,
        user_data: localStorage.getItem('user_data') ? 'Present' : null,
      },
      userContext: {
        isUserLoggedIn,
        user: user ? {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
        } : null,
      },
      authMethods: {
        isAuthenticated: auth.isAuthenticated(),
      }
    };
    
    setDebugInfo(info);
  }, [user, isUserLoggedIn]);

  const testVotingAPI = async () => {
    try {
      const customToken = localStorage.getItem('custom_auth_token');
      const authToken = localStorage.getItem('auth_token');
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      
      if (customToken) {
        headers['X-Custom-Authorization'] = customToken;
      } else if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }
      
      const response = await fetch('/api/videos/vote?videoId=test', {
        headers
      });
      
      const result = await response.json();
      
      setApiTestResult({
        status: response.status,
        ok: response.ok,
        result,
        headers: {
          'X-Custom-Authorization': customToken ? 'Present' : 'Missing',
          'Authorization': authToken ? 'Present' : 'Missing',
        }
      });
    } catch (error) {
      setApiTestResult({
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  const testTokenRefresh = async () => {
    try {
      const { auth } = await import('@/lib/auth');
      const refreshed = await auth.refreshAuthToken();
      
      setApiTestResult({
        type: 'Token Refresh',
        success: refreshed,
        message: refreshed ? 'Token refresh successful' : 'Token refresh failed - no refresh token available'
      });
    } catch (error) {
      setApiTestResult({
        type: 'Token Refresh',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  const testBuycycleAPI = async () => {
    try {
      const customToken = localStorage.getItem('custom_auth_token');
      const authToken = localStorage.getItem('auth_token');
      
      if (!customToken && !authToken) {
        setApiTestResult({
          error: 'No tokens available to test'
        });
        return;
      }
      
      const buycycleApiUrl = process.env.NEXT_PUBLIC_BUYCYCLE_API_URL || 'https://api.buycycle.com';
      const apiKey = process.env.NEXT_PUBLIC_BUYCYCLE_API_KEY || '';
      
      // Test with custom token first
      if (customToken) {
        const response = await fetch(`${buycycleApiUrl}/en/api/v4/user`, {
          headers: {
            'X-Custom-Authorization': customToken,
            'X-Proxy-Authorization': apiKey,
            'Content-Type': 'application/json'
          }
        });
        
        const result = await response.json();
        
        setApiTestResult({
          type: 'Buycycle API (Custom Token)',
          status: response.status,
          ok: response.ok,
          result,
        });
        return;
      }
      
      // Test with auth token
      if (authToken) {
        const response = await fetch(`${buycycleApiUrl}/en/api/v4/user`, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'X-Proxy-Authorization': apiKey,
            'Content-Type': 'application/json'
          }
        });
        
        const result = await response.json();
        
        setApiTestResult({
          type: 'Buycycle API (Bearer Token)',
          status: response.status,
          ok: response.ok,
          result,
        });
      }
    } catch (error) {
      setApiTestResult({
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Authentication Debug</h1>
      
      <div className="space-y-8">
        <div className="bg-gray-100 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Debug Information</h2>
          <pre className="text-sm bg-white p-4 rounded border overflow-auto">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>
        
        <div className="bg-gray-100 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">API Tests</h2>
          <div className="space-x-4 mb-4 flex flex-wrap gap-2">
            <button
              onClick={testVotingAPI}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Test Voting API
            </button>
            <button
              onClick={testBuycycleAPI}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Test Buycycle API
            </button>
            <button
              onClick={testTokenRefresh}
              className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
            >
              Test Token Refresh
            </button>
          </div>
          
          {apiTestResult && (
            <div className="bg-white p-4 rounded border">
              <h3 className="font-semibold mb-2">API Test Result:</h3>
              <pre className="text-sm overflow-auto">
                {JSON.stringify(apiTestResult, null, 2)}
              </pre>
            </div>
          )}
        </div>
        
        <div className="bg-yellow-100 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Troubleshooting</h2>
          <div className="space-y-2 text-sm">
            <p><strong>If custom_auth_token is missing:</strong></p>
            <ul className="list-disc pl-6 space-y-1">
              <li>The Buycycle API is not returning the custom_auth_token in the OAuth response</li>
              <li>Check the Network tab for the OAuth callback request</li>
              <li>Ensure the API key is correct</li>
            </ul>
            
            <p className="mt-4"><strong>If voting API returns 401:</strong></p>
            <ul className="list-disc pl-6 space-y-1">
              <li>The token is invalid or expired</li>
              <li>The token format is incorrect</li>
              <li>The API endpoint expects a different token</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 