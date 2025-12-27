import bcrypt from 'bcryptjs';
import { prisma } from '../prisma';
import { User, CreateUserData } from '../../types/auth';
import crypto from 'crypto';

export interface UserService {
  createUser(userData: CreateUserData): Promise<User>;
  authenticateUser(email: string, password: string): Promise<User | null>;
  generateResetToken(email: string): Promise<string>;
  validateResetToken(token: string): Promise<boolean>;
  updateUserPassword(userId: string, newPassword: string): Promise<void>;
  getUserById(userId: string): Promise<User | null>;
  getUserByEmail(email: string): Promise<User | null>;
  updateUser(userId: string, updates: Partial<User>): Promise<User>;
}

class UserServiceImpl implements UserService {
  private readonly SALT_ROUNDS = 12;
  private readonly RESET_TOKEN_EXPIRY = 60 * 60 * 1000; // 1 hour

  async createUser(userData: CreateUserData): Promise<User> {
    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, this.SALT_ROUNDS);

    // Create user in database
    const dbUser = await prisma.user.create({
      data: {
        email: userData.email.toLowerCase().trim(),
        password: hashedPassword,
        firstName: userData.firstName.trim(),
        lastName: userData.lastName.trim(),
      },
    });

    // Return user without password
    return this.sanitizeUser(dbUser);
  }

  async authenticateUser(email: string, password: string): Promise<User | null> {
    // Find user by email
    const dbUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!dbUser) {
      return null;
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, dbUser.password);
    if (!isPasswordValid) {
      return null;
    }

    return this.sanitizeUser(dbUser);
  }

  async generateResetToken(email: string): Promise<string> {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Generate secure random token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + this.RESET_TOKEN_EXPIRY);

    // Store token in database
    await prisma.passwordResetToken.create({
      data: {
        token,
        userId: user.id,
        expiresAt,
      },
    });

    return token;
  }

  async validateResetToken(token: string): Promise<boolean> {
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
    });

    if (!resetToken) {
      return false;
    }

    // Check if token is expired or already used
    if (resetToken.used || resetToken.expiresAt < new Date()) {
      return false;
    }

    return true;
  }

  async updateUserPassword(userId: string, newPassword: string): Promise<void> {
    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, this.SALT_ROUNDS);

    // Update user password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    // Invalidate all existing sessions for this user
    await prisma.userSession.deleteMany({
      where: { userId },
    });
  }

  async getUserById(userId: string): Promise<User | null> {
    const dbUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    return dbUser ? this.sanitizeUser(dbUser) : null;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const dbUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    return dbUser ? this.sanitizeUser(dbUser) : null;
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<User> {
    const dbUser = await prisma.user.update({
      where: { id: userId },
      data: {
        firstName: updates.firstName?.trim(),
        lastName: updates.lastName?.trim(),
        avatar: updates.avatar,
        verified: updates.verified,
      },
    });

    return this.sanitizeUser(dbUser);
  }

  async markResetTokenAsUsed(token: string): Promise<void> {
    await prisma.passwordResetToken.update({
      where: { token },
      data: { used: true },
    });
  }

  async getUserByResetToken(token: string): Promise<User | null> {
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!resetToken || resetToken.used || resetToken.expiresAt < new Date()) {
      return null;
    }

    return this.sanitizeUser(resetToken.user);
  }

  private sanitizeUser(dbUser: any): User {
    const { password, ...user } = dbUser;
    return user;
  }
}

export const userService = new UserServiceImpl();