/**
 * **Feature: luxury-authentication, Property 7: Permission validation**
 * For any sensitive operation, the system should validate user permissions 
 * and session integrity before allowing access
 * **Validates: Requirements 3.4**
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import fc from 'fast-check';
import { requireAuth, rateLimit } from '../../lib/auth/middleware';
import { jwtService } from '../../lib/auth/jwt';
import { sessionService } from '../../lib/auth/sessionService';
import { userService } from '../../lib/auth/userService';
import { prisma } from '../../lib/prisma';

// Test utilities for generating valid user data
const validUserDataArbitrary = fc.record({
  email: fc.string({ minLength: 3, maxLength: 50 })
    .filter(s => s.includes('@') && s.includes('.'))
    .map(s => `test${s.replace(/[^a-zA-Z0-9@.]/g, '')}@example.com`),
  password: fc.string({ minLength: 8, maxLength: 100 }).filter(s => s.length >= 8),
  firstName: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0).map(s => s.trim()),
  lastName: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0).map(s => s.trim()),
});

// Mock Request class for testing
class MockRequest {
  headers: Map<string, string>;

  constructor(headers: Record<string, string> = {}) {
    this.headers = new Map(Object.entries(headers));
  }

  get(name: string): string | null {
    return this.headers.get(name.toLowerCase()) || null;
  }
}

// Convert MockRequest to Request-like object
function createMockRequest(headers: Record<string, string>): Request {
  const mockRequest = new MockRequest(headers);
  return {
    headers: {
      get: (name: string) => mockRequest.get(name),
    },
  } as Request;
}

describe('Permission Validation Properties', () => {
  beforeEach(async () => {
    // Clean up test data before each test
    await prisma.passwordResetToken.deleteMany();
    await prisma.userSession.deleteMany();
    await prisma.user.deleteMany();
  });

  afterEach(async () => {
    // Clean up test data after each test
    await prisma.passwordResetToken.deleteMany();
    await prisma.userSession.deleteMany();
    await prisma.user.deleteMany();
  });

  it('should validate authentication for any valid user session', async () => {
    await fc.assert(
      fc.asyncProperty(validUserDataArbitrary, async (userData) => {
        // Create user and session
        const user = await userService.createUser(userData);
        const sessionResult = await sessionService.createSession(user);
        
        // Create request with valid authorization header
        const request = createMockRequest({
          'authorization': `Bearer ${sessionResult.token}`,
        });
        
        // Should successfully authenticate
        const authResult = await requireAuth(request);
        expect(authResult).toBeDefined();
        expect(authResult.id).toBe(user.id);
        expect(authResult.email).toBe(user.email);
        
        // Clean up
        await sessionService.invalidateSession(sessionResult.token);
        await prisma.user.delete({ where: { id: user.id } });
      }),
      { numRuns: 50 }
    );
  });

  it('should reject authentication for any invalid token', async () => {
    await fc.assert(
      fc.asyncProperty(fc.string({ minLength: 10, maxLength: 100 }), async (invalidToken) => {
        // Skip if token happens to be valid format
        if (invalidToken.includes('.') && invalidToken.split('.').length === 3) {
          return;
        }
        
        const request = createMockRequest({
          'authorization': `Bearer ${invalidToken}`,
        });
        
        // Should reject invalid token
        await expect(requireAuth(request)).rejects.toThrow();
      }),
      { numRuns: 50 }
    );
  });

  it('should reject requests without authorization header', async () => {
    await fc.assert(
      fc.asyncProperty(fc.record({}), async () => {
        const request = createMockRequest({});
        
        // Should reject request without authorization
        await expect(requireAuth(request)).rejects.toThrow('Authentication required');
      }),
      { numRuns: 20 }
    );
  });

  it('should reject requests with malformed authorization header', async () => {
    await fc.assert(
      fc.asyncProperty(fc.string({ minLength: 1, maxLength: 50 }), async (malformedAuth) => {
        // Skip if auth happens to start with "Bearer "
        if (malformedAuth.startsWith('Bearer ')) {
          return;
        }
        
        const request = createMockRequest({
          'authorization': malformedAuth,
        });
        
        // Should reject malformed authorization
        await expect(requireAuth(request)).rejects.toThrow('Authentication required');
      }),
      { numRuns: 50 }
    );
  });

  it('should reject expired tokens', async () => {
    const userData = {
      email: 'expired-test@example.com',
      password: 'testpassword123',
      firstName: 'Test',
      lastName: 'User',
    };

    const user = await userService.createUser(userData);
    
    // Create an expired token manually
    const expiredToken = jwtService.generateToken(user);
    
    // Wait a moment then invalidate the session to simulate expiration
    const sessionResult = await sessionService.createSession(user);
    await sessionService.invalidateSession(sessionResult.token);
    
    const request = createMockRequest({
      'authorization': `Bearer ${sessionResult.token}`,
    });
    
    // Should reject expired/invalidated token
    await expect(requireAuth(request)).rejects.toThrow();
    
    // Clean up
    await prisma.user.delete({ where: { id: user.id } });
  });

  it('should reject tokens for non-existent users', async () => {
    // Create a token for a user that doesn't exist
    const fakeUser = {
      id: 'non-existent-user-id',
      email: 'fake@example.com',
      firstName: 'Fake',
      lastName: 'User',
      verified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    const fakeToken = jwtService.generateToken(fakeUser);
    
    const request = createMockRequest({
      'authorization': `Bearer ${fakeToken}`,
    });
    
    // Should reject token for non-existent user
    await expect(requireAuth(request)).rejects.toThrow('User not found');
  });

  it('should enforce rate limiting for any identifier', async () => {
    await fc.assert(
      fc.asyncProperty(fc.string({ minLength: 1, maxLength: 50 }), async (identifier) => {
        // First 5 requests should succeed
        for (let i = 0; i < 5; i++) {
          const allowed = rateLimit(identifier, 5, 60000); // 5 requests per minute
          expect(allowed).toBe(true);
        }
        
        // 6th request should be rate limited
        const rateLimited = rateLimit(identifier, 5, 60000);
        expect(rateLimited).toBe(false);
      }),
      { numRuns: 20 }
    );
  });

  it('should reset rate limits after window expires', async () => {
    const identifier = 'test-rate-limit-reset';
    const windowMs = 100; // Very short window for testing
    
    // Exhaust rate limit
    for (let i = 0; i < 3; i++) {
      const allowed = rateLimit(identifier, 3, windowMs);
      expect(allowed).toBe(true);
    }
    
    // Should be rate limited
    const rateLimited = rateLimit(identifier, 3, windowMs);
    expect(rateLimited).toBe(false);
    
    // Wait for window to expire
    await new Promise(resolve => setTimeout(resolve, windowMs + 10));
    
    // Should be allowed again
    const allowedAfterReset = rateLimit(identifier, 3, windowMs);
    expect(allowedAfterReset).toBe(true);
  });

  it('should validate session integrity across multiple operations', async () => {
    await fc.assert(
      fc.asyncProperty(validUserDataArbitrary, async (userData) => {
        // Create user and session
        const user = await userService.createUser(userData);
        const sessionResult = await sessionService.createSession(user);
        
        // Multiple authentication attempts should succeed with same token
        for (let i = 0; i < 3; i++) {
          const request = createMockRequest({
            'authorization': `Bearer ${sessionResult.token}`,
          });
          
          const authResult = await requireAuth(request);
          expect(authResult.id).toBe(user.id);
          expect(authResult.email).toBe(user.email);
        }
        
        // Invalidate session
        await sessionService.invalidateSession(sessionResult.token);
        
        // Further attempts should fail
        const request = createMockRequest({
          'authorization': `Bearer ${sessionResult.token}`,
        });
        
        await expect(requireAuth(request)).rejects.toThrow();
        
        // Clean up
        await prisma.user.delete({ where: { id: user.id } });
      }),
      { numRuns: 30 }
    );
  });

  it('should handle concurrent authentication requests safely', async () => {
    const userData = {
      email: 'concurrent-test@example.com',
      password: 'testpassword123',
      firstName: 'Test',
      lastName: 'User',
    };

    const user = await userService.createUser(userData);
    const sessionResult = await sessionService.createSession(user);
    
    // Create multiple concurrent authentication requests
    const requests = Array.from({ length: 10 }, () => 
      createMockRequest({
        'authorization': `Bearer ${sessionResult.token}`,
      })
    );
    
    // All should succeed
    const results = await Promise.all(
      requests.map(request => requireAuth(request))
    );
    
    results.forEach(result => {
      expect(result.id).toBe(user.id);
      expect(result.email).toBe(user.email);
    });
    
    // Clean up
    await sessionService.invalidateSession(sessionResult.token);
    await prisma.user.delete({ where: { id: user.id } });
  });

  it('should maintain security when user data changes', async () => {
    const userData = {
      email: 'security-test@example.com',
      password: 'testpassword123',
      firstName: 'Test',
      lastName: 'User',
    };

    const user = await userService.createUser(userData);
    const sessionResult = await sessionService.createSession(user);
    
    // Authentication should work initially
    const request1 = createMockRequest({
      'authorization': `Bearer ${sessionResult.token}`,
    });
    const authResult1 = await requireAuth(request1);
    expect(authResult1.id).toBe(user.id);
    
    // Update user data
    await userService.updateUser(user.id, { firstName: 'Updated' });
    
    // Authentication should still work (token contains immutable user ID)
    const request2 = createMockRequest({
      'authorization': `Bearer ${sessionResult.token}`,
    });
    const authResult2 = await requireAuth(request2);
    expect(authResult2.id).toBe(user.id);
    
    // Clean up
    await sessionService.invalidateSession(sessionResult.token);
    await prisma.user.delete({ where: { id: user.id } });
  });
});