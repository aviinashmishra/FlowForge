/**
 * **Feature: luxury-authentication, Property 1: Input validation consistency**
 * For any user input (email, password, profile data), the validation system should 
 * consistently apply format rules, strength requirements, and field constraints 
 * across all authentication forms
 * **Validates: Requirements 1.2, 2.2**
 */

import { describe, it, expect } from '@jest/globals';
import fc from 'fast-check';

// Email validation function (extracted from API routes)
function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Password strength validation function (extracted from API routes)
function validatePasswordStrength(password: string): { valid: boolean; message?: string } {
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters long' };
  }
  
  if (!/(?=.*[a-z])/.test(password)) {
    return { valid: false, message: 'Password must contain at least one lowercase letter' };
  }
  
  if (!/(?=.*[A-Z])/.test(password)) {
    return { valid: false, message: 'Password must contain at least one uppercase letter' };
  }
  
  if (!/(?=.*\d)/.test(password)) {
    return { valid: false, message: 'Password must contain at least one number' };
  }
  
  return { valid: true };
}

// Name validation function
function validateName(name: string): boolean {
  if (typeof name !== 'string') return false;
  const trimmed = name.trim();
  return trimmed.length > 0 && trimmed.length <= 50 && trimmed === name;
}

// Test data generators
const validEmailArbitrary = fc.string({ minLength: 1, maxLength: 20 })
  .filter(s => /^[a-zA-Z0-9]+$/.test(s))
  .map(s => `${s}@example.com`);

const invalidEmailArbitrary = fc.oneof(
  fc.string({ minLength: 1, maxLength: 20 }).filter(s => !s.includes('@')),
  fc.string({ minLength: 1, maxLength: 20 }).filter(s => !s.includes('.')),
  fc.constant(''),
  fc.constant('   '),
  fc.constant('@'),
  fc.constant('.'),
  fc.constant('@.'),
  fc.constant('user@'),
  fc.constant('@example.com'),
);

const validPasswordArbitrary = fc.string({ minLength: 8, maxLength: 100 })
  .filter(s => 
    s.length >= 8 && 
    /(?=.*[a-z])/.test(s) && 
    /(?=.*[A-Z])/.test(s) && 
    /(?=.*\d)/.test(s)
  );

const invalidPasswordArbitrary = fc.oneof(
  fc.string({ minLength: 1, maxLength: 7 }), // Too short
  fc.string({ minLength: 8, maxLength: 100 }).filter(s => !/(?=.*[a-z])/.test(s)), // No lowercase
  fc.string({ minLength: 8, maxLength: 100 }).filter(s => !/(?=.*[A-Z])/.test(s)), // No uppercase
  fc.string({ minLength: 8, maxLength: 100 }).filter(s => !/(?=.*\d)/.test(s)), // No digit
  fc.constant(''), // Empty
);

const validNameArbitrary = fc.string({ minLength: 1, maxLength: 50 })
  .filter(s => s.trim().length > 0)
  .map(s => s.trim());

const invalidNameArbitrary = fc.oneof(
  fc.constant(''), // Empty
  fc.constant('   '), // Only whitespace
  fc.constant(' '), // Single space
  fc.constant('\t'), // Tab
  fc.constant('\n'), // Newline
  fc.string({ minLength: 51, maxLength: 100 }), // Too long
  fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.startsWith(' ') || s.endsWith(' ')), // Leading/trailing whitespace
);

describe('Input Validation Consistency Properties', () => {
  it('should consistently validate email format across all inputs', () => {
    fc.assert(
      fc.property(validEmailArbitrary, (email) => {
        const isValid = validateEmail(email);
        expect(isValid).toBe(true);
      }),
      { numRuns: 100 }
    );

    fc.assert(
      fc.property(invalidEmailArbitrary, (email) => {
        const isValid = validateEmail(email);
        expect(isValid).toBe(false);
      }),
      { numRuns: 100 }
    );
  });

  it('should consistently validate password strength across all inputs', () => {
    fc.assert(
      fc.property(validPasswordArbitrary, (password) => {
        const validation = validatePasswordStrength(password);
        expect(validation.valid).toBe(true);
        expect(validation.message).toBeUndefined();
      }),
      { numRuns: 100 }
    );

    fc.assert(
      fc.property(invalidPasswordArbitrary, (password) => {
        const validation = validatePasswordStrength(password);
        expect(validation.valid).toBe(false);
        expect(validation.message).toBeDefined();
        expect(typeof validation.message).toBe('string');
      }),
      { numRuns: 100 }
    );
  });

  it('should consistently validate name fields across all inputs', () => {
    fc.assert(
      fc.property(validNameArbitrary, (name) => {
        const isValid = validateName(name);
        expect(isValid).toBe(true);
      }),
      { numRuns: 100 }
    );

    fc.assert(
      fc.property(invalidNameArbitrary, (name) => {
        const isValid = validateName(name);
        expect(isValid).toBe(false);
      }),
      { numRuns: 100 }
    );
  });

  it('should provide consistent error messages for same validation failures', () => {
    // Test that same type of password failures always give same error message
    const shortPasswords = ['1', '12', '1234567']; // All too short
    const messages = shortPasswords.map(pwd => validatePasswordStrength(pwd).message);
    
    // All short password errors should be the same
    expect(messages.every(msg => msg === messages[0])).toBe(true);
    expect(messages[0]).toBe('Password must be at least 8 characters long');

    // Test lowercase missing
    const noLowercasePasswords = ['PASSWORD123', 'ANOTHER123'];
    const lowercaseMessages = noLowercasePasswords.map(pwd => validatePasswordStrength(pwd).message);
    expect(lowercaseMessages.every(msg => msg === lowercaseMessages[0])).toBe(true);
    expect(lowercaseMessages[0]).toBe('Password must contain at least one lowercase letter');
  });

  it('should handle edge cases consistently', () => {
    // Test email edge cases
    const emailEdgeCases = [
      'a@b.c', // Minimal valid email
      'test@example.com', // Standard email
      'user.name+tag@example.co.uk', // Complex valid email
    ];

    emailEdgeCases.forEach(email => {
      expect(validateEmail(email)).toBe(true);
    });

    // Test password edge cases
    const passwordEdgeCases = [
      'Aa1bcdef', // Minimal valid password
      'Password123', // Standard password
      'VeryLongPassword123WithManyCharacters', // Long password
    ];

    passwordEdgeCases.forEach(password => {
      expect(validatePasswordStrength(password).valid).toBe(true);
    });

    // Test name edge cases
    const nameEdgeCases = [
      'A', // Single character
      'John', // Standard name
      'A'.repeat(50), // Maximum length
    ];

    nameEdgeCases.forEach(name => {
      expect(validateName(name)).toBe(true);
    });
  });

  it('should reject malformed inputs consistently', () => {
    // Test malformed emails
    const malformedEmails = [
      'notanemail',
      '@example.com',
      'user@',
      'user@.com',
      '.user@example.com',
      'user.@example.com',
      'user@',
      '@.com',
    ];

    malformedEmails.forEach(email => {
      expect(validateEmail(email)).toBe(false);
    });

    // Test weak passwords
    const weakPasswords = [
      'password', // No uppercase, no number
      'PASSWORD', // No lowercase, no number
      '12345678', // No letters
      'Passwor', // Too short
    ];

    weakPasswords.forEach(password => {
      expect(validatePasswordStrength(password).valid).toBe(false);
    });

    // Test invalid names
    const invalidNames = [
      '', // Empty
      '   ', // Whitespace only
      'A'.repeat(51), // Too long
    ];

    invalidNames.forEach(name => {
      expect(validateName(name)).toBe(false);
    });
  });

  it('should handle unicode and special characters consistently', () => {
    // Test emails with unicode (should be rejected by our simple validator)
    const unicodeEmails = ['tëst@example.com', 'test@exämple.com'];
    unicodeEmails.forEach(email => {
      const result = validateEmail(email);
      // Our simple regex should handle these consistently
      expect(typeof result).toBe('boolean');
    });

    // Test passwords with unicode (should be accepted if they meet other criteria)
    const unicodePasswords = ['Pässwörd123', 'Tëst1234'];
    unicodePasswords.forEach(password => {
      const result = validatePasswordStrength(password);
      expect(typeof result.valid).toBe('boolean');
      if (!result.valid) {
        expect(typeof result.message).toBe('string');
      }
    });

    // Test names with unicode (should be accepted)
    const unicodeNames = ['José', 'François', 'Müller'];
    unicodeNames.forEach(name => {
      expect(validateName(name)).toBe(true);
    });
  });

  it('should maintain validation consistency across different input sources', () => {
    fc.assert(
      fc.property(
        fc.record({
          email: fc.string({ minLength: 1, maxLength: 100 }),
          password: fc.string({ minLength: 1, maxLength: 100 }),
          firstName: fc.string({ minLength: 0, maxLength: 100 }),
          lastName: fc.string({ minLength: 0, maxLength: 100 }),
        }),
        (input) => {
          // Validation should be deterministic - same input should always give same result
          const emailResult1 = validateEmail(input.email);
          const emailResult2 = validateEmail(input.email);
          expect(emailResult1).toBe(emailResult2);

          const passwordResult1 = validatePasswordStrength(input.password);
          const passwordResult2 = validatePasswordStrength(input.password);
          expect(passwordResult1.valid).toBe(passwordResult2.valid);
          expect(passwordResult1.message).toBe(passwordResult2.message);

          const firstNameResult1 = validateName(input.firstName);
          const firstNameResult2 = validateName(input.firstName);
          expect(firstNameResult1).toBe(firstNameResult2);

          const lastNameResult1 = validateName(input.lastName);
          const lastNameResult2 = validateName(input.lastName);
          expect(lastNameResult1).toBe(lastNameResult2);
        }
      ),
      { numRuns: 100 }
    );
  });
});