'use client';

import { ProtectedRoute } from '../../components/auth/ProtectedRoute';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { StatsCard } from '../../components/dashboard/StatsCard';
import { ActivityMonitor } from '../../components/dashboard/ActivityMonitor';
import { useAuth } from '../../contexts/AuthContext';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function DashboardPage() {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const response = await fetch('/api/dashboard/stats');
      if (response.ok) {
        const data = await response.json();
        setDashboardData(data.data);
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Mock data - in a real app, this would come from the API
  const stats = [
    {
      title: 'Total Pipelines',
      value: dashboardData?.stats?.totalPipelines || 12,
      change: '+2 this week',
      changeType: 'increase' as const,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      color: 'blue' as const,
    },
    {
      title: 'Active Executions',
      value: dashboardData?.stats?.activeExecutions || 3,
      change: 'Running now',
      changeType: 'neutral' as const,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h8m-9-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'green' as const,
    },
    {
      title: 'Success Rate',
      value: `${dashboardData?.stats?.successRate || 94.2}%`,
      change: '+1.2% from last month',
      changeType: 'increase' as const,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'purple' as const,
    },
    {
      title: 'Data Processed',
      value: dashboardData?.stats?.dataProcessed || '2.4TB',
      change: '+15% this month',
      changeType: 'increase' as const,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
        </svg>
      ),
      color: 'orange' as const,
    },
  ];

  if (isLoading) {
    return (
      <ProtectedRoute requireAuth={true}>
        <DashboardLayout>
          <div className="p-6 sm:p-8">
            <div className="flex items-center justify-center min-h-96">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="ml-3 text-gray-600">Loading dashboard...</span>
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requireAuth={true}>
      <DashboardLayout>
        {/* Hero Section with Gradient Background */}
        <div className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 overflow-hidden">
          <div className="absolute inset-0 bg-black opacity-10"></div>
          <div className="absolute inset-0">
            <div className="absolute top-0 left-0 w-72 h-72 bg-white opacity-5 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full translate-x-1/2 translate-y-1/2"></div>
          </div>
          <div className="relative p-6 sm:p-8">
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">
                    Welcome back, {user?.firstName}! 👋
                  </h1>
                  <p className="text-blue-100 text-lg">
                    Here&apos;s what&apos;s happening with your pipelines today.
                  </p>
                </div>
                <div className="hidden md:block">
                  <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-4">
                    <div className="text-white text-center">
                      <div className="text-2xl font-bold">{new Date().getDate()}</div>
                      <div className="text-sm opacity-80">{new Date().toLocaleDateString('en-US', { month: 'short' })}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {stats.map((stat, index) => (
                <div key={index} className="group">
                  <div className="bg-white bg-opacity-10 backdrop-blur-sm border border-white border-opacity-20 rounded-2xl p-6 hover:bg-opacity-20 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-blue-100 text-sm font-medium mb-2">{stat.title}</p>
                        <p className="text-white text-3xl font-bold mb-1">{stat.value}</p>
                        {stat.change && (
                          <p className={`text-sm font-medium flex items-center ${
                            stat.changeType === 'increase' ? 'text-green-300' : 'text-blue-200'
                          }`}>
                            {stat.changeType === 'increase' && (
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                              </svg>
                            )}
                            {stat.change}
                          </p>
                        )}
                      </div>
                      <div className="bg-white bg-opacity-20 p-3 rounded-xl group-hover:bg-opacity-30 transition-all duration-300">
                        <div className="text-white">
                          {stat.icon}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-8 bg-gray-50 min-h-screen -mt-4 rounded-t-3xl relative z-10">

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Activity - Enhanced */}
            <div className="lg:col-span-2">
              <ActivityMonitor 
                limit={10}
                showFilters={false}
                realTimeUpdates={true}
              />
            </div>

            {/* Quick Actions & System Status */}
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Link
                    href="/builder"
                    className="flex items-center p-3 rounded-lg border border-gray-200 hover:bg-blue-50 hover:border-blue-300 transition-colors duration-200 group"
                  >
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-blue-200">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Create Pipeline</p>
                      <p className="text-sm text-gray-600">Build a new data pipeline</p>
                    </div>
                  </Link>

                  <Link
                    href="/dashboard/pipelines"
                    className="flex items-center p-3 rounded-lg border border-gray-200 hover:bg-green-50 hover:border-green-300 transition-colors duration-200 group"
                  >
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-green-200">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">View Pipelines</p>
                      <p className="text-sm text-gray-600">Manage existing pipelines</p>
                    </div>
                  </Link>

                  <Link
                    href="/dashboard/analytics"
                    className="flex items-center p-3 rounded-lg border border-gray-200 hover:bg-purple-50 hover:border-purple-300 transition-colors duration-200 group"
                  >
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-purple-200">
                      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">View Analytics</p>
                      <p className="text-sm text-gray-600">Check performance metrics</p>
                    </div>
                  </Link>

                  <Link
                    href="/dashboard/profile"
                    className="flex items-center p-3 rounded-lg border border-gray-200 hover:bg-indigo-50 hover:border-indigo-300 transition-colors duration-200 group"
                  >
                    <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-indigo-200">
                      <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Manage Profile</p>
                      <p className="text-sm text-gray-600">Update account settings</p>
                    </div>
                  </Link>
                </div>
              </div>

              {/* System Status */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">API Status</span>
                    <span className={`flex items-center text-sm ${
                      dashboardData?.systemStatus?.api?.status === 'operational' 
                        ? 'text-green-600' 
                        : 'text-red-600'
                    }`}>
                      <div className={`w-2 h-2 rounded-full mr-2 ${
                        dashboardData?.systemStatus?.api?.status === 'operational' 
                          ? 'bg-green-500' 
                          : 'bg-red-500'
                      }`}></div>
                      {dashboardData?.systemStatus?.api?.status || 'Operational'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Database</span>
                    <span className={`flex items-center text-sm ${
                      dashboardData?.systemStatus?.database?.status === 'operational' 
                        ? 'text-green-600' 
                        : 'text-red-600'
                    }`}>
                      <div className={`w-2 h-2 rounded-full mr-2 ${
                        dashboardData?.systemStatus?.database?.status === 'operational' 
                          ? 'bg-green-500' 
                          : 'bg-red-500'
                      }`}></div>
                      {dashboardData?.systemStatus?.database?.status || 'Healthy'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Queue Processing</span>
                    <span className={`flex items-center text-sm ${
                      dashboardData?.systemStatus?.queueProcessing?.status === 'operational' 
                        ? 'text-green-600' 
                        : dashboardData?.systemStatus?.queueProcessing?.status === 'degraded'
                        ? 'text-yellow-600'
                        : 'text-red-600'
                    }`}>
                      <div className={`w-2 h-2 rounded-full mr-2 ${
                        dashboardData?.systemStatus?.queueProcessing?.status === 'operational' 
                          ? 'bg-green-500' 
                          : dashboardData?.systemStatus?.queueProcessing?.status === 'degraded'
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                      }`}></div>
                      {dashboardData?.systemStatus?.queueProcessing?.status || 'High Load'}
                    </span>
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