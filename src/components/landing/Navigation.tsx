'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import LuxuryButton from './LuxuryButton';

interface NavigationProps {
  isLoaded?: boolean;
}

export default function Navigation({ isLoaded = false }: NavigationProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { href: '#features', label: 'Features' },
    { href: '#about', label: 'About' },
    { href: '#pricing', label: 'Pricing' },
    { href: '#contact', label: 'Contact' }
  ];

  return (
    <nav className={`
      fixed top-0 left-0 right-0 z-50 px-6 py-4 transition-all duration-500
      ${isScrolled 
        ? 'bg-white/80 backdrop-blur-xl border-b border-neutral-200/20 shadow-luxury' 
        : 'bg-transparent'
      }
      ${isLoaded ? 'fade-in-up' : 'opacity-0'}
    `}>
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="group flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-luxury-500 to-luxury-600 rounded-xl flex items-center justify-center shadow-luxury group-hover:scale-110 transition-transform duration-300">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div className="font-display text-2xl font-semibold text-gradient group-hover:scale-105 transition-transform duration-300">
            FlowForge
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center space-x-8">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="font-sans text-neutral-600 hover:text-luxury-600 transition-colors duration-300 relative group py-2"
            >
              {item.label}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-luxury-400 to-luxury-600 group-hover:w-full transition-all duration-300"></span>
            </a>
          ))}
        </div>

        {/* Desktop CTA */}
        <div className="hidden lg:flex items-center gap-4">
          <Link
            href="/auth/signin"
            className="font-sans text-neutral-600 hover:text-luxury-600 transition-colors duration-300 px-4 py-2"
          >
            Sign In
          </Link>
          <LuxuryButton
            href="/auth/signup"
            size="small"
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            }
          >
            Get Started
          </LuxuryButton>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="lg:hidden p-2 text-neutral-600 hover:text-luxury-600 transition-colors duration-300"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isMobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      <div className={`
        lg:hidden absolute top-full left-0 right-0 bg-white/95 backdrop-blur-xl border-b border-neutral-200/20 shadow-luxury-lg
        transition-all duration-300 overflow-hidden
        ${isMobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}
      `}>
        <div className="px-6 py-6 space-y-4">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className="block font-sans text-neutral-600 hover:text-luxury-600 transition-colors duration-300 py-2"
            >
              {item.label}
            </a>
          ))}
          <div className="pt-4 border-t border-neutral-200/20 space-y-3">
            <Link
              href="/auth/signin"
              className="block font-sans text-neutral-600 hover:text-luxury-600 transition-colors duration-300 py-2"
            >
              Sign In
            </Link>
            <LuxuryButton
              href="/auth/signup"
              size="small"
              className="w-full"
              icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              }
            >
              Get Started
            </LuxuryButton>
          </div>
        </div>
      </div>
    </nav>
  );
}