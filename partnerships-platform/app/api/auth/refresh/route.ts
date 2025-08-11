import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { refresh_token } = await request.json();
    
    if (!refresh_token) {
      return NextResponse.json(
        { success: false, error: 'Refresh token is required' },
        { status: 400 }
      );
    }
    
    const apiKey = process.env.X_PROXY_AUTHORIZATION;
    if (!apiKey) {
      console.error('X_PROXY_AUTHORIZATION environment variable is missing');
      return NextResponse.json(
        { success: false, error: 'Server configuration error' },
        { status: 500 }
      );
    }

    console.log('🔄 [Refresh] Attempting to refresh auth token...');
    console.log('🔄 [Refresh] Refresh token format:', refresh_token ? `${refresh_token.substring(0, 20)}...` : 'null');

    // Call Buycycle API to refresh the token (same as contact-form)
    const response = await fetch('https://api.buycycle.com/en/api/v3/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Proxy-Authorization': apiKey
      },
      body: JSON.stringify({ refresh_token })
    });

    console.log('🔄 [Refresh] Buycycle API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('🔄 [Refresh] Token refresh failed:', response.status, errorText);
      
      return NextResponse.json(
        { success: false, error: `Token refresh failed: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('✅ [Refresh] Token refresh successful');
    
    // Return the new tokens (same format as contact-form)
    return NextResponse.json({
      success: true,
      token: data.token,
      refresh_token: data.refresh_token,
      user: data.user
    });

  } catch (error) {
    console.error('🔄 [Refresh] Error in token refresh:', error);
    return NextResponse.json(
      { success: false, error: 'Token refresh failed' },
      { status: 500 }
    );
  }
} 