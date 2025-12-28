/**
 * **Feature: luxury-authentication, Property 7: Reset token security**
 * For any password reset token, it should be cryptographically secure, 
 * single-use, time-limited, and properly invalidated after use
 * **Validates: Requirements 5.1, 5.2**
 */

import { describe, it, expect } from '@jest/globals';
import fc from 'fast-check';
import crypto from 'crypto';

// Test utilities
const validEmailArbitrary = fc.string({ minLength: 3, maxLength: 50 })
  .filter(s => s.includes('@') && s.includes('.'))
  .map(s => `test${s.replace(/[^a-zA-Z0-9@.]/g, '')}@example.com`);

// Mock reset token management
interface ResetToken {
  token: string;
  email: string;
  expiresAt: Date;
  used: boolean;
  createdAt: Date;
}

const tokenStore = new Map<string, ResetToken>();

function generateResetToken(email: string, expirationMinutes: number = 15): ResetToken {
  const token = crypto.randomBytes(32).toString('hex');
  const resetToken: ResetToken = {
    token,
    email,
    expiresAt: new Date(Date.now() + expirationMinutes * 60 * 1000),
    used: false,
    createdAt: new Date(),
  };
  
  tokenStore.set(token, resetToken);
  return resetToken;
}

function validateResetToken(token: string): { valid: boolean; email?: string; error?: string } {
  const resetToken = tokenStore.get(token);
  
  if (!resetToken) {
    return { valid: false, error: 'Token not found' };
  }
  
  if (resetToken.used) {
    return { valid: false, error: 'Token already used' };
  }
  
  if (resetToken.expiresAt < new Date()) {
    return { valid: false, error: 'Token expired' };
  }
  
  return { valid: true, email: resetToken.email };
}

function useResetToken(token: string): { success: boolean; error?: string } {
  const resetToken = tokenStore.get(token);
  
  if (!resetToken) {
    return { success: false, error: 'Token not found' };
  }
  
  if (resetToken.used) {
    return { success: false, error: 'Token already used' };
  }
  
  if (resetToken.expiresAt < new Date()) {
    return { success: false, error: 'Token expired' };
  }
  
  resetToken.used = true;
  return { success: true };
}

describe('Reset Token Security Properties', () => {
  beforeEach(() => {
    tokenStore.clear();
  });

  it('should generate secure reset tokens for any valid user', () => {
    fc.assert(
      fc.property(validEmailArbitrary, (email) => {
        const resetToken = generateResetToken(email);
        
        // Token should be defined and non-empty
        expect(resetToken.token).toBeDefined();
        expect(resetToken.token.length).toBeGreaterThan(0);
        
        // Token should be cryptographically secure (hex string of appropriate length)
        expect(resetToken.token).toMatch(/^[a-f0-9]{64}$/); // 32 bytes = 64 hex chars
        
        // Token should be associated with correct email
        expect(resetToken.email).toBe(email);
        
        // Token should not be marked as used initially
        expect(resetToken.used).toBe(false);
        
        // Token should have future expiration
        expect(resetToken.expiresAt).toBeInstanceOf(Date);
        expect(resetToken.expiresAt.getTime()).toBeGreaterThan(Date.now());
      }),
      { numRuns: 100 }
    );
  });

  it('should generate unique tokens for each request', () => {
    fc.assert(
      fc.property(validEmailArbitrary, (email) => {
        // Generate multiple tokens for same email
        const token1 = generateResetToken(email);
        const token2 = generateResetToken(email);
        const token3 = generateResetToken(email);
        
        // All tokens should be different
        expect(token1.token).not.toBe(token2.token);
        expect(token2.token).not.toBe(token3.token);
        expect(token1.token).not.toBe(token3.token);
        
        // But all should be for same email
        expect(token1.email).toBe(email);
        expect(token2.email).toBe(email);
        expect(token3.email).toBe(email);
      }),
      { numRuns: 50 }
    );
  });

  it('should expire tokens after appropriate time', () => {
    fc.assert(
      fc.property(validEmailArbitrary, (email) => {
        // Generate token with very short expiration (negative for immediate expiration)
        const resetToken = generateResetToken(email, -1); // Expired 1 minute ago
        
        // Validation should fail for expired token
        const validation = validateResetToken(resetToken.token);
        expect(validation.valid).toBe(false);
        expect(validation.error).toBe('Token expired');
      }),
      { numRuns: 50 }
    );
  });

  it('should invalidate tokens after use', () => {
    fc.assert(
      fc.property(validEmailArbitrary, (email) => {
        const resetToken = generateResetToken(email);
        
        // Token should be valid initially
        const initialValidation = validateResetToken(resetToken.token);
        expect(initialValidation.valid).toBe(true);
        expect(initialValidation.email).toBe(email);
        
        // Use the token
        const useResult = useResetToken(resetToken.token);
        expect(useResult.success).toBe(true);
        
        // Token should no longer be valid
        const secondValidation = validateResetToken(resetToken.token);
        expect(secondValidation.valid).toBe(false);
        expect(secondValidation.error).toBe('Token already used');
        
        // Attempting to use again should fail
        const secondUseResult = useResetToken(resetToken.token);
        expect(secondUseResult.success).toBe(false);
        expect(secondUseResult.error).toBe('Token already used');
      }),
      { numRuns: 100 }
    );
  });

  it('should handle invalid tokens gracefully', () => {
    const invalidTokens = [
      'invalid-token',
      '',
      'short',
      '1234567890abcdef', // Too short
      'not-hex-characters!@#$%^&*()', // Invalid characters
      'a'.repeat(128), // Too long but valid hex
    ];
    
    invalidTokens.forEach(token => {
      const validation = validateResetToken(token);
      expect(validation.valid).toBe(false);
      expect(validation.error).toBe('Token not found');
    });
  });

  it('should maintain token security properties across operations', () => {
    fc.assert(
      fc.property(validEmailArbitrary, (email) => {
        const resetToken = generateResetToken(email);
        
        // Token should maintain its properties through validation
        const validation1 = validateResetToken(resetToken.token);
        const validation2 = validateResetToken(resetToken.token);
        
        expect(validation1.valid).toBe(validation2.valid);
        expect(validation1.email).toBe(validation2.email);
        
        // Token properties should be immutable during validation
        const storedToken = tokenStore.get(resetToken.token);
        expect(storedToken?.used).toBe(false);
        expect(storedToken?.email).toBe(email);
      }),
      { numRuns: 50 }
    );
  });
});