'use client';

import { ProtectedRoute } from '../../../components/auth/ProtectedRoute';
import { DashboardLayout } from '../../../components/dashboard/DashboardLayout';
import { AnalyticsDashboard } from '../../../components/dashboard/AnalyticsDashboard';
import { ActivityMonitor } from '../../../components/dashboard/ActivityMonitor';
import { useAuth } from '../../../contexts/AuthContext';

export default function AnalyticsPage() {
  const { user } = useAuth();

  const handleExport = async (format: 'csv' | 'json') => {
    // Mock implementation - replace with actual export logic
    console.log(`Exporting analytics data as ${format}`);
    
    // Simulate download
    const filename = `analytics-${new Date().toISOString().split('T')[0]}.${format}`;
    const content = format === 'csv' 
      ? 'Pipeline,Executions,Success Rate,Avg Time\nTest Pipeline,100,95.5,2.3s'
      : JSON.stringify({ pipelines: [{ name: 'Test Pipeline', executions: 100 }] }, null, 2);
    
    const blob = new Blob([content], { type: format === 'csv' ? 'text/csv' : 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <ProtectedRoute requireAuth={true}>
      <DashboardLayout>
        <div className="p-6 sm:p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Analytics</h1>
            <p className="text-gray-600">Monitor pipeline performance and system metrics</p>
          </div>

          <div className="space-y-8">
            {/* Main Analytics Dashboard */}
            <AnalyticsDashboard 
              userId={user?.id || ''}
              onExport={handleExport}
            />

            {/* Activity Monitor */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <ActivityMonitor 
                  limit={20}
                  showFilters={true}
                  realTimeUpdates={true}
                />
              </div>
              
              {/* Quick Stats Sidebar */}
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Active Pipelines</span>
                      <span className="text-lg font-semibold text-gray-900">12</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Running Executions</span>
                      <span className="text-lg font-semibold text-green-600">3</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Failed Today</span>
                      <span className="text-lg font-semibold text-red-600">2</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Avg Response Time</span>
                      <span className="text-lg font-semibold text-gray-900">1.2s</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">System Health</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">API Status</span>
                      <span className="flex items-center text-sm text-green-600">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                        Operational
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Database</span>
                      <span className="flex items-center text-sm text-green-600">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                        Healthy
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Queue Processing</span>
                      <span className="flex items-center text-sm text-yellow-600">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                        High Load
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}