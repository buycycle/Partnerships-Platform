import { User, AuthResponse, LoginCredentials, SocialAuthData, Video, VideosResponse, VideoResponse, VoteResponse, PaginationInfo, UserOrder, UserSale } from './types';
import { env } from './env';
import { getCustomAuthToken } from './auth';

// Re-export getCustomAuthToken for compatibility
export { getCustomAuthToken } from './auth';

/**
 * API client configuration
 */
const API_CONFIG = {
  BUYCYCLE_URL: env.BUYCYCLE_API_URL,
  CONTACT_URL: env.API_BASE_URL,
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    'X-Proxy-Authorization': env.BUYCYCLE_API_KEY
  } as Record<string, string>,
  DEFAULT_AUTH_TOKEN: env.DEFAULT_AUTH_TOKEN
};

// Initialize auth token if provided in the env
if (typeof window !== 'undefined' && API_CONFIG.DEFAULT_AUTH_TOKEN && !localStorage.getItem('auth_token')) {
  localStorage.setItem('auth_token', API_CONFIG.DEFAULT_AUTH_TOKEN);
}

/**
 * Refresh the auth token using the refresh token
 */
async function refreshAuthToken(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  
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
    // Clear tokens on refresh error - BUT DO NOT CLEAR custom_auth_token
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    // NOTE: We do NOT clear custom_auth_token or user_data here!
    // The custom_auth_token is more persistent and should remain
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
  if (typeof window === 'undefined') {
    throw new Error('API requests can only be made from the client side');
  }

  try {
    const baseUrl = config.baseUrl || API_CONFIG.CONTACT_URL;
    const url = `${baseUrl}${endpoint}`;

    // Get auth token if required
    const headers = { ...API_CONFIG.DEFAULT_HEADERS };
    if (config.requiresAuth) {
      const token = localStorage.getItem('auth_token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      // Include custom auth token for user-specific isolation (like contact-form)
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
        // Clear tokens and throw error - BUT DO NOT CLEAR custom_auth_token
        localStorage.removeItem('auth_token');
        localStorage.removeItem('refresh_token');
        // NOTE: We do NOT clear custom_auth_token or user_data here!
        // The custom_auth_token is more persistent and should remain
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

// Auth API
export const auth = {
  /**
   * Login with email and password
   */
  async login(email: string, password: string): Promise<AuthResponse> {
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
        localStorage.setItem('custom_auth_token', data.user.custom_auth_token);
      }
      
      // Store user data if available
      if (data.user) {
        localStorage.setItem('user_data', JSON.stringify(data.user));
      }
      
      return data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Register a new user with email and password
   */
  async register(first_name: string, last_name: string, email: string, password: string, phone_number?: string): Promise<AuthResponse> {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          first_name, 
          last_name, 
          email, 
          password,
          phone_number 
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      // Store the token from the response
      if (data.access_token) {
        localStorage.setItem('auth_token', data.access_token);
      }
      
      // Store refresh token if available
      if (data.refresh_token) {
        localStorage.setItem('refresh_token', data.refresh_token);
      }
      
      // Store custom auth token if available
      if (data.user && data.user.custom_auth_token) {
        localStorage.setItem('custom_auth_token', data.user.custom_auth_token);
      }
      
      // Store user data if available
      if (data.user) {
        localStorage.setItem('user_data', JSON.stringify(data.user));
      }
      
      return data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Login with social provider (Google or Apple)
   * @param provider The provider (google or apple)
   * @param accessToken OAuth access token from the provider
   */
  async socialLogin(provider: 'google' | 'apple', accessToken: string): Promise<AuthResponse> {
    try {
      console.log(`🚀 [Auth] Attempting ${provider} social login...`);
      console.log(`🚀 [Auth] API URL: ${API_CONFIG.BUYCYCLE_URL}/en/api/v3/login/${provider}`);
      console.log(`🚀 [Auth] Token length: ${accessToken.length}`);
      console.log(`🚀 [Auth] Token preview: ${accessToken.substring(0, 30)}...`);
      
      const requestBody = { access_token: accessToken };
      console.log(`🚀 [Auth] Request body:`, requestBody);
      
      const response = await fetch(`${API_CONFIG.BUYCYCLE_URL}/en/api/v3/login/${provider}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Proxy-Authorization': API_CONFIG.DEFAULT_HEADERS['X-Proxy-Authorization']
        },
        body: JSON.stringify(requestBody)
      });

      console.log(`🚀 [Auth] Response status: ${response.status}`);
      console.log(`🚀 [Auth] Response headers:`, Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ [Auth] Error response body:`, errorText);
        throw new Error(`${provider} login failed: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log(`✅ [Auth] Success response keys:`, Object.keys(data));
      console.log(`✅ [Auth] User data keys:`, data.user ? Object.keys(data.user) : 'No user data');
      
      // Store the token from the response
      if (data.token) {
        console.log(`✅ [Auth] Storing auth token...`);
        localStorage.setItem('auth_token', data.token);
      }
      
      // Store refresh token if available
      if (data.refresh_token) {
        console.log(`✅ [Auth] Storing refresh token...`);
        localStorage.setItem('refresh_token', data.refresh_token);
      }
      
      // Store custom auth token if available
      if (data.user && data.user.custom_auth_token) {
        console.log(`✅ [Auth] Storing custom auth token...`);
        localStorage.setItem('custom_auth_token', data.user.custom_auth_token);
      }
      
      // Store user data if available
      if (data.user) {
        console.log(`✅ [Auth] Storing user data...`);
        localStorage.setItem('user_data', JSON.stringify(data.user));
      }
      
      console.log(`✅ [Auth] ${provider} login completed successfully`);
      return data;
    } catch (error) {
      console.error(`❌ [Auth] ${provider} login failed:`, error);
      throw error;
    }
  },

  /**
   * Logout the current user
   */
  async logout(): Promise<void> {
    try {
      // Try to call the logout API endpoint if we have a token
      const token = localStorage.getItem('auth_token');
      if (token) {
        await apiRequest(
          '/api/auth/logout',
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
      localStorage.removeItem('custom_auth_token');
      localStorage.removeItem('user_data');
    }
  },

  /**
   * Get current user information
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      // First check localStorage for cached user data
      const storedUserData = localStorage.getItem('user_data');
      if (storedUserData) {
        try {
          const userData = JSON.parse(storedUserData);
          // Verify we still have a valid token
          const token = localStorage.getItem('auth_token');
          if (token) {
            return userData;
          }
        } catch (e) {
          // Invalid stored data, remove it
          localStorage.removeItem('user_data');
        }
      }

      // If no stored data or no token, try to fetch from API
      const token = localStorage.getItem('auth_token');
      if (!token) {
        return null;
      }

      // Try to fetch user data from Buycycle API using custom auth token
      const customToken = localStorage.getItem('custom_auth_token');
      if (customToken) {
        try {
          const response = await fetch(`${API_CONFIG.BUYCYCLE_URL}/en/api/v4/user`, {
            headers: {
              'X-Custom-Authorization': customToken,
              'X-Proxy-Authorization': API_CONFIG.DEFAULT_HEADERS['X-Proxy-Authorization'],
              'Content-Type': 'application/json'
            }
          });

          if (!response.ok) {
            // If token is invalid, clear it and return null
            if (response.status === 401) {
              localStorage.removeItem('auth_token');
              localStorage.removeItem('refresh_token');
              // NOTE: Don't clear custom_auth_token here - it's more persistent
              // localStorage.removeItem('custom_auth_token');
              // localStorage.removeItem('user_data');
            }
            return null;
          }

          const data = await response.json();
          
          if (data.user) {
            // Store user data for future use
            localStorage.setItem('user_data', JSON.stringify(data.user));
            return data.user;
          }
        } catch (error) {
          console.error('Failed to fetch user from Buycycle API:', error);
        }
      }

      return null;
    } catch (error) {
      console.error('Failed to get current user:', error);
      // Clear invalid tokens - but preserve custom_auth_token
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
      // NOTE: Don't clear custom_auth_token - it's more persistent
      // localStorage.removeItem('custom_auth_token');
      // localStorage.removeItem('user_data');
      return null;
    }
  },

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      const user = await this.getCurrentUser();
      return !!user;
    } catch (error) {
      return false;
    }
  },

  /**
   * Get user's sales data (orders where user is the seller)
   */
  async getUserSales(params: { offset?: number; limit?: number; status?: string } = {}): Promise<UserSale[]> {
    try {
      const { offset = 0, limit = 100, status = 'all' } = params;
      const customAuthToken = getCustomAuthToken();
      
      if (!customAuthToken) {
        throw new Error('Authentication required');
      }
      
      const response = await fetch(`${API_BASE_URL}/api/user/sales?offset=${offset}&limit=${limit}&status=${status}`, {
        method: 'GET',
        headers: {
          'X-Custom-Authorization': customAuthToken,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch sales data: ${response.status}`);
      }
      
      const data = await response.json();
      return data.sales || [];
    } catch (error) {
      console.error('Error fetching user sales:', error);
      throw error;
    }
  },

  /**
   * Get user's orders data (orders where user is the buyer)
   */
  async getUserOrders(params: { offset?: number; limit?: number; status?: string } = {}): Promise<UserOrder[]> {
    try {
      const { offset = 0, limit = 100, status = 'all' } = params;
      const customAuthToken = getCustomAuthToken();
      
      if (!customAuthToken) {
        throw new Error('Authentication required');
      }
      
      const response = await fetch(`${API_BASE_URL}/api/user/orders?offset=${offset}&limit=${limit}&status=${status}`, {
        method: 'GET',
        headers: {
          'X-Custom-Authorization': customAuthToken,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch orders data: ${response.status}`);
      }
      
      const data = await response.json();
      return data.orders || [];
    } catch (error) {
      console.error('Error fetching user orders:', error);
      throw error;
    }
  }
};

const API_BASE_URL = env.API_BASE_URL;

// Helper function to get auth token - prioritize custom_auth_token like contact-form
function getAuthToken(): string | null {
  if (typeof window !== 'undefined') {
    // First try custom_auth_token (highest priority)
    const customToken = getCustomAuthToken();
    if (customToken) {
      return customToken;
    }
    
    // Then try regular auth_token
    return localStorage.getItem('auth_token') || localStorage.getItem('authToken');
  }
  return null;
}

// Helper function to make authenticated requests with 401 retry logic
async function makeAuthenticatedRequest(url: string, options: RequestInit = {}, retried: boolean = false) {
  const token = localStorage.getItem('auth_token');
  const customToken = getCustomAuthToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    (headers as any)['Authorization'] = `Bearer ${token}`;
  }
  
  // Also send custom auth token if available (for Buycycle API compatibility)
  if (customToken) {
    (headers as any)['X-Custom-Authorization'] = customToken;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });
  
  // Handle 401 Unauthorized - attempt to refresh token and retry once
  if (response.status === 401 && !retried) {
    const refreshSuccess = await refreshAuthToken();
    
    if (refreshSuccess) {
      // Retry the request with the new token, but mark as retried to prevent infinite loops
      return makeAuthenticatedRequest(url, options, true);
    } else {
      // Clear tokens and throw error - BUT DO NOT CLEAR custom_auth_token
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
      // NOTE: We do NOT clear custom_auth_token or user_data here!
      // The custom_auth_token is more persistent and should remain
      throw new Error('Unauthorized - token refresh failed');
    }
  }
  
  return response;
}

// Get all videos with pagination info (mock data + real-time counts)
export async function getVideos(limit: number = 50, offset: number = 0): Promise<{videos: Video[], pagination?: PaginationInfo}> {
  try {
    const response = await makeAuthenticatedRequest(
      `${API_BASE_URL}/api/videos/with-counts?limit=${limit}&offset=${offset}`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data: VideosResponse = await response.json();
    return {
      videos: data.success ? data.videos : [],
      pagination: data.pagination
    };
  } catch (error) {
    console.error('Error fetching videos:', error);
    return { videos: [] };
  }
}

// Get single video by ID (mock data + real-time counts)
export async function getVideo(id: string): Promise<Video | null> {
  try {
    const response = await makeAuthenticatedRequest(`${API_BASE_URL}/api/videos/with-counts?id=${id}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data: VideoResponse = await response.json();
    return data.success ? data.video : null;
  } catch (error) {
    console.error('Error fetching video:', error);
    return null;
  }
}

// Vote for a video
export async function voteForVideo(videoId: string, videoTitle: string): Promise<VoteResponse> {
  try {
    const response = await makeAuthenticatedRequest(`${API_BASE_URL}/api/videos/vote`, {
      method: 'POST',
      body: JSON.stringify({ videoId, videoTitle }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error voting for video:', error);
    throw error;
  }
}

// Get vote information for a video
export async function getVoteInfo(videoId: string) {
  try {
    const response = await makeAuthenticatedRequest(`${API_BASE_URL}/api/videos/vote?videoId=${videoId}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error getting vote info:', error);
    return { success: false, voteCount: 0, userVote: null };
  }
}



// User authentication functions
export async function loginUser(credentials: { email: string; password: string }) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
}

export async function logoutUser() {
  try {
    const response = await makeAuthenticatedRequest(`${API_BASE_URL}/api/auth/logout`, {
      method: 'POST',
    });
    
    if (typeof window !== 'undefined') {
      // Clear all auth-related tokens
      localStorage.removeItem('auth_token');
      localStorage.removeItem('authToken');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('custom_auth_token');
      localStorage.removeItem('user_data');
    }
    
    return response.ok;
  } catch (error) {
    console.error('Error logging out:', error);
    
    // Even if logout API fails, clear local tokens
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('authToken');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('custom_auth_token');
      localStorage.removeItem('user_data');
    }
    
    return false;
  }
} 