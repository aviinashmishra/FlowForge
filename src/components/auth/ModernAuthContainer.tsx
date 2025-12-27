'use client';

import React from 'react';

interface ModernAuthContainerProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  className?: string;
}

export function ModernAuthContainer({ 
  children, 
  title, 
  subtitle, 
  className = '' 
}: ModernAuthContainerProps) {
  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${className}`}>
      <div className="w-full max-w-md">
        {/* Main Card */}
        <div className="relative group">
          {/* Glow effect behind card */}
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-indigo-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-300" />
          
          {/* Main card */}
          <div className="relative bg-white/[0.08] backdrop-blur-2xl rounded-3xl border border-white/[0.12] shadow-2xl p-8 overflow-hidden">
            {/* Inner glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.08] via-transparent to-transparent rounded-3xl" />
            
            {/* Content */}
            <div className="relative z-10">
              {/* Header */}
              <div className="text-center mb-8">
                {/* Logo */}
                <div className="flex justify-center mb-6">
                  <div className="relative group">
                    <div className="absolute -inset-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-300" />
                    <div className="relative w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                  </div>
                </div>
                
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent mb-3">
                  {title}
                </h1>
                
                {subtitle && (
                  <p className="text-slate-300 text-sm leading-relaxed max-w-sm mx-auto">
                    {subtitle}
                  </p>
                )}
              </div>

              {/* Form Content */}
              <div>
                {children}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}