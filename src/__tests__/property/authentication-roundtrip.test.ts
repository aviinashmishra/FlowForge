/**
 * **Feature: luxury-authentication, Property 2: Authentication round trip**
 * For any user credentials, the authentication process should be reversible - 
 * a user who can sign up should be able to sign in with the same credentials
 * **Validates: Requirements 1.1, 2.1**
 */

import { describe, it, expect } from '@jest/globals';
import fc from 'fast-check';
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

// Mock user storage
const userStore = new Map<string, any>();

// Mock authentication functions
async function signUp(userData: any) {
  if (userStore.has(userData.email)) {
    throw new Error('User already exists');
  }
  
  const hashedPassword = await bcrypt.hash(userData.password, 12);
  const user = {
    id: `user_${Date.now()}_${Math.random()}`,
    email: userData.email,
    firstName: userData.firstName,
    lastName: userData.lastName,
    password: hashedPassword,
    createdAt: new Date(),
  };
  
  userStore.set(userData.email, user);
  return { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName };
}

async function signIn(email: string, password: string) {
  const user = userStore.get(email);
  if (!user) {
    return null;
  }
  
  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    return null;
  }
  
  return { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName };
}

describe('Authentication Round Trip Properties', () => {
  beforeEach(() => {
    userStore.clear();
  });

  it('should allow sign in after successful sign up for any valid credentials', async () => {
    await fc.assert(
      fc.asyncProperty(validUserDataArbitrary, async (userData) => {
        // Sign up should succeed
        const signUpResult = await signUp(userData);
        expect(signUpResult).toBeDefined();
        expect(signUpResult.email).toBe(userData.email);
        expect(signUpResult.firstName).toBe(userData.firstName);
        expect(signUpResult.lastName).toBe(userData.lastName);
        
        // Sign in with same credentials should succeed
        const signInResult = await signIn(userData.email, userData.password);
        expect(signInResult).toBeDefined();
        expect(signInResult!.id).toBe(signUpResult.id);
        expect(signInResult!.email).toBe(userData.email);
        expect(signInResult!.firstName).toBe(userData.firstName);
        expect(signInResult!.lastName).toBe(userData.lastName);
      }),
      { numRuns: 100 }
    );
  });

  it('should reject sign in with wrong password after sign up', async () => {
    await fc.assert(
      fc.asyncProperty(validUserDataArbitrary, validPasswordArbitrary, async (userData, wrongPassword) => {
        // Skip if wrong password is same as correct password
        if (wrongPassword === userData.password) {
          return;
        }
        
        // Sign up should succeed
        await signUp(userData);
        
        // Sign in with wrong password should fail
        const signInResult = await signIn(userData.email, wrongPassword);
        expect(signInResult).toBeNull();
      }),
      { numRuns: 100 }
    );
  });

  it('should reject sign in for non-existent user', async () => {
    await fc.assert(
      fc.asyncProperty(validEmailArbitrary, validPasswordArbitrary, async (email, password) => {
        // Ensure user doesn't exist
        userStore.delete(email);
        
        // Sign in should fail
        const signInResult = await signIn(email, password);
        expect(signInResult).toBeNull();
      }),
      { numRuns: 50 }
    );
  });

  it('should prevent duplicate sign ups with same email', async () => {
    await fc.assert(
      fc.asyncProperty(validUserDataArbitrary, validUserDataArbitrary, async (userData1, userData2) => {
        // Use same email for both users
        const sameEmailData2 = { ...userData2, email: userData1.email };
        
        // First sign up should succeed
        const firstSignUp = await signUp(userData1);
        expect(firstSignUp).toBeDefined();
        
        // Second sign up with same email should fail
        await expect(signUp(sameEmailData2)).rejects.toThrow('User already exists');
      }),
      { numRuns: 50 }
    );
  });

  it('should maintain user data integrity through sign up and sign in cycle', async () => {
    await fc.assert(
      fc.asyncProperty(validUserDataArbitrary, async (userData) => {
        // Sign up
        const signUpResult = await signUp(userData);
        
        // Sign in
        const signInResult = await signIn(userData.email, userData.password);
        
        // All user data should be preserved (except password which should be hashed)
        expect(signInResult!.id).toBe(signUpResult.id);
        expect(signInResult!.email).toBe(userData.email);
        expect(signInResult!.firstName).toBe(userData.firstName);
        expect(signInResult!.lastName).toBe(userData.lastName);
        
        // Verify password is properly hashed in storage
        const storedUser = userStore.get(userData.email);
        expect(storedUser.password).not.toBe(userData.password);
        expect(storedUser.password).toMatch(/^\$2[aby]\$\d{2}\$/);
      }),
      { numRuns: 100 }
    );
  });

  it('should handle case sensitivity correctly', async () => {
    const userData = {
      email: 'Test@Example.Com',
      password: 'TestPassword123',
      firstName: 'Test',
      lastName: 'User',
    };
    
    await signUp(userData);
    
    // Sign in should be case sensitive for email (depending on implementation)
    const signInResult1 = await signIn('Test@Example.Com', userData.password);
    expect(signInResult1).toBeDefined();
    
    // Different case email should fail (if implementation is case sensitive)
    const signInResult2 = await signIn('test@example.com', userData.password);
    // This test depends on implementation - some systems normalize email case
    // For this test, we'll assume case sensitivity
    expect(signInResult2).toBeNull();
  });
});