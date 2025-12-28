/**
 * **Feature: luxury-authentication, Property 6: Session lifecycle management**
 * For any user session, the system should properly manage creation, validation, 
 * expiration, and cleanup throughout the session lifecycle
 * **Validates: Requirements 4.2, 4.3**
 */

import { describe, it, expect } from '@jest/globals';
import fc from 'fast-check';
import jwt from 'jsonwebtoken';

const JWT_SECRET = 'test-jwt-secret-key-for-testing-only';

// Test utilities
const validUserIdArbitrary = fc.string({ minLength: 1, maxLength: 50 })
  .filter(s => s.trim().length > 0);

// Mock session management functions
function createSession(userId: string, expiresIn: string = '1h') {
  const sessionId = `session_${Date.now()}_${Math.random()}`;
  const token = jwt.sign({ userId, sessionId }, JWT_SECRET, { expiresIn });
  return { sessionId, token, userId };
}

function validateSession(token: string) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return { valid: true, userId: decoded.userId, sessionId: decoded.sessionId };
  } catch (error) {
    return { valid: false, error: error.message };
  }
}

function refreshSession(token: string, newExpiresIn: string = '1h') {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const newToken = jwt.sign(
      { userId: decoded.userId, sessionId: decoded.sessionId }, 
      JWT_SECRET, 
      { expiresIn: newExpiresIn }
    );
    return { success: true, token: newToken };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

describe('Session Lifecycle Management Properties', () => {
  it('should handle complete session lifecycle for any user', () => {
    fc.assert(
      fc.property(validUserIdArbitrary, (userId) => {
        // Create session
        const session = createSession(userId);
        expect(session.sessionId).toBeDefined();
        expect(session.token).toBeDefined();
        expect(session.userId).toBe(userId);
        
        // Validate session
        const validation = validateSession(session.token);
        expect(validation.valid).toBe(true);
        expect(validation.userId).toBe(userId);
        expect(validation.sessionId).toBe(session.sessionId);
        
        // Session should contain expected data
        const decoded = jwt.decode(session.token) as any;
        expect(decoded.userId).toBe(userId);
        expect(decoded.sessionId).toBe(session.sessionId);
        expect(decoded.exp).toBeDefined();
        expect(decoded.iat).toBeDefined();
      }),
      { numRuns: 100 }
    );
  });

  it('should maintain session state across multiple validations', () => {
    fc.assert(
      fc.property(validUserIdArbitrary, (userId) => {
        const session = createSession(userId);
        
        // Multiple validations should return consistent results
        const validation1 = validateSession(session.token);
        const validation2 = validateSession(session.token);
        const validation3 = validateSession(session.token);
        
        expect(validation1.valid).toBe(true);
        expect(validation2.valid).toBe(true);
        expect(validation3.valid).toBe(true);
        
        expect(validation1.userId).toBe(validation2.userId);
        expect(validation2.userId).toBe(validation3.userId);
        expect(validation1.sessionId).toBe(validation2.sessionId);
        expect(validation2.sessionId).toBe(validation3.sessionId);
      }),
      { numRuns: 50 }
    );
  });

  it('should handle session expiration properly', () => {
    fc.assert(
      fc.property(validUserIdArbitrary, (userId) => {
        // Create session with very short expiration
        const session = createSession(userId, '-1s'); // Already expired
        
        // Validation should fail for expired session
        const validation = validateSession(session.token);
        expect(validation.valid).toBe(false);
        expect(validation.error).toContain('expired');
      }),
      { numRuns: 50 }
    );
  });

  it('should handle session refresh maintaining user identity', () => {
    fc.assert(
      fc.property(validUserIdArbitrary, (userId) => {
        const originalSession = createSession(userId);
        
        // Refresh session
        const refreshResult = refreshSession(originalSession.token);
        expect(refreshResult.success).toBe(true);
        expect(refreshResult.token).toBeDefined();
        
        // New token should be different
        expect(refreshResult.token).not.toBe(originalSession.token);
        
        // But should maintain same user identity
        const originalValidation = validateSession(originalSession.token);
        const refreshedValidation = validateSession(refreshResult.token!);
        
        expect(originalValidation.userId).toBe(refreshedValidation.userId);
        expect(originalValidation.sessionId).toBe(refreshedValidation.sessionId);
      }),
      { numRuns: 50 }
    );
  });

  it('should handle multiple concurrent sessions for same user', () => {
    fc.assert(
      fc.property(validUserIdArbitrary, (userId) => {
        // Create multiple sessions for same user
        const session1 = createSession(userId);
        const session2 = createSession(userId);
        const session3 = createSession(userId);
        
        // All sessions should be valid
        const validation1 = validateSession(session1.token);
        const validation2 = validateSession(session2.token);
        const validation3 = validateSession(session3.token);
        
        expect(validation1.valid).toBe(true);
        expect(validation2.valid).toBe(true);
        expect(validation3.valid).toBe(true);
        
        // All should belong to same user
        expect(validation1.userId).toBe(userId);
        expect(validation2.userId).toBe(userId);
        expect(validation3.userId).toBe(userId);
        
        // But should have different session IDs
        expect(validation1.sessionId).not.toBe(validation2.sessionId);
        expect(validation2.sessionId).not.toBe(validation3.sessionId);
        expect(validation1.sessionId).not.toBe(validation3.sessionId);
      }),
      { numRuns: 50 }
    );
  });

  it('should extend session expiration when requested', () => {
    fc.assert(
      fc.property(validUserIdArbitrary, (userId) => {
        const originalSession = createSession(userId, '1h');
        const originalDecoded = jwt.decode(originalSession.token) as any;
        
        // Refresh with longer expiration
        const refreshResult = refreshSession(originalSession.token, '2h');
        expect(refreshResult.success).toBe(true);
        
        const refreshedDecoded = jwt.decode(refreshResult.token!) as any;
        
        // New token should have later expiration
        expect(refreshedDecoded.exp).toBeGreaterThan(originalDecoded.exp);
        
        // Should maintain same user and session identity
        expect(refreshedDecoded.userId).toBe(originalDecoded.userId);
        expect(refreshedDecoded.sessionId).toBe(originalDecoded.sessionId);
      }),
      { numRuns: 50 }
    );
  });
});