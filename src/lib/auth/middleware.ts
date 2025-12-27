import { NextRequest, NextResponse } from 'next/server';
import { jwtService } from './jwt';
import { userService } from './userService';

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: string;
    email: string;
  };
}

export async function authMiddleware(request: NextRequest): Promise<NextResponse | null> {
  // Get token from Authorization header or cookies
  const authHeader = request.headers.get('authorization');
  const cookieToken = request.cookies.get('auth-token')?.value;
  
  let token: string | null = null;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else if (cookieToken) {
    token = cookieToken;
  }

  if (!token) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }

  // Validate token
  const validation = jwtService.validateToken(token);
  
  if (!validation.valid || !validation.payload) {
    return NextResponse.json(
      { error: validation.error || 'Invalid token' },
      { status: 401 }
    );
  }

  // Verify user still exists
  const user = await userService.getUserById(validation.payload.userId);
  if (!user) {
    return NextResponse.json(
      { error: 'User not found' },
      { status: 401 }
    );
  }

  // Add user info to request (this would be available in API routes)
  // Note: In Next.js middleware, we can't modify the request object directly
  // Instead, we'll pass user info via headers
  const response = NextResponse.next();
  response.headers.set('x-user-id', user.id);
  response.headers.set('x-user-email', user.email);
  
  return response;
}

// Helper function to extract user from request in API routes
export function getUserFromRequest(request: Request): { id: string; email: string } | null {
  const userId = request.headers.get('x-user-id');
  const userEmail = request.headers.get('x-user-email');
  
  if (!userId || !userEmail) {
    return null;
  }
  
  return { id: userId, email: userEmail };
}

// Helper function for API route authentication
export async function requireAuth(request: Request): Promise<{ id: string; email: string }> {
  // Get token from Authorization header
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Authentication required');
  }

  const token = authHeader.substring(7);
  
  // Validate token
  const validation = jwtService.validateToken(token);
  
  if (!validation.valid || !validation.payload) {
    throw new Error(validation.error || 'Invalid token');
  }

  // Verify user still exists
  const user = await userService.getUserById(validation.payload.userId);
  if (!user) {
    throw new Error('User not found');
  }

  return { id: user.id, email: user.email };
}

// Rate limiting helper
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function rateLimit(
  identifier: string,
  maxRequests: number = 5,
  windowMs: number = 15 * 60 * 1000 // 15 minutes
): boolean {
  const now = Date.now();
  const windowStart = now - windowMs;
  
  // Clean up old entries
  for (const [key, value] of rateLimitMap.entries()) {
    if (value.resetTime < windowStart) {
      rateLimitMap.delete(key);
    }
  }
  
  const current = rateLimitMap.get(identifier);
  
  if (!current) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now });
    return true;
  }
  
  if (current.resetTime < windowStart) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now });
    return true;
  }
  
  if (current.count >= maxRequests) {
    return false;
  }
  
  current.count++;
  return true;
}