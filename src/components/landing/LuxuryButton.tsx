'use client';

import { ReactNode, ButtonHTMLAttributes } from 'react';
import Link from 'next/link';

interface LuxuryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  children: ReactNode;
  href?: string;
  loading?: boolean;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
}

export default function LuxuryButton({
  variant = 'primary',
  size = 'medium',
  children,
  href,
  loading = false,
  icon,
  iconPosition = 'right',
  className = '',
  disabled,
  ...props
}: LuxuryButtonProps) {
  const baseClasses = 'relative overflow-hidden font-sans font-medium rounded-2xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-luxury-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed group';
  
  const variantClasses = {
    primary: 'luxury-button text-white shadow-luxury-md hover:shadow-luxury-lg',
    secondary: 'luxury-button-outline text-luxury-700 border border-luxury-200/30',
    ghost: 'text-luxury-700 hover:bg-luxury-50 hover:text-luxury-800'
  };
  
  const sizeClasses = {
    small: 'px-6 py-3 text-sm min-w-[140px]',
    medium: 'px-10 py-4 text-base min-w-[180px]',
    large: 'px-12 py-5 text-lg min-w-[220px]'
  };

  const buttonClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

  const content = (
    <>
      {/* Loading spinner */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-inherit">
          <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      
      {/* Button content */}
      <span className={`relative z-10 flex items-center justify-center gap-3 ${loading ? 'opacity-0' : 'opacity-100'}`}>
        {icon && iconPosition === 'left' && (
          <span className="transition-transform duration-300 group-hover:-translate-x-1">
            {icon}
          </span>
        )}
        {children}
        {icon && iconPosition === 'right' && (
          <span className="transition-transform duration-300 group-hover:translate-x-1">
            {icon}
          </span>
        )}
      </span>

      {/* Hover effect overlay */}
      {variant === 'primary' && (
        <div className="absolute inset-0 bg-gradient-to-r from-luxury-600 to-luxury-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      )}
      
      {/* Shimmer effect */}
      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
    </>
  );

  if (href) {
    return (
      <Link href={href} className={buttonClasses}>
        {content}
      </Link>
    );
  }

  return (
    <button 
      className={buttonClasses}
      disabled={disabled || loading}
      {...props}
    >
      {content}
    </button>
  );
}