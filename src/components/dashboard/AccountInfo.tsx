'use client';

import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { ExtendedUser } from '../../types/dashboard';

interface AccountInfoProps {
  user?: ExtendedUser;
}

export function AccountInfo({ user: extendedUser }: AccountInfoProps) {
  const { user } = useAuth();
  
  // Use extended user data if available, fallback to basic user data
  const userData = extendedUser || user;

  const formatDate = (date: Date | string | undefined): string => {
    if (!date) return 'Unknown';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatLastLogin = (date: Date | string | undefined): string => {
    if (!date) return 'Never';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffMs = now.getTime() - dateObj.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      if (diffHours === 0) {
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        return diffMinutes <= 1 ? 'Just now' : `${diffMinutes} minutes ago`;
      }
      return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return formatDate(dateObj);
    }
  };

  const getAccountTypeLabel = (type: string): string => {
    switch (type) {
      case 'free':
        return 'Free';
      case 'professional':
        return 'Professional';
      case 'enterprise':
        return 'Enterprise';
      default:
        return 'Free';
    }
  };

  const getAccountTypeColor = (type: string): string => {
    switch (type) {
      case 'free':
        return 'bg-gray-100 text-gray-800';
      case 'professional':
        return 'bg-blue-100 text-blue-800';
      case 'enterprise':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSubscriptionStatusColor = (status: string): string => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'trial':
        return 'bg-yellow-100 text-yellow-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTwoFactorStatus = (enabled: boolean): { label: string; color: string } => {
    return enabled 
      ? { label: 'Enabled', color: 'bg-green-100 text-green-800' }
      : { label: 'Disabled', color: 'bg-red-100 text-red-800' };
  };

  const twoFactorStatus = getTwoFactorStatus(
    (extendedUser as any)?.twoFactorEnabled || false
  );

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h2>
      
      <div className="space-y-4">
        <div className="flex justify-between items-center py-2">
          <span className="text-sm text-gray-600">Member since</span>
          <span className="text-sm font-medium text-gray-900">
            {formatDate(userData?.createdAt)}
          </span>
        </div>

        <div className="flex justify-between items-center py-2">
          <span className="text-sm text-gray-600">Account type</span>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            getAccountTypeColor((extendedUser as any)?.accountType || 'free')
          }`}>
            {getAccountTypeLabel((extendedUser as any)?.accountType || 'free')}
          </span>
        </div>

        {extendedUser && (extendedUser as any).subscriptionStatus && (
          <div className="flex justify-between items-center py-2">
            <span className="text-sm text-gray-600">Subscription status</span>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              getSubscriptionStatusColor((extendedUser as any).subscriptionStatus)
            }`}>
              {(extendedUser as any).subscriptionStatus.charAt(0).toUpperCase() + 
               (extendedUser as any).subscriptionStatus.slice(1)}
            </span>
          </div>
        )}

        <div className="flex justify-between items-center py-2">
          <span className="text-sm text-gray-600">Last login</span>
          <span className="text-sm font-medium text-gray-900">
            {formatLastLogin((extendedUser as any)?.lastLoginAt)}
          </span>
        </div>

        {extendedUser && (extendedUser as any).loginCount !== undefined && (
          <div className="flex justify-between items-center py-2">
            <span className="text-sm text-gray-600">Total logins</span>
            <span className="text-sm font-medium text-gray-900">
              {(extendedUser as any).loginCount.toLocaleString()}
            </span>
          </div>
        )}

        <div className="flex justify-between items-center py-2">
          <span className="text-sm text-gray-600">Email verification</span>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            userData?.verified 
              ? 'bg-green-100 text-green-800' 
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            {userData?.verified ? 'Verified' : 'Pending'}
          </span>
        </div>

        <div className="flex justify-between items-center py-2">
          <span className="text-sm text-gray-600">Two-factor authentication</span>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${twoFactorStatus.color}`}>
            {twoFactorStatus.label}
          </span>
        </div>

        {extendedUser && (extendedUser as any).timezone && (
          <div className="flex justify-between items-center py-2">
            <span className="text-sm text-gray-600">Timezone</span>
            <span className="text-sm font-medium text-gray-900">
              {(extendedUser as any).timezone}
            </span>
          </div>
        )}

        {extendedUser && (extendedUser as any).language && (
          <div className="flex justify-between items-center py-2">
            <span className="text-sm text-gray-600">Language</span>
            <span className="text-sm font-medium text-gray-900">
              {(extendedUser as any).language.toUpperCase()}
            </span>
          </div>
        )}
      </div>

      {!userData?.verified && (
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-yellow-400 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div>
              <h4 className="text-sm font-medium text-yellow-800">Email verification required</h4>
              <p className="text-sm text-yellow-700 mt-1">
                Please check your email and click the verification link to activate your account.
              </p>
              <button className="text-sm text-yellow-800 underline hover:text-yellow-900 mt-2">
                Resend verification email
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}