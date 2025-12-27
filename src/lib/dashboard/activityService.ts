import { prisma } from '../prisma';
import { ActivityLog, Activity, ActivityType } from '../../types/dashboard';

export class ActivityService {
  /**
   * Log user activity
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
      await prisma.activityLog.create({
        data: {
          userId,
          sessionId,
          type,
          resource,
          action,
          details,
          ipAddress,
          userAgent,
        },
      });
    } catch (error) {
      console.error('Error logging activity:', error);
      // Don't throw - activity logging shouldn't break the application
    }
  }

  /**
   * Get recent activities for a user
   */
  async getRecentActivities(userId: string, limit: number = 50): Promise<Activity[]> {
    try {
      const activityLogs = await prisma.activityLog.findMany({
        where: { userId },
        orderBy: { timestamp: 'desc' },
        take: limit,
      });

      return activityLogs.map(log => this.formatActivity(log));
    } catch (error) {
      console.error('Error fetching recent activities:', error);
      return [];
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
      await prisma.activityLog.createMany({
        data: activities,
      });
    } catch (error) {
      console.error('Error batch logging activities:', error);
    }
  }
}

export const activityService = new ActivityService();