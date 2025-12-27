/**
 * **Feature: luxury-authentication, Property 2: Account creation integrity**
 * For any valid registration data, successful account creation should result in 
 * a properly stored user record in the database with hashed password and generated authentication token
 * **Validates: Requirements 1.3, 1.4**
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import fc from 'fast-check';
import { prisma } from '../../lib/prisma';
import bcrypt from 'bcryptjs';

// Test utilities for generating valid user data
const validEmailArbitrary = fc.string({ minLength: 3, maxLength: 50 })
  .filter(s => s.includes('@') && s.includes('.'))
  .map(s => `test${s.replace(/[^a-zA-Z0-9@.]/g, '')}@example.com`);

const validPasswordArbitrary = fc.string({ minLength: 8, maxLength: 100 })
  .filter(s => s.length >= 8);

const validNameArbitrary = fc.string({ minLength: 1, maxLength: 50 })
  .filter(s => s.trim().length > 0)
  .map(s => s.trim());

const validUserDataArbitrary = fc.record({
  email: validEmailArbitrary,
  password: validPasswordArbitrary,
  firstName: validNameArbitrary,
  lastName: validNameArbitrary,
});

describe('Database Schema Validation Properties', () => {
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

  it('should maintain account creation integrity for any valid user data', async () => {
    await fc.assert(
      fc.asyncProperty(validUserDataArbitrary, async (userData) => {
        // Hash the password as the system would
        const hashedPassword = await bcrypt.hash(userData.password, 12);
        
        // Create user in database
        const createdUser = await prisma.user.create({
          data: {
            email: userData.email,
            password: hashedPassword,
            firstName: userData.firstName,
            lastName: userData.lastName,
          },
        });

        // Verify the user was created with proper data integrity
        expect(createdUser).toBeDefined();
        expect(createdUser.id).toBeDefined();
        expect(createdUser.email).toBe(userData.email);
        expect(createdUser.firstName).toBe(userData.firstName);
        expect(createdUser.lastName).toBe(userData.lastName);
        expect(createdUser.verified).toBe(false); // Default value
        expect(createdUser.createdAt).toBeInstanceOf(Date);
        expect(createdUser.updatedAt).toBeInstanceOf(Date);

        // Verify password is hashed (not stored in plain text)
        expect(createdUser.password).not.toBe(userData.password);
        expect(createdUser.password).toBe(hashedPassword);
        
        // Verify password can be validated
        const isPasswordValid = await bcrypt.compare(userData.password, createdUser.password);
        expect(isPasswordValid).toBe(true);

        // Verify user can be retrieved from database
        const retrievedUser = await prisma.user.findUnique({
          where: { id: createdUser.id },
        });
        expect(retrievedUser).toEqual(createdUser);

        // Clean up this specific test user
        await prisma.user.delete({ where: { id: createdUser.id } });
      }),
      { numRuns: 100 }
    );
  });

  it('should enforce unique email constraint', async () => {
    await fc.assert(
      fc.asyncProperty(validUserDataArbitrary, async (userData) => {
        const hashedPassword = await bcrypt.hash(userData.password, 12);
        
        // Create first user
        const firstUser = await prisma.user.create({
          data: {
            email: userData.email,
            password: hashedPassword,
            firstName: userData.firstName,
            lastName: userData.lastName,
          },
        });

        // Attempt to create second user with same email should fail
        await expect(
          prisma.user.create({
            data: {
              email: userData.email, // Same email
              password: hashedPassword,
              firstName: 'Different',
              lastName: 'Name',
            },
          })
        ).rejects.toThrow();

        // Clean up
        await prisma.user.delete({ where: { id: firstUser.id } });
      }),
      { numRuns: 50 }
    );
  });

  it('should properly handle user sessions relationship', async () => {
    await fc.assert(
      fc.asyncProperty(validUserDataArbitrary, fc.string({ minLength: 10 }), async (userData, sessionToken) => {
        const hashedPassword = await bcrypt.hash(userData.password, 12);
        
        // Create user
        const user = await prisma.user.create({
          data: {
            email: userData.email,
            password: hashedPassword,
            firstName: userData.firstName,
            lastName: userData.lastName,
          },
        });

        // Create session for user
        const session = await prisma.userSession.create({
          data: {
            userId: user.id,
            token: sessionToken,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
          },
        });

        // Verify session is properly linked to user
        expect(session.userId).toBe(user.id);
        
        // Verify cascade delete works
        await prisma.user.delete({ where: { id: user.id } });
        
        const deletedSession = await prisma.userSession.findUnique({
          where: { id: session.id },
        });
        expect(deletedSession).toBeNull();
      }),
      { numRuns: 50 }
    );
  });

  it('should properly handle password reset tokens relationship', async () => {
    await fc.assert(
      fc.asyncProperty(validUserDataArbitrary, fc.string({ minLength: 10 }), async (userData, resetToken) => {
        const hashedPassword = await bcrypt.hash(userData.password, 12);
        
        // Create user
        const user = await prisma.user.create({
          data: {
            email: userData.email,
            password: hashedPassword,
            firstName: userData.firstName,
            lastName: userData.lastName,
          },
        });

        // Create reset token for user
        const token = await prisma.passwordResetToken.create({
          data: {
            userId: user.id,
            token: resetToken,
            expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
          },
        });

        // Verify token is properly linked to user
        expect(token.userId).toBe(user.id);
        expect(token.used).toBe(false); // Default value
        
        // Verify cascade delete works
        await prisma.user.delete({ where: { id: user.id } });
        
        const deletedToken = await prisma.passwordResetToken.findUnique({
          where: { id: token.id },
        });
        expect(deletedToken).toBeNull();
      }),
      { numRuns: 50 }
    );
  });
});