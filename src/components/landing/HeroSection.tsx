'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface HeroSectionProps {
  isLoaded?: boolean;
}

export default function HeroSection({ isLoaded = false }: HeroSectionProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <section className="relative z-10 px-6 pt-20 pb-32 min-h-screen flex items-center">
      {/* Interactive Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute w-80 h-80 bg-gradient-to-br from-luxury-200/30 to-luxury-300/20 rounded-full blur-3xl floating-animation transition-transform duration-1000 ease-out"
          style={{
            top: `${20 + mousePosition.y * 0.1}%`,
            right: `${10 + mousePosition.x * 0.05}%`,
          }}
        />
        <div 
          className="absolute w-96 h-96 bg-gradient-to-tr from-accent-rose/20 to-luxury-200/30 rounded-full blur-3xl floating-animation transition-transform duration-1000 ease-out"
          style={{
            bottom: `${10 + mousePosition.y * 0.08}%`,
            left: `${5 + mousePosition.x * 0.03}%`,
            animationDelay: '2s'
          }}
        />
        <div 
          className="absolute w-[600px] h-[600px] bg-gradient-to-r from-luxury-100/10 to-accent-gold/10 rounded-full blur-3xl floating-animation transition-transform duration-1000 ease-out"
          style={{
            top: '50%',
            left: '50%',
            transform: `translate(-50%, -50%) translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)`,
            animationDelay: '4s'
          }}
        />
      </div>

      <div className="max-w-6xl mx-auto text-center relative z-10">
        {/* Main Heading with Enhanced Typography */}
        <div className={`mb-8 ${isLoaded ? 'fade-in-up stagger-1' : 'opacity-0'}`}>
          <div className="relative inline-block">
            <h1 className="font-display text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-bold text-gradient mb-6 leading-none tracking-tight">
              Flow<span className="font-light italic">Forge</span>
            </h1>
            {/* Subtle glow effect */}
            <div className="absolute inset-0 font-display text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-bold leading-none tracking-tight opacity-20 blur-sm">
              Flow<span className="font-light italic">Forge</span>
            </div>
          </div>
          <div className="w-24 h-1 bg-gradient-to-r from-luxury-500 to-accent-gold mx-auto rounded-full shadow-glow-purple"></div>
        </div>

        {/* Enhanced Subtitle */}
        <div className={`mb-12 ${isLoaded ? 'fade-in-up stagger-2' : 'opacity-0'}`}>
          <p className="font-sans text-lg sm:text-xl md:text-2xl text-neutral-700 max-w-4xl mx-auto leading-relaxed font-light">
            Craft elegant data pipelines with our{' '}
            <span className="font-medium text-luxury-700 relative">
              visual-first platform
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-luxury-400 to-luxury-600 opacity-30"></span>
            </span>
            . Transform complex workflows into beautiful,{' '}
            <span className="font-medium text-luxury-700 relative">
              collaborative experiences
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-luxury-400 to-luxury-600 opacity-30"></span>
            </span>{' '}
            that scale with your ambitions.
          </p>
        </div>

        {/* Enhanced CTA Buttons */}
        <div className={`mb-20 ${isLoaded ? 'fade-in-up stagger-3' : 'opacity-0'}`}>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link 
              href="/builder"
              className="group luxury-button px-12 py-5 text-white font-sans font-medium rounded-2xl text-lg min-w-[220px] relative overflow-hidden"
            >
              <span className="relative z-10 flex items-center justify-center gap-3">
                Start Creating
                <svg className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-luxury-600 to-luxury-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Link>
            <button className="group luxury-button-outline px-12 py-5 text-luxury-700 font-sans font-medium rounded-2xl text-lg min-w-[220px] relative overflow-hidden">
              <span className="relative z-10 flex items-center justify-center gap-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Watch Demo
              </span>
            </button>
          </div>
        </div>

        {/* Enhanced Stats with Luxury Cards */}
        <div className={`${isLoaded ? 'fade-in-up stagger-4' : 'opacity-0'}`}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="group glass-effect rounded-3xl p-8 luxury-shadow hover:shadow-luxury-lg transition-all duration-500 hover:-translate-y-2">
              <div className="font-display text-4xl lg:text-5xl font-bold text-gradient mb-3 group-hover:scale-110 transition-transform duration-300">
                15+
              </div>
              <div className="font-sans text-neutral-600 font-light text-lg">Transform Nodes</div>
              <div className="w-12 h-0.5 bg-gradient-to-r from-luxury-400 to-luxury-600 mx-auto mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            
            <div className="group glass-effect rounded-3xl p-8 luxury-shadow hover:shadow-luxury-lg transition-all duration-500 hover:-translate-y-2">
              <div className="font-display text-4xl lg:text-5xl font-bold text-gradient mb-3 group-hover:scale-110 transition-transform duration-300">
                Real-time
              </div>
              <div className="font-sans text-neutral-600 font-light text-lg">Collaboration</div>
              <div className="w-12 h-0.5 bg-gradient-to-r from-luxury-400 to-luxury-600 mx-auto mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            
            <div className="group glass-effect rounded-3xl p-8 luxury-shadow hover:shadow-luxury-lg transition-all duration-500 hover:-translate-y-2">
              <div className="font-display text-4xl lg:text-5xl font-bold text-gradient mb-3 group-hover:scale-110 transition-transform duration-300">
                Zero
              </div>
              <div className="font-sans text-neutral-600 font-light text-lg">Code Required</div>
              <div className="w-12 h-0.5 bg-gradient-to-r from-luxury-400 to-luxury-600 mx-auto mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className={`absolute bottom-8 left-1/2 transform -translate-x-1/2 ${isLoaded ? 'fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '1s' }}>
          <div className="flex flex-col items-center gap-2 text-neutral-400">
            <span className="text-sm font-light">Scroll to explore</span>
            <div className="w-6 h-10 border-2 border-neutral-300 rounded-full flex justify-center">
              <div className="w-1 h-3 bg-neutral-400 rounded-full mt-2 animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}