'use client';

import React from 'react';
import Link from 'next/link';

export function TestAuthPages() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl p-8 max-w-md w-full">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-6">Authentication Test</h1>
          <p className="text-gray-300 mb-8">Test the new authentication pages</p>
          
          <div className="space-y-4">
            <Link
              href="/auth/signin"
              className="block w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-purple-500 hover:to-blue-500 transition-all duration-200"
            >
              Test Sign In Page
            </Link>
            
            <Link
              href="/auth/signup"
              className="block w-full bg-white/10 border border-white/20 text-white py-3 px-6 rounded-xl font-semibold hover:bg-white/20 transition-all duration-200"
            >
              Test Sign Up Page
            </Link>
            
            <Link
              href="/auth/forgot-password"
              className="block w-full bg-transparent text-purple-400 py-3 px-6 rounded-xl font-semibold hover:text-purple-300 transition-all duration-200"
            >
              Test Forgot Password
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}