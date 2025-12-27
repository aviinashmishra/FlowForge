import { NextRequest, NextResponse } from 'next/server';
import { sessionService } from '../../../../lib/auth/sessionService';
import { requireAuth } from '../../../../lib/auth/middleware';

export async function POST(request: NextRequest) {
  try {
    // Get token from cookie or authorization header
    const cookieToken = request.cookies.get('auth-token')?.value;
    const authHeader = request.headers.get('authorization');
    
    let token: string | null = null;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else if (cookieToken) {
      token = cookieToken;
    }

    if (token) {
      // Invalidate the session
      await sessionService.invalidateSession(token);
    }

    // Clear the cookie
    const response = NextResponse.json(
      { success: true, message: 'Successfully signed out' },
      { status: 200 }
    );
    
    response.cookies.set('auth-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0, // Expire immediately
      path: '/',
    });

    return response;

  } catch (error) {
    console.error('Signout error:', error);
    
    // Even if there's an error, we should clear the cookie
    const response = NextResponse.json(
      { success: true, message: 'Signed out' },
      { status: 200 }
    );
    
    response.cookies.set('auth-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
      path: '/',
    });

    return response;
  }
}