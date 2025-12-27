'use client';

import React, { useState } from 'react';
import { SimpleInput } from '../auth/SimpleInput';
import { SimpleButton } from '../auth/SimpleButton';
import { PasswordChangeData } from '../../types/dashboard';

interface PasswordChangeFormProps {
  onPasswordChange?: (data: PasswordChangeData) => Promise<void>;
}

export function PasswordChangeForm({ onPasswordChange }: PasswordChangeFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState('');
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState<PasswordChangeData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleInputChange = (field: keyof PasswordChangeData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }

    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters long';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.newPassword)) {
      newErrors.newPassword = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (formData.currentPassword === formData.newPassword) {
      newErrors.newPassword = 'New password must be different from current password';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getPasswordStrength = (password: string): { score: number; label: string; color: string } => {
    let score = 0;
    
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^a-zA-Z\d]/.test(password)) score++;

    if (score <= 2) return { score, label: 'Weak', color: 'red' };
    if (score <= 4) return { score, label: 'Medium', color: 'yellow' };
    return { score, label: 'Strong', color: 'green' };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});
    setSuccessMessage('');

    try {
      if (onPasswordChange) {
        await onPasswordChange(formData);
      } else {
        // Mock API call
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      setSuccessMessage('Password changed successfully!');
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setShowForm(false);
    } catch (error: any) {
      setErrors({ 
        general: error.message || 'Failed to change password. Please try again.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    setErrors({});
    setSuccessMessage('');
    setShowForm(false);
  };

  const passwordStrength = getPasswordStrength(formData.newPassword);

  if (!showForm) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Password</h3>
            <p className="text-sm text-gray-600 mt-1">
              Last changed: Never
            </p>
          </div>
          <SimpleButton
            variant="secondary"
            size="sm"
            onClick={() => setShowForm(true)}
          >
            Change Password
          </SimpleButton>
        </div>
        
        {successMessage && (
          <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 mt-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <p className="text-green-700 text-sm font-medium">{successMessage}</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Change Password</h3>
        <button
          onClick={handleCancel}
          className="text-gray-400 hover:text-gray-600"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {errors.general && (
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <p className="text-red-700 text-sm font-medium">{errors.general}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <SimpleInput
          type="password"
          label="Current Password"
          value={formData.currentPassword}
          onChange={(value) => handleInputChange('currentPassword', value)}
          error={errors.currentPassword}
          required
          disabled={isLoading}
          placeholder="Enter your current password"
        />

        <div>
          <SimpleInput
            type="password"
            label="New Password"
            value={formData.newPassword}
            onChange={(value) => handleInputChange('newPassword', value)}
            error={errors.newPassword}
            required
            disabled={isLoading}
            placeholder="Enter your new password"
          />
          
          {formData.newPassword && (
            <div className="mt-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Password strength:</span>
                <span className={`font-medium text-${passwordStrength.color}-600`}>
                  {passwordStrength.label}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                <div 
                  className={`bg-${passwordStrength.color}-500 h-2 rounded-full transition-all duration-300`}
                  style={{ width: `${(passwordStrength.score / 6) * 100}%` }}
                ></div>
              </div>
              <div className="mt-2 text-xs text-gray-600">
                <p>Password should contain:</p>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li className={formData.newPassword.length >= 8 ? 'text-green-600' : 'text-gray-400'}>
                    At least 8 characters
                  </li>
                  <li className={/[a-z]/.test(formData.newPassword) ? 'text-green-600' : 'text-gray-400'}>
                    One lowercase letter
                  </li>
                  <li className={/[A-Z]/.test(formData.newPassword) ? 'text-green-600' : 'text-gray-400'}>
                    One uppercase letter
                  </li>
                  <li className={/\d/.test(formData.newPassword) ? 'text-green-600' : 'text-gray-400'}>
                    One number
                  </li>
                  <li className={/[^a-zA-Z\d]/.test(formData.newPassword) ? 'text-green-600' : 'text-gray-400'}>
                    One special character (recommended)
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>

        <SimpleInput
          type="password"
          label="Confirm New Password"
          value={formData.confirmPassword}
          onChange={(value) => handleInputChange('confirmPassword', value)}
          error={errors.confirmPassword}
          required
          disabled={isLoading}
          placeholder="Confirm your new password"
        />

        <div className="flex space-x-4 pt-6">
          <SimpleButton
            type="submit"
            variant="primary"
            loading={isLoading}
            disabled={isLoading}
          >
            {isLoading ? 'Changing Password...' : 'Change Password'}
          </SimpleButton>
          <SimpleButton
            type="button"
            variant="secondary"
            onClick={handleCancel}
            disabled={isLoading}
          >
            Cancel
          </SimpleButton>
        </div>
      </form>
    </div>
  );
}