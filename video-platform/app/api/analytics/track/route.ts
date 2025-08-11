import { NextRequest, NextResponse } from 'next/server';

interface AnalyticsEvent {
  event: string;
  page?: string;
  video_id?: string;
  video_title?: string;
  utm_params?: {
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    utm_term?: string;
    utm_content?: string;
  };
  user_id?: string;
  timestamp: string;
  additional_data?: Record<string, any>;
}

export async function POST(request: NextRequest) {
  try {
    const body: AnalyticsEvent = await request.json();

    // Validate required fields
    if (!body.event || !body.timestamp) {
      return NextResponse.json(
        { success: false, message: 'Event and timestamp are required' },
        { status: 400 }
      );
    }

    // Get user info from auth token if available
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    let userId = null;

    if (token) {
      try {
        // Here you would validate the token and get user ID
        // For now, we'll skip this step
        console.log('Analytics tracking with auth token:', token.substring(0, 10) + '...');
      } catch (error) {
        console.log('Invalid token in analytics request');
      }
    }

    // Get client info
    const clientInfo = {
      ip_address: request.headers.get('x-forwarded-for') || 
        request.headers.get('x-real-ip') || 
        'unknown',
      user_agent: request.headers.get('user-agent') || 'unknown',
      referer: request.headers.get('referer') || 'unknown'
    };

    // Prepare analytics data
    const analyticsData = {
      ...body,
      user_id: userId,
      client_info: clientInfo,
      processed_at: new Date().toISOString()
    };

    // Log the analytics event (in production, you'd save to database)
    console.log('[Analytics] Event tracked:', {
      event: body.event,
      page: body.page,
      video_id: body.video_id,
      utm_source: body.utm_params?.utm_source,
      utm_medium: body.utm_params?.utm_medium,
      utm_campaign: body.utm_params?.utm_campaign,
      timestamp: body.timestamp
    });

    // In production, you would:
    // 1. Save to analytics database
    // 2. Send to third-party analytics services (Google Analytics, Mixpanel, etc.)
    // 3. Process for real-time dashboards
    
    // Example database save (uncomment when database is set up):
    /*
    await saveAnalyticsEvent({
      event_type: body.event,
      page_name: body.page,
      video_id: body.video_id,
      video_title: body.video_title,
      utm_source: body.utm_params?.utm_source,
      utm_medium: body.utm_params?.utm_medium,
      utm_campaign: body.utm_params?.utm_campaign,
      utm_term: body.utm_params?.utm_term,
      utm_content: body.utm_params?.utm_content,
      user_id: userId,
      ip_address: clientInfo.ip_address,
      user_agent: clientInfo.user_agent,
      referer: clientInfo.referer,
      timestamp: body.timestamp,
      additional_data: JSON.stringify(body.additional_data || {})
    });
    */

    return NextResponse.json({
      success: true,
      message: 'Analytics event tracked successfully'
    });

  } catch (error) {
    console.error('Error tracking analytics event:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  // This endpoint could return analytics data for dashboards
  return NextResponse.json({
    success: true,
    message: 'Analytics tracking endpoint is active',
    endpoints: {
      track: 'POST /api/analytics/track - Track analytics events',
      data: 'GET /api/analytics/data - Get analytics data (not implemented)'
    }
  });
} 