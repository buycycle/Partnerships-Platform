import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { access_token } = await request.json();

    if (!access_token) {
      return NextResponse.json(
        { success: false, message: 'Access token is required' },
        { status: 400 }
      );
    }

    // Call Buycycle API social login endpoint
    const buycycleApiUrl = 'https://api.buycycle.com';
    const apiKey = process.env.X_PROXY_AUTHORIZATION;

    if (!apiKey) {
      return NextResponse.json({
        success: false,
        error: 'Server configuration error: API key not configured'
      }, { status: 500 });
    }

    console.log('🔄 [Apple Login] Attempting Apple login with Buycycle API...');

    const response = await fetch(`${buycycleApiUrl}/en/api/v3/login/apple`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Proxy-Authorization': apiKey
      },
      body: JSON.stringify({ access_token })
    });

    console.log('🔄 [Apple Login] Buycycle API response status:', response.status);

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = { message: await response.text() };
      }
      
      console.error('🔄 [Apple Login] Login failed:', response.status, errorData);
      
      return NextResponse.json(
        { success: false, message: errorData.message || 'Apple login failed' },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('✅ [Apple Login] Login successful');

    // Return the same format as other auth endpoints
    return NextResponse.json({
      success: true,
      access_token: data.access_token || data.token,
      refresh_token: data.refresh_token,
      user: data.user
    });

  } catch (error) {
    console.error('Apple login error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
