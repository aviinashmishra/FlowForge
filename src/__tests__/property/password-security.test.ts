/**
 * **Feature: luxury-authentication, Property 4: Password security invariant**
 * For any password stored in the system, it should never be stored in plain text 
 * and should always use secure hashing algorithms
 * **Validates: Requirements 3.1**
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import fc from 'fast-check';
import { userService } from '../../lib/auth/userService';
import { prisma } from '../../lib/prisma';
import bcrypt from 'bcryptjs';

// Test utilities for generating valid passwords
const validPasswordArbitrary = fc.string({ minLength: 8, maxLength: 100 })
  .filter(s => s.length >= 8);

const validUserDataArbitrary = fc.record({
  email: fc.string({ minLength: 3, maxLength: 50 })
    .filter(s => s.includes('@') && s.includes('.'))
    .map(s => `test${s.replace(/[^a-zA-Z0-9@.]/g, '')}@example.com`),
  password: validPasswordArbitrary,
  firstName: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0).map(s => s.trim()),
  lastName: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0).map(s => s.trim()),
});

describe('Password Security Properties', () => {
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

  it('should never store passwords in plain text for any password', async () => {
    await fc.assert(
      fc.asyncProperty(validUserDataArbitrary, async (userData) => {
        // Create user through service
        const user = await userService.createUser(userData);

        // Retrieve user from database directly
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
        });

        expect(dbUser).toBeDefined();
        expect(dbUser!.password).toBeDefined();
        
        // Password should never be stored in plain text
        expect(dbUser!.password).not.toBe(userData.password);
        
        // Password should be hashed (bcrypt hashes start with $2a$, $2b$, or $2y$)
        expect(dbUser!.password).toMatch(/^\$2[aby]\$\d{2}\$/);
        
        // Password should be verifiable with bcrypt
        const isValid = await bcrypt.compare(userData.password, dbUser!.password);
        expect(isValid).toBe(true);
        
        // Hash should be different each time (salt should be random)
        const secondHash = await bcrypt.hash(userData.password, 12);
        expect(dbUser!.password).not.toBe(secondHash);

        // Clean up
        await prisma.user.delete({ where: { id: user.id } });
      }),
      { numRuns: 100 }
    );
  });

  it('should use secure hashing algorithm with proper salt rounds', async () => {
    await fc.assert(
      fc.asyncProperty(validPasswordArbitrary, async (password) => {
        const testUserData = {
          email: `test${Math.random()}@example.com`,
          password,
          firstName: 'Test',
          lastName: 'User',
        };

        const user = await userService.createUser(testUserData);
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
        });

        expect(dbUser).toBeDefined();
        
        // Check that hash uses bcrypt format with proper cost factor
        const hashParts = dbUser!.password.split('$');
        expect(hashParts).toHaveLength(4);
        expect(hashParts[1]).toMatch(/^2[aby]$/); // bcrypt version
        expect(parseInt(hashParts[2])).toBeGreaterThanOrEqual(10); // Cost factor >= 10
        expect(hashParts[3]).toHaveLength(53); // Salt + hash length

        // Clean up
        await prisma.user.delete({ where: { id: user.id } });
      }),
      { numRuns: 50 }
    );
  });

  it('should authenticate correctly with original password for any valid password', async () => {
    await fc.assert(
      fc.asyncProperty(validUserDataArbitrary, async (userData) => {
        // Create user
        const user = await userService.createUser(userData);

        // Authentication should succeed with correct password
        const authenticatedUser = await userService.authenticateUser(userData.email, userData.password);
        expect(authenticatedUser).toBeDefined();
        expect(authenticatedUser!.id).toBe(user.id);
        expect(authenticatedUser!.email).toBe(userData.email);

        // Authentication should fail with wrong password
        const wrongPassword = userData.password + 'wrong';
        const failedAuth = await userService.authenticateUser(userData.email, wrongPassword);
        expect(failedAuth).toBeNull();

        // Clean up
        await prisma.user.delete({ where: { id: user.id } });
      }),
      { numRuns: 100 }
    );
  });

  it('should handle password updates securely', async () => {
    await fc.assert(
      fc.asyncProperty(validUserDataArbitrary, validPasswordArbitrary, async (userData, newPassword) => {
        // Skip if new password is same as old password
        if (newPassword === userData.password) {
          return;
        }

        // Create user
        const user = await userService.createUser(userData);
        const originalDbUser = await prisma.user.findUnique({
          where: { id: user.id },
        });

        // Update password
        await userService.updateUserPassword(user.id, newPassword);
        
        const updatedDbUser = await prisma.user.findUnique({
          where: { id: user.id },
        });

        expect(updatedDbUser).toBeDefined();
        
        // New password hash should be different from original
        expect(updatedDbUser!.password).not.toBe(originalDbUser!.password);
        
        // New password should not be stored in plain text
        expect(updatedDbUser!.password).not.toBe(newPassword);
        
        // Should authenticate with new password
        const authWithNew = await userService.authenticateUser(userData.email, newPassword);
        expect(authWithNew).toBeDefined();
        
        // Should not authenticate with old password
        const authWithOld = await userService.authenticateUser(userData.email, userData.password);
        expect(authWithOld).toBeNull();

        // Clean up
        await prisma.user.delete({ where: { id: user.id } });
      }),
      { numRuns: 50 }
    );
  });

  it('should resist timing attacks by taking consistent time for authentication', async () => {
    const nonExistentEmail = 'nonexistent@example.com';
    const password = 'testpassword123';
    
    // Create a real user for comparison
    const realUserData = {
      email: 'real@example.com',
      password: 'realpassword123',
      firstName: 'Real',
      lastName: 'User',
    };
    
    const realUser = await userService.createUser(realUserData);

    // Measure time for non-existent user authentication
    const startNonExistent = Date.now();
    const resultNonExistent = await userService.authenticateUser(nonExistentEmail, password);
    const timeNonExistent = Date.now() - startNonExistent;

    // Measure time for existing user with wrong password
    const startWrongPassword = Date.now();
    const resultWrongPassword = await userService.authenticateUser(realUserData.email, 'wrongpassword');
    const timeWrongPassword = Date.now() - startWrongPassword;

    expect(resultNonExistent).toBeNull();
    expect(resultWrongPassword).toBeNull();

    // Times should be reasonably similar (within 100ms) to prevent timing attacks
    const timeDifference = Math.abs(timeNonExistent - timeWrongPassword);
    expect(timeDifference).toBeLessThan(100);

    // Clean up
    await prisma.user.delete({ where: { id: realUser.id } });
  });
});