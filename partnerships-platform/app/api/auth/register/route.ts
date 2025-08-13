import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    const { first_name, last_name, email, password, phone_number } = await request.json();

    // Validate required fields
    if (!first_name || !last_name || !email || !password) {
      return NextResponse.json(
        { success: false, message: 'All fields are required' },
        { status: 400 }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: 'Please enter a valid email address' },
        { status: 400 }
      );
    }

    // Get client info
    const clientIp = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Save user details to partnerships_everide_users table
    console.log('🔄 [Migrate] Saving user to partnerships_everide_users...');
    try {
      const saveQuery = `
        INSERT INTO partnerships_everide_users (
          first_name, last_name, email, phone_number, 
          migration_status, migration_source, request_ip, user_agent,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, 'pending', 'everide_partnerships_platform', ?, ?, NOW(), NOW())
        ON DUPLICATE KEY UPDATE
          first_name = VALUES(first_name),
          last_name = VALUES(last_name),
          phone_number = VALUES(phone_number),
          migration_status = 'pending',
          updated_at = NOW()
      `;
      
      await executeQuery(saveQuery, [
        first_name,
        last_name,
        email,
        phone_number || null,
        clientIp,
        userAgent
      ]);
      
      console.log('✅ [Migrate] User saved to partnerships_everide_users');
    } catch (dbError) {
      console.error('❌ [Migrate] Failed to save user:', dbError);
      // Continue even if DB save fails
    }

    // Call Buycycle LOGIN API (not register)
    const buycycleApiUrl = 'https://api.buycycle.com';
    const apiKey = process.env.X_PROXY_AUTHORIZATION;

    if (!apiKey) {
      return NextResponse.json({
        success: false,
        error: 'Server configuration error: API key not configured'
      }, { status: 500 });
    }

    console.log('🔄 [Migrate] Calling Buycycle LOGIN API...');
    const response = await fetch(`${buycycleApiUrl}/en/api/v3/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Proxy-Authorization': apiKey
      },
      body: JSON.stringify({ 
        email, 
        password
      })
    });

    console.log('🔄 [Migrate] Buycycle API response status:', response.status);

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = { message: await response.text() };
      }
      
      console.error('🔄 [Migrate] Login failed:', response.status, errorData);
      
      // Update status to failed
      try {
        const updateQuery = `UPDATE partnerships_everide_users SET migration_status = 'failed', updated_at = NOW() WHERE email = ?`;
        await executeQuery(updateQuery, [email]);
      } catch (dbError) {
        console.error('❌ [Migrate] Failed to update status:', dbError);
      }
      
      return NextResponse.json(
        { success: false, message: 'Login failed. Please check your credentials.' },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('✅ [Migrate] Login successful');

    // Update status to success
    try {
      const buycycleUserId = data.user?.id || data.user?.user_id || 'unknown';
      const updateQuery = `
        UPDATE partnerships_everide_users 
        SET migration_status = 'success', 
            buycycle_user_id = ?, 
            buycycle_response = ?,
            updated_at = NOW()
        WHERE email = ?
      `;
      await executeQuery(updateQuery, [
        buycycleUserId,
        JSON.stringify(data.user || {}),
        email
      ]);
      console.log('✅ [Migrate] Status updated to success');
    } catch (dbError) {
      console.error('❌ [Migrate] Failed to update success status:', dbError);
    }

    return NextResponse.json({
      success: true,
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      user: data.user
    });

  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
} 