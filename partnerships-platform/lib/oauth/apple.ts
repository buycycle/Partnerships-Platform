  // Apple OAuth configuration
export const APPLE_AUTH_CONFIG = {
  CLIENT_ID: process.env.NEXT_PUBLIC_APPLE_CLIENT_ID || 'com.buycycle.client',
  REDIRECT_URI: `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/apple/callback`,
  SCOPES: ['name', 'email']
};

// Extend Window interface to include AppleID
declare global {
  interface Window {
    AppleID?: {
      auth: {
        init: (config: any) => void;
        signIn: () => Promise<any>;
      };
    };
  }
}

/**
 * Generate a cryptographically random string
 */
function cryptoRandomString(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Validate Apple configuration
 */
export function validateAppleConfig() {
  const errors = [];
  
  if (!APPLE_AUTH_CONFIG.CLIENT_ID) {
    errors.push('Apple Client ID is missing');
  }
  
  if (!APPLE_AUTH_CONFIG.REDIRECT_URI) {
    errors.push('Apple Redirect URI is missing');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    error: errors.length > 0 ? errors.join(', ') : null
  };
}

/**
 * Diagnose Apple configuration for debugging
 */
export function diagnoseAppleConfig() {
  console.log('🔍 [Apple] Configuration Diagnosis:');
  console.log('- Client ID:', APPLE_AUTH_CONFIG.CLIENT_ID);
  console.log('- Redirect URI:', APPLE_AUTH_CONFIG.REDIRECT_URI);
  console.log('- Scopes:', APPLE_AUTH_CONFIG.SCOPES);
  console.log('- AppleID JS SDK loaded:', typeof window !== 'undefined' && typeof window.AppleID !== 'undefined');
  
  const validation = validateAppleConfig();
  console.log('- Configuration valid:', validation.isValid);
  if (!validation.isValid) {
    console.log('- Configuration errors:', validation.errors);
  }
}

/**
 * Generate Apple OAuth URL for login
 */
export function getAppleAuthUrl(): string {
  // Generate a random state value
  const state = cryptoRandomString(16);
  
  // Store the state for validation
  localStorage.setItem('apple_auth_state', state);
  localStorage.setItem('apple_auth_timestamp', Date.now().toString());
  
  // Generate a cryptographically-random nonce
  const nonce = cryptoRandomString();
  
  // Store nonce for later validation
  localStorage.setItem('apple_auth_nonce', nonce);

  const queryParams = new URLSearchParams({
    client_id: APPLE_AUTH_CONFIG.CLIENT_ID,
    redirect_uri: APPLE_AUTH_CONFIG.REDIRECT_URI,
    response_type: 'code id_token',
    scope: APPLE_AUTH_CONFIG.SCOPES.join(' '),
    response_mode: 'form_post',
    state: state,
    nonce: nonce
  });

  return `https://appleid.apple.com/auth/authorize?${queryParams.toString()}`;
}

/**
 * Handle Apple OAuth login by redirecting to Apple's authorization page
 */
export function initiateAppleLogin(): void {
  const appleAuthUrl = getAppleAuthUrl();
  
  // Open Apple login in a popup window
  const popup = window.open(
    appleAuthUrl,
    'AppleLogin',
    'width=600,height=600,scrollbars=yes,resizable=yes'
  );
  
  // Check if popup was blocked
  if (!popup || popup.closed || typeof popup.closed === 'undefined') {
    console.error('Apple login popup was blocked');
    // Fall back to same-window redirect
    window.location.href = appleAuthUrl;
    return;
  }
  
  // Monitor the popup for completion
  const checkInterval = setInterval(() => {
      if (popup.closed) {
        clearInterval(checkInterval);
      // Popup closed, check if we received tokens
      const code = localStorage.getItem('apple_auth_code');
      const idToken = localStorage.getItem('apple_auth_id_token');
      
      if (code && idToken) {
        // Tokens received, trigger a page refresh to process them
        window.location.reload();
        }
      }
  }, 1000);
  
  // Clean up after 5 minutes
  setTimeout(() => {
    clearInterval(checkInterval);
  }, 300000);
}

/**
 * Alternative login method using Apple's JS SDK
 * This can be more reliable than OAuth redirects
 */
export function initiateAppleLoginWithJS(): void {
  // Check if AppleID JS is loaded
  if (typeof window === 'undefined' || typeof window.AppleID === 'undefined') {
    console.error('Apple JS SDK not loaded');
    // Fall back to regular OAuth flow
    initiateAppleLogin();
    return;
  }
  
  try {
    window.AppleID.auth.init({
      clientId: APPLE_AUTH_CONFIG.CLIENT_ID,
      scope: APPLE_AUTH_CONFIG.SCOPES.join(' '),
      redirectURI: APPLE_AUTH_CONFIG.REDIRECT_URI,
      state: cryptoRandomString(16),
      nonce: cryptoRandomString(),
      usePopup: true
    });
    
    window.AppleID.auth.signIn();
  } catch (error) {
    console.error('Apple JS SDK error:', error);
    // Fall back to regular OAuth flow
    initiateAppleLogin();
  }
}

/**
 * Extract tokens from Apple's OAuth callback response
 */
export function extractAppleTokenFromCallback(): { code: string | null; idToken: string | null; state: string | null } {
  const result = {
    code: null as string | null,
    idToken: null as string | null,
    state: null as string | null
  };
  
  // Check URL parameters first
  const queryParams = new URLSearchParams(window.location.search);
  result.code = queryParams.get('code');
  result.idToken = queryParams.get('id_token');
  result.state = queryParams.get('state');
  
  // If we have what we need from URL parameters, return early
  if (result.code && result.idToken) {
    return result;
  }
  
  // Check if tokens are in localStorage (from our data bridge page)
  const storedCode = localStorage.getItem('apple_auth_code');
  const storedIdToken = localStorage.getItem('apple_auth_id_token');
  const storedState = localStorage.getItem('apple_auth_state');
  
  if (storedCode) result.code = storedCode;
  if (storedIdToken) result.idToken = storedIdToken;
  if (storedState) result.state = storedState;
  
  // Clear localStorage values after using them
  if (storedCode || storedIdToken) {
    localStorage.removeItem('apple_auth_code');
    localStorage.removeItem('apple_auth_id_token');
    localStorage.removeItem('apple_auth_state');
  }
  
  return result;
}

/**
 * Validate Apple OAuth state parameter
 */
export function validateAppleState(returnedState: string): boolean {
  const storedState = localStorage.getItem('apple_auth_state');
  const storedTimestamp = localStorage.getItem('apple_auth_timestamp');
  
  // Clean up stored state
  localStorage.removeItem('apple_auth_state');
  localStorage.removeItem('apple_auth_timestamp');
  
  if (!storedState) {
    console.warn('No stored Apple OAuth state found');
    return false;
  }
  
  if (storedState !== returnedState) {
    console.error('Apple OAuth state mismatch');
    return false;
  }
  
  // Check if state is not too old (10 minutes max)
  if (storedTimestamp) {
    const timestamp = parseInt(storedTimestamp);
    const now = Date.now();
    const maxAge = 10 * 60 * 1000; // 10 minutes
    
    if (now - timestamp > maxAge) {
      console.error('Apple OAuth state is too old');
      return false;
    }
  }
  
  return true;
} 