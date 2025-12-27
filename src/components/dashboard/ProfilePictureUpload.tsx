'use client';

import React, { useState, useRef, useCallback } from 'react';
import { SimpleButton } from '../auth/SimpleButton';
import { useSuccessToast, useErrorToast } from '../ui/Toast';
import { FileUploadResult } from '../../types/dashboard';

interface ProfilePictureUploadProps {
  currentAvatar?: string;
  userName?: string;
  onUploadSuccess: (url: string) => void;
  onRemove?: () => void;
  disabled?: boolean;
}

export function ProfilePictureUpload({
  currentAvatar,
  userName = 'User',
  onUploadSuccess,
  onRemove,
  disabled = false,
}: ProfilePictureUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const showSuccessToast = useSuccessToast();
  const showErrorToast = useErrorToast();

  const validateFile = (file: File): { isValid: boolean; error?: string } => {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const minDimension = 100;
    const maxDimension = 2000;

    if (file.size > maxSize) {
      return { isValid: false, error: 'File size must be less than 5MB' };
    }

    if (!allowedTypes.includes(file.type)) {
      return { isValid: false, error: 'Only JPEG, PNG, GIF, and WebP files are allowed' };
    }

    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        if (img.width < minDimension || img.height < minDimension) {
          resolve({ isValid: false, error: `Image must be at least ${minDimension}x${minDimension} pixels` });
        } else if (img.width > maxDimension || img.height > maxDimension) {
          resolve({ isValid: false, error: `Image must be smaller than ${maxDimension}x${maxDimension} pixels` });
        } else {
          resolve({ isValid: true });
        }
        URL.revokeObjectURL(img.src);
      };
      img.onerror = () => {
        resolve({ isValid: false, error: 'Invalid image file' });
        URL.revokeObjectURL(img.src);
      };
      img.src = URL.createObjectURL(file);
    }) as any;
  };

  const uploadFile = async (file: File): Promise<FileUploadResult> => {
    return new Promise((resolve) => {
      // Simulate upload progress
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 15;
        setUploadProgress(Math.min(progress, 95));
        
        if (progress >= 95) {
          clearInterval(interval);
          setUploadProgress(100);
          
          // Simulate successful upload
          setTimeout(() => {
            resolve({
              success: true,
              url: `https://example.com/avatars/${Date.now()}-${file.name}`,
            });
          }, 300);
        }
      }, 200);
    });
  };

  const handleFileSelect = useCallback(async (file: File) => {
    if (disabled) return;

    // Validate file
    const validation = await validateFile(file);
    if (!validation.isValid) {
      showErrorToast(validation.error || 'Invalid file');
      return;
    }

    // Create preview
    const preview = URL.createObjectURL(file);
    setPreviewUrl(preview);
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const result = await uploadFile(file);
      if (result.success && result.url) {
        onUploadSuccess(result.url);
        showSuccessToast('Profile picture updated successfully!');
        setPreviewUrl(null);
      } else {
        throw new Error(result.error || 'Upload failed');
      }
    } catch (error) {
      showErrorToast(error instanceof Error ? error.message : 'Upload failed');
      setPreviewUrl(null);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      URL.revokeObjectURL(preview);
    }
  }, [disabled, onUploadSuccess, showSuccessToast, showErrorToast]);

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
    // Reset input value to allow selecting the same file again
    event.target.value = '';
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setDragActive(true);
    }
  }, []);

  const handleDragOut = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  const handleRemove = () => {
    if (onRemove && !disabled && !isUploading) {
      onRemove();
    }
  };

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const displayUrl = previewUrl || currentAvatar;

  return (
    <div className="space-y-4">
      {/* Profile Picture Display */}
      <div className="flex items-center space-x-6">
        <div className="relative">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center overflow-hidden shadow-lg">
            {displayUrl ? (
              <img 
                src={displayUrl} 
                alt="Profile" 
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-2xl font-bold text-white">
                {getInitials(userName)}
              </span>
            )}
          </div>
          
          {isUploading && (
            <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-1"></div>
                <span className="text-xs text-white font-medium">{Math.round(uploadProgress)}%</span>
              </div>
            </div>
          )}
        </div>

        <div className="flex-1">
          <div className="flex space-x-3">
            <SimpleButton 
              variant="secondary" 
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled || isUploading}
            >
              {isUploading ? 'Uploading...' : 'Change Photo'}
            </SimpleButton>
            
            {currentAvatar && onRemove && (
              <SimpleButton 
                variant="secondary" 
                size="sm"
                onClick={handleRemove}
                disabled={disabled || isUploading}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                Remove
              </SimpleButton>
            )}
          </div>
          
          <p className="text-sm text-gray-600 mt-2">
            JPG, PNG, GIF, or WebP. Max 5MB. Min 100x100px.
          </p>
        </div>
      </div>

      {/* Drag and Drop Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragActive 
            ? 'border-blue-400 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        onDragEnter={handleDragIn}
        onDragLeave={handleDragOut}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
          <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <div className="mt-4">
          <p className="text-sm text-gray-600">
            <span className="font-medium text-blue-600 hover:text-blue-500">
              Click to upload
            </span>
            {' '}or drag and drop
          </p>
          <p className="text-xs text-gray-500 mt-1">
            PNG, JPG, GIF up to 5MB
          </p>
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
        disabled={disabled}
      />
    </div>
  );
}