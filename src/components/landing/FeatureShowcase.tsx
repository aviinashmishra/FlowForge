'use client';

import { useState, useEffect, useRef } from 'react';

interface Feature {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
}

interface FeatureShowcaseProps {
  isVisible?: boolean;
}

export default function FeatureShowcase({ isVisible = false }: FeatureShowcaseProps) {
  const [visibleFeatures, setVisibleFeatures] = useState<Set<string>>(new Set());
  const sectionRef = useRef<HTMLElement>(null);

  const features: Feature[] = [
    {
      id: 'visual-builder',
      title: 'Visual Pipeline Builder',
      description: 'Intuitive drag-and-drop interface with 15+ transformation nodes. Build complex data workflows without writing a single line of code.',
      gradient: 'from-luxury-500 to-luxury-600',
      icon: (
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      )
    },
    {
      id: 'collaboration',
      title: 'Real-time Collaboration',
      description: 'Work seamlessly with your team. Live cursor tracking, conflict-free editing, and instant synchronization across all devices.',
      gradient: 'from-accent-rose to-luxury-500',
      icon: (
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    },
    {
      id: 'data-previews',
      title: 'Live Data Previews',
      description: 'Instant data previews at every pipeline stage. Automatic schema detection and intelligent error highlighting for rapid debugging.',
      gradient: 'from-accent-emerald to-luxury-600',
      icon: (
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      )
    },
    {
      id: 'code-export',
      title: 'Code Export',
      description: 'Export your visual pipelines as production-ready JavaScript, Python, or SQL code. Seamlessly integrate with existing systems.',
      gradient: 'from-accent-gold to-luxury-700',
      icon: (
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      )
    }
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const featureId = entry.target.getAttribute('data-feature-id');
            if (featureId) {
              setVisibleFeatures(prev => new Set([...prev, featureId]));
            }
          }
        });
      },
      { threshold: 0.3 }
    );

    const featureElements = sectionRef.current?.querySelectorAll('[data-feature-id]');
    featureElements?.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} id="features" className="relative z-10 px-6 py-32">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className={`text-center mb-20 ${isVisible ? 'fade-in-up' : 'opacity-0'}`}>
          <h2 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-gradient mb-6 leading-tight">
            Designed for Excellence
          </h2>
          <p className="font-sans text-xl text-neutral-600 max-w-3xl mx-auto font-light leading-relaxed">
            Every detail crafted to deliver an unparalleled experience in data pipeline creation
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-luxury-400 to-accent-gold mx-auto rounded-full mt-8 shadow-glow-purple"></div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={feature.id}
              data-feature-id={feature.id}
              className={`group transition-all duration-700 ${
                visibleFeatures.has(feature.id) 
                  ? 'opacity-100 translate-y-0' 
                  : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${index * 150}ms` }}
            >
              <div className="glass-effect rounded-3xl p-8 luxury-shadow hover:shadow-luxury-lg transition-all duration-500 group-hover:-translate-y-3 h-full flex flex-col">
                {/* Icon */}
                <div className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-luxury`}>
                  {feature.icon}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <h3 className="font-sans text-xl font-semibold text-neutral-800 mb-4 group-hover:text-luxury-700 transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="font-sans text-neutral-600 leading-relaxed font-light text-sm">
                    {feature.description}
                  </p>
                </div>

                {/* Hover indicator */}
                <div className="w-12 h-0.5 bg-gradient-to-r from-luxury-400 to-luxury-600 mt-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                {/* Subtle glow effect on hover */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-luxury-500/5 to-luxury-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Features Row */}
        <div className="mt-16 grid md:grid-cols-3 gap-8">
          {/* Performance */}
          <div className={`group transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`} style={{ transitionDelay: '600ms' }}>
            <div className="glass-effect rounded-3xl p-6 luxury-shadow hover:shadow-luxury-lg transition-all duration-500 group-hover:-translate-y-2">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-luxury-400 to-luxury-500 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h4 className="font-sans text-lg font-semibold text-neutral-800">Lightning Fast</h4>
              </div>
              <p className="font-sans text-neutral-600 text-sm font-light">
                Web Worker execution ensures your pipelines run smoothly without blocking the interface.
              </p>
            </div>
          </div>

          {/* Version Control */}
          <div className={`group transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`} style={{ transitionDelay: '750ms' }}>
            <div className="glass-effect rounded-3xl p-6 luxury-shadow hover:shadow-luxury-lg transition-all duration-500 group-hover:-translate-y-2">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-accent-emerald to-luxury-500 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h4 className="font-sans text-lg font-semibold text-neutral-800">Version Control</h4>
              </div>
              <p className="font-sans text-neutral-600 text-sm font-light">
                Automatic versioning with visual diffs and one-click rollbacks for safe iteration.
              </p>
            </div>
          </div>

          {/* Enterprise Ready */}
          <div className={`group transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`} style={{ transitionDelay: '900ms' }}>
            <div className="glass-effect rounded-3xl p-6 luxury-shadow hover:shadow-luxury-lg transition-all duration-500 group-hover:-translate-y-2">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-accent-gold to-luxury-600 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h4 className="font-sans text-lg font-semibold text-neutral-800">Enterprise Ready</h4>
              </div>
              <p className="font-sans text-neutral-600 text-sm font-light">
                Built for scale with robust security, audit trails, and enterprise-grade reliability.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}