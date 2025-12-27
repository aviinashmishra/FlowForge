'use client';

import { ProtectedRoute } from '../../../components/auth/ProtectedRoute';
import { DashboardLayout } from '../../../components/dashboard/DashboardLayout';
import Link from 'next/link';
import { useState } from 'react';

interface Pipeline {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive' | 'error';
  lastRun: string;
  nextRun?: string;
  executions: number;
  successRate: number;
  createdAt: string;
}

export default function PipelinesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'error'>('all');

  // Mock data - in a real app, this would come from your API
  const pipelines: Pipeline[] = [
    {
      id: '1',
      name: 'Customer Data Processing',
      description: 'Processes customer data from multiple sources and creates unified profiles',
      status: 'active',
      lastRun: '2 hours ago',
      nextRun: 'In 4 hours',
      executions: 1250,
      successRate: 98.2,
      createdAt: '2024-01-15',
    },
    {
      id: '2',
      name: 'Sales Analytics Pipeline',
      description: 'Aggregates sales data and generates daily reports',
      status: 'active',
      lastRun: '1 hour ago',
      nextRun: 'In 23 hours',
      executions: 890,
      successRate: 95.7,
      createdAt: '2024-01-10',
    },
    {
      id: '3',
      name: 'Marketing Data Pipeline',
      description: 'Processes marketing campaign data and calculates ROI metrics',
      status: 'inactive',
      lastRun: '3 days ago',
      executions: 456,
      successRate: 92.1,
      createdAt: '2024-01-05',
    },
    {
      id: '4',
      name: 'Inventory Sync Pipeline',
      description: 'Synchronizes inventory data across multiple systems',
      status: 'error',
      lastRun: '8 hours ago',
      executions: 234,
      successRate: 87.3,
      createdAt: '2024-01-20',
    },
  ];

  const filteredPipelines = pipelines.filter(pipeline => {
    const matchesSearch = pipeline.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pipeline.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || pipeline.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: Pipeline['status']) => {
    const statusClasses = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      error: 'bg-red-100 text-red-800',
    };

    const statusIcons = {
      active: '●',
      inactive: '●',
      error: '●',
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClasses[status]}`}>
        <span className="mr-1">{statusIcons[status]}</span>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <ProtectedRoute requireAuth={true}>
      <DashboardLayout>
        <div className="p-6 sm:p-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Pipelines</h1>
                <p className="text-gray-600">Manage and monitor your data pipelines</p>
              </div>
              <div className="mt-4 sm:mt-0">
                <Link
                  href="/builder"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Create Pipeline
                </Link>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label htmlFor="search" className="sr-only">Search pipelines</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    id="search"
                    type="text"
                    placeholder="Search pipelines..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="error">Error</option>
                </select>
              </div>
            </div>
          </div>

          {/* Pipelines Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredPipelines.map((pipeline) => (
              <div key={pipeline.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{pipeline.name}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2">{pipeline.description}</p>
                  </div>
                  <div className="ml-4">
                    {getStatusBadge(pipeline.status)}
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Last Run:</span>
                    <span className="text-gray-900">{pipeline.lastRun}</span>
                  </div>
                  {pipeline.nextRun && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Next Run:</span>
                      <span className="text-gray-900">{pipeline.nextRun}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Executions:</span>
                    <span className="text-gray-900">{pipeline.executions.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Success Rate:</span>
                    <span className={`font-medium ${pipeline.successRate >= 95 ? 'text-green-600' : pipeline.successRate >= 90 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {pipeline.successRate}%
                    </span>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Link
                    href={`/builder?pipeline=${pipeline.id}`}
                    className="flex-1 text-center px-3 py-2 bg-blue-50 text-blue-700 text-sm font-medium rounded-lg hover:bg-blue-100 transition-colors duration-200"
                  >
                    Edit
                  </Link>
                  <button className="flex-1 px-3 py-2 bg-gray-50 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-100 transition-colors duration-200">
                    Run Now
                  </button>
                  <button className="px-3 py-2 bg-gray-50 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-100 transition-colors duration-200">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredPipelines.length === 0 && (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No pipelines found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filter criteria.'
                  : 'Get started by creating your first pipeline.'
                }
              </p>
              {!searchTerm && statusFilter === 'all' && (
                <Link
                  href="/builder"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Create Your First Pipeline
                </Link>
              )}
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}