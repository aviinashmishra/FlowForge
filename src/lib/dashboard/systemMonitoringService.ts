import { prisma } from '../prisma';
import { SystemStatus, ServiceStatus } from '../../types/dashboard';

export class SystemMonitoringService {
  private statusCache = new Map<string, { data: SystemStatus; timestamp: number }>();
  private readonly CACHE_TTL = 30 * 1000; // 30 seconds for system status

  /**
   * Get comprehensive system status with health checks
   */
  async getSystemStatus(): Promise<SystemStatus> {
    const cached = this.statusCache.get('system');
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data;
    }

    const [apiStatus, databaseStatus, queueStatus] = await Promise.all([
      this.checkAPIStatus(),
      this.checkDatabaseStatus(),
      this.checkQueueStatus(),
    ]);

    const status: SystemStatus = {
      api: apiStatus,
      database: databaseStatus,
      queueProcessing: queueStatus,
      lastChecked: new Date(),
    };

    this.statusCache.set('system', { data: status, timestamp: Date.now() });
    return status;
  }

  /**
   * Check API status with multiple endpoints
   */
  private async checkAPIStatus(): Promise<ServiceStatus> {
    try {
      const start = Date.now();
      
      // Test multiple endpoints
      const healthChecks = await Promise.allSettled([
        this.pingEndpoint('/api/health'),
        this.pingEndpoint('/api/auth/me'),
        this.pingEndpoint('/api/dashboard/stats'),
      ]);

      const successfulChecks = healthChecks.filter(result => result.status === 'fulfilled').length;
      const responseTime = Date.now() - start;

      let status: 'operational' | 'degraded' | 'down';
      if (successfulChecks === healthChecks.length) {
        status = 'operational';
      } else if (successfulChecks > 0) {
        status = 'degraded';
      } else {
        status = 'down';
      }

      return {
        status,
        responseTime,
        uptime: this.calculateUptime('api'),
      };
    } catch (error) {
      console.error('API health check failed:', error);
      return {
        status: 'down',
        responseTime: 0,
        uptime: 0,
      };
    }
  }

  /**
   * Check database status with connection and query tests
   */
  private async checkDatabaseStatus(): Promise<ServiceStatus> {
    try {
      const start = Date.now();
      
      // Test database connection and basic query
      await Promise.all([
        prisma.$queryRaw`SELECT 1`,
        prisma.user.count(),
        prisma.activityLog.count(),
      ]);
      
      const responseTime = Date.now() - start;

      return {
        status: responseTime < 1000 ? 'operational' : 'degraded',
        responseTime,
        uptime: this.calculateUptime('database'),
      };
    } catch (error) {
      console.error('Database health check failed:', error);
      return {
        status: 'down',
        responseTime: 0,
        uptime: 0,
      };
    }
  }

  /**
   * Check queue processing status
   */
  private async checkQueueStatus(): Promise<ServiceStatus> {
    try {
      const start = Date.now();
      
      // Check recent activity processing as a proxy for queue health
      const recentActivities = await prisma.activityLog.count({
        where: {
          timestamp: {
            gte: new Date(Date.now() - 5 * 60 * 1000), // Last 5 minutes
          },
        },
      });

      const responseTime = Date.now() - start;
      
      // Simulate queue load based on recent activity
      const load = Math.min(recentActivities / 100, 1); // Normalize to 0-1
      let status: 'operational' | 'degraded' | 'down';
      
      if (load < 0.7) {
        status = 'operational';
      } else if (load < 0.9) {
        status = 'degraded';
      } else {
        status = 'down';
      }

      return {
        status,
        responseTime,
        uptime: this.calculateUptime('queue'),
      };
    } catch (error) {
      console.error('Queue health check failed:', error);
      return {
        status: 'down',
        responseTime: 0,
        uptime: 0,
      };
    }
  }

  /**
   * Ping an endpoint for health checking
   */
  private async pingEndpoint(endpoint: string): Promise<boolean> {
    try {
      // In a real implementation, this would make an actual HTTP request
      // For now, we'll simulate with a delay and random success/failure
      await new Promise(resolve => setTimeout(resolve, Math.random() * 100));
      return Math.random() > 0.1; // 90% success rate
    } catch (error) {
      return false;
    }
  }

  /**
   * Calculate service uptime percentage
   */
  private calculateUptime(service: string): number {
    // In a real implementation, this would track actual uptime metrics
    // For now, return a realistic uptime percentage with some variation
    const baseUptime = 99.5;
    const variation = (Math.random() - 0.5) * 1; // ±0.5%
    return Math.max(95, Math.min(100, baseUptime + variation));
  }

  /**
   * Get detailed system metrics
   */
  async getSystemMetrics(): Promise<{
    cpu: { usage: number; cores: number };
    memory: { used: number; total: number; percentage: number };
    disk: { used: number; total: number; percentage: number };
    network: { inbound: number; outbound: number };
  }> {
    try {
      // In a real implementation, these would be actual system metrics
      // For now, we'll simulate realistic values
      const cpuUsage = Math.random() * 60 + 20; // 20-80%
      const memoryUsed = Math.random() * 4 + 2; // 2-6 GB
      const memoryTotal = 8; // 8 GB
      const diskUsed = Math.random() * 200 + 50; // 50-250 GB
      const diskTotal = 500; // 500 GB

      return {
        cpu: {
          usage: Math.round(cpuUsage * 100) / 100,
          cores: 4,
        },
        memory: {
          used: Math.round(memoryUsed * 100) / 100,
          total: memoryTotal,
          percentage: Math.round((memoryUsed / memoryTotal) * 10000) / 100,
        },
        disk: {
          used: Math.round(diskUsed * 100) / 100,
          total: diskTotal,
          percentage: Math.round((diskUsed / diskTotal) * 10000) / 100,
        },
        network: {
          inbound: Math.round(Math.random() * 100 * 100) / 100, // MB/s
          outbound: Math.round(Math.random() * 50 * 100) / 100, // MB/s
        },
      };
    } catch (error) {
      console.error('Error fetching system metrics:', error);
      throw new Error('Failed to fetch system metrics');
    }
  }

  /**
   * Get service alerts and warnings
   */
  async getSystemAlerts(): Promise<Array<{
    id: string;
    type: 'error' | 'warning' | 'info';
    service: string;
    message: string;
    timestamp: Date;
    resolved: boolean;
  }>> {
    try {
      // In a real implementation, this would query an alerts/monitoring system
      const alerts = [];
      
      const systemStatus = await this.getSystemStatus();
      
      // Generate alerts based on system status
      if (systemStatus.database.status === 'degraded') {
        alerts.push({
          id: 'db-slow-' + Date.now(),
          type: 'warning' as const,
          service: 'database',
          message: `Database response time is elevated (${systemStatus.database.responseTime}ms)`,
          timestamp: new Date(),
          resolved: false,
        });
      }

      if (systemStatus.api.status === 'down') {
        alerts.push({
          id: 'api-down-' + Date.now(),
          type: 'error' as const,
          service: 'api',
          message: 'API service is not responding',
          timestamp: new Date(),
          resolved: false,
        });
      }

      if (systemStatus.queueProcessing.status === 'degraded') {
        alerts.push({
          id: 'queue-slow-' + Date.now(),
          type: 'warning' as const,
          service: 'queue',
          message: 'Queue processing is experiencing high load',
          timestamp: new Date(),
          resolved: false,
        });
      }

      return alerts;
    } catch (error) {
      console.error('Error fetching system alerts:', error);
      return [];
    }
  }

  /**
   * Record system event
   */
  async recordSystemEvent(
    type: 'startup' | 'shutdown' | 'error' | 'warning' | 'maintenance',
    message: string,
    metadata?: Record<string, unknown>
  ): Promise<void> {
    try {
      await prisma.systemMetric.create({
        data: {
          name: `system_event_${type}`,
          value: 1,
          unit: 'event',
          metadata: {
            type,
            message,
            ...metadata,
          },
        },
      });
    } catch (error) {
      console.error('Error recording system event:', error);
    }
  }

  /**
   * Clear status cache
   */
  clearStatusCache(): void {
    this.statusCache.clear();
  }
}

export const systemMonitoringService = new SystemMonitoringService();