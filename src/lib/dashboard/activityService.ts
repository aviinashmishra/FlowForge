import { prisma } from '../prisma';
import { ActivityLog, Activity, ActivityType } from '../../types/dashboard';

export class ActivityService {
  private activityCache = new Map<string, { data: Activity[]; timestamp: number }>();
  private readonly CACHE_TTL = 2 * 60 * 1000; // 2 minutes for activity data

  /**
   * Log user activity with enhanced metadata
   */
  async logActivity(
    userId: string,
    type: ActivityType,
    action: string,
    resource?: string,
    details?: Record<string, unknown>,
    sessionId?: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    try {
      // Enhance details with additional context
      const enhancedDetails = {
        ...details,
        timestamp: new Date().toISOString(),
        userAgent: userAgent || 'Unknown',
        sessionId: sessionId || 'Unknown',
      };

      await prisma.activityLog.create({
        data: {
          userId,
          sessionId,
          type,
          resource,
          action,
          details: enhancedDetails,
          ipAddress,
          userAgent,
        },
      });

      // Clear cache for this user to ensure fresh data
      this.clearActivityCache(userId);
    } catch (error) {
      console.error('Error logging activity:', error);
      // Don't throw - activity logging shouldn't break the application
    }
  }

  /**
   * Get recent activities for a user with caching
   */
  async getRecentActivities(userId: string, limit: number = 50): Promise<Activity[]> {
    try {
      const cacheKey = `${userId}-recent-${limit}`;
      const cached = this.activityCache.get(cacheKey);
      
      if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
        return cached.data;
      }

      const activityLogs = await prisma.activityLog.findMany({
        where: { userId },
        orderBy: { timestamp: 'desc' },
        take: limit,
      });

      const activities = activityLogs.map(log => this.formatActivity(log));
      
      // Cache the results
      this.activityCache.set(cacheKey, { data: activities, timestamp: Date.now() });

      return activities;
    } catch (error) {
      console.error('Error fetching recent activities:', error);
      return [];
    }
  }

  /**
   * Get filtered activities with advanced filtering
   */
  async getFilteredActivities(
    userId: string,
    filters: {
      types?: ActivityType[];
      dateRange?: { start: Date; end: Date };
      search?: string;
      status?: 'success' | 'error' | 'warning';
      limit?: number;
      offset?: number;
    }
  ): Promise<{ activities: Activity[]; total: number }> {
    try {
      const where: any = { userId };

      if (filters.types && filters.types.length > 0) {
        where.type = { in: filters.types };
      }

      if (filters.dateRange) {
        where.timestamp = {
          gte: filters.dateRange.start,
          lte: filters.dateRange.end,
        };
      }

      if (filters.search) {
        where.OR = [
          { action: { contains: filters.search, mode: 'insensitive' } },
          { resource: { contains: filters.search, mode: 'insensitive' } },
        ];
      }

      const [activityLogs, total] = await Promise.all([
        prisma.activityLog.findMany({
          where,
          orderBy: { timestamp: 'desc' },
          take: filters.limit || 50,
          skip: filters.offset || 0,
        }),
        prisma.activityLog.count({ where }),
      ]);

      let activities = activityLogs.map(log => this.formatActivity(log));

      // Apply status filter after formatting (since status is derived)
      if (filters.status) {
        activities = activities.filter(activity => activity.status === filters.status);
      }

      return { activities, total };
    } catch (error) {
      console.error('Error fetching filtered activities:', error);
      return { activities: [], total: 0 };
    }
  }

  /**
   * Get activities by type
   */
  async getActivitiesByType(
    userId: string, 
    type: ActivityType, 
    limit: number = 20
  ): Promise<Activity[]> {
    try {
      const activityLogs = await prisma.activityLog.findMany({
        where: { 
          userId,
          type,
        },
        orderBy: { timestamp: 'desc' },
        take: limit,
      });

      return activityLogs.map(log => this.formatActivity(log));
    } catch (error) {
      console.error('Error fetching activities by type:', error);
      return [];
    }
  }

  /**
   * Get activities for date range
   */
  async getActivitiesInRange(
    userId: string,
    startDate: Date,
    endDate: Date,
    limit: number = 100
  ): Promise<Activity[]> {
    try {
      const activityLogs = await prisma.activityLog.findMany({
        where: {
          userId,
          timestamp: {
            gte: startDate,
            lte: endDate,
          },
        },
        orderBy: { timestamp: 'desc' },
        take: limit,
      });

      return activityLogs.map(log => this.formatActivity(log));
    } catch (error) {
      console.error('Error fetching activities in range:', error);
      return [];
    }
  }

  /**
   * Get activity count by type for a user
   */
  async getActivityCounts(userId: string, days: number = 30): Promise<Record<ActivityType, number>> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const counts = await prisma.activityLog.groupBy({
        by: ['type'],
        where: {
          userId,
          timestamp: {
            gte: startDate,
          },
        },
        _count: {
          type: true,
        },
      });

      const result: Record<string, number> = {};
      counts.forEach(count => {
        result[count.type] = count._count.type;
      });

      return result as Record<ActivityType, number>;
    } catch (error) {
      console.error('Error fetching activity counts:', error);
      return {} as Record<ActivityType, number>;
    }
  }

  /**
   * Get admin audit trail (for admin users)
   */
  async getAuditTrail(
    limit: number = 100,
    userId?: string,
    type?: ActivityType
  ): Promise<Array<ActivityLog & { user: { firstName: string; lastName: string; email: string } }>> {
    try {
      const where: any = {};
      if (userId) where.userId = userId;
      if (type) where.type = type;

      const activities = await prisma.activityLog.findMany({
        where,
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
        orderBy: { timestamp: 'desc' },
        take: limit,
      });

      return activities;
    } catch (error) {
      console.error('Error fetching audit trail:', error);
      return [];
    }
  }

  /**
   * Delete old activity logs (cleanup)
   */
  async cleanupOldActivities(daysToKeep: number = 90): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      const result = await prisma.activityLog.deleteMany({
        where: {
          timestamp: {
            lt: cutoffDate,
          },
        },
      });

      return result.count;
    } catch (error) {
      console.error('Error cleaning up old activities:', error);
      return 0;
    }
  }

  /**
   * Format activity log for display
   */
  private formatActivity(log: ActivityLog): Activity {
    const title = this.getActivityTitle(log.type, log.action);
    const description = this.getActivityDescription(log.type, log.action, log.resource, log.details);
    const status = this.getActivityStatus(log.type, log.details);

    return {
      id: log.id,
      type: log.type,
      title,
      description,
      timestamp: log.timestamp,
      status,
      metadata: log.details,
    };
  }

  /**
   * Get human-readable title for activity
   */
  private getActivityTitle(type: ActivityType, action: string): string {
    const titleMap: Record<ActivityType, string> = {
      user_login: 'User Login',
      user_logout: 'User Logout',
      profile_update: 'Profile Updated',
      pipeline_created: 'Pipeline Created',
      pipeline_updated: 'Pipeline Updated',
      pipeline_deleted: 'Pipeline Deleted',
      pipeline_executed: 'Pipeline Executed',
      settings_changed: 'Settings Changed',
      security_event: 'Security Event',
      admin_action: 'Admin Action',
      system_alert: 'System Alert',
    };

    return titleMap[type] || action;
  }

  /**
   * Get human-readable description for activity
   */
  private getActivityDescription(
    type: ActivityType, 
    action: string, 
    resource?: string, 
    details?: Record<string, unknown>
  ): string {
    switch (type) {
      case 'user_login':
        return `Signed in from ${details?.ipAddress || 'unknown location'}`;
      case 'user_logout':
        return 'Signed out of the application';
      case 'profile_update':
        return `Updated profile information`;
      case 'pipeline_created':
        return `Created pipeline: ${resource || 'Unknown'}`;
      case 'pipeline_updated':
        return `Updated pipeline: ${resource || 'Unknown'}`;
      case 'pipeline_deleted':
        return `Deleted pipeline: ${resource || 'Unknown'}`;
      case 'pipeline_executed':
        const status = details?.status === 'success' ? 'successfully' : 'with errors';
        return `Executed pipeline ${resource || 'Unknown'} ${status}`;
      case 'settings_changed':
        return `Changed ${resource || 'application'} settings`;
      case 'security_event':
        return `Security event: ${action}`;
      case 'admin_action':
        return `Admin action: ${action}`;
      case 'system_alert':
        return `System alert: ${action}`;
      default:
        return action;
    }
  }

  /**
   * Get activity status based on type and details
   */
  private getActivityStatus(type: ActivityType, details?: Record<string, unknown>): 'success' | 'error' | 'warning' | undefined {
    if (details?.status) {
      return details.status as 'success' | 'error' | 'warning';
    }

    switch (type) {
      case 'pipeline_executed':
        return details?.success ? 'success' : 'error';
      case 'security_event':
        return 'warning';
      case 'system_alert':
        return 'warning';
      default:
        return undefined;
    }
  }

  /**
   * Get activity analytics and insights
   */
  async getActivityAnalytics(userId: string, days: number = 30): Promise<{
    totalActivities: number;
    activityByType: Record<ActivityType, number>;
    activityByDay: Array<{ date: string; count: number }>;
    mostActiveHours: Array<{ hour: number; count: number }>;
    topResources: Array<{ resource: string; count: number }>;
  }> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const activities = await prisma.activityLog.findMany({
        where: {
          userId,
          timestamp: { gte: startDate },
        },
        select: {
          type: true,
          timestamp: true,
          resource: true,
        },
      });

      const totalActivities = activities.length;

      // Activity by type
      const activityByType: Record<string, number> = {};
      activities.forEach(activity => {
        activityByType[activity.type] = (activityByType[activity.type] || 0) + 1;
      });

      // Activity by day
      const activityByDay = new Map<string, number>();
      activities.forEach(activity => {
        const date = activity.timestamp.toISOString().split('T')[0];
        activityByDay.set(date, (activityByDay.get(date) || 0) + 1);
      });

      // Most active hours
      const activityByHour = new Map<number, number>();
      activities.forEach(activity => {
        const hour = activity.timestamp.getHours();
        activityByHour.set(hour, (activityByHour.get(hour) || 0) + 1);
      });

      // Top resources
      const resourceCounts = new Map<string, number>();
      activities.forEach(activity => {
        if (activity.resource) {
          resourceCounts.set(activity.resource, (resourceCounts.get(activity.resource) || 0) + 1);
        }
      });

      return {
        totalActivities,
        activityByType: activityByType as Record<ActivityType, number>,
        activityByDay: Array.from(activityByDay.entries())
          .map(([date, count]) => ({ date, count }))
          .sort((a, b) => a.date.localeCompare(b.date)),
        mostActiveHours: Array.from(activityByHour.entries())
          .map(([hour, count]) => ({ hour, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5),
        topResources: Array.from(resourceCounts.entries())
          .map(([resource, count]) => ({ resource, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10),
      };
    } catch (error) {
      console.error('Error fetching activity analytics:', error);
      return {
        totalActivities: 0,
        activityByType: {} as Record<ActivityType, number>,
        activityByDay: [],
        mostActiveHours: [],
        topResources: [],
      };
    }
  }

  /**
   * Get security-related activities
   */
  async getSecurityActivities(userId: string, limit: number = 20): Promise<Activity[]> {
    const securityTypes: ActivityType[] = ['user_login', 'user_logout', 'security_event', 'settings_changed'];
    
    try {
      const activityLogs = await prisma.activityLog.findMany({
        where: {
          userId,
          type: { in: securityTypes },
        },
        orderBy: { timestamp: 'desc' },
        take: limit,
      });

      return activityLogs.map(log => this.formatActivity(log));
    } catch (error) {
      console.error('Error fetching security activities:', error);
      return [];
    }
  }

  /**
   * Clear activity cache
   */
  clearActivityCache(userId?: string): void {
    if (userId) {
      // Clear cache entries for specific user
      for (const [key] of this.activityCache) {
        if (key.startsWith(userId)) {
          this.activityCache.delete(key);
        }
      }
    } else {
      this.activityCache.clear();
    }
  }
  /**
   * Batch log multiple activities
   */
  async logBatchActivities(activities: Array<{
    userId: string;
    type: ActivityType;
    action: string;
    resource?: string;
    details?: Record<string, unknown>;
    sessionId?: string;
    ipAddress?: string;
    userAgent?: string;
  }>): Promise<void> {
    try {
      const enhancedActivities = activities.map(activity => ({
        ...activity,
        details: {
          ...activity.details,
          timestamp: new Date().toISOString(),
          batchLogged: true,
        },
      }));

      await prisma.activityLog.createMany({
        data: enhancedActivities,
      });

      // Clear cache for affected users
      const userIds = [...new Set(activities.map(a => a.userId))];
      userIds.forEach(userId => this.clearActivityCache(userId));
    } catch (error) {
      console.error('Error batch logging activities:', error);
    }
  }
}

export const activityService = new ActivityService();