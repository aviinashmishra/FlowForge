import { ExtendedUser } from './dashboard';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  verified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Extended user interface for dashboard features
export { ExtendedUser } from './dashboard';

export interface AuthResult {
  success: boolean;
  user?: User;
  token?: string;
  error?: string;
}

export interface SignInCredentials {
  email: string;
  password: string;
}

export interface SignUpData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface ProfileUpdates {
  firstName?: string;
  lastName?: string;
  avatar?: string;
  bio?: string;
  timezone?: string;
  language?: string;
}

export interface CreateUserData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface AuthenticationContext {
  user: User | null;
  isLoading: boolean;
  signIn: (credentials: SignInCredentials) => Promise<AuthResult>;
  signUp: (userData: SignUpData) => Promise<AuthResult>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (updates: ProfileUpdates) => Promise<User>;
}

// API Request/Response types
export interface SignUpRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface SignInRequest {
  email: string;
  password: string;
}

export interface ResetPasswordRequest {
  email: string;
}

export interface VerifyResetRequest {
  token: string;
  newPassword: string;
}