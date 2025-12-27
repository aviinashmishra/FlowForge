import { sign, verify } from 'jsonwebtoken';
import { User } from '../../types/auth';

export interface JWTPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

export interface TokenValidationResult {
  valid: boolean;
  payload?: JWTPayload;
  error?: string;
}

class JWTService {
  private readonly secret: string;
  private readonly expiresIn: string;

  constructor() {
    this.secret = process.env.JWT_SECRET || 'fallback-secret-change-in-production';
    this.expiresIn = process.env.JWT_EXPIRES_IN || '7d';
    
    if (process.env.NODE_ENV === 'production' && this.secret === 'fallback-secret-change-in-production') {
      throw new Error('JWT_SECRET must be set in production');
    }
  }

  generateToken(user: User): string {
    const payload: JWTPayload = {
      userId: user.id,
      email: user.email,
    };

    return sign(payload, this.secret, {
      expiresIn: this.expiresIn,
      issuer: 'flowforge-auth',
      audience: 'flowforge-app',
    });
  }

  validateToken(token: string): TokenValidationResult {
    try {
      const payload = verify(token, this.secret, {
        issuer: 'flowforge-auth',
        audience: 'flowforge-app',
      }) as JWTPayload;

      return {
        valid: true,
        payload,
      };
    } catch (error) {
      let errorMessage = 'Invalid token';
      
      if (error instanceof jwt.TokenExpiredError) {
        errorMessage = 'Token expired';
      } else if (error instanceof jwt.JsonWebTokenError) {
        errorMessage = 'Malformed token';
      } else if (error instanceof jwt.NotBeforeError) {
        errorMessage = 'Token not active';
      }

      return {
        valid: false,
        error: errorMessage,
      };
    }
  }

  refreshToken(token: string): string | null {
    const validation = this.validateToken(token);
    
    if (!validation.valid || !validation.payload) {
      return null;
    }

    // Generate new token with same payload but fresh expiration
    const newPayload: JWTPayload = {
      userId: validation.payload.userId,
      email: validation.payload.email,
    };

    return jwt.sign(newPayload, this.secret, {
      expiresIn: this.expiresIn,
      issuer: 'flowforge-auth',
      audience: 'flowforge-app',
    });
  }

  decodeToken(token: string): JWTPayload | null {
    try {
      const decoded = jwt.decode(token) as JWTPayload;
      return decoded;
    } catch {
      return null;
    }
  }

  getTokenExpiration(token: string): Date | null {
    const decoded = this.decodeToken(token);
    if (!decoded || !decoded.exp) {
      return null;
    }
    
    return new Date(decoded.exp * 1000);
  }

  isTokenExpired(token: string): boolean {
    const expiration = this.getTokenExpiration(token);
    if (!expiration) {
      return true;
    }
    
    return expiration < new Date();
  }
}

export const jwtService = new JWTService();