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

    const response = await fetch(`${buycycleApiUrl}/en/api/v3/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Proxy-Authorization': apiKey
      },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const data = await response.json();
    
    return NextResponse.json({
      success: true,
      token: data.token,
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