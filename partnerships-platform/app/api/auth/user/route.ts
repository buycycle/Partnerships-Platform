import { NextRequest, NextResponse } from 'next/server';

const BUYCYCLE_API_URL = 'https://api.buycycle.com';
const API_KEY = process.env.X_PROXY_AUTHORIZATION;

export async function GET(request: NextRequest) {
  try {
    // Read custom auth token from X-Custom-Authorization header
    const customAuthToken = request.headers.get('x-custom-authorization');
    
    console.log('[API] /api/auth/user - Custom auth token:', customAuthToken ? 'Present' : 'Missing');
    console.log('[API] /api/auth/user - API_KEY available:', API_KEY ? 'Present' : 'Missing');
    console.log('[API] /api/auth/user - API_KEY length:', API_KEY ? API_KEY.length : 0);
    
    if (!customAuthToken) {
      return NextResponse.json({
        success: false,
        error: 'X-Custom-Authorization header is required'
      }, { status: 400 });
    }
    
    if (!API_KEY) {
      console.error('[API] /api/auth/user - CRITICAL: X_PROXY_AUTHORIZATION environment variable is not set!');
      return NextResponse.json({
        success: false,
        error: 'Server configuration error: API key not configured'
      }, { status: 500 });
    }
    
    // Get user info from Buycycle API
    try {
      console.log('[API] /api/auth/user - Making request to Buycycle API');
      console.log('[API] /api/auth/user - URL:', `${BUYCYCLE_API_URL}/en/api/v4/user`);
      
      const buycycleResponse = await fetch(
        `${BUYCYCLE_API_URL}/en/api/v4/user`, {
          method: 'GET',
          headers: {
            'X-Custom-Authorization': customAuthToken,
            'X-Proxy-Authorization': API_KEY || '',
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('[API] /api/auth/user - Buycycle API response status:', buycycleResponse.status);
      
      if (buycycleResponse.ok) {
        const buycycleData = await buycycleResponse.json();
        console.log('[API] /api/auth/user - Buycycle API response data:', buycycleData);
        
        if (buycycleData.user) {
          console.log('[API] /api/auth/user - Found user data, returning success');
          return NextResponse.json({
            success: true,
            isLoggedIn: true,
            user: {
              id: buycycleData.user.id,
              first_name: buycycleData.user.first_name || '',
              last_name: buycycleData.user.last_name || '',
              email: buycycleData.user.email || '',
              phone: buycycleData.user.phone || '',
              isAuthenticated: true,
              buycycle_user_id: buycycleData.user.id,
              custom_auth_token: customAuthToken
            }
          });
        } else {
          console.error('[API] /api/auth/user - Buycycle API returned no user data');
          console.error('[API] /api/auth/user - Full Buycycle response:', JSON.stringify(buycycleData, null, 2));
        }
      } else {
        console.error('[API] /api/auth/user - Buycycle API failed with status:', buycycleResponse.status);
        const errorText = await buycycleResponse.text();
        console.error('[API] /api/auth/user - Buycycle API error response:', errorText);
      }
    } catch (apiError) {
      console.error('[API] /api/auth/user - Error calling Buycycle API:', apiError);
    }
    
    // If we can't determine anything, return not logged in
    return NextResponse.json({
      success: true,
      isLoggedIn: false,
      user: null
    });
  } catch (error) {
    console.error('[API] /api/auth/user - Error:', error);
    return NextResponse.json({
      success: false,
      isLoggedIn: false,
      error: "Error fetching user data",
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 