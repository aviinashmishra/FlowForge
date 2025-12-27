'use client';

import React, { useState } from 'react';

interface ModernInputProps {
  type?: 'text' | 'email' | 'password';
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  autoComplete?: string;
  placeholder?: string;
}

export function ModernInput({
  type = 'text',
  label,
  value,
  onChange,
  error,
  required = false,
  disabled = false,
  autoComplete,
  placeholder,
}: ModernInputProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="w-full">
      <label className="block text-sm font-semibold text-slate-200 mb-3">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
      
      <div className="relative group">
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={disabled}
          autoComplete={autoComplete}
          placeholder={placeholder}
          className={`
            w-full px-4 py-3.5 bg-white/[0.05] border rounded-xl text-white placeholder-slate-400
            transition-all duration-300 ease-out
            focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/50
            hover:bg-white/[0.08] hover:border-white/30
            backdrop-blur-sm
            ${error 
              ? 'border-red-400/60 focus:ring-red-500/50 focus:border-red-400' 
              : isFocused 
              ? 'border-blue-400/60 bg-white/[0.08]' 
              : 'border-white/20'
            }
            ${disabled ? 'cursor-not-allowed opacity-50' : ''}
          `}
        />
        
        {/* Animated border glow */}
        {isFocused && !error && (
          <div className="absolute inset-0 rounded-xl ring-1 ring-blue-400/30 pointer-events-none animate-pulse" />
        )}
        
        {/* Error state glow */}
        {error && (
          <div className="absolute inset-0 rounded-xl ring-1 ring-red-400/40 pointer-events-none" />
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-2 flex items-start space-x-2">
          <svg className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <p className="text-sm text-red-400 leading-relaxed">
            {error}
          </p>
        </div>
      )}
    </div>
  );
}