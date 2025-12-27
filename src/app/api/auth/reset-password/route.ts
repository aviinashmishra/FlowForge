import { NextRequest, NextResponse } from 'next/server';
import { userService } from '../../../../lib/auth/userService';
import { rateLimit } from '../../../../lib/auth/middleware';
import { ResetPasswordRequest } from '../../../../types/auth';

// Input validation
function validateResetPasswordData(data: any): data is ResetPasswordRequest {
  return (
    typeof data.email === 'string' &&
    data.email.trim().length > 0 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)
  );
}

// Mock email service (in production, integrate with real email service)
async function sendPasswordResetEmail(email: string, token: string): Promise<void> {
  // In production, this would send an actual email
  console.log(`Password reset email would be sent to ${email} with token: ${token}`);
  
  // For development, you could integrate with services like:
  // - SendGrid
  // - AWS SES
  // - Nodemailer with SMTP
  
  // Example implementation:
  /*
  const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${token}`;
  const emailContent = `
    Click the following link to reset your password:
    ${resetUrl}
    
    This link will expire in 1 hour.
  `;
  
  await emailService.send({
    to: email,
    subject: 'Password Reset - FlowForge',
    text: emailContent,
  });
  */
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting - prevent abuse of password reset
    const clientIP = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    if (!rateLimit(`reset:${clientIP}`, 3, 15 * 60 * 1000)) { // 3 attempts per 15 minutes
      return NextResponse.json(
        { success: false, error: 'Too many password reset attempts. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    
    // Validate input
    if (!validateResetPasswordData(body)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid email format.' 
        },
        { status: 400 }
      );
    }

    // Additional rate limiting per email
    if (!rateLimit(`reset:email:${body.email}`, 2, 60 * 60 * 1000)) { // 2 attempts per email per hour
      return NextResponse.json(
        { success: false, error: 'Too many reset attempts for this email. Please try again later.' },
        { status: 429 }
      );
    }

    try {
      // Generate reset token
      const resetToken = await userService.generateResetToken(body.email);
      
      // Send reset email
      await sendPasswordResetEmail(body.email, resetToken);
      
      // Always return success to prevent email enumeration
      return NextResponse.json(
        { 
          success: true, 
          message: 'If an account with that email exists, a password reset link has been sent.' 
        },
        { status: 200 }
      );
      
    } catch (error) {
      // If user doesn't exist, still return success to prevent email enumeration
      if (error instanceof Error && error.message === 'User not found') {
        return NextResponse.json(
          { 
            success: true, 
            message: 'If an account with that email exists, a password reset link has been sent.' 
          },
          { status: 200 }
        );
      }
      
      throw error; // Re-throw other errors
    }

  } catch (error) {
    console.error('Password reset error:', error);
    
    return NextResponse.json(
      { success: false, error: 'An error occurred. Please try again.' },
      { status: 500 }
    );
  }
}