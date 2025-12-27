'use client';

import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { SimpleInput } from './SimpleInput';
import { SimpleButton } from './SimpleButton';
import Link from 'next/link';

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const { resetPassword } = useAuth();

  const validateForm = () => {
    if (!email) {
      setError('Email is required');
      return false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    setError('');

    try {
      await resetPassword(email);
      setIsSuccess(true);
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (value: string) => {
    setEmail(value);
    if (error) {
      setError('');
    }
  };

  if (isSuccess) {
    return (
      <div className="text-center space-y-6">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Check Your Email</h3>
          <p className="text-gray-600 text-sm">
            We've sent a password reset link to <strong>{email}</strong>
          </p>
        </div>

        <div className="space-y-4">
          <p className="text-gray-500 text-sm">
            Didn't receive the email? Check your spam folder or try again.
          </p>
          
          <SimpleButton
            onClick={() => {
              setIsSuccess(false);
              setEmail('');
            }}
            variant="secondary"
            className="w-full"
          >
            Try Again
          </SimpleButton>
        </div>

        <div className="text-center pt-4 border-t border-gray-200">
          <Link
            href="/auth/signin"
            className="text-blue-600 hover:text-blue-700 transition-colors font-medium"
          >
            Back to Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Email Input */}
      <SimpleInput
        type="email"
        label="Email Address"
        value={email}
        onChange={handleInputChange}
        error={error}
        required
        autoComplete="email"
        disabled={isLoading}
        placeholder="Enter your email address"
      />

      {/* Submit Button */}
      <SimpleButton
        type="submit"
        variant="primary"
        size="lg"
        loading={isLoading}
        disabled={isLoading}
        className="w-full"
      >
        {isLoading ? 'Sending...' : 'Send Reset Link'}
      </SimpleButton>

      {/* Back to Sign In */}
      <div className="text-center pt-4 border-t border-gray-200">
        <Link
          href="/auth/signin"
          className="text-blue-600 hover:text-blue-700 transition-colors font-medium"
        >
          Back to Sign In
        </Link>
      </div>
    </form>
  );
}