'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface LuxuryButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

export function LuxuryButton({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  className = '',
}: LuxuryButtonProps) {
  const [isPressed, setIsPressed] = useState(false);

  const baseClasses = `
    relative overflow-hidden font-semibold rounded-xl
    transition-all duration-300 ease-out
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent
    disabled:cursor-not-allowed disabled:opacity-50
    transform-gpu
  `;

  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  const variantClasses = {
    primary: `
      bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-size-200
      text-white shadow-lg shadow-blue-500/25
      hover:shadow-xl hover:shadow-blue-500/40
      focus:ring-blue-500
      active:scale-95
    `,
    secondary: `
      bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 bg-size-200
      text-white shadow-lg shadow-gray-500/25
      hover:shadow-xl hover:shadow-gray-500/40
      focus:ring-gray-500
      active:scale-95
    `,
    ghost: `
      bg-transparent border border-gray-600 text-gray-300
      hover:border-blue-400 hover:text-blue-400 hover:bg-blue-400/10
      focus:ring-blue-500
      active:scale-95
    `,
  };

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      whileHover={{ 
        scale: disabled ? 1 : 1.02,
        backgroundPosition: variant === 'primary' || variant === 'secondary' ? '100% 0' : undefined,
      }}
      whileTap={{ 
        scale: disabled ? 1 : 0.98,
      }}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      transition={{ duration: 0.2 }}
    >
      {/* Animated background gradient */}
      {(variant === 'primary' || variant === 'secondary') && (
        <motion.div
          className="absolute inset-0 opacity-0"
          animate={{
            opacity: isPressed ? 0.3 : 0,
          }}
          style={{
            background: 'linear-gradient(45deg, rgba(255,255,255,0.1), rgba(255,255,255,0.3), rgba(255,255,255,0.1))',
            backgroundSize: '200% 200%',
          }}
        />
      )}

      {/* Shimmer effect */}
      <motion.div
        className="absolute inset-0 -translate-x-full"
        animate={{
          translateX: isPressed ? '100%' : '-100%',
        }}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
        }}
      />

      {/* Content */}
      <span className="relative z-10 flex items-center justify-center">
        {loading && (
          <motion.div
            className="mr-2"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </motion.div>
        )}
        {children}
      </span>

      {/* Glow effect */}
      <motion.div
        className="absolute inset-0 rounded-xl opacity-0"
        animate={{
          opacity: isPressed ? 0.5 : 0,
        }}
        style={{
          background: variant === 'primary' 
            ? 'radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, transparent 70%)'
            : variant === 'secondary'
            ? 'radial-gradient(circle, rgba(107, 114, 128, 0.3) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(59, 130, 246, 0.2) 0%, transparent 70%)',
          filter: 'blur(10px)',
        }}
      />
    </motion.button>
  );
}