import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/user/sales
 * Get user sales data (orders where user is the seller)
 */
export async function GET(request: NextRequest) {
  try {
    // Get custom auth token from header
    const customAuthToken = request.headers.get('x-custom-authorization');
    
    if (!customAuthToken) {
      return NextResponse.json({
        success: false,
        error: 'X-Custom-Authorization header is required'
      }, { status: 400 });
    }
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const offset = searchParams.get('offset') || '0';
    const limit = searchParams.get('limit') || '100';
    const status = searchParams.get('status') || 'all';
    
    const buycycleApiUrl = 'https://api.buycycle.com';
    const apiKey = process.env.X_PROXY_AUTHORIZATION;
    
    if (!apiKey) {
      return NextResponse.json({
        success: false,
        error: 'Server configuration error'
      }, { status: 500 });
    }
    
    // Call Buycycle API for sales data
    const salesUrl = `${buycycleApiUrl}/en/api/v4/account/orders?type=sold&status=${status}&offset=${offset}&limit=${limit}`;
    
    const response = await fetch(salesUrl, {
      method: 'GET',
      headers: {
        'X-Custom-Authorization': customAuthToken,
        'X-Proxy-Authorization': apiKey,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch sales data',
        message: errorText
      }, { status: response.status });
    }
    
    const salesData = await response.json();
    
    // Handle different response formats
    const salesArray = salesData.data || salesData.orders || salesData.sales || salesData;
    const safeSalesArray = Array.isArray(salesArray) ? salesArray : [];
    
    return NextResponse.json({
      success: true,
      sales: safeSalesArray
    });
    
  } catch (error) {
    console.error('Error fetching sales:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch sales data'
    }, { status: 500 });
  }
} 