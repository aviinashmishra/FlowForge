import { NextRequest, NextResponse } from 'next/server';
import { sessionService } from '../../../../lib/auth/sessionService';

// POST - Refresh authentication token
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

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'No authentication token provided.' },
        { status: 401 }
      );
    }

    // Refresh session
    const refreshResult = await sessionService.refreshSession(token);
    
    if (!refreshResult) {
      return NextResponse.json(
        { success: false, error: 'Unable to refresh session. Please sign in again.' },
        { status: 401 }
      );
    }

    // Set new HTTP-only cookie
    const response = NextResponse.json(
      { 
        success: true, 
        token: refreshResult.token,
        message: 'Session refreshed successfully.' 
      },
      { status: 200 }
    );
    
    response.cookies.set('auth-token', refreshResult.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    return response;

  } catch (error) {
    console.error('Refresh token error:', error);
    
    return NextResponse.json(
      { success: false, error: 'An error occurred while refreshing session.' },
      { status: 500 }
    );
  }
}