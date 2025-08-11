import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // In a real implementation, you would:
    // 1. Get the token from the Authorization header
    // 2. Invalidate the token in your database/cache
    // 3. Call the Buycycle API logout endpoint if needed

    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (token) {
      // Optional: Call Buycycle API logout endpoint
      const buycycleApiUrl = 'https://api.buycycle.com';
      const apiKey = process.env.X_PROXY_AUTHORIZATION;

      if (apiKey) {
      try {
        await fetch(`${buycycleApiUrl}/en/api/v3/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Proxy-Authorization': apiKey,
            'Authorization': `Bearer ${token}`
          }
        });
      } catch (error) {
        console.warn('Buycycle logout API call failed:', error);
        // Continue with local logout even if remote logout fails
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    });

  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
} 