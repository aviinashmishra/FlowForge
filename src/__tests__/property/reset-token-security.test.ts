/**
 * **Feature: luxury-authentication, Property 8: Reset token security**
 * For any password reset request, the system should generate secure tokens 
 * that expire appropriately and can only be used once
 * **Validates: Requirements 5.1, 5.2**
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import fc from 'fast-check';
import { userService } from '../../lib/auth/userService';
import { prisma } from '../../lib/prisma';

const validUserDataArbitrary = fc.record({
  email: fc.string({ minLength: 3, maxLength: 50 })
    .filter(s => s.includes('@') && s.includes('.'))
    .map(s => `test${s.replace(/[^a-zA-Z0-9@.]/g, '')}@example.com`),
  password: fc.string({ minLength: 8, maxLength: 100 }).filter(s => s.length >= 8),
  firstName: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0).map(s => s.trim()),
  lastName: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0).map(s => s.trim()),
});

describe('Reset Token Security Properties', () => {
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

  it('should generate secure reset tokens for any valid user', async () => {
    await fc.assert(
      fc.asyncProperty(validUserDataArbitrary, async (userData) => {
        const user = await userService.createUser(userData);
        const token = await userService.generateResetToken(userData.email);
        
        expect(token).toBeDefined();
        expect(typeof token).toBe('string');
        expect(token.length).toBeGreaterThan(10);
        
        // Token should be valid initially
        const isValid = await userService.validateResetToken(token);
        expect(isValid).toBe(true);
        
        await prisma.user.delete({ where: { id: user.id } });
      }),
      { numRuns: 50 }
    );
  });

  it('should generate unique tokens for each request', async () => {
    const userData = {
      email: 'unique-tokens@example.com',
      password: 'testpassword123',
      firstName: 'Test',
      lastName: 'User',
    };

    const user = await userService.createUser(userData);
    const tokens = new Set<string>();

    for (let i = 0; i < 10; i++) {
      const token = await userService.generateResetToken(userData.email);
      expect(tokens.has(token)).toBe(false);
      tokens.add(token);
    }

    await prisma.user.delete({ where: { id: user.id } });
  });

  it('should expire tokens after appropriate time', async () => {
    const userData = {
      email: 'expire-test@example.com',
      password: 'testpassword123',
      firstName: 'Test',
      lastName: 'User',
    };

    const user = await userService.createUser(userData);
    const token = await userService.generateResetToken(userData.email);
    
    // Token should be valid initially
    expect(await userService.validateResetToken(token)).toBe(true);
    
    // Manually expire the token by updating the database
    await prisma.passwordResetToken.update({
      where: { token },
      data: { expiresAt: new Date(Date.now() - 1000) }, // 1 second ago
    });
    
    // Token should now be invalid
    expect(await userService.validateResetToken(token)).toBe(false);
    
    await prisma.user.delete({ where: { id: user.id } });
  });

  it('should invalidate tokens after use', async () => {
    const userData = {
      email: 'single-use@example.com',
      password: 'testpassword123',
      firstName: 'Test',
      lastName: 'User',
    };

    const user = await userService.createUser(userData);
    const token = await userService.generateResetToken(userData.email);
    
    // Token should be valid initially
    expect(await userService.validateResetToken(token)).toBe(true);
    
    // Mark token as used
    await (userService as any).markResetTokenAsUsed(token);
    
    // Token should now be invalid
    expect(await userService.validateResetToken(token)).toBe(false);
    
    await prisma.user.delete({ where: { id: user.id } });
  });
});