import { NextRequest, NextResponse } from 'next/server';
import { userService } from '../../../../lib/auth/userService';
import { sessionService } from '../../../../lib/auth/sessionService';
import { rateLimit } from '../../../../lib/auth/middleware';
import { VerifyResetRequest } from '../../../../types/auth';

// Input validation
function validateVerifyResetData(data: any): data is VerifyResetRequest {
  return (
    typeof data.token === 'string' &&
    typeof data.newPassword === 'string' &&
    data.token.trim().length > 0 &&
    data.newPassword.length >= 8
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
    if (!rateLimit(`verify-reset:${clientIP}`, 5, 15 * 60 * 1000)) { // 5 attempts per 15 minutes
      return NextResponse.json(
        { success: false, error: 'Too many password reset attempts. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    
    // Validate input
    if (!validateVerifyResetData(body)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid token or password format.' 
        },
        { status: 400 }
      );
    }

    // Validate password strength
    const passwordValidation = validatePasswordStrength(body.newPassword);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { success: false, error: passwordValidation.message },
        { status: 400 }
      );
    }

    // Validate reset token
    const isValidToken = await userService.validateResetToken(body.token);
    if (!isValidToken) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired reset token.' },
        { status: 400 }
      );
    }

    // Get user by reset token
    const user = await (userService as any).getUserByResetToken(body.token);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired reset token.' },
        { status: 400 }
      );
    }

    // Update password
    await userService.updateUserPassword(user.id, body.newPassword);
    
    // Mark reset token as used
    await (userService as any).markResetTokenAsUsed(body.token);

    // Create new session for the user
    const sessionResult = await sessionService.createSession(user);

    // Set HTTP-only cookie
    const response = NextResponse.json(
      { 
        success: true, 
        message: 'Password successfully reset.',
        user,
        token: sessionResult.token,
      },
      { status: 200 }
    );
    
    response.cookies.set('auth-token', sessionResult.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    return response;

  } catch (error) {
    console.error('Verify reset error:', error);
    
    return NextResponse.json(
      { success: false, error: 'An error occurred. Please try again.' },
      { status: 500 }
    );
  }
}