'use client';

import { useCallback } from 'react';
import { useErrorToast } from '../components/ui/Toast';

interface ErrorHandlerOptions {
  showToast?: boolean;
  logError?: boolean;
  fallbackMessage?: string;
}

export function useErrorHandler(options: ErrorHandlerOptions = {}) {
  const {
    showToast = true,
    logError = true,
    fallbackMessage = 'An unexpected error occurred',
  } = options;

  const showErrorToast = useErrorToast();

  const handleError = useCallback((error: unknown, context?: string) => {
    let errorMessage = fallbackMessage;
    let errorDetails: any = null;

    // Extract error message
    if (error instanceof Error) {
      errorMessage = error.message;
      errorDetails = {
        name: error.name,
        stack: error.stack,
        context,
      };
    } else if (typeof error === 'string') {
      errorMessage = error;
    } else if (error && typeof error === 'object' && 'message' in error) {
      errorMessage = (error as any).message || fallbackMessage;
    }

    // Log error
    if (logError) {
      console.error('Error handled:', {
        message: errorMessage,
        context,
        originalError: error,
        timestamp: new Date().toISOString(),
      });

      // In production, send to error reporting service
      if (process.env.NODE_ENV === 'production') {
        // Example: Sentry.captureException(error, { tags: { context } });
      }
    }

    // Show toast notification
    if (showToast) {
      showErrorToast('Error', errorMessage);
    }

    return {
      message: errorMessage,
      details: errorDetails,
    };
  }, [showToast, logError, fallbackMessage, showErrorToast]);

  const handleAsyncError = useCallback(async <T>(
    asyncFn: () => Promise<T>,
    context?: string
  ): Promise<T | null> => {
    try {
      return await asyncFn();
    } catch (error) {
      handleError(error, context);
      return null;
    }
  }, [handleError]);

  const createErrorHandler = useCallback((context: string) => {
    return (error: unknown) => handleError(error, context);
  }, [handleError]);

  return {
    handleError,
    handleAsyncError,
    createErrorHandler,
  };
}

// API Error Handler
export function useApiErrorHandler() {
  const { handleError } = useErrorHandler();

  const handleApiError = useCallback((error: any, endpoint?: string) => {
    let message = 'API request failed';

    if (error?.response) {
      // HTTP error response
      const status = error.response.status;
      const data = error.response.data;

      switch (status) {
        case 400:
          message = data?.error || 'Bad request';
          break;
        case 401:
          message = 'You are not authorized to perform this action';
          break;
        case 403:
          message = 'You do not have permission to access this resource';
          break;
        case 404:
          message = 'The requested resource was not found';
          break;
        case 422:
          message = data?.error || 'Validation failed';
          break;
        case 429:
          message = 'Too many requests. Please try again later';
          break;
        case 500:
          message = 'Internal server error. Please try again later';
          break;
        default:
          message = data?.error || `Request failed with status ${status}`;
      }
    } else if (error?.request) {
      // Network error
      message = 'Network error. Please check your connection and try again';
    } else if (error?.message) {
      message = error.message;
    }

    return handleError(new Error(message), endpoint ? `API: ${endpoint}` : 'API');
  }, [handleError]);

  return { handleApiError };
}

// Form Error Handler
export function useFormErrorHandler() {
  const { handleError } = useErrorHandler({ showToast: false });

  const handleFormError = useCallback((error: any, fieldName?: string) => {
    const context = fieldName ? `Form field: ${fieldName}` : 'Form validation';
    
    if (error?.response?.data?.errors) {
      // Handle validation errors from API
      const validationErrors = error.response.data.errors;
      return validationErrors;
    }

    handleError(error, context);
    return null;
  }, [handleError]);

  return { handleFormError };
}

// Global error handler for unhandled promise rejections
export function setupGlobalErrorHandlers() {
  if (typeof window !== 'undefined') {
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled promise rejection:', event.reason);
      
      // Prevent the default browser behavior
      event.preventDefault();
      
      // In production, report to error service
      if (process.env.NODE_ENV === 'production') {
        // Example: Sentry.captureException(event.reason);
      }
    });

    // Handle global errors
    window.addEventListener('error', (event) => {
      console.error('Global error:', event.error);
      
      // In production, report to error service
      if (process.env.NODE_ENV === 'production') {
        // Example: Sentry.captureException(event.error);
      }
    });
  }
}