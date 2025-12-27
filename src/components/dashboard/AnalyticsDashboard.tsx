'use client';

import React, { useState, useEffect } from 'react';
import { SimpleButton } from '../auth/SimpleButton';
import { 
  AnalyticsData, 
  AnalyticsFilters, 
  DateRange, 
  PipelineMetrics,
  ExecutionTrend,
  ErrorRate,
  PerformanceMetric 
} from '../../types/dashboard';

interface AnalyticsDashboardProps {
  userId: string;
  onExport?: (format: 'csv' | 'json') => Promise<void>;
}

export function AnalyticsDashboard({ userId, onExport }: AnalyticsDashboardProps) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState<AnalyticsFilters>({
    dateRange: getDefaultDateRange(),
    status: 'all',
  });

  useEffect(() => {
    loadAnalyticsData();
  }, [filters]);

  const loadAnalyticsData = async () => {
    setIsLoading(true);
    setError('');

    try {
      // Mock data loading - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockData: AnalyticsData = {
        pipelineMetrics: generateMockPipelineMetrics(),
        executionTrends: generateMockExecutionTrends(filters.dateRange),
        errorRates: generateMockErrorRates(filters.dateRange),
        performanceMetrics: generateMockPerformanceMetrics(),
      };

      setData(mockData);
    } catch (err: any) {
      setError(err.message || 'Failed to load analytics data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateRangeChange = (range: DateRange) => {
    setFilters(prev => ({ ...prev, dateRange: range }));
  };

  const handleExport = async (format: 'csv' | 'json') => {
    try {
      if (onExport) {
        await onExport(format);
      } else {
        // Mock export
        const filename = `analytics-${new Date().toISOString().split('T')[0]}.${format}`;
        console.log(`Exporting analytics data as ${filename}`);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to export data');
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-3 text-gray-600">Loading analytics...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="text-center">
          <svg className="w-12 h-12 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to Load Analytics</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <SimpleButton variant="primary" onClick={loadAnalyticsData}>
            Retry
          </SimpleButton>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Header with Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Analytics Dashboard</h2>
          <div className="flex items-center space-x-3">
            <SimpleButton
              variant="secondary"
              size="sm"
              onClick={() => handleExport('csv')}
            >
              Export CSV
            </SimpleButton>
            <SimpleButton
              variant="secondary"
              size="sm"
              onClick={() => handleExport('json')}
            >
              Export JSON
            </SimpleButton>
          </div>
        </div>

        {/* Date Range Filter */}
        <div className="flex items-center space-x-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
            <select
              value={getDateRangePreset(filters.dateRange)}
              onChange={(e) => handleDateRangeChange(getDateRangeFromPreset(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status Filter</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as any }))}
              className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All executions</option>
              <option value="success">Successful only</option>
              <option value="error">Failed only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {data.performanceMetrics.map((metric, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{metric.name}</p>
                <p className="text-2xl font-bold text-gray-900">
                  {metric.value} <span className="text-sm font-normal text-gray-500">{metric.unit}</span>
                </p>
              </div>
              <div className={`p-2 rounded-full ${
                metric.trend === 'up' ? 'bg-green-100' :
                metric.trend === 'down' ? 'bg-red-100' : 'bg-gray-100'
              }`}>
                {metric.trend === 'up' && (
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17l9.2-9.2M17 17V7H7" />
                  </svg>
                )}
                {metric.trend === 'down' && (
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 7l-9.2 9.2M7 7v10h10" />
                  </svg>
                )}
                {metric.trend === 'stable' && (
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Execution Trends Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Execution Trends</h3>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center">
              <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <p className="text-gray-500">Chart visualization would go here</p>
              <p className="text-sm text-gray-400 mt-1">
                {data.executionTrends.length} data points over {filters.dateRange ? Math.ceil((filters.dateRange.end.getTime() - filters.dateRange.start.getTime()) / (1000 * 60 * 60 * 24)) : 0} days
              </p>
            </div>
          </div>
        </div>

        {/* Error Rates Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Error Rates</h3>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center">
              <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
              </svg>
              <p className="text-gray-500">Error rate chart would go here</p>
              <p className="text-sm text-gray-400 mt-1">
                Average error rate: {data.errorRates.reduce((sum, rate) => sum + rate.errorRate, 0) / data.errorRates.length || 0}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Pipeline Metrics Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Pipeline Performance</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pipeline
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Executions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Success Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avg Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data Processed
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Executed
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.pipelineMetrics.map((pipeline) => (
                <tr key={pipeline.pipelineId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{pipeline.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{pipeline.executionCount.toLocaleString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      pipeline.successRate >= 95 ? 'bg-green-100 text-green-800' :
                      pipeline.successRate >= 80 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {pipeline.successRate}%
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{pipeline.averageExecutionTime}s</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{formatBytes(pipeline.dataProcessed)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{formatRelativeTime(pipeline.lastExecuted)}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Helper functions
function getDefaultDateRange(): DateRange {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 30);
  return { start, end };
}

function getDateRangePreset(range: DateRange): string {
  const days = Math.ceil((range.end.getTime() - range.start.getTime()) / (1000 * 60 * 60 * 24));
  if (days <= 7) return '7d';
  if (days <= 30) return '30d';
  if (days <= 90) return '90d';
  return '1y';
}

function getDateRangeFromPreset(preset: string): DateRange {
  const end = new Date();
  const start = new Date();
  
  switch (preset) {
    case '7d':
      start.setDate(start.getDate() - 7);
      break;
    case '30d':
      start.setDate(start.getDate() - 30);
      break;
    case '90d':
      start.setDate(start.getDate() - 90);
      break;
    case '1y':
      start.setFullYear(start.getFullYear() - 1);
      break;
  }
  
  return { start, end };
}

function generateMockPipelineMetrics(): PipelineMetrics[] {
  const names = [
    'Customer Data Processing',
    'Sales Analytics',
    'Marketing Data Pipeline',
    'Inventory Sync',
    'User Behavior Analysis',
  ];

  return names.map((name, index) => ({
    pipelineId: `pipeline_${index + 1}`,
    name,
    executionCount: Math.floor(Math.random() * 100) + 10,
    successRate: Math.round((Math.random() * 20 + 80) * 100) / 100,
    averageExecutionTime: Math.floor(Math.random() * 300) + 30,
    dataProcessed: Math.floor(Math.random() * 1000000) + 10000,
    lastExecuted: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
  }));
}

function generateMockExecutionTrends(dateRange: DateRange): ExecutionTrend[] {
  const trends: ExecutionTrend[] = [];
  const daysDiff = Math.ceil((dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24));
  
  for (let i = 0; i < daysDiff; i++) {
    const date = new Date(dateRange.start);
    date.setDate(date.getDate() + i);
    
    const executions = Math.floor(Math.random() * 50) + 5;
    const successes = Math.floor(executions * (0.8 + Math.random() * 0.15));
    const failures = executions - successes;
    
    trends.push({
      date,
      executions,
      successes,
      failures,
      averageTime: Math.floor(Math.random() * 200) + 50,
    });
  }

  return trends;
}

function generateMockErrorRates(dateRange: DateRange): ErrorRate[] {
  const errorRates: ErrorRate[] = [];
  const daysDiff = Math.ceil((dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24));
  
  for (let i = 0; i < daysDiff; i++) {
    const date = new Date(dateRange.start);
    date.setDate(date.getDate() + i);
    
    const totalExecutions = Math.floor(Math.random() * 50) + 10;
    const errorCount = Math.floor(totalExecutions * (Math.random() * 0.2));
    const errorRate = totalExecutions > 0 ? (errorCount / totalExecutions) * 100 : 0;
    
    errorRates.push({
      date,
      errorCount,
      totalExecutions,
      errorRate: Math.round(errorRate * 100) / 100,
    });
  }

  return errorRates;
}

function generateMockPerformanceMetrics(): PerformanceMetric[] {
  const metrics = [
    { name: 'Average Response Time', unit: 'ms', baseValue: 150 },
    { name: 'Memory Usage', unit: 'MB', baseValue: 512 },
    { name: 'CPU Usage', unit: '%', baseValue: 45 },
    { name: 'Throughput', unit: 'req/s', baseValue: 25 },
  ];

  return metrics.map(metric => {
    const variation = (Math.random() - 0.5) * 0.3;
    const value = Math.round(metric.baseValue * (1 + variation) * 100) / 100;
    const trend = variation > 0.1 ? 'up' : variation < -0.1 ? 'down' : 'stable';

    return {
      name: metric.name,
      value,
      unit: metric.unit,
      timestamp: new Date(),
      trend: trend as 'up' | 'down' | 'stable',
    };
  });
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours === 0) {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return diffMinutes <= 1 ? 'Just now' : `${diffMinutes}m ago`;
    }
    return `${diffHours}h ago`;
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return `${diffDays}d ago`;
  } else {
    return date.toLocaleDateString();
  }
}