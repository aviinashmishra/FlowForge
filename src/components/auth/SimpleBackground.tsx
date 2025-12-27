'use client';

import React from 'react';

interface SimpleBackgroundProps {
  className?: string;
}

export function SimpleBackground({ className = '' }: SimpleBackgroundProps) {
  return (
    <div className={`fixed inset-0 -z-10 ${className}`}>
      {/* Main Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950" />
      
      {/* Animated Gradient Orbs */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Primary orb - top right */}
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-gradient-to-br from-blue-500/30 to-indigo-600/30 rounded-full filter blur-3xl animate-pulse" 
             style={{ animationDuration: '4s' }} />
        
        {/* Secondary orb - bottom left */}
        <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-gradient-to-tr from-purple-500/25 to-pink-500/25 rounded-full filter blur-3xl animate-pulse" 
             style={{ animationDuration: '6s', animationDelay: '2s' }} />
        
        {/* Tertiary orb - center */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-full filter blur-2xl animate-pulse" 
             style={{ animationDuration: '8s', animationDelay: '4s' }} />
      </div>
      
      {/* Subtle Grid Pattern */}
      <div className="absolute inset-0 opacity-[0.03]" 
           style={{
             backgroundImage: `
               linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
               linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
             `,
             backgroundSize: '50px 50px'
           }} />
      
      {/* Radial Gradient Overlay for depth */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-slate-900/20 to-slate-900/60" />
      
      {/* Noise texture for premium feel */}
      <div className="absolute inset-0 opacity-[0.015] mix-blend-overlay"
           style={{
             backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
           }} />
    </div>
  );
}