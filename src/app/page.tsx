'use client';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="max-w-4xl mx-auto text-center">
        {/* Hero Section */}
        <div className="mb-12">
          <h1 className="text-6xl font-bold text-primary-800 mb-6">
            Flow<span className="text-primary-600">Forge</span>
          </h1>
          <p className="text-xl text-secondary-600 mb-8 max-w-2xl mx-auto">
            A real-time collaborative visual data pipeline builder that transforms 
            how data engineers and analysts create, execute, and debug data workflows.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="/builder"
              className="px-8 py-3 bg-primary-600 text-white rounded-lg font-semibold 
                         hover:bg-primary-700 transition-colors duration-200 
                         focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
                         text-center"
            >
              Start Building Pipelines
            </a>
            <button 
              className="px-8 py-3 border-2 border-primary-600 text-primary-600 rounded-lg font-semibold 
                         hover:bg-primary-50 transition-colors duration-200
                         focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              View Documentation
            </button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white p-6 rounded-xl shadow-lg border border-secondary-200">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
              <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-secondary-800 mb-2">Visual Pipeline Builder</h3>
            <p className="text-secondary-600">
              Drag, drop, and connect 15+ transformation nodes to build complex data pipelines without code.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg border border-secondary-200">
            <div className="w-12 h-12 bg-accent-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
              <svg className="w-6 h-6 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-secondary-800 mb-2">Real-time Collaboration</h3>
            <p className="text-secondary-600">
              Work together with your team in real-time with live cursor tracking and conflict-free editing.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg border border-secondary-200">
            <div className="w-12 h-12 bg-success/20 rounded-lg flex items-center justify-center mb-4 mx-auto">
              <svg className="w-6 h-6 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-secondary-800 mb-2">Live Data Previews</h3>
            <p className="text-secondary-600">
              See instant data previews at every pipeline stage with automatic schema detection and error highlighting.
            </p>
          </div>
        </div>

        {/* Status */}
        <div className="bg-white p-4 rounded-lg border border-secondary-200 inline-block opacity-0">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600"></div>
            <span className="text-secondary-700">Setting up your workspace...</span>
          </div>
        </div>
      </div>
    </main>
  );
}