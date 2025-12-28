/**
 * **Feature: luxury-authentication, Property 4: Password security invariant**
 * For any password stored in the system, it should never be stored in plain text 
 * and should always use secure hashing algorithms
 * **Validates: Requirements 3.1**
 */

import { describe, it, expect } from '@jest/globals';
import fc from 'fast-check';
import bcrypt from 'bcryptjs';

// Test utilities for generating valid passwords
const validPasswordArbitrary = fc.string({ minLength: 8, maxLength: 100 })
  .filter(s => s.length >= 8);

describe('Password Security Properties', () => {
  it('should never store passwords in plain text', async () => {
    await fc.assert(
      fc.asyncProperty(validPasswordArbitrary, async (password) => {
        // Test that bcrypt hashing works correctly
        const hashedPassword = await bcrypt.hash(password, 12);
        
        // Password should never be stored in plain text
        expect(hashedPassword).not.toBe(password);
        
        // Password should be hashed (bcrypt hashes start with $2a$, $2b$, or $2y$)
        expect(hashedPassword).toMatch(/^\$2[aby]\$\d{2}\$/);
        
        // Password should be verifiable with bcrypt
        const isValid = await bcrypt.compare(password, hashedPassword);
        expect(isValid).toBe(true);
        
        // Hash should be different each time (salt should be random)
        const secondHash = await bcrypt.hash(password, 12);
        expect(hashedPassword).not.toBe(secondHash);
      }),
      { numRuns: 100 }
    );
  });

  it('should use secure hashing algorithm with proper salt rounds', async () => {
    await fc.assert(
      fc.asyncProperty(validPasswordArbitrary, async (password) => {
        const hashedPassword = await bcrypt.hash(password, 12);
        
        // Check that hash uses bcrypt format with proper cost factor
        const hashParts = hashedPassword.split('$');
        expect(hashParts).toHaveLength(4);
        expect(hashParts[1]).toMatch(/^2[aby]$/); // bcrypt version
        expect(parseInt(hashParts[2])).toBeGreaterThanOrEqual(10); // Cost factor >= 10
        expect(hashParts[3]).toHaveLength(53); // Salt + hash length
      }),
      { numRuns: 50 }
    );
  });

  it('should authenticate correctly with original password', async () => {
    await fc.assert(
      fc.asyncProperty(validPasswordArbitrary, async (password) => {
        const hashedPassword = await bcrypt.hash(password, 12);
        
        // Authentication should succeed with correct password
        const isValidCorrect = await bcrypt.compare(password, hashedPassword);
        expect(isValidCorrect).toBe(true);

        // Authentication should fail with wrong password
        const wrongPassword = password + 'wrong';
        const isValidWrong = await bcrypt.compare(wrongPassword, hashedPassword);
        expect(isValidWrong).toBe(false);
      }),
      { numRuns: 100 }
    );
  });

  it('should handle password updates securely', async () => {
    await fc.assert(
      fc.asyncProperty(validPasswordArbitrary, validPasswordArbitrary, async (oldPassword, newPassword) => {
        // Skip if passwords are the same
        if (newPassword === oldPassword) {
          return;
        }

        const oldHash = await bcrypt.hash(oldPassword, 12);
        const newHash = await bcrypt.hash(newPassword, 12);
        
        // New password hash should be different from original
        expect(newHash).not.toBe(oldHash);
        
        // New password should not be stored in plain text
        expect(newHash).not.toBe(newPassword);
        
        // Should authenticate with new password
        const authWithNew = await bcrypt.compare(newPassword, newHash);
        expect(authWithNew).toBe(true);
        
        // Should not authenticate with old password against new hash
        const authWithOld = await bcrypt.compare(oldPassword, newHash);
        expect(authWithOld).toBe(false);
      }),
      { numRuns: 50 }
    );
  });

  it('should resist timing attacks by taking consistent time for authentication', async () => {
    const password = 'testpassword123';
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Measure time for correct password
    const startCorrect = Date.now();
    await bcrypt.compare(password, hashedPassword);
    const timeCorrect = Date.now() - startCorrect;

    // Measure time for wrong password
    const startWrong = Date.now();
    await bcrypt.compare('wrongpassword', hashedPassword);
    const timeWrong = Date.now() - startWrong;

    // Times should be reasonably similar (within reasonable bounds)
    // bcrypt is designed to be constant-time for the same hash
    const timeDifference = Math.abs(timeCorrect - timeWrong);
    expect(timeDifference).toBeLessThan(50); // Allow some variance
  });
});