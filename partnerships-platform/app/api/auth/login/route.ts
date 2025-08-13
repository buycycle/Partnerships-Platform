import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email and password are required' },
        { status: 400 }
      );
    }

    // In a real implementation, you would:
    // 1. Validate credentials against your database
    // 2. Check password hash
    // 3. Generate JWT tokens
    // 4. Return user data and tokens

    // For now, we'll use the Buycycle API endpoint
    const buycycleApiUrl = 'https://api.buycycle.com';
    const apiKey = process.env.X_PROXY_AUTHORIZATION;

    if (!apiKey) {
      return NextResponse.json({
        success: false,
        error: 'Server configuration error: API key not configured'
      }, { status: 500 });
    }

    console.log('🔄 [Login API] Attempting login with Buycycle API...');
    
    const response = await fetch(`${buycycleApiUrl}/en/api/v3/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Proxy-Authorization': apiKey
      },
      body: JSON.stringify({ email, password })
    });

    console.log('🔄 [Login API] Buycycle response status:', response.status);

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = { message: 'Invalid credentials' };
      }
      
      console.error('❌ [Login API] Login failed:', response.status, errorData);
      
      return NextResponse.json(
        { success: false, message: errorData.message || 'Invalid credentials' },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    console.log('✅ [Login API] Buycycle login successful');
    
    return NextResponse.json({
      success: true,
      access_token: data.access_token || data.token,
      refresh_token: data.refresh_token,
      user: data.user
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
} 