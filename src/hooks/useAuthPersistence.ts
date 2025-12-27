'use client';

import { useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';

// Custom hook for handling authentication persistence and session management
export function useAuthPersistence() {
  const { user } = useAuth();

  // Sync authentication state across tabs using localStorage events
  const syncAuthState = useCallback((event: StorageEvent) => {
    if (event.key === 'auth-sync') {
      // Trigger a re-check of auth status when other tabs sign in/out
      window.location.reload();
    }
  }, []);

  // Set up cross-tab synchronization
  useEffect(() => {
    window.addEventListener('storage', syncAuthState);
    return () => window.removeEventListener('storage', syncAuthState);
  }, [syncAuthState]);

  // Notify other tabs when auth state changes
  useEffect(() => {
    localStorage.setItem('auth-sync', Date.now().toString());
  }, [user]);

  // Auto-refresh token before expiration
  useEffect(() => {
    if (!user) return;

    const refreshInterval = setInterval(async () => {
      try {
        await fetch('/api/auth/refresh', {
          method: 'POST',
          credentials: 'include',
        });
      } catch (error) {
        console.error('Token refresh failed:', error);
      }
    }, 30 * 60 * 1000); // Refresh every 30 minutes

    return () => clearInterval(refreshInterval);
  }, [user]);

  // Handle page visibility changes to refresh auth state
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible' && user) {
        try {
          const response = await fetch('/api/auth/me', {
            method: 'GET',
            credentials: 'include',
          });
          
          if (!response.ok) {
            // Session might have expired, trigger a re-check
            window.location.reload();
          }
        } catch (error) {
          console.error('Auth validation failed:', error);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [user]);

  return {
    isAuthenticated: !!user,
    user,
  };
}