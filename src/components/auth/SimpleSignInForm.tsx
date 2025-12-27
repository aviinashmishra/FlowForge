'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { SimpleInput } from './SimpleInput';
import { SimpleButton } from './SimpleButton';
import Link from 'next/link';

export function SimpleSignInForm() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { signIn } = useAuth();
  const router = useRouter();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      const result = await signIn({
        email: formData.email,
        password: formData.password,
      });

      if (result.success) {
        router.push('/dashboard');
      } else {
        setErrors({ general: result.error || 'Sign in failed' });
      }
    } catch (error) {
      setErrors({ general: 'An unexpected error occurred' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* General Error Message */}
      {errors.general && (
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-red-700 text-sm font-medium">{errors.general}</p>
            </div>
          </div>
        </div>
      )}

      {/* Email Input */}
      <SimpleInput
        type="email"
        label="Email Address"
        value={formData.email}
        onChange={(value) => handleInputChange('email', value)}
        error={errors.email}
        required
        autoComplete="email"
        disabled={isLoading}
        placeholder="Enter your email address"
      />

      {/* Password Input */}
      <div className="relative">
        <SimpleInput
          type={showPassword ? 'text' : 'password'}
          label="Password"
          value={formData.password}
          onChange={(value) => handleInputChange('password', value)}
          error={errors.password}
          required
          autoComplete="current-password"
          disabled={isLoading}
          placeholder="Enter your password"
        />
        
        {/* Show/Hide Password Button */}
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-9 text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1 rounded-lg hover:bg-gray-100"
          disabled={isLoading}
        >
          {showPassword ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          )}
        </button>
      </div>

      {/* Forgot Password Link */}
      <div className="text-right">
        <Link
          href="/auth/forgot-password"
          className="text-sm text-blue-600 hover:text-blue-700 transition-colors duration-200 font-medium"
        >
          Forgot your password?
        </Link>
      </div>

      {/* Submit Button */}
      <SimpleButton
        type="submit"
        variant="primary"
        size="lg"
        loading={isLoading}
        disabled={isLoading}
        className="w-full"
      >
        {isLoading ? 'Signing In...' : 'Sign In'}
      </SimpleButton>

      {/* Sign Up Link */}
      <div className="text-center pt-6 border-t border-gray-200">
        <p className="text-gray-600 text-sm">
          Don&apos;t have an account?{' '}
          <Link
            href="/auth/signup"
            className="text-blue-600 hover:text-blue-700 transition-colors duration-200 font-semibold"
          >
            Sign up here
          </Link>
        </p>
      </div>
    </form>
  );
}