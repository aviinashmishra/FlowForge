import { prisma } from '../prisma';
import { jwtService } from './jwt';
import { User } from '../../types/auth';

export interface SessionInfo {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
}

class SessionService {
  private readonly SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

  async createSession(user: User): Promise<{ token: string; sessionId: string }> {
    // Generate JWT token
    const token = jwtService.generateToken(user);
    
    // Store session in database
    const session = await prisma.userSession.create({
      data: {
        userId: user.id,
        token,
        expiresAt: new Date(Date.now() + this.SESSION_DURATION),
      },
    });

    return {
      token,
      sessionId: session.id,
    };
  }

  async validateSession(token: string): Promise<User | null> {
    // First validate JWT token
    const validation = jwtService.validateToken(token);
    
    if (!validation.valid || !validation.payload) {
      return null;
    }

    // Check if session exists in database
    const session = await prisma.userSession.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!session) {
      return null;
    }

    // Check if session is expired
    if (session.expiresAt < new Date()) {
      // Clean up expired session
      await this.invalidateSession(token);
      return null;
    }

    // Return user without password
    const { password, ...user } = session.user;
    return user;
  }

  async refreshSession(token: string): Promise<{ token: string; sessionId: string } | null> {
    // Validate current session
    const user = await this.validateSession(token);
    
    if (!user) {
      return null;
    }

    // Invalidate old session
    await this.invalidateSession(token);

    // Create new session
    return this.createSession(user);
  }

  async invalidateSession(token: string): Promise<void> {
    await prisma.userSession.deleteMany({
      where: { token },
    });
  }

  async invalidateAllUserSessions(userId: string): Promise<void> {
    await prisma.userSession.deleteMany({
      where: { userId },
    });
  }

  async getUserSessions(userId: string): Promise<SessionInfo[]> {
    const sessions = await prisma.userSession.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return sessions;
  }

  async cleanupExpiredSessions(): Promise<number> {
    const result = await prisma.userSession.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });

    return result.count;
  }

  async extendSession(token: string): Promise<boolean> {
    try {
      const session = await prisma.userSession.findUnique({
        where: { token },
      });

      if (!session || session.expiresAt < new Date()) {
        return false;
      }

      await prisma.userSession.update({
        where: { token },
        data: {
          expiresAt: new Date(Date.now() + this.SESSION_DURATION),
        },
      });

      return true;
    } catch {
      return false;
    }
  }
}

export const sessionService = new SessionService();