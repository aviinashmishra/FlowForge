/**
 * **Feature: luxury-authentication, Property 10: Route protection**
 * For any protected API endpoint, the middleware should properly validate 
 * authentication and reject unauthorized access
 * **Validates: Requirements 6.3**
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import fc from 'fast-check';
import { requireAuth } from '../../lib/auth/middleware';
import { userService } from '../../lib/auth/userService';
import { sessionService } from '../../lib/auth/sessionService';
import { prisma } from '../../lib/prisma';

const validUserDataArbitrary = fc.record({
  email: fc.string({ minLength: 3, maxLength: 50 })
    .filter(s => s.includes('@') && s.includes('.'))
    .map(s => `test${s.replace(/[^a-zA-Z0-9@.]/g, '')}@example.com`),
  password: fc.string({ minLength: 8, maxLength: 100 }).filter(s => s.length >= 8),
  firstName: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0).map(s => s.trim()),
  lastName: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0).map(s => s.trim()),
});

function createMockRequest(headers: Record<string, string>): Request {
  return {
    headers: {
      get: (name: string) => headers[name.toLowerCase()] || null,
    },
  } as Request;
}

describe('Route Protection Properties', () => {
  beforeEach(async () => {
    await prisma.passwordResetToken.deleteMany();
    await prisma.userSession.deleteMany();
    await prisma.user.deleteMany();
  });

  afterEach(async () => {
    await prisma.passwordResetToken.deleteMany();
    await prisma.userSession.deleteMany();
    await prisma.user.deleteMany();
  });

  it('should protect routes for any valid authenticated user', async () => {
    await fc.assert(
      fc.asyncProperty(validUserDataArbitrary, async (userData) => {
        const user = await userService.createUser(userData);
        const sessionResult = await sessionService.createSession(user);
        
        const request = createMockRequest({
          'authorization': `Bearer ${sessionResult.token}`,
        });
        
        const authResult = await requireAuth(request);
        expect(authResult.id).toBe(user.id);
        expect(authResult.email).toBe(user.email);
        
        await sessionService.invalidateSession(sessionResult.token);
        await prisma.user.delete({ where: { id: user.id } });
      }),
      { numRuns: 50 }
    );
  });

  it('should reject any request without authorization', async () => {
    await fc.assert(
      fc.asyncProperty(fc.record({}), async () => {
        const request = createMockRequest({});
        await expect(requireAuth(request)).rejects.toThrow('Authentication required');
      }),
      { numRuns: 20 }
    );
  });

  it('should reject any invalid token format', async () => {
    await fc.assert(
      fc.asyncProperty(fc.string({ minLength: 1, maxLength: 100 }), async (invalidToken) => {
        if (invalidToken.includes('.') && invalidToken.split('.').length === 3) {
          return; // Skip valid JWT format
        }
        
        const request = createMockRequest({
          'authorization': `Bearer ${invalidToken}`,
        });
        
        await expect(requireAuth(request)).rejects.toThrow();
      }),
      { numRuns: 50 }
    );
  });
});