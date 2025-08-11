import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  console.log('🧪 [COMPARISON TEST] Starting API comparison test...');
  
  const customAuthToken = request.headers.get('x-custom-authorization');
  const apiKey = process.env.X_PROXY_AUTHORIZATION;
  
  if (!customAuthToken) {
    return NextResponse.json({
      error: 'X-Custom-Authorization header required for testing'
    }, { status: 400 });
  }
  
  if (!apiKey) {
    return NextResponse.json({
      error: 'X_PROXY_AUTHORIZATION not configured'
    }, { status: 500 });
  }
  
  const results = {
    timestamp: new Date().toISOString(),
    token_info: {
      length: customAuthToken.length,
      format: customAuthToken.substring(0, 20) + '...',
      type: 'custom_auth_token'
    },
    api_key_info: {
      length: apiKey.length,
      format: apiKey.substring(0, 20) + '...'
    },
    tests: [] as any[]
  };
  
  // Test 1: V3 endpoint (should work)
  console.log('🧪 [TEST 1] Testing V3 endpoint (working in both systems)...');
  try {
    const v3Response = await fetch('https://api.buycycle.com/en/api/v3/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Proxy-Authorization': apiKey
      },
      body: JSON.stringify({ refresh_token: 'test-token' })
    });
    
    results.tests.push({
      test: 'V3_refresh_endpoint',
      url: 'https://api.buycycle.com/en/api/v3/refresh',
      method: 'POST',
      status: v3Response.status,
      statusText: v3Response.statusText,
      headers: Object.fromEntries(v3Response.headers.entries()),
      body: await v3Response.text()
    });
  } catch (error) {
    results.tests.push({
      test: 'V3_refresh_endpoint',
      error: String(error)
    });
  }
  
  // Test 2: V4 endpoint (failing in video-platform)
  console.log('🧪 [TEST 2] Testing V4 user endpoint (failing in video-platform)...');
  try {
    const v4Response = await fetch('https://api.buycycle.com/en/api/v4/user', {
      method: 'GET',
      headers: {
        'X-Custom-Authorization': customAuthToken,
        'X-Proxy-Authorization': apiKey,
        'Content-Type': 'application/json'
      }
    });
    
    const responseBody = await v4Response.text();
    
    results.tests.push({
      test: 'V4_user_endpoint',
      url: 'https://api.buycycle.com/en/api/v4/user',
      method: 'GET',
      status: v4Response.status,
      statusText: v4Response.statusText,
      headers: Object.fromEntries(v4Response.headers.entries()),
      body: responseBody,
      success: v4Response.ok
    });
  } catch (error) {
    results.tests.push({
      test: 'V4_user_endpoint',
      error: String(error)
    });
  }
  
  // Test 3: Alternative V4 endpoint
  console.log('🧪 [TEST 3] Testing alternative V4 endpoint...');
  try {
    const v4AltResponse = await fetch('https://api.buycycle.com/en/api/v4/account/orders?type=sold&limit=1', {
      method: 'GET',
      headers: {
        'X-Custom-Authorization': customAuthToken,
        'X-Proxy-Authorization': apiKey,
        'Content-Type': 'application/json'
      }
    });
    
    const altResponseBody = await v4AltResponse.text();
    
    results.tests.push({
      test: 'V4_orders_endpoint',
      url: 'https://api.buycycle.com/en/api/v4/account/orders?type=sold&limit=1',
      method: 'GET',
      status: v4AltResponse.status,
      statusText: v4AltResponse.statusText,
      headers: Object.fromEntries(v4AltResponse.headers.entries()),
      body: altResponseBody,
      success: v4AltResponse.ok
    });
  } catch (error) {
    results.tests.push({
      test: 'V4_orders_endpoint',
      error: String(error)
    });
  }
  
  // Test 4: Check if it's a method issue
  console.log('🧪 [TEST 4] Testing V4 endpoint with POST method...');
  try {
    const v4PostResponse = await fetch('https://api.buycycle.com/en/api/v4/user', {
      method: 'POST',
      headers: {
        'X-Custom-Authorization': customAuthToken,
        'X-Proxy-Authorization': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    });
    
    const postResponseBody = await v4PostResponse.text();
    
    results.tests.push({
      test: 'V4_user_endpoint_POST',
      url: 'https://api.buycycle.com/en/api/v4/user',
      method: 'POST',
      status: v4PostResponse.status,
      statusText: v4PostResponse.statusText,
      body: postResponseBody
    });
  } catch (error) {
    results.tests.push({
      test: 'V4_user_endpoint_POST',
      error: String(error)
    });
  }
  
  console.log('🧪 [COMPARISON TEST] Results:', JSON.stringify(results, null, 2));
  
  return NextResponse.json(results);
} 