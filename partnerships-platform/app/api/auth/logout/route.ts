import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Get authorization header
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    // Call Buycycle API logout endpoint if we have a token
    if (token) {
      const buycycleApiUrl = 'https://api.buycycle.com';
      const apiKey = process.env.X_PROXY_AUTHORIZATION;

      if (apiKey) {
        try {
          console.log('🔄 [Logout] Attempting logout with Buycycle API...');
          
          const response = await fetch(`${buycycleApiUrl}/en/api/v3/logout`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Proxy-Authorization': apiKey,
              'Authorization': `Bearer ${token}`
            }
          });

          console.log('🔄 [Logout] Buycycle API response status:', response.status);
          
          if (response.ok) {
            console.log('✅ [Logout] Buycycle logout successful');
          } else {
            console.log('⚠️ [Logout] Buycycle logout failed, but continuing with local logout');
          }
        } catch (error) {
          console.error('❌ [Logout] Buycycle logout error:', error);
          // Continue with local logout even if API call fails
        }
      }
    }

    // Always return success for logout
    return NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    });

  } catch (error) {
    console.error('Logout error:', error);
    // Even if there's an error, return success for logout
    return NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    });
  }
}
