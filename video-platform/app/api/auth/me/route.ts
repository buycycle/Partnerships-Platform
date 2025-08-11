import { NextRequest, NextResponse } from 'next/server';

const BUYCYCLE_API_URL = 'https://api.buycycle.com';
const API_KEY = process.env.X_PROXY_AUTHORIZATION;

export async function GET(request: NextRequest) {
  console.log('🚀 [AUTH-ME] Endpoint called!');
  console.log('🚀 [AUTH-ME] Request URL:', request.url);
  console.log('🚀 [AUTH-ME] Request method:', request.method);
  
  try {
    // Read custom auth token from X-Custom-Authorization header
    const customAuthToken = request.headers.get('x-custom-authorization');
    
    console.log('Backend /api/auth/me - Custom auth token:', customAuthToken ? 'Present' : 'Missing');
    
    if (!customAuthToken) {
      return NextResponse.json({
        success: false,
        error: 'X-Custom-Authorization header is required'
      }, { status: 400 });
    }
    
    if (!API_KEY) {
      console.error('Backend /api/auth/me - CRITICAL: X_PROXY_AUTHORIZATION environment variable is not set!');
      return NextResponse.json({
        success: false,
        error: 'Server configuration error: API key not configured'
      }, { status: 500 });
    }
    
    // Get user info from Buycycle API
    try {
      console.log('Backend /api/auth/me - Making request to Buycycle API');
      console.log('Backend /api/auth/me - URL:', `${BUYCYCLE_API_URL}/en/api/v4/user`);
      console.log('Backend /api/auth/me - Headers:', {
        'X-Custom-Authorization': customAuthToken ? `${customAuthToken.substring(0, 10)}...` : 'Missing',
        'X-Proxy-Authorization': API_KEY ? `${API_KEY.substring(0, 10)}...` : 'Missing'
      });
      
      const buycycleResponse = await fetch(
        `${BUYCYCLE_API_URL}/en/api/v4/user`, {
          method: 'GET',
          headers: {
            'X-Custom-Authorization': customAuthToken,
            'X-Proxy-Authorization': API_KEY,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('Backend /api/auth/me - Buycycle API response status:', buycycleResponse.status);
      
      if (buycycleResponse.ok) {
        const buycycleData = await buycycleResponse.json();
        console.log('Backend /api/auth/me - Buycycle API response data:', buycycleData);
        
        if (buycycleData.user) {
          console.log('Backend /api/auth/me - Found user data, returning success');
          return NextResponse.json({
            success: true,
            user: {
              id: buycycleData.user.id,
              first_name: buycycleData.user.first_name || '',
              last_name: buycycleData.user.last_name || '',
              email: buycycleData.user.email || '',
              phone: buycycleData.user.phone || '',
              isAuthenticated: true,
              buycycle_user_id: buycycleData.user.id
            }
          });
        } else {
          console.error('Backend /api/auth/me - Buycycle API returned no user data');
          console.error('Backend /api/auth/me - Full Buycycle response:', JSON.stringify(buycycleData, null, 2));
        }
      } else {
        console.error('Backend /api/auth/me - Buycycle API failed with status:', buycycleResponse.status);
        const errorText = await buycycleResponse.text();
        console.error('Backend /api/auth/me - Buycycle API error response:', errorText);
      }
    } catch (apiError) {
      console.error('Error calling Buycycle API:', apiError);
    }
    
    // If we can't determine anything, return not logged in
    return NextResponse.json({
      success: true,
      user: null
    });
  } catch (error) {
    console.error('Backend /api/auth/me - Error:', error);
    return NextResponse.json({
      success: false,
      error: "Error fetching user data",
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 