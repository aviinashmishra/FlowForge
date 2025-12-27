'use client';

import { useState, useEffect } from 'react';
import Navigation from '@/components/landing/Navigation';
import HeroSection from '@/components/landing/HeroSection';
import FeatureShowcase from '@/components/landing/FeatureShowcase';

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [featuresVisible, setFeaturesVisible] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
    
    // Intersection observer for features section
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setFeaturesVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const featuresSection = document.getElementById('features');
    if (featuresSection) {
      observer.observe(featuresSection);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <main className="min-h-screen luxury-gradient relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-luxury-200/30 to-luxury-300/20 rounded-full blur-3xl floating-animation"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-accent-rose/20 to-luxury-200/30 rounded-full blur-3xl floating-animation" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-luxury-100/10 to-accent-gold/10 rounded-full blur-3xl floating-animation" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Navigation */}
      <Navigation isLoaded={isLoaded} />

      {/* Hero Section */}
      <HeroSection isLoaded={isLoaded} />

      {/* Features Section */}
      <FeatureShowcase isVisible={featuresVisible} />

      {/* Additional Sections */}
      <section className="relative z-10 px-6 py-32">
        <div className="max-w-7xl mx-auto">
          {/* Testimonials or Social Proof */}
          <div className="text-center mb-20">
            <h2 className="font-display text-4xl md:text-5xl font-bold text-gradient mb-6">
              Trusted by Data Teams
            </h2>
            <p className="font-sans text-xl text-neutral-600 max-w-3xl mx-auto font-light">
              Join thousands of data professionals who have transformed their workflow with FlowForge
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20">
            <div className="text-center">
              <div className="font-display text-4xl font-bold text-gradient mb-2">10K+</div>
              <div className="font-sans text-neutral-600 font-light">Pipelines Created</div>
            </div>
            <div className="text-center">
              <div className="font-display text-4xl font-bold text-gradient mb-2">500+</div>
              <div className="font-sans text-neutral-600 font-light">Companies</div>
            </div>
            <div className="text-center">
              <div className="font-display text-4xl font-bold text-gradient mb-2">99.9%</div>
              <div className="font-sans text-neutral-600 font-light">Uptime</div>
            </div>
            <div className="text-center">
              <div className="font-display text-4xl font-bold text-gradient mb-2">24/7</div>
              <div className="font-sans text-neutral-600 font-light">Support</div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="glass-effect rounded-3xl p-12 luxury-shadow-lg text-center">
            <h3 className="font-display text-3xl md:text-4xl font-bold text-gradient mb-6">
              Ready to Transform Your Data Workflow?
            </h3>
            <p className="font-sans text-lg text-neutral-600 mb-8 max-w-2xl mx-auto font-light">
              Start building beautiful data pipelines today. No credit card required.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="/auth/signup"
                className="luxury-button px-12 py-5 text-white font-sans font-medium rounded-2xl text-lg min-w-[220px] group"
              >
                <span className="flex items-center justify-center gap-3">
                  Get Started
                  <svg className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </a>
              <a 
                href="/auth/signin"
                className="luxury-button-outline px-12 py-5 text-luxury-700 font-sans font-medium rounded-2xl text-lg min-w-[220px]"
              >
                Sign In
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-16 border-t border-white/20">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-luxury-500 to-luxury-600 rounded-xl flex items-center justify-center shadow-luxury">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div className="font-display text-2xl font-semibold text-gradient">
                  FlowForge
                </div>
              </div>
              <p className="font-sans text-neutral-600 font-light max-w-md">
                Crafting the future of data pipeline creation with elegant design and powerful functionality.
              </p>
            </div>

            {/* Links */}
            <div>
              <h4 className="font-sans font-semibold text-neutral-800 mb-4">Product</h4>
              <ul className="space-y-2">
                <li><a href="#features" className="font-sans text-neutral-600 hover:text-luxury-600 transition-colors duration-300">Features</a></li>
                <li><a href="#pricing" className="font-sans text-neutral-600 hover:text-luxury-600 transition-colors duration-300">Pricing</a></li>
                <li><a href="#docs" className="font-sans text-neutral-600 hover:text-luxury-600 transition-colors duration-300">Documentation</a></li>
                <li><a href="#api" className="font-sans text-neutral-600 hover:text-luxury-600 transition-colors duration-300">API</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-sans font-semibold text-neutral-800 mb-4">Company</h4>
              <ul className="space-y-2">
                <li><a href="#about" className="font-sans text-neutral-600 hover:text-luxury-600 transition-colors duration-300">About</a></li>
                <li><a href="#blog" className="font-sans text-neutral-600 hover:text-luxury-600 transition-colors duration-300">Blog</a></li>
                <li><a href="#careers" className="font-sans text-neutral-600 hover:text-luxury-600 transition-colors duration-300">Careers</a></li>
                <li><a href="#contact" className="font-sans text-neutral-600 hover:text-luxury-600 transition-colors duration-300">Contact</a></li>
              </ul>
            </div>
          </div>

          {/* Bottom */}
          <div className="border-t border-neutral-200/20 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="font-sans text-neutral-500 font-light text-sm">
              © 2024 FlowForge. All rights reserved.
            </p>
            <div className="flex items-center gap-6 mt-4 md:mt-0">
              <a href="#privacy" className="font-sans text-neutral-500 hover:text-luxury-600 transition-colors duration-300 text-sm">Privacy</a>
              <a href="#terms" className="font-sans text-neutral-500 hover:text-luxury-600 transition-colors duration-300 text-sm">Terms</a>
              <a href="#security" className="font-sans text-neutral-500 hover:text-luxury-600 transition-colors duration-300 text-sm">Security</a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}