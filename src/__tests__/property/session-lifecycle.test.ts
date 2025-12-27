/**
 * **Feature: luxury-authentication, Property 6: Session lifecycle management**
 * For any user session, the system should properly handle creation, validation, 
 * expiration, and invalidation while maintaining security
 * **Validates: Requirements 4.1, 4.2, 4.3**
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import fc from 'fast-check';
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

describe('Session Lifecycle Management Properties', () => {
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

  it('should handle complete session lifecycle for any user', async () => {
    await fc.assert(
      fc.asyncProperty(validUserDataArbitrary, async (userData) => {
        // Create user
        const user = await userService.createUser(userData);
        
        // Create session
        const sessionResult = await sessionService.createSession(user);
        expect(sessionResult.token).toBeDefined();
        expect(sessionResult.sessionId).toBeDefined();
        
        // Validate session
        const validatedUser = await sessionService.validateSession(sessionResult.token);
        expect(validatedUser).toBeDefined();
        expect(validatedUser!.id).toBe(user.id);
        
        // Invalidate session
        await sessionService.invalidateSession(sessionResult.token);
        
        // Session should no longer be valid
        const invalidatedUser = await sessionService.validateSession(sessionResult.token);
        expect(invalidatedUser).toBeNull();
        
        await prisma.user.delete({ where: { id: user.id } });
      }),
      { numRuns: 50 }
    );
  });

  it('should maintain session state across multiple validations', async () => {
    await fc.assert(
      fc.asyncProperty(validUserDataArbitrary, async (userData) => {
        const user = await userService.createUser(userData);
        const sessionResult = await sessionService.createSession(user);
        
        // Multiple validations should return consistent results
        for (let i = 0; i < 5; i++) {
          const validatedUser = await sessionService.validateSession(sessionResult.token);
          expect(validatedUser).toBeDefined();
          expect(validatedUser!.id).toBe(user.id);
          expect(validatedUser!.email).toBe(user.email);
        }
        
        await sessionService.invalidateSession(sessionResult.token);
        await prisma.user.delete({ where: { id: user.id } });
      }),
      { numRuns: 30 }
    );
  });

  it('should handle session expiration properly', async () => {
    const userData = {
      email: 'expiration-test@example.com',
      password: 'testpassword123',
      firstName: 'Test',
      lastName: 'User',
    };

    const user = await userService.createUser(userData);
    const sessionResult = await sessionService.createSession(user);
    
    // Session should be valid initially
    const validUser = await sessionService.validateSession(sessionResult.token);
    expect(validUser).toBeDefined();
    
    // Manually expire the session
    await prisma.userSession.update({
      where: { token: sessionResult.token },
      data: { expiresAt: new Date(Date.now() - 1000) }, // 1 second ago
    });
    
    // Session should now be invalid
    const expiredUser = await sessionService.validateSession(sessionResult.token);
    expect(expiredUser).toBeNull();
    
    await prisma.user.delete({ where: { id: user.id } });
  });

  it('should clean up expired sessions', async () => {
    const userData = {
      email: 'cleanup-test@example.com',
      password: 'testpassword123',
      firstName: 'Test',
      lastName: 'User',
    };

    const user = await userService.createUser(userData);
    
    // Create multiple sessions
    const sessions = [];
    for (let i = 0; i < 3; i++) {
      const sessionResult = await sessionService.createSession(user);
      sessions.push(sessionResult);
    }
    
    // Expire all sessions
    await prisma.userSession.updateMany({
      where: { userId: user.id },
      data: { expiresAt: new Date(Date.now() - 1000) },
    });
    
    // Clean up expired sessions
    const cleanedCount = await sessionService.cleanupExpiredSessions();
    expect(cleanedCount).toBe(3);
    
    // Verify sessions are gone
    for (const session of sessions) {
      const validatedUser = await sessionService.validateSession(session.token);
      expect(validatedUser).toBeNull();
    }
    
    await prisma.user.delete({ where: { id: user.id } });
  });

  it('should handle session refresh maintaining user identity', async () => {
    await fc.assert(
      fc.asyncProperty(validUserDataArbitrary, async (userData) => {
        const user = await userService.createUser(userData);
        const originalSession = await sessionService.createSession(user);
        
        // Refresh session
        const refreshedSession = await sessionService.refreshSession(originalSession.token);
        expect(refreshedSession).toBeDefined();
        expect(refreshedSession!.token).not.toBe(originalSession.token);
        
        // Original session should be invalid
        const originalValidation = await sessionService.validateSession(originalSession.token);
        expect(originalValidation).toBeNull();
        
        // New session should be valid and maintain user identity
        const newValidation = await sessionService.validateSession(refreshedSession!.token);
        expect(newValidation).toBeDefined();
        expect(newValidation!.id).toBe(user.id);
        expect(newValidation!.email).toBe(user.email);
        
        await sessionService.invalidateSession(refreshedSession!.token);
        await prisma.user.delete({ where: { id: user.id } });
      }),
      { numRuns: 30 }
    );
  });

  it('should handle multiple concurrent sessions for same user', async () => {
    const userData = {
      email: 'concurrent-sessions@example.com',
      password: 'testpassword123',
      firstName: 'Test',
      lastName: 'User',
    };

    const user = await userService.createUser(userData);
    const sessions = [];
    
    // Create multiple sessions concurrently
    const sessionPromises = Array.from({ length: 5 }, () => 
      sessionService.createSession(user)
    );
    
    const sessionResults = await Promise.all(sessionPromises);
    sessions.push(...sessionResults);
    
    // All sessions should be valid
    for (const session of sessions) {
      const validatedUser = await sessionService.validateSession(session.token);
      expect(validatedUser).toBeDefined();
      expect(validatedUser!.id).toBe(user.id);
    }
    
    // Invalidate one session
    await sessionService.invalidateSession(sessions[0].token);
    
    // First session should be invalid
    const invalidatedUser = await sessionService.validateSession(sessions[0].token);
    expect(invalidatedUser).toBeNull();
    
    // Other sessions should still be valid
    for (let i = 1; i < sessions.length; i++) {
      const validatedUser = await sessionService.validateSession(sessions[i].token);
      expect(validatedUser).toBeDefined();
      expect(validatedUser!.id).toBe(user.id);
    }
    
    // Clean up
    for (let i = 1; i < sessions.length; i++) {
      await sessionService.invalidateSession(sessions[i].token);
    }
    await prisma.user.delete({ where: { id: user.id } });
  });

  it('should invalidate all user sessions when requested', async () => {
    const userData = {
      email: 'invalidate-all@example.com',
      password: 'testpassword123',
      firstName: 'Test',
      lastName: 'User',
    };

    const user = await userService.createUser(userData);
    const sessions = [];
    
    // Create multiple sessions
    for (let i = 0; i < 3; i++) {
      const sessionResult = await sessionService.createSession(user);
      sessions.push(sessionResult);
    }
    
    // All sessions should be valid initially
    for (const session of sessions) {
      const validatedUser = await sessionService.validateSession(session.token);
      expect(validatedUser).toBeDefined();
    }
    
    // Invalidate all user sessions
    await sessionService.invalidateAllUserSessions(user.id);
    
    // All sessions should now be invalid
    for (const session of sessions) {
      const validatedUser = await sessionService.validateSession(session.token);
      expect(validatedUser).toBeNull();
    }
    
    await prisma.user.delete({ where: { id: user.id } });
  });

  it('should extend session expiration when requested', async () => {
    const userData = {
      email: 'extend-session@example.com',
      password: 'testpassword123',
      firstName: 'Test',
      lastName: 'User',
    };

    const user = await userService.createUser(userData);
    const sessionResult = await sessionService.createSession(user);
    
    // Get original expiration
    const originalSession = await prisma.userSession.findUnique({
      where: { token: sessionResult.token },
    });
    expect(originalSession).toBeDefined();
    
    // Extend session
    const extended = await sessionService.extendSession(sessionResult.token);
    expect(extended).toBe(true);
    
    // Get updated expiration
    const extendedSession = await prisma.userSession.findUnique({
      where: { token: sessionResult.token },
    });
    expect(extendedSession).toBeDefined();
    expect(extendedSession!.expiresAt.getTime()).toBeGreaterThan(originalSession!.expiresAt.getTime());
    
    await sessionService.invalidateSession(sessionResult.token);
    await prisma.user.delete({ where: { id: user.id } });
  });
});