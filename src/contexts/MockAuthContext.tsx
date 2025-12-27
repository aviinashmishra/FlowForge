'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, AuthResult, SignInCredentials, SignUpData, ProfileUpdates, AuthenticationContext } from '../types/auth';

const AuthContext = createContext<AuthenticationContext | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function MockAuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Simulate checking for existing session
  useEffect(() => {
    const timer = setTimeout(() => {
      // Check localStorage for mock user
      const savedUser = localStorage.getItem('mockUser');
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch (error) {
          console.error('Error parsing saved user:', error);
        }
      }
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const signIn = async (credentials: SignInCredentials): Promise<AuthResult> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Mock validation
    if (credentials.email === 'demo@flowforge.com' && credentials.password === 'password123') {
      const mockUser: User = {
        id: '1',
        email: credentials.email,
        firstName: 'Demo',
        lastName: 'User',
        verified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      setUser(mockUser);
      localStorage.setItem('mockUser', JSON.stringify(mockUser));

      return {
        success: true,
        user: mockUser,
        token: 'mock-jwt-token',
      };
    } else {
      return {
        success: false,
        error: 'Invalid email or password. Try demo@flowforge.com / password123',
      };
    }
  };

  const signUp = async (userData: SignUpData): Promise<AuthResult> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mock user creation
    const mockUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      verified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setUser(mockUser);
    localStorage.setItem('mockUser', JSON.stringify(mockUser));

    return {
      success: true,
      user: mockUser,
      token: 'mock-jwt-token',
    };
  };

  const signOut = async (): Promise<void> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setUser(null);
    localStorage.removeItem('mockUser');
  };

  const resetPassword = async (email: string): Promise<void> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock password reset (always succeeds)
    console.log(`Password reset email sent to: ${email}`);
  };

  const updateProfile = async (updates: ProfileUpdates): Promise<User> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (!user) {
      throw new Error('No user logged in');
    }

    const updatedUser: User = {
      ...user,
      ...updates,
      updatedAt: new Date(),
    };

    setUser(updatedUser);
    localStorage.setItem('mockUser', JSON.stringify(updatedUser));

    return updatedUser;
  };

  const value: AuthenticationContext = {
    user,
    isLoading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthenticationContext {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}