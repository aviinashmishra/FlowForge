'use client';

import React, { useState, useRef, useEffect } from 'react';
import { SimpleInput } from '../auth/SimpleInput';
import { SimpleButton } from '../auth/SimpleButton';
import { useAuth } from '../../contexts/AuthContext';
import { ProfileFormData, FileUploadResult, ExtendedUser } from '../../types/dashboard';
import { useSuccessToast, useErrorToast } from '../ui/Toast';
import { useApiErrorHandler } from '../../hooks/useErrorHandler';

interface ProfileManagerProps {
  onUpdate?: (updates: any) => void;
  showAccountInfo?: boolean;
}

export function ProfileManager({ onUpdate, showAccountInfo = true }: ProfileManagerProps) {
  const { user, updateProfile } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const showSuccessToast = useSuccessToast();
  const showErrorToast = useErrorToast();
  const { handleApiError } = useApiErrorHandler();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploadProgress, setUploadProgress] = useState(0);

  const [formData, setFormData] = useState<ProfileFormData>({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    bio: (user as ExtendedUser)?.bio || '',
    timezone: (user as ExtendedUser)?.timezone || 'UTC',
    language: (user as ExtendedUser)?.language || 'en',
  });

  // Update form data when user changes
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        bio: (user as ExtendedUser)?.bio || '',
        timezone: (user as ExtendedUser)?.timezone || 'UTC',
        language: (user as ExtendedUser)?.language || 'en',
      });
    }
  }, [user]);

  const handleInputChange = (field: keyof ProfileFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    } else if (formData.firstName.length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    } else if (formData.lastName.length < 2) {
      newErrors.lastName = 'Last name must be at least 2 characters';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (formData.bio && formData.bio.length > 500) {
      newErrors.bio = 'Bio must be less than 500 characters';
    }

    // Validate names don't contain numbers or special characters
    const nameRegex = /^[a-zA-Z\s'-]+$/;
    if (formData.firstName && !nameRegex.test(formData.firstName)) {
      newErrors.firstName = 'First name can only contain letters, spaces, hyphens, and apostrophes';
    }
    if (formData.lastName && !nameRegex.test(formData.lastName)) {
      newErrors.lastName = 'Last name can only contain letters, spaces, hyphens, and apostrophes';
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
      await updateProfile({
        firstName: formData.firstName,
        lastName: formData.lastName,
        bio: formData.bio,
        timezone: formData.timezone,
        language: formData.language,
      });
      
      showSuccessToast('Profile updated successfully!');
      setIsEditing(false);
      onUpdate?.(formData);
    } catch (error) {
      handleApiError(error, '/api/dashboard/profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      bio: '',
      timezone: 'UTC',
      language: 'en',
    });
    setErrors({});
    setIsEditing(false);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file
    const validationResult = validateFile(file);
    if (!validationResult.isValid) {
      setErrors({ avatar: validationResult.error || 'Invalid file' });
      showErrorToast(validationResult.error || 'Invalid file');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setErrors(prev => ({ ...prev, avatar: '' }));

    try {
      const uploadResult = await uploadProfilePicture(file);
      if (uploadResult.success && uploadResult.url) {
        await updateProfile({ avatar: uploadResult.url });
        showSuccessToast('Profile picture updated successfully!');
        onUpdate?.({ avatar: uploadResult.url });
      } else {
        const errorMsg = uploadResult.error || 'Upload failed';
        setErrors({ avatar: errorMsg });
        showErrorToast(errorMsg);
      }
    } catch (error) {
      const errorMsg = 'Failed to upload profile picture';
      setErrors({ avatar: errorMsg });
      showErrorToast(errorMsg);
      handleApiError(error, '/api/dashboard/profile/avatar');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const validateFile = (file: File): { isValid: boolean; error?: string } => {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

    if (file.size > maxSize) {
      return { isValid: false, error: 'File size must be less than 5MB' };
    }

    if (!allowedTypes.includes(file.type)) {
      return { isValid: false, error: 'Only JPEG, PNG, GIF, and WebP files are allowed' };
    }

    // Check image dimensions
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        if (img.width < 100 || img.height < 100) {
          resolve({ isValid: false, error: 'Image must be at least 100x100 pixels' });
        } else if (img.width > 2000 || img.height > 2000) {
          resolve({ isValid: false, error: 'Image must be smaller than 2000x2000 pixels' });
        } else {
          resolve({ isValid: true });
        }
      };
      img.onerror = () => resolve({ isValid: false, error: 'Invalid image file' });
      img.src = URL.createObjectURL(file);
    }) as any;
  };

  const uploadProfilePicture = async (file: File): Promise<FileUploadResult> => {
    return new Promise((resolve) => {
      // Simulate upload progress
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          const next = prev + 10;
          if (next >= 100) {
            clearInterval(interval);
            // Simulate successful upload
            setTimeout(() => {
              resolve({
                success: true,
                url: `https://example.com/avatars/${Date.now()}.jpg`,
              });
            }, 200);
          }
          return next;
        });
      }, 100);
    });
  };

  const removeProfilePicture = async () => {
    setIsLoading(true);
    try {
      await updateProfile({ avatar: undefined });
      showSuccessToast('Profile picture removed successfully!');
      onUpdate?.({ avatar: undefined });
    } catch (error) {
      showErrorToast('Failed to remove profile picture');
      handleApiError(error, '/api/dashboard/profile/avatar');
    } finally {
      setIsLoading(false);
    }
  };

  const timezones = [
    { value: 'UTC', label: 'UTC' },
    { value: 'America/New_York', label: 'Eastern Time' },
    { value: 'America/Chicago', label: 'Central Time' },
    { value: 'America/Denver', label: 'Mountain Time' },
    { value: 'America/Los_Angeles', label: 'Pacific Time' },
    { value: 'Europe/London', label: 'London' },
    { value: 'Europe/Paris', label: 'Paris' },
    { value: 'Asia/Tokyo', label: 'Tokyo' },
    { value: 'Asia/Shanghai', label: 'Shanghai' },
    { value: 'Australia/Sydney', label: 'Sydney' },
  ];

  const languages = [
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Spanish' },
    { value: 'fr', label: 'French' },
    { value: 'de', label: 'German' },
    { value: 'it', label: 'Italian' },
    { value: 'pt', label: 'Portuguese' },
    { value: 'ja', label: 'Japanese' },
    { value: 'ko', label: 'Korean' },
    { value: 'zh', label: 'Chinese' },
  ];

  return (
    <div className="space-y-6">
      {/* Account Information (if enabled) */}
      {showAccountInfo && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Account Type:</span>
              <span className="ml-2 font-medium capitalize">
                {(user as ExtendedUser)?.accountType || 'Free'}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Member Since:</span>
              <span className="ml-2 font-medium">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Last Login:</span>
              <span className="ml-2 font-medium">
                {(user as ExtendedUser)?.lastLoginAt 
                  ? new Date((user as ExtendedUser).lastLoginAt!).toLocaleDateString()
                  : 'N/A'
                }
              </span>
            </div>
            <div>
              <span className="text-gray-600">Email Verified:</span>
              <span className={`ml-2 font-medium ${user?.verified ? 'text-green-600' : 'text-red-600'}`}>
                {user?.verified ? 'Yes' : 'No'}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Two-Factor Auth:</span>
              <span className={`ml-2 font-medium ${(user as ExtendedUser)?.twoFactorEnabled ? 'text-green-600' : 'text-gray-600'}`}>
                {(user as ExtendedUser)?.twoFactorEnabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Login Count:</span>
              <span className="ml-2 font-medium">
                {(user as ExtendedUser)?.loginCount || 0}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Profile Picture Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile Picture</h2>
        <div className="flex items-center space-x-6">
          <div className="relative">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center overflow-hidden shadow-lg">
              {user?.avatar ? (
                <img 
                  src={user.avatar} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-2xl font-bold text-white">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </span>
              )}
            </div>
            {isUploading && (
              <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                <div className="text-center">
                  <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-1"></div>
                  <span className="text-xs text-white font-medium">{uploadProgress}%</span>
                </div>
              </div>
            )}
          </div>
          <div className="flex-1">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <div className="flex space-x-3">
              <SimpleButton 
                variant="secondary" 
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading || isLoading}
              >
                {isUploading ? 'Uploading...' : 'Change Photo'}
              </SimpleButton>
              {user?.avatar && (
                <SimpleButton 
                  variant="secondary" 
                  size="sm"
                  onClick={removeProfilePicture}
                  disabled={isUploading || isLoading}
                  className="text-red-600 hover:text-red-700"
                >
                  Remove
                </SimpleButton>
              )}
            </div>
            <p className="text-sm text-gray-600 mt-2">
              JPG, PNG, GIF, or WebP. Max size of 5MB. Minimum 100x100px.
            </p>
            {errors.avatar && (
              <p className="text-sm text-red-600 mt-1">{errors.avatar}</p>
            )}
          </div>
        </div>
      </div>

      {/* Personal Information */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Personal Information</h2>
          {!isEditing && (
            <SimpleButton
              variant="secondary"
              size="sm"
              onClick={() => setIsEditing(true)}
            >
              Edit
            </SimpleButton>
          )}
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
          <div className="grid grid-cols-2 gap-4">
            <SimpleInput
              type="text"
              label="First Name"
              value={formData.firstName}
              onChange={(value) => handleInputChange('firstName', value)}
              error={errors.firstName}
              required
              disabled={!isEditing || isLoading}
            />

            <SimpleInput
              type="text"
              label="Last Name"
              value={formData.lastName}
              onChange={(value) => handleInputChange('lastName', value)}
              error={errors.lastName}
              required
              disabled={!isEditing || isLoading}
            />
          </div>

          <SimpleInput
            type="email"
            label="Email Address"
            value={formData.email}
            onChange={(value) => handleInputChange('email', value)}
            error={errors.email}
            required
            disabled={true} // Email changes require special verification
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bio
            </label>
            <textarea
              value={formData.bio || ''}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              disabled={!isEditing || isLoading}
              rows={3}
              maxLength={500}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
              placeholder="Tell us about yourself..."
            />
            <div className="flex justify-between mt-1">
              {errors.bio && <p className="text-sm text-red-600">{errors.bio}</p>}
              <p className="text-sm text-gray-500 ml-auto">
                {(formData.bio || '').length}/500
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Timezone
              </label>
              <select
                value={formData.timezone}
                onChange={(e) => handleInputChange('timezone', e.target.value)}
                disabled={!isEditing || isLoading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
              >
                {timezones.map(tz => (
                  <option key={tz.value} value={tz.value}>
                    {tz.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Language
              </label>
              <select
                value={formData.language}
                onChange={(e) => handleInputChange('language', e.target.value)}
                disabled={!isEditing || isLoading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
              >
                {languages.map(lang => (
                  <option key={lang.value} value={lang.value}>
                    {lang.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {isEditing && (
            <div className="flex space-x-4 pt-6">
              <SimpleButton
                type="submit"
                variant="primary"
                loading={isLoading}
                disabled={isLoading}
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
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
          )}
        </form>
      </div>
    </div>
  );
}