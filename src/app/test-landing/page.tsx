'use client';

import { useState, useEffect } from 'react';

export default function TestLanding() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-luxury-50 to-luxury-100 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-luxury-200/30 to-luxury-300/20 rounded-full blur-3xl floating-animation"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-accent-rose/20 to-luxury-200/30 rounded-full blur-3xl floating-animation" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Simple Navigation */}
      <nav className={`relative z-10 px-6 py-8 ${isLoaded ? 'fade-in-up' : 'opacity-0'}`}>
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-luxury-500 to-luxury-600 rounded-xl flex items-center justify-center shadow-luxury">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="font-display text-2xl font-semibold text-gradient">
              FlowForge
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="font-sans text-neutral-600 hover:text-luxury-600 transition-colors duration-300">Features</a>
            <a href="#about" className="font-sans text-neutral-600 hover:text-luxury-600 transition-colors duration-300">About</a>
            <a href="#contact" className="font-sans text-neutral-600 hover:text-luxury-600 transition-colors duration-300">Contact</a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 px-6 pt-20 pb-32 min-h-screen flex items-center">
        <div className="max-w-6xl mx-auto text-center">
          {/* Main Heading */}
          <div className={`mb-8 ${isLoaded ? 'fade-in-up stagger-1' : 'opacity-0'}`}>
            <h1 className="font-display text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-bold text-gradient mb-6 leading-none tracking-tight">
              Flow<span className="font-light italic">Forge</span>
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-luxury-500 to-accent-gold mx-auto rounded-full shadow-glow-purple"></div>
          </div>

          {/* Subtitle */}
          <div className={`mb-12 ${isLoaded ? 'fade-in-up stagger-2' : 'opacity-0'}`}>
            <p className="font-sans text-lg sm:text-xl md:text-2xl text-neutral-700 max-w-4xl mx-auto leading-relaxed font-light">
              Craft elegant data pipelines with our{' '}
              <span className="font-medium text-luxury-700">visual-first platform</span>. 
              Transform complex workflows into beautiful,{' '}
              <span className="font-medium text-luxury-700">collaborative experiences</span>{' '}
              that scale with your ambitions.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className={`mb-20 ${isLoaded ? 'fade-in-up stagger-3' : 'opacity-0'}`}>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <a 
                href="/builder"
                className="luxury-button px-12 py-5 text-white font-sans font-medium rounded-2xl text-lg min-w-[220px] group"
              >
                <span className="flex items-center justify-center gap-3">
                  Start Creating
                  <svg className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </a>
              <button className="luxury-button-outline px-12 py-5 text-luxury-700 font-sans font-medium rounded-2xl text-lg min-w-[220px]">
                Watch Demo
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className={`${isLoaded ? 'fade-in-up stagger-4' : 'opacity-0'}`}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="glass-effect rounded-3xl p-8 luxury-shadow hover:shadow-luxury-lg transition-all duration-500 hover:-translate-y-2">
                <div className="font-display text-4xl lg:text-5xl font-bold text-gradient mb-3">15+</div>
                <div className="font-sans text-neutral-600 font-light text-lg">Transform Nodes</div>
              </div>
              <div className="glass-effect rounded-3xl p-8 luxury-shadow hover:shadow-luxury-lg transition-all duration-500 hover:-translate-y-2">
                <div className="font-display text-4xl lg:text-5xl font-bold text-gradient mb-3">Real-time</div>
                <div className="font-sans text-neutral-600 font-light text-lg">Collaboration</div>
              </div>
              <div className="glass-effect rounded-3xl p-8 luxury-shadow hover:shadow-luxury-lg transition-all duration-500 hover:-translate-y-2">
                <div className="font-display text-4xl lg:text-5xl font-bold text-gradient mb-3">Zero</div>
                <div className="font-sans text-neutral-600 font-light text-lg">Code Required</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Simple Features Section */}
      <section className="relative z-10 px-6 py-32">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-gradient mb-6 leading-tight">
              Designed for Excellence
            </h2>
            <p className="font-sans text-xl text-neutral-600 max-w-3xl mx-auto font-light leading-relaxed">
              Every detail crafted to deliver an unparalleled experience in data pipeline creation
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="group">
              <div className="glass-effect rounded-3xl p-8 luxury-shadow hover:shadow-luxury-lg transition-all duration-500 group-hover:-translate-y-3">
                <div className="w-16 h-16 bg-gradient-to-br from-luxury-500 to-luxury-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="font-sans text-xl font-semibold text-neutral-800 mb-4">Visual Pipeline Builder</h3>
                <p className="font-sans text-neutral-600 leading-relaxed font-light text-sm">
                  Intuitive drag-and-drop interface with 15+ transformation nodes. Build complex data workflows without writing code.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="group">
              <div className="glass-effect rounded-3xl p-8 luxury-shadow hover:shadow-luxury-lg transition-all duration-500 group-hover:-translate-y-3">
                <div className="w-16 h-16 bg-gradient-to-br from-accent-rose to-luxury-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="font-sans text-xl font-semibold text-neutral-800 mb-4">Real-time Collaboration</h3>
                <p className="font-sans text-neutral-600 leading-relaxed font-light text-sm">
                  Work seamlessly with your team. Live cursor tracking and instant synchronization across all devices.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="group">
              <div className="glass-effect rounded-3xl p-8 luxury-shadow hover:shadow-luxury-lg transition-all duration-500 group-hover:-translate-y-3">
                <div className="w-16 h-16 bg-gradient-to-br from-accent-emerald to-luxury-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <h3 className="font-sans text-xl font-semibold text-neutral-800 mb-4">Live Data Previews</h3>
                <p className="font-sans text-neutral-600 leading-relaxed font-light text-sm">
                  Instant data previews at every pipeline stage with automatic schema detection and error highlighting.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}