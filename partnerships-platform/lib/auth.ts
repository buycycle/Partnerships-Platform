import { User } from './types';

/**
 * Get the custom auth token from either localStorage or cookies
 * This allows sharing auth between buycycle.com and sponsorship.buycycle.com
 */
export function getCustomAuthToken(): string | null {
  console.log('getCustomAuthToken - checking localStorage...');
  
  // First try localStorage
  const localStorageToken = localStorage.getItem('custom_auth_token');
  console.log('getCustomAuthToken - localStorage token:', localStorageToken);
  
  if (localStorageToken) {
    console.log('getCustomAuthToken - found token in localStorage:', localStorageToken);
    return localStorageToken;
  }

  console.log('getCustomAuthToken - no token in localStorage, checking cookies...');
  
  // Then try cookies
  const cookies = document.cookie.split(';');
  console.log('getCustomAuthToken - cookies:', cookies);
  
  for (const cookie of cookies) {
    const eqIndex = cookie.indexOf('=');
    const name = cookie.slice(0, eqIndex).trim();
    const value = cookie.slice(eqIndex + 1);
    if (name === 'custom_auth_token') {
      const decoded = decodeURIComponent(value);
      console.log('getCustomAuthToken - found token in cookies:', decoded);
      // Store in localStorage for future use
      localStorage.setItem('custom_auth_token', decoded);
      return decoded;
    }
  }

  console.log('getCustomAuthToken - no token found anywhere, returning null');
  return null;
}

/**
 * Set the custom auth token in both localStorage and cookies
 * This ensures it's available across subdomains
 */
export function setCustomAuthToken(token: string): void {
  // Store in localStorage
  localStorage.setItem('custom_auth_token', token);
  
  // Store in cookie with domain set to .buycycle.com
  const domain = '.buycycle.com';
  const secure = window.location.protocol === 'https:';
  const cookieOptions = [
    `domain=${domain}`,
    'path=/',
    secure ? 'secure' : '',
    'SameSite=Lax'
  ].filter(Boolean).join('; ');
  
  document.cookie = `custom_auth_token=${encodeURIComponent(token)}; ${cookieOptions}`;
}

/**
 * Clear the custom auth token from both localStorage and cookies
 */
export function clearCustomAuthToken(): void {
  // Clear from localStorage
  localStorage.removeItem('custom_auth_token');
  
  // Clear from cookies
  const domain = '.buycycle.com';
  const secure = window.location.protocol === 'https:';
  const cookieOptions = [
    `domain=${domain}`,
    'path=/',
    secure ? 'secure' : '',
    'SameSite=Lax',
    'expires=Thu, 01 Jan 1970 00:00:00 GMT'
  ].filter(Boolean).join('; ');
  
  document.cookie = `custom_auth_token=; ${cookieOptions}`;
}

/**
 * API client configuration
 */
const API_CONFIG = {
  BUYCYCLE_URL: 'https://api.buycycle.com',
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    'X-Proxy-Authorization': process.env.X_PROXY_AUTHORIZATION || ''
  },
  DEFAULT_AUTH_TOKEN: process.env.NEXT_PUBLIC_DEFAULT_AUTH_TOKEN || ''
};

// Initialize auth token if provided in the env
if (typeof window !== 'undefined' && API_CONFIG.DEFAULT_AUTH_TOKEN && !localStorage.getItem('auth_token')) {
  localStorage.setItem('auth_token', API_CONFIG.DEFAULT_AUTH_TOKEN);
}

// Cache version management - increment this to force cache clear for all users
const CACHE_VERSION = '2.0';
const CACHE_VERSION_KEY = 'user_data_cache_version';

// Check and update cache version
if (typeof window !== 'undefined') {
  const currentCacheVersion = localStorage.getItem(CACHE_VERSION_KEY);
  if (currentCacheVersion !== CACHE_VERSION) {
    console.log('Cache version mismatch, clearing user data cache');
    // Clear all potentially stale user data
    localStorage.removeItem('user_data');
    // Update the cache version
    localStorage.setItem(CACHE_VERSION_KEY, CACHE_VERSION);
  }
}

/**
 * Refresh the auth token using the refresh token
 */
async function refreshAuthToken(): Promise<boolean> {
  try {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      return false;
    }

    const response = await fetch(`${API_CONFIG.BUYCYCLE_URL}/en/api/v3/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Proxy-Authorization': API_CONFIG.DEFAULT_HEADERS['X-Proxy-Authorization']
      },
      body: JSON.stringify({ refresh_token: refreshToken })
    });

    if (!response.ok) {
      throw new Error(`Failed to refresh token: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.token) {
      localStorage.setItem('auth_token', data.token);
    }
    
    if (data.refresh_token) {
      localStorage.setItem('refresh_token', data.refresh_token);
    }
    
    return true;
  } catch (error) {
    // Clear tokens on refresh error
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    return false;
  }
}

/**
 * Generic API request handler with error handling and authentication
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  config: { baseUrl?: string; requiresAuth?: boolean; retried?: boolean } = {}
): Promise<T> {
  try {
    const baseUrl = config.baseUrl || API_CONFIG.BUYCYCLE_URL;
    const url = `${baseUrl}${endpoint}`;

    // Get auth token if required
    const headers: Record<string, string> = { ...API_CONFIG.DEFAULT_HEADERS };
    if (config.requiresAuth) {
      const token = localStorage.getItem('auth_token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      // Include custom auth token for user-specific isolation
      const customAuthToken = getCustomAuthToken();
      if (customAuthToken) {
        headers['X-Custom-Authorization'] = customAuthToken;
      }
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...(options.headers || {})
      }
    });

    // Handle 401 Unauthorized - attempt to refresh token and retry once
    if (response.status === 401 && config.requiresAuth && !config.retried) {
      const refreshSuccess = await refreshAuthToken();
      
      if (refreshSuccess) {
        // Retry the request with the new token, but mark as retried to prevent infinite loops
        return apiRequest(endpoint, options, { ...config, retried: true });
      } else {
        // Clear tokens and throw error
        localStorage.removeItem('auth_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_data');
        throw new Error('Unauthorized - token refresh failed');
      }
    }

    // Try to parse the response body
    let responseData;
    try {
      responseData = await response.json();
    } catch (e) {
      // If the response isn't JSON, use the status text
      if (!response.ok) {
        const error = new Error(`API error: ${response.status} ${response.statusText}`);
        (error as any).statusCode = response.status;
        throw error;
      }
      // If response is OK but not JSON, return empty success
      return { success: true } as unknown as T;
    }

    // Check for error response
    if (!response.ok) {
      const errorMsg = responseData?.message || responseData?.error || `API error: ${response.status}`;
      const error = new Error(errorMsg);
      (error as any).statusCode = response.status;
      (error as any).errorResponse = responseData;
      throw error;
    }

    // Check for API-level error indicated in the response
    if (responseData && responseData.success === false) {
      const errorMsg = responseData.message || responseData.error || 'Unknown API error';
      const error = new Error(errorMsg);
      (error as any).errorResponse = responseData;
      throw error;
    }

    return responseData as T;
  } catch (error) {
    // Pass through existing errors
    throw error;
  }
}

/**
 * Login with email and password
 */
export async function login(email: string, password: string) {
  try {
    const response = await fetch(`${API_CONFIG.BUYCYCLE_URL}/en/api/v3/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Proxy-Authorization': API_CONFIG.DEFAULT_HEADERS['X-Proxy-Authorization']
      },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Login failed: ${response.status}`);
    }

    const data = await response.json();
    
    // Store the token from the response
    if (data.token) {
      localStorage.setItem('auth_token', data.token);
    }
    
    // Store refresh token if available
    if (data.refresh_token) {
      localStorage.setItem('refresh_token', data.refresh_token);
    }

    // Store custom auth token if available
    if (data.user && data.user.custom_auth_token) {
      setCustomAuthToken(data.user.custom_auth_token);
    }

    // Store user data if available
    if (data.user) {
      localStorage.setItem('user_data', JSON.stringify(data.user));
    }

    return data;
  } catch (error) {
    throw error;
  }
}

/**
 * Login with social provider (Google or Apple)
 * @param provider The provider (google or apple)
 * @param accessToken OAuth access token from the provider
 */
export async function socialLogin(provider: 'google' | 'apple', accessToken: string) {
  try {
    const response = await fetch(`${API_CONFIG.BUYCYCLE_URL}/en/api/v3/login/${provider}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Proxy-Authorization': API_CONFIG.DEFAULT_HEADERS['X-Proxy-Authorization']
      },
      body: JSON.stringify({ access_token: accessToken })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`${provider} login failed: ${response.status}`);
    }

    const data = await response.json();
    
    // Store the token from the response
    if (data.token) {
      localStorage.setItem('auth_token', data.token);
    }
    
    // Store refresh token if available
    if (data.refresh_token) {
      localStorage.setItem('refresh_token', data.refresh_token);
    }
    
    // Store custom auth token if available
    if (data.user && data.user.custom_auth_token) {
      setCustomAuthToken(data.user.custom_auth_token);
    }
    
    // Store user data if available
    if (data.user) {
      localStorage.setItem('user_data', JSON.stringify(data.user));
    }
    
    return data;
  } catch (error) {
    throw error;
  }
}

/**
 * Logout the current user
 */
export async function logout() {
  try {
    // Try to call the logout API endpoint if we have a token
    const token = localStorage.getItem('auth_token');
    if (token) {
      await apiRequest(
        '/en/api/v3/logout',
        { method: 'POST' },
        { baseUrl: API_CONFIG.BUYCYCLE_URL, requiresAuth: true }
      );
    }
  } catch (error) {
    // Continue with local logout even if API call fails
  } finally {
    // Clear all auth-related data from localStorage
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    clearCustomAuthToken();
    localStorage.removeItem('user_data');
  }
}

/**
 * Get the current authenticated user
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    // First check localStorage
    const userData = localStorage.getItem('user_data');
    if (userData) {
      return JSON.parse(userData);
    }
    
    // If no local data, try to fetch from API
    const token = localStorage.getItem('auth_token');
    if (!token) {
      return null;
    }
    
    const data = await apiRequest<{ success: boolean; user: User | null }>(
      '/api/auth/me',
      {},
      { baseUrl: '', requiresAuth: true }
    );
    
    // Update localStorage if user data returned
    if (data.user) {
      localStorage.setItem('user_data', JSON.stringify(data.user));
    }
    
    return data.user;
  } catch (error) {
    return null;
  }
}

/**
 * Refresh the current user's auth token
 */
export async function refreshAuthTokenPublic(): Promise<boolean> {
  return refreshAuthToken();
}

/**
 * Legacy auth object for backward compatibility
 */
export const auth = {
  login,
  socialLogin,
  logout,
  getCurrentUser,
  refreshAuthToken: refreshAuthTokenPublic
}; 