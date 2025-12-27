'use client';

import React, { useState, useEffect } from 'react';

interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  breakpoint?: 'sm' | 'md' | 'lg' | 'xl';
}

export function ResponsiveContainer({ 
  children, 
  className = '', 
  breakpoint = 'lg' 
}: ResponsiveContainerProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      const breakpoints = {
        sm: 640,
        md: 768,
        lg: 1024,
        xl: 1280,
      };
      
      setIsMobile(window.innerWidth < breakpoints[breakpoint]);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, [breakpoint]);

  return (
    <div className={`responsive-container ${isMobile ? 'mobile' : 'desktop'} ${className}`}>
      {children}
    </div>
  );
}

interface ResponsiveGridProps {
  children: React.ReactNode;
  cols?: {
    default: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: number;
  className?: string;
}

export function ResponsiveGrid({ 
  children, 
  cols = { default: 1, md: 2, lg: 3 },
  gap = 6,
  className = '' 
}: ResponsiveGridProps) {
  const getGridClasses = () => {
    const classes = [`grid gap-${gap}`];
    
    classes.push(`grid-cols-${cols.default}`);
    if (cols.sm) classes.push(`sm:grid-cols-${cols.sm}`);
    if (cols.md) classes.push(`md:grid-cols-${cols.md}`);
    if (cols.lg) classes.push(`lg:grid-cols-${cols.lg}`);
    if (cols.xl) classes.push(`xl:grid-cols-${cols.xl}`);
    
    return classes.join(' ');
  };

  return (
    <div className={`${getGridClasses()} ${className}`}>
      {children}
    </div>
  );
}

interface ResponsiveStackProps {
  children: React.ReactNode;
  direction?: 'vertical' | 'horizontal' | 'responsive';
  spacing?: number;
  className?: string;
}

export function ResponsiveStack({ 
  children, 
  direction = 'responsive',
  spacing = 4,
  className = '' 
}: ResponsiveStackProps) {
  const getStackClasses = () => {
    const classes = [`space-y-${spacing}`];
    
    if (direction === 'horizontal') {
      return [`flex space-x-${spacing} space-y-0`];
    } else if (direction === 'responsive') {
      return [`flex flex-col space-y-${spacing} md:flex-row md:space-y-0 md:space-x-${spacing}`];
    }
    
    return classes;
  };

  return (
    <div className={`${getStackClasses().join(' ')} ${className}`}>
      {children}
    </div>
  );
}