import { NextRequest, NextResponse } from 'next/server';
import { userService } from '../../../../lib/auth/userService';
import { sessionService } from '../../../../lib/auth/sessionService';
import { rateLimit } from '../../../../lib/auth/middleware';
import { SignInRequest, AuthResult } from '../../../../types/auth';

// Input validation
function validateSignInData(data: any): data is SignInRequest {
  return (
    typeof data.email === 'string' &&
    typeof data.password === 'string' &&
    data.email.trim().length > 0 &&
    data.password.length > 0 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)
  );
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting - more restrictive for signin to prevent brute force
    const clientIP = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
    if (!rateLimit(`signin:${clientIP}`, 10, 15 * 60 * 1000)) { // 10 attempts per 15 minutes
      return NextResponse.json(
        { success: false, error: 'Too many signin attempts. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    
    // Validate input
    if (!validateSignInData(body)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid email or password format.' 
        },
        { status: 400 }
      );
    }

    // Additional rate limiting per email to prevent targeted attacks
    if (!rateLimit(`signin:email:${body.email}`, 5, 15 * 60 * 1000)) { // 5 attempts per email per 15 minutes
      return NextResponse.json(
        { success: false, error: 'Too many attempts for this email. Please try again later.' },
        { status: 429 }
      );
    }

    // Authenticate user
    const user = await userService.authenticateUser(body.email, body.password);
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    // Create session
    const sessionResult = await sessionService.createSession(user);

    const result: AuthResult = {
      success: true,
      user,
      token: sessionResult.token,
    };

    // Set HTTP-only cookie for web clients
    const response = NextResponse.json(result, { status: 200 });
    response.cookies.set('auth-token', sessionResult.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    return response;

  } catch (error) {
    console.error('Signin error:', error);
    
    // Don't expose internal errors to client
    return NextResponse.json(
      { success: false, error: 'An error occurred during signin. Please try again.' },
      { status: 500 }
    );
  }
}