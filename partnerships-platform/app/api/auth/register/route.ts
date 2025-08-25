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
    console.log('🔄 [Migrate] User data:', { first_name, last_name, email, phone_number, clientIp, userAgent });
    
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
      
      console.log('🔄 [Migrate] Executing query:', saveQuery);
      console.log('🔄 [Migrate] Query parameters:', [first_name, last_name, email, phone_number || null, clientIp, userAgent]);
      
      const result = await executeQuery(saveQuery, [
        first_name,
        last_name,
        email,
        phone_number || null,
        clientIp,
        userAgent
      ]);
      
      console.log('✅ [Migrate] User saved to partnerships_everide_users. Result:', result);
    } catch (dbError: any) {
      console.error('❌ [Migrate] Failed to save user:', dbError);
      console.error('❌ [Migrate] Error details:', {
        message: dbError.message,
        code: dbError.code,
        sqlState: dbError.sqlState,
        errno: dbError.errno
      });
      // Continue even if DB save fails
    }

    // Call Buycycle REGISTER API (correct endpoint)
    const buycycleApiUrl = 'https://api.buycycle.com';
    const apiKey = process.env.X_PROXY_AUTHORIZATION;

    if (!apiKey) {
      return NextResponse.json({
        success: false,
        error: 'Server configuration error: API key not configured'
      }, { status: 500 });
    }

    console.log('🔄 [Migrate] Calling Buycycle REGISTER API...');
    const response = await fetch(`${buycycleApiUrl}/en/api/v3/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Proxy-Authorization': apiKey
      },
      body: JSON.stringify({ 
        first_name,
        last_name,
        email, 
        password,
        password_confirmation: password,
        phone_number: phone_number || null,
        type: "private",
        i_agree: true
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
      
      console.error('🔄 [Migrate] Registration failed:', response.status, errorData);
      
      // Update status to failed
      try {
        const updateQuery = `UPDATE partnerships_everide_users SET migration_status = 'failed', updated_at = NOW() WHERE email = ?`;
        console.log('🔄 [Migrate] Updating status to failed for email:', email);
        
        const failedUpdateResult = await executeQuery(updateQuery, [email]);
        console.log('✅ [Migrate] Status updated to failed. Result:', failedUpdateResult);
      } catch (dbError: any) {
        console.error('❌ [Migrate] Failed to update status:', dbError);
        console.error('❌ [Migrate] Failed update error details:', {
          message: dbError.message,
          code: dbError.code,
          sqlState: dbError.sqlState,
          errno: dbError.errno
        });
      }
      
      return NextResponse.json(
        { success: false, message: 'Registration failed. Please try again or contact support.' },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('✅ [Migrate] Registration successful');

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
      
      console.log('🔄 [Migrate] Updating status to success for email:', email);
      console.log('🔄 [Migrate] Buycycle user ID:', buycycleUserId);
      
      const updateResult = await executeQuery(updateQuery, [
        buycycleUserId,
        JSON.stringify(data.user || {}),
        email
      ]);
      
      console.log('✅ [Migrate] Status updated to success. Result:', updateResult);
    } catch (dbError: any) {
      console.error('❌ [Migrate] Failed to update success status:', dbError);
      console.error('❌ [Migrate] Update error details:', {
        message: dbError.message,
        code: dbError.code,
        sqlState: dbError.sqlState,
        errno: dbError.errno
      });
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