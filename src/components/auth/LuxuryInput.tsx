'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LuxuryInputProps {
  type?: 'text' | 'email' | 'password';
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  autoComplete?: string;
}

export function LuxuryInput({
  type = 'text',
  label,
  value,
  onChange,
  error,
  required = false,
  disabled = false,
  autoComplete,
}: LuxuryInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const hasValue = value.length > 0;
  const shouldFloatLabel = isFocused || hasValue;

  useEffect(() => {
    if (error && inputRef.current) {
      inputRef.current.focus();
    }
  }, [error]);

  return (
    <div className="relative w-full">
      <motion.div
        className="relative"
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
      >
        {/* Input Container with 3D effect */}
        <div
          className={`
            relative overflow-hidden rounded-xl border backdrop-blur-sm
            transition-all duration-300 ease-out
            ${isFocused 
              ? 'border-blue-400 shadow-lg shadow-blue-500/25 bg-white/10' 
              : error
              ? 'border-red-400 shadow-lg shadow-red-500/25 bg-red-500/5'
              : isHovered
              ? 'border-gray-300 shadow-md shadow-gray-500/10 bg-white/5'
              : 'border-gray-600 bg-white/5'
            }
          `}
          style={{
            background: isFocused 
              ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 51, 234, 0.1) 100%)'
              : 'rgba(255, 255, 255, 0.05)',
          }}
        >
          {/* Animated border gradient */}
          <motion.div
            className="absolute inset-0 rounded-xl opacity-0"
            animate={{
              opacity: isFocused ? 1 : 0,
            }}
            style={{
              background: 'linear-gradient(45deg, #3b82f6, #8b5cf6, #06b6d4, #3b82f6)',
              backgroundSize: '300% 300%',
            }}
          >
            <motion.div
              className="absolute inset-0 rounded-xl"
              animate={{
                backgroundPosition: isFocused ? ['0% 50%', '100% 50%', '0% 50%'] : '0% 50%',
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'linear',
              }}
              style={{
                background: 'linear-gradient(45deg, #3b82f6, #8b5cf6, #06b6d4, #3b82f6)',
                backgroundSize: '300% 300%',
                mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                maskComposite: 'xor',
                padding: '1px',
              }}
            />
          </motion.div>

          {/* Floating Label */}
          <motion.label
            className={`
              absolute left-4 pointer-events-none select-none font-medium
              transition-all duration-300 ease-out
              ${shouldFloatLabel
                ? 'text-xs -translate-y-2.5 text-blue-400'
                : 'text-sm translate-y-3 text-gray-400'
              }
              ${error ? 'text-red-400' : ''}
            `}
            animate={{
              y: shouldFloatLabel ? -10 : 12,
              scale: shouldFloatLabel ? 0.85 : 1,
            }}
            transition={{ duration: 0.2 }}
          >
            {label}
            {required && <span className="text-red-400 ml-1">*</span>}
          </motion.label>

          {/* Input Field */}
          <input
            ref={inputRef}
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            disabled={disabled}
            autoComplete={autoComplete}
            className={`
              w-full px-4 pt-6 pb-2 bg-transparent text-white placeholder-transparent
              focus:outline-none transition-all duration-300
              ${disabled ? 'cursor-not-allowed opacity-50' : ''}
            `}
            style={{
              textShadow: '0 0 10px rgba(255, 255, 255, 0.3)',
            }}
          />

          {/* Shimmer effect on focus */}
          <AnimatePresence>
            {isFocused && (
              <motion.div
                className="absolute inset-0 pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                  animate={{
                    x: ['-100%', '100%'],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-2 px-1"
          >
            <p className="text-sm text-red-400 flex items-center">
              <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}