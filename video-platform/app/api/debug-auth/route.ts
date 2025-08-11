import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Get user from auth token
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    console.log('=== DEBUG AUTH ENDPOINT ===');
    console.log('Auth header:', authHeader);
    console.log('Token:', token);
    console.log('Token length:', token?.length || 0);

    if (!token) {
      return NextResponse.json({
        success: false,
        message: 'No token provided',
        debug: {
          authHeader: !!authHeader,
          token: !!token
        }
      });
    }

    // Test the Buycycle API call
    const buycycleApiUrl = 'https://api.buycycle.com';
    const apiKey = process.env.X_PROXY_AUTHORIZATION;
    
    console.log('Environment variables:');
    console.log('BUYCYCLE_API_URL:', buycycleApiUrl);
    console.log('API_KEY available:', !!apiKey);
    console.log('API_KEY length:', apiKey?.length || 0);

    if (!apiKey) {
      return NextResponse.json({
        success: false,
        error: 'X_PROXY_AUTHORIZATION environment variable is not set',
        debug: {
          apiUrl: buycycleApiUrl,
          hasApiKey: false,
          token: !!token
        }
      }, { status: 500 });
    }

    const response = await fetch(`${buycycleApiUrl}/en/api/v4/user`, {
      headers: {
        'X-Custom-Authorization': token,
        'X-Proxy-Authorization': apiKey,
        'Content-Type': 'application/json'
      }
    });

    console.log('Buycycle API response status:', response.status);
    console.log('Buycycle API response headers:', Object.fromEntries(response.headers.entries()));

    let responseData = null;
    try {
      responseData = await response.json();
      console.log('Response data:', responseData);
    } catch (e) {
      const text = await response.text();
      console.log('Response text:', text);
      responseData = { error: 'Could not parse JSON', text };
    }

    return NextResponse.json({
      success: response.ok,
      debug: {
        apiUrl: buycycleApiUrl,
        hasApiKey: !!apiKey,
        responseStatus: response.status,
        responseData: responseData
      }
    });

  } catch (error) {
    console.error('Debug auth error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      debug: {
        errorType: error instanceof Error ? error.constructor.name : typeof error
      }
    });
  }
} 