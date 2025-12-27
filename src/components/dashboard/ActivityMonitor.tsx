'use client';

import React, { useState, useEffect } from 'react';
import { Activity, ActivityType } from '../../types/dashboard';

interface ActivityMonitorProps {
  activities?: Activity[];
  limit?: number;
  showFilters?: boolean;
  realTimeUpdates?: boolean;
  onActivityClick?: (activity: Activity) => void;
}

export function ActivityMonitor({ 
  activities: propActivities, 
  limit = 50, 
  showFilters = true,
  realTimeUpdates = false,
  onActivityClick 
}: ActivityMonitorProps) {
  const [activities, setActivities] = useState<Activity[]>(propActivities || []);
  const [filteredActivities, setFilteredActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(!propActivities);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    type: 'all' as ActivityType | 'all',
    status: 'all' as 'all' | 'success' | 'error' | 'warning',
    timeRange: '24h' as '1h' | '24h' | '7d' | '30d',
  });

  useEffect(() => {
    if (!propActivities) {
      loadActivities();
    }
  }, [propActivities]);

  useEffect(() => {
    applyFilters();
  }, [activities, filters]);

  useEffect(() => {
    if (realTimeUpdates && !propActivities) {
      const interval = setInterval(loadActivities, 30000); // Update every 30 seconds
      return () => clearInterval(interval);
    }
  }, [realTimeUpdates, propActivities]);

  const loadActivities = async () => {
    setIsLoading(true);
    setError('');

    try {
      // Mock data loading - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockActivities = generateMockActivities(limit);
      setActivities(mockActivities);
    } catch (err: any) {
      setError(err.message || 'Failed to load activities');
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...activities];

    // Filter by type
    if (filters.type !== 'all') {
      filtered = filtered.filter(activity => activity.type === filters.type);
    }

    // Filter by status
    if (filters.status !== 'all') {
      filtered = filtered.filter(activity => activity.status === filters.status);
    }

    // Filter by time range
    const now = new Date();
    const timeRangeMs = {
      '1h': 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000,
    };

    const cutoffTime = new Date(now.getTime() - timeRangeMs[filters.timeRange]);
    filtered = filtered.filter(activity => activity.timestamp >= cutoffTime);

    // Sort by timestamp (newest first)
    filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    setFilteredActivities(filtered);
  };

  const getActivityIcon = (type: ActivityType): string => {
    const iconMap: Record<ActivityType, string> = {
      user_login: '🔐',
      user_logout: '🚪',
      profile_update: '👤',
      pipeline_created: '🔧',
      pipeline_updated: '⚙️',
      pipeline_deleted: '🗑️',
      pipeline_executed: '▶️',
      settings_changed: '⚙️',
      security_event: '🛡️',
      admin_action: '👑',
      system_alert: '⚠️',
    };
    return iconMap[type] || '📝';
  };

  const getStatusColor = (status?: 'success' | 'error' | 'warning'): string => {
    switch (status) {
      case 'success':
        return 'text-green-600 bg-green-100';
      case 'error':
        return 'text-red-600 bg-red-100';
      case 'warning':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const formatRelativeTime = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const activityTypes: { value: ActivityType | 'all'; label: string }[] = [
    { value: 'all', label: 'All Activities' },
    { value: 'user_login', label: 'User Login' },
    { value: 'user_logout', label: 'User Logout' },
    { value: 'profile_update', label: 'Profile Updates' },
    { value: 'pipeline_created', label: 'Pipeline Created' },
    { value: 'pipeline_updated', label: 'Pipeline Updated' },
    { value: 'pipeline_executed', label: 'Pipeline Executed' },
    { value: 'settings_changed', label: 'Settings Changed' },
    { value: 'security_event', label: 'Security Events' },
    { value: 'admin_action', label: 'Admin Actions' },
    { value: 'system_alert', label: 'System Alerts' },
  ];

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center py-8">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-3 text-gray-600">Loading activities...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center py-8">
          <svg className="w-12 h-12 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to Load Activities</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadActivities}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
            <p className="text-sm text-gray-600 mt-1">
              {filteredActivities.length} of {activities.length} activities
              {realTimeUpdates && (
                <span className="ml-2 inline-flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></span>
                  Live
                </span>
              )}
            </p>
          </div>
          {realTimeUpdates && (
            <button
              onClick={loadActivities}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors duration-200"
              title="Refresh activities"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Type</label>
              <select
                value={filters.type}
                onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value as any }))}
                className="text-sm px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {activityTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as any }))}
                className="text-sm px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="success">Success</option>
                <option value="error">Error</option>
                <option value="warning">Warning</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Time Range</label>
              <select
                value={filters.timeRange}
                onChange={(e) => setFilters(prev => ({ ...prev, timeRange: e.target.value as any }))}
                className="text-sm px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="1h">Last Hour</option>
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Activity List */}
      <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
        {filteredActivities.length === 0 ? (
          <div className="px-6 py-8 text-center">
            <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Activities Found</h3>
            <p className="text-gray-600">No activities match your current filters.</p>
          </div>
        ) : (
          filteredActivities.map((activity) => (
            <div
              key={activity.id}
              className={`px-6 py-4 hover:bg-gray-50 transition-colors duration-200 ${
                onActivityClick ? 'cursor-pointer' : ''
              }`}
              onClick={() => onActivityClick?.(activity)}
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm">
                    {getActivityIcon(activity.type)}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {activity.title}
                    </p>
                    <div className="flex items-center space-x-2">
                      {activity.status && (
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(activity.status)}`}>
                          {activity.status}
                        </span>
                      )}
                      <span className="text-xs text-gray-500 whitespace-nowrap">
                        {formatRelativeTime(activity.timestamp)}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {activity.description}
                  </p>
                  {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                    <div className="mt-2">
                      <details className="text-xs text-gray-500">
                        <summary className="cursor-pointer hover:text-gray-700">
                          View details
                        </summary>
                        <pre className="mt-1 p-2 bg-gray-100 rounded text-xs overflow-x-auto">
                          {JSON.stringify(activity.metadata, null, 2)}
                        </pre>
                      </details>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      {filteredActivities.length > 0 && (
        <div className="px-6 py-3 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>
              Showing {filteredActivities.length} activities
            </span>
            {filteredActivities.length >= limit && (
              <span>
                Limited to {limit} most recent activities
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Helper function to generate mock activities
function generateMockActivities(count: number): Activity[] {
  const activities: Activity[] = [];
  const types: ActivityType[] = [
    'user_login', 'user_logout', 'profile_update', 'pipeline_created',
    'pipeline_updated', 'pipeline_executed', 'settings_changed', 'security_event'
  ];

  const templates = {
    user_login: { title: 'User Login', description: 'Signed in from new device' },
    user_logout: { title: 'User Logout', description: 'Signed out of the application' },
    profile_update: { title: 'Profile Updated', description: 'Updated profile information' },
    pipeline_created: { title: 'Pipeline Created', description: 'Created new data pipeline' },
    pipeline_updated: { title: 'Pipeline Updated', description: 'Modified pipeline configuration' },
    pipeline_executed: { title: 'Pipeline Executed', description: 'Pipeline execution completed' },
    settings_changed: { title: 'Settings Changed', description: 'Updated account settings' },
    security_event: { title: 'Security Event', description: 'Security alert triggered' },
    admin_action: { title: 'Admin Action', description: 'Administrative action performed' },
    system_alert: { title: 'System Alert', description: 'System notification generated' },
  };

  for (let i = 0; i < count; i++) {
    const type = types[Math.floor(Math.random() * types.length)];
    const template = templates[type];
    const timestamp = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000);
    
    let status: 'success' | 'error' | 'warning' | undefined;
    if (type === 'pipeline_executed') {
      status = Math.random() > 0.2 ? 'success' : 'error';
    } else if (type === 'security_event') {
      status = 'warning';
    } else if (Math.random() > 0.8) {
      status = Math.random() > 0.5 ? 'success' : 'warning';
    }

    activities.push({
      id: `activity_${i + 1}`,
      type,
      title: template.title,
      description: template.description,
      timestamp,
      status,
      metadata: {
        userId: 'user_123',
        sessionId: `session_${Math.random().toString(36).substring(7)}`,
        ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
      },
    });
  }

  return activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}