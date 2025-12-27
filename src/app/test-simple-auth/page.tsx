import Link from 'next/link';

export default function TestSimpleAuthPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-8">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-3">
              Simple Auth Design
            </h1>
            
            <p className="text-gray-600 text-sm leading-relaxed max-w-sm mx-auto mb-8">
              Clean, modern 2D authentication forms with aesthetic color combinations
            </p>
          </div>

          <div className="space-y-4">
            <Link
              href="/auth/signin"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-8 rounded-lg transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-200"
            >
              View Sign In Form
            </Link>
            
            <Link
              href="/auth/signup"
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-4 px-8 rounded-lg transition-all duration-200 flex items-center justify-center border-2 border-gray-200 focus:outline-none focus:ring-4 focus:ring-gray-200"
            >
              View Sign Up Form
            </Link>
            
            <Link
              href="/auth/forgot-password"
              className="w-full text-blue-600 hover:text-blue-700 font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
            >
              View Forgot Password Form
            </Link>
          </div>
        </div>
        
        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">
            © 2024 FlowForge. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}