import { NextRequest, NextResponse } from 'next/server';
import { userService } from '../../../../lib/auth/userService';
import { sessionService } from '../../../../lib/auth/sessionService';
import { rateLimit } from '../../../../lib/auth/middleware';
import { SignUpRequest, AuthResult } from '../../../../types/auth';

// Input validation
function validateSignUpData(data: any): data is SignUpRequest {
  return (
    typeof data.email === 'string' &&
    typeof data.password === 'string' &&
    typeof data.firstName === 'string' &&
    typeof data.lastName === 'string' &&
    data.email.trim().length > 0 &&
    data.password.length >= 8 &&
    data.firstName.trim().length > 0 &&
    data.lastName.trim().length > 0 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)
  );
}

function validatePasswordStrength(password: string): { valid: boolean; message?: string } {
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters long' };
  }
  
  if (!/(?=.*[a-z])/.test(password)) {
    return { valid: false, message: 'Password must contain at least one lowercase letter' };
  }
  
  if (!/(?=.*[A-Z])/.test(password)) {
    return { valid: false, message: 'Password must contain at least one uppercase letter' };
  }
  
  if (!/(?=.*\d)/.test(password)) {
    return { valid: false, message: 'Password must contain at least one number' };
  }
  
  return { valid: true };
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientIP = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    if (!rateLimit(`signup:${clientIP}`, 5, 15 * 60 * 1000)) { // 5 attempts per 15 minutes
      return NextResponse.json(
        { success: false, error: 'Too many signup attempts. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    
    // Validate input
    if (!validateSignUpData(body)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid input data. Please check all required fields.' 
        },
        { status: 400 }
      );
    }

    // Validate password strength
    const passwordValidation = validatePasswordStrength(body.password);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { success: false, error: passwordValidation.message },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await userService.getUserByEmail(body.email);
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'An account with this email already exists.' },
        { status: 409 }
      );
    }

    // Create user
    const user = await userService.createUser({
      email: body.email,
      password: body.password,
      firstName: body.firstName,
      lastName: body.lastName,
    });

    // Create session
    const sessionResult = await sessionService.createSession(user);

    const result: AuthResult = {
      success: true,
      user,
      token: sessionResult.token,
    };

    // Set HTTP-only cookie for web clients
    const response = NextResponse.json(result, { status: 201 });
    response.cookies.set('auth-token', sessionResult.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    return response;

  } catch (error) {
    console.error('Signup error:', error);
    
    // Don't expose internal errors to client
    return NextResponse.json(
      { success: false, error: 'An error occurred during signup. Please try again.' },
      { status: 500 }
    );
  }
}