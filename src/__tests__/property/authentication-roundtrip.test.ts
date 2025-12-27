/**
 * **Feature: luxury-authentication, Property 3: Authentication round-trip**
 * For any valid user credentials, successful authentication should create a session 
 * that can be used to access protected resources and maintain user identity
 * **Validates: Requirements 2.3, 2.4**
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import fc from 'fast-check';
import { userService } from '../../lib/auth/userService';
import { sessionService } from '../../lib/auth/sessionService';
import { requireAuth } from '../../lib/auth/middleware';
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

function createMockRequest(headers: Record<string, string>): Request {
  const mockRequest = new MockRequest(headers);
  return {
    headers: {
      get: (name: string) => mockRequest.get(name),
    },
  } as Request;
}

describe('Authentication Round-trip Properties', () => {
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

  it('should complete full authentication round-trip for any valid user', async () => {
    await fc.assert(
      fc.asyncProperty(validUserDataArbitrary, async (userData) => {
        // Step 1: Create user account
        const user = await userService.createUser(userData);
        expect(user).toBeDefined();
        expect(user.email).toBe(userData.email);
        expect(user.firstName).toBe(userData.firstName);
        expect(user.lastName).toBe(userData.lastName);

        // Step 2: Authenticate with credentials
        const authenticatedUser = await userService.authenticateUser(userData.email, userData.password);
        expect(authenticatedUser).toBeDefined();
        expect(authenticatedUser!.id).toBe(user.id);
        expect(authenticatedUser!.email).toBe(user.email);

        // Step 3: Create session
        const sessionResult = await sessionService.createSession(authenticatedUser!);
        expect(sessionResult.token).toBeDefined();
        expect(sessionResult.sessionId).toBeDefined();

        // Step 4: Validate session can access protected resources
        const request = createMockRequest({
          'authorization': `Bearer ${sessionResult.token}`,
        });

        const authResult = await requireAuth(request);
        expect(authResult).toBeDefined();
        expect(authResult.id).toBe(user.id);
        expect(authResult.email).toBe(user.email);

        // Step 5: Verify session maintains user identity
        const sessionUser = await sessionService.validateSession(sessionResult.token);
        expect(sessionUser).toBeDefined();
        expect(sessionUser!.id).toBe(user.id);
        expect(sessionUser!.email).toBe(user.email);
        expect(sessionUser!.firstName).toBe(userData.firstName);
        expect(sessionUser!.lastName).toBe(userData.lastName);

        // Clean up
        await sessionService.invalidateSession(sessionResult.token);
        await prisma.user.delete({ where: { id: user.id } });
      }),
      { numRuns: 50 }
    );
  });

  it('should maintain session consistency across multiple protected resource accesses', async () => {
    await fc.assert(
      fc.asyncProperty(validUserDataArbitrary, async (userData) => {
        // Create user and session
        const user = await userService.createUser(userData);
        const sessionResult = await sessionService.createSession(user);

        // Access protected resources multiple times
        for (let i = 0; i < 5; i++) {
          const request = createMockRequest({
            'authorization': `Bearer ${sessionResult.token}`,
          });

          const authResult = await requireAuth(request);
          expect(authResult.id).toBe(user.id);
          expect(authResult.email).toBe(user.email);

          // Verify session is still valid
          const sessionUser = await sessionService.validateSession(sessionResult.token);
          expect(sessionUser).toBeDefined();
          expect(sessionUser!.id).toBe(user.id);
        }

        // Clean up
        await sessionService.invalidateSession(sessionResult.token);
        await prisma.user.delete({ where: { id: user.id } });
      }),
      { numRuns: 30 }
    );
  });

  it('should handle session refresh maintaining user identity', async () => {
    await fc.assert(
      fc.asyncProperty(validUserDataArbitrary, async (userData) => {
        // Create user and initial session
        const user = await userService.createUser(userData);
        const originalSession = await sessionService.createSession(user);

        // Verify original session works
        const originalRequest = createMockRequest({
          'authorization': `Bearer ${originalSession.token}`,
        });
        const originalAuth = await requireAuth(originalRequest);
        expect(originalAuth.id).toBe(user.id);

        // Refresh session
        const refreshedSession = await sessionService.refreshSession(originalSession.token);
        expect(refreshedSession).toBeDefined();
        expect(refreshedSession!.token).not.toBe(originalSession.token);

        // Verify refreshed session maintains identity
        const refreshedRequest = createMockRequest({
          'authorization': `Bearer ${refreshedSession!.token}`,
        });
        const refreshedAuth = await requireAuth(refreshedRequest);
        expect(refreshedAuth.id).toBe(user.id);
        expect(refreshedAuth.email).toBe(user.email);

        // Verify original session is invalidated
        await expect(requireAuth(originalRequest)).rejects.toThrow();

        // Clean up
        await sessionService.invalidateSession(refreshedSession!.token);
        await prisma.user.delete({ where: { id: user.id } });
      }),
      { numRuns: 30 }
    );
  });

  it('should reject authentication with invalid credentials', async () => {
    await fc.assert(
      fc.asyncProperty(validUserDataArbitrary, fc.string({ minLength: 1, maxLength: 50 }), async (userData, wrongPassword) => {
        // Skip if wrong password happens to be the same as correct password
        if (wrongPassword === userData.password) {
          return;
        }

        // Create user
        const user = await userService.createUser(userData);

        // Authentication should fail with wrong password
        const authResult = await userService.authenticateUser(userData.email, wrongPassword);
        expect(authResult).toBeNull();

        // Authentication should fail with wrong email
        const wrongEmail = `wrong${userData.email}`;
        const authResult2 = await userService.authenticateUser(wrongEmail, userData.password);
        expect(authResult2).toBeNull();

        // Clean up
        await prisma.user.delete({ where: { id: user.id } });
      }),
      { numRuns: 50 }
    );
  });

  it('should handle session invalidation properly', async () => {
    await fc.assert(
      fc.asyncProperty(validUserDataArbitrary, async (userData) => {
        // Create user and session
        const user = await userService.createUser(userData);
        const sessionResult = await sessionService.createSession(user);

        // Verify session works initially
        const request = createMockRequest({
          'authorization': `Bearer ${sessionResult.token}`,
        });
        const authResult = await requireAuth(request);
        expect(authResult.id).toBe(user.id);

        // Invalidate session
        await sessionService.invalidateSession(sessionResult.token);

        // Session should no longer work
        await expect(requireAuth(request)).rejects.toThrow();

        // Session validation should return null
        const sessionUser = await sessionService.validateSession(sessionResult.token);
        expect(sessionUser).toBeNull();

        // Clean up
        await prisma.user.delete({ where: { id: user.id } });
      }),
      { numRuns: 50 }
    );
  });

  it('should handle concurrent authentication requests safely', async () => {
    const userData = {
      email: 'concurrent-auth-test@example.com',
      password: 'testpassword123',
      firstName: 'Test',
      lastName: 'User',
    };

    const user = await userService.createUser(userData);

    // Create multiple concurrent authentication requests
    const authPromises = Array.from({ length: 5 }, () =>
      userService.authenticateUser(userData.email, userData.password)
    );

    const results = await Promise.all(authPromises);

    // All should succeed and return the same user
    results.forEach(result => {
      expect(result).toBeDefined();
      expect(result!.id).toBe(user.id);
      expect(result!.email).toBe(user.email);
    });

    // Clean up
    await prisma.user.delete({ where: { id: user.id } });
  });

  it('should maintain user data integrity throughout authentication lifecycle', async () => {
    await fc.assert(
      fc.asyncProperty(validUserDataArbitrary, async (userData) => {
        // Create user
        const originalUser = await userService.createUser(userData);

        // Authenticate
        const authenticatedUser = await userService.authenticateUser(userData.email, userData.password);
        expect(authenticatedUser).toBeDefined();

        // Create session
        const sessionResult = await sessionService.createSession(authenticatedUser!);

        // Access through protected endpoint
        const request = createMockRequest({
          'authorization': `Bearer ${sessionResult.token}`,
        });
        const protectedUser = await requireAuth(request);

        // Validate session
        const sessionUser = await sessionService.validateSession(sessionResult.token);

        // All user representations should have consistent core data
        const users = [originalUser, authenticatedUser!, sessionUser!];
        const protectedUserData = { id: protectedUser.id, email: protectedUser.email };

        users.forEach(user => {
          expect(user.id).toBe(originalUser.id);
          expect(user.email).toBe(originalUser.email);
          expect(user.firstName).toBe(originalUser.firstName);
          expect(user.lastName).toBe(originalUser.lastName);
        });

        expect(protectedUserData.id).toBe(originalUser.id);
        expect(protectedUserData.email).toBe(originalUser.email);

        // Clean up
        await sessionService.invalidateSession(sessionResult.token);
        await prisma.user.delete({ where: { id: originalUser.id } });
      }),
      { numRuns: 30 }
    );
  });

  it('should handle multiple sessions for the same user', async () => {
    const userData = {
      email: 'multi-session-test@example.com',
      password: 'testpassword123',
      firstName: 'Test',
      lastName: 'User',
    };

    const user = await userService.createUser(userData);
    const sessions: string[] = [];

    // Create multiple sessions for the same user
    for (let i = 0; i < 3; i++) {
      const sessionResult = await sessionService.createSession(user);
      sessions.push(sessionResult.token);
    }

    // All sessions should work independently
    for (const token of sessions) {
      const request = createMockRequest({
        'authorization': `Bearer ${token}`,
      });
      const authResult = await requireAuth(request);
      expect(authResult.id).toBe(user.id);
    }

    // Invalidate one session
    await sessionService.invalidateSession(sessions[0]);

    // First session should not work
    const invalidRequest = createMockRequest({
      'authorization': `Bearer ${sessions[0]}`,
    });
    await expect(requireAuth(invalidRequest)).rejects.toThrow();

    // Other sessions should still work
    for (let i = 1; i < sessions.length; i++) {
      const request = createMockRequest({
        'authorization': `Bearer ${sessions[i]}`,
      });
      const authResult = await requireAuth(request);
      expect(authResult.id).toBe(user.id);
    }

    // Clean up
    for (let i = 1; i < sessions.length; i++) {
      await sessionService.invalidateSession(sessions[i]);
    }
    await prisma.user.delete({ where: { id: user.id } });
  });
});