/**
 * **Feature: luxury-authentication, Property 5: Token security properties**
 * For any generated JWT token, it should have proper structure, valid expiration time, 
 * and pass integrity verification
 * **Validates: Requirements 3.3, 4.5**
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import fc from 'fast-check';
import { jwtService } from '../../lib/auth/jwt';
import { sessionService } from '../../lib/auth/sessionService';
import { userService } from '../../lib/auth/userService';
import { prisma } from '../../lib/prisma';
import jwt from 'jsonwebtoken';

// Test utilities for generating valid user data
const validUserArbitrary = fc.record({
  id: fc.string({ minLength: 10, maxLength: 30 }),
  email: fc.string({ minLength: 3, maxLength: 50 })
    .filter(s => s.includes('@') && s.includes('.'))
    .map(s => `test${s.replace(/[^a-zA-Z0-9@.]/g, '')}@example.com`),
  firstName: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0).map(s => s.trim()),
  lastName: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0).map(s => s.trim()),
  verified: fc.boolean(),
  createdAt: fc.date(),
  updatedAt: fc.date(),
});

const validUserDataArbitrary = fc.record({
  email: fc.string({ minLength: 3, maxLength: 50 })
    .filter(s => s.includes('@') && s.includes('.'))
    .map(s => `test${s.replace(/[^a-zA-Z0-9@.]/g, '')}@example.com`),
  password: fc.string({ minLength: 8, maxLength: 100 }).filter(s => s.length >= 8),
  firstName: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0).map(s => s.trim()),
  lastName: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0).map(s => s.trim()),
});

describe('Token Security Properties', () => {
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

  it('should generate tokens with proper JWT structure for any user', async () => {
    await fc.assert(
      fc.asyncProperty(validUserArbitrary, (user) => {
        const token = jwtService.generateToken(user);
        
        // JWT should have 3 parts separated by dots
        const parts = token.split('.');
        expect(parts).toHaveLength(3);
        
        // Each part should be base64url encoded
        parts.forEach(part => {
          expect(part).toMatch(/^[A-Za-z0-9_-]+$/);
          expect(part.length).toBeGreaterThan(0);
        });
        
        // Should be able to decode header and payload
        const header = JSON.parse(Buffer.from(parts[0], 'base64url').toString());
        const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
        
        // Header should have proper algorithm
        expect(header.alg).toBe('HS256');
        expect(header.typ).toBe('JWT');
        
        // Payload should contain user information
        expect(payload.userId).toBe(user.id);
        expect(payload.email).toBe(user.email);
        expect(payload.iss).toBe('flowforge-auth');
        expect(payload.aud).toBe('flowforge-app');
        expect(payload.exp).toBeDefined();
        expect(payload.iat).toBeDefined();
      }),
      { numRuns: 100 }
    );
  });

  it('should generate tokens with valid expiration times', async () => {
    await fc.assert(
      fc.asyncProperty(validUserArbitrary, (user) => {
        const beforeGeneration = Math.floor(Date.now() / 1000);
        const token = jwtService.generateToken(user);
        const afterGeneration = Math.floor(Date.now() / 1000);
        
        const decoded = jwtService.decodeToken(token);
        expect(decoded).toBeDefined();
        expect(decoded!.exp).toBeDefined();
        expect(decoded!.iat).toBeDefined();
        
        // Issued at time should be reasonable
        expect(decoded!.iat!).toBeGreaterThanOrEqual(beforeGeneration);
        expect(decoded!.iat!).toBeLessThanOrEqual(afterGeneration);
        
        // Expiration should be in the future
        expect(decoded!.exp!).toBeGreaterThan(afterGeneration);
        
        // Expiration should be reasonable (7 days = 604800 seconds)
        const expectedExpiration = decoded!.iat! + 604800;
        expect(Math.abs(decoded!.exp! - expectedExpiration)).toBeLessThan(10); // Allow 10 second variance
      }),
      { numRuns: 100 }
    );
  });

  it('should validate tokens correctly for any valid token', async () => {
    await fc.assert(
      fc.asyncProperty(validUserArbitrary, (user) => {
        const token = jwtService.generateToken(user);
        
        // Valid token should pass validation
        const validation = jwtService.validateToken(token);
        expect(validation.valid).toBe(true);
        expect(validation.payload).toBeDefined();
        expect(validation.payload!.userId).toBe(user.id);
        expect(validation.payload!.email).toBe(user.email);
        expect(validation.error).toBeUndefined();
      }),
      { numRuns: 100 }
    );
  });

  it('should reject invalid or tampered tokens', async () => {
    await fc.assert(
      fc.asyncProperty(validUserArbitrary, fc.string({ minLength: 1, maxLength: 10 }), (user, tamperString) => {
        const validToken = jwtService.generateToken(user);
        
        // Tamper with the token
        const tamperedToken = validToken + tamperString;
        
        const validation = jwtService.validateToken(tamperedToken);
        expect(validation.valid).toBe(false);
        expect(validation.error).toBeDefined();
        expect(validation.payload).toBeUndefined();
      }),
      { numRuns: 50 }
    );
  });

  it('should handle token expiration correctly', async () => {
    // Create a token with very short expiration for testing
    const user = {
      id: 'test-user-id',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      verified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Create token that expires in 1 second
    const shortLivedToken = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'fallback-secret-change-in-production',
      { expiresIn: '1s', issuer: 'flowforge-auth', audience: 'flowforge-app' }
    );

    // Should be valid immediately
    const immediateValidation = jwtService.validateToken(shortLivedToken);
    expect(immediateValidation.valid).toBe(true);

    // Wait for expiration
    await new Promise(resolve => setTimeout(resolve, 1100));

    // Should be invalid after expiration
    const expiredValidation = jwtService.validateToken(shortLivedToken);
    expect(expiredValidation.valid).toBe(false);
    expect(expiredValidation.error).toBe('Token expired');
  });

  it('should create and validate sessions properly for any user', async () => {
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
        expect(validatedUser!.email).toBe(user.email);
        
        // Token should be valid JWT
        const validation = jwtService.validateToken(sessionResult.token);
        expect(validation.valid).toBe(true);
        expect(validation.payload!.userId).toBe(user.id);
        
        // Clean up
        await sessionService.invalidateSession(sessionResult.token);
        await prisma.user.delete({ where: { id: user.id } });
      }),
      { numRuns: 50 }
    );
  });

  it('should properly invalidate sessions', async () => {
    await fc.assert(
      fc.asyncProperty(validUserDataArbitrary, async (userData) => {
        // Create user and session
        const user = await userService.createUser(userData);
        const sessionResult = await sessionService.createSession(user);
        
        // Session should be valid initially
        const initialValidation = await sessionService.validateSession(sessionResult.token);
        expect(initialValidation).toBeDefined();
        
        // Invalidate session
        await sessionService.invalidateSession(sessionResult.token);
        
        // Session should be invalid after invalidation
        const postInvalidationValidation = await sessionService.validateSession(sessionResult.token);
        expect(postInvalidationValidation).toBeNull();
        
        // Clean up
        await prisma.user.delete({ where: { id: user.id } });
      }),
      { numRuns: 50 }
    );
  });

  it('should refresh tokens maintaining security properties', async () => {
    await fc.assert(
      fc.asyncProperty(validUserDataArbitrary, async (userData) => {
        // Create user and session
        const user = await userService.createUser(userData);
        const originalSession = await sessionService.createSession(user);
        
        // Refresh session
        const refreshedSession = await sessionService.refreshSession(originalSession.token);
        expect(refreshedSession).toBeDefined();
        expect(refreshedSession!.token).not.toBe(originalSession.token);
        
        // Original token should be invalid
        const originalValidation = await sessionService.validateSession(originalSession.token);
        expect(originalValidation).toBeNull();
        
        // New token should be valid
        const newValidation = await sessionService.validateSession(refreshedSession!.token);
        expect(newValidation).toBeDefined();
        expect(newValidation!.id).toBe(user.id);
        
        // Clean up
        await sessionService.invalidateSession(refreshedSession!.token);
        await prisma.user.delete({ where: { id: user.id } });
      }),
      { numRuns: 30 }
    );
  });

  it('should generate unique tokens for each session', async () => {
    const userData = {
      email: 'unique-test@example.com',
      password: 'testpassword123',
      firstName: 'Test',
      lastName: 'User',
    };

    const user = await userService.createUser(userData);
    const tokens = new Set<string>();

    // Generate multiple tokens for the same user
    for (let i = 0; i < 10; i++) {
      const sessionResult = await sessionService.createSession(user);
      expect(tokens.has(sessionResult.token)).toBe(false);
      tokens.add(sessionResult.token);
      await sessionService.invalidateSession(sessionResult.token);
    }

    // Clean up
    await prisma.user.delete({ where: { id: user.id } });
  });
});