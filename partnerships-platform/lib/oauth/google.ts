// Google OAuth configuration
export const GOOGLE_AUTH_CONFIG = {
  CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
  REDIRECT_URI: `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/google/callback`,
  SCOPES: [
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
    'openid'
  ]
};

/**
 * Generate a random state value to prevent CSRF attacks
 */
function generateRandomState(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

/**
 * Generate Google OAuth URL for login
 */
export function getGoogleAuthUrl(state: string): string {
  const queryParams = new URLSearchParams({
    client_id: GOOGLE_AUTH_CONFIG.CLIENT_ID,
    redirect_uri: GOOGLE_AUTH_CONFIG.REDIRECT_URI,
    response_type: 'token',
    scope: GOOGLE_AUTH_CONFIG.SCOPES.join(' '),
    prompt: 'select_account',
    access_type: 'online',
    state: state,
    include_granted_scopes: 'true',
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${queryParams.toString()}`;
}

/**
 * Handle Google OAuth login by redirecting to Google's authorization page
 */
export function initiateGoogleLogin(): void {
  // Generate and store a state parameter to verify when the user returns
  const state = generateRandomState();
  localStorage.setItem('google_auth_state', state);
  
  // Store the current timestamp to prevent prolonged auth sessions
  localStorage.setItem('google_auth_timestamp', Date.now().toString());
  
  // Use the same state value in the URL
  window.location.href = getGoogleAuthUrl(state);
}

/**
 * Extract access token from URL after Google OAuth redirect
 */
export function extractGoogleTokenFromCallback(): string | null {
  console.log('🔍 [Google] Extracting token from callback URL...');
  console.log('🔍 [Google] Current URL:', window.location.href);
  console.log('🔍 [Google] Hash:', window.location.hash);
  console.log('🔍 [Google] Search:', window.location.search);
  
  // First check hash fragment for the access token (implicit flow)
  const hash = window.location.hash.substring(1);
  if (hash) {
    console.log('🔍 [Google] Found hash, parsing...');
    const params = new URLSearchParams(hash);
    const token = params.get('access_token');
    console.log('🔍 [Google] Token from hash:', token ? `${token.substring(0, 20)}...` : 'null');
    if (token) {
      console.log('✅ [Google] Token successfully extracted from hash');
      return token;
    }
  }
  
  // If not in hash, check query parameters (some OAuth flows use this)
  const queryParams = new URLSearchParams(window.location.search);
  const token = queryParams.get('access_token');
  console.log('🔍 [Google] Token from query:', token ? `${token.substring(0, 20)}...` : 'null');
  
  if (token) {
    console.log('✅ [Google] Token successfully extracted from query params');
  } else {
    console.log('❌ [Google] No token found in hash or query params');
  }
  
  return token;
} 