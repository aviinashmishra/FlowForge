'use client';

import React from 'react';

interface SimpleAuthContainerProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  className?: string;
}

export function SimpleAuthContainer({ 
  children, 
  title, 
  subtitle, 
  className = '' 
}: SimpleAuthContainerProps) {
  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4 ${className}`}>
      <div className="w-full max-w-md">
        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            {/* Logo */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-3">
              {title}
            </h1>
            
            {subtitle && (
              <p className="text-gray-600 text-sm leading-relaxed max-w-sm mx-auto">
                {subtitle}
              </p>
            )}
          </div>

          {/* Form Content */}
          <div>
            {children}
          </div>
        </div>
        
        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">
            © 2024 FlowForge. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}