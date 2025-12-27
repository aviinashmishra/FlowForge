import { NextRequest, NextResponse } from 'next/server';
import { sessionService } from '../../../../lib/auth/sessionService';

// GET - Get current authenticated user from session
export async function GET(request: NextRequest) {
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

    // Validate session and get user
    const user = await sessionService.validateSession(token);
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired session.' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: true, user },
      { status: 200 }
    );

  } catch (error) {
    console.error('Get current user error:', error);
    
    return NextResponse.json(
      { success: false, error: 'An error occurred.' },
      { status: 500 }
    );
  }
}