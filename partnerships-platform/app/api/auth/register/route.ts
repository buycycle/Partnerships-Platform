import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { first_name, last_name, email, password, phone_number, type } = await request.json();

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

    // Basic password validation
    if (password.length < 8) {
      return NextResponse.json(
        { success: false, message: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    // Call Buycycle API register endpoint
    const buycycleApiUrl = 'https://api.buycycle.com';
    const apiKey = process.env.X_PROXY_AUTHORIZATION;

    if (!apiKey) {
      return NextResponse.json({
        success: false,
        error: 'Server configuration error: API key not configured'
      }, { status: 500 });
    }

    console.log('🔄 [Register] Attempting registration with Buycycle API...');
    console.log('🔄 [Register] User data:', { first_name, last_name, email, password: '[HIDDEN]' });

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
        phone_number: phone_number || "+1234567890",
        type: "private",
        i_agree: true
      })
    });

    console.log('🔄 [Register] Buycycle API response status:', response.status);

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = { message: await response.text() };
      }
      
      console.error('🔄 [Register] Registration failed:', response.status, errorData);
      
      let errorMessage = 'Registration failed. Please try again.';
      
      // Handle specific error cases with detailed messages
      if (response.status === 400) {
        errorMessage = 'Invalid registration data. Please check your inputs.';
      } else if (response.status === 409) {
        errorMessage = 'An account with this email already exists. Please try logging in instead.';
      } else if (response.status === 422) {
        // Handle validation errors from the API
        if (errorData && errorData.errors) {
          const errors = errorData.errors;
          const errorMessages = [];
          
          if (errors.email) {
            errorMessages.push(`Email: ${errors.email.join(', ')}`);
          }
          if (errors.password) {
            errorMessages.push(`Password: ${errors.password.join(', ')}`);
          }
          if (errors.phone_number) {
            errorMessages.push(`Phone: ${errors.phone_number.join(', ')}`);
          }
          if (errors.first_name) {
            errorMessages.push(`First Name: ${errors.first_name.join(', ')}`);
          }
          if (errors.last_name) {
            errorMessages.push(`Last Name: ${errors.last_name.join(', ')}`);
          }
          if (errors.type) {
            errorMessages.push(`Account Type: ${errors.type.join(', ')}`);
          }
          if (errors.i_agree) {
            errorMessages.push(`Terms: ${errors.i_agree.join(', ')}`);
          }
          
          if (errorMessages.length > 0) {
            errorMessage = errorMessages.join('. ');
          } else {
            errorMessage = errorData.message || 'Please check your registration information and try again.';
          }
        } else {
          errorMessage = errorData.message || 'Please check your registration information and try again.';
        }
      } else {
        // Use the API's error message if available
        errorMessage = errorData.message || errorMessage;
      }
      
      return NextResponse.json(
        { success: false, message: errorMessage },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('✅ [Register] Registration successful');

    // Return the same format as login
    return NextResponse.json({
      success: true,
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      user: data.user
    });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
} 