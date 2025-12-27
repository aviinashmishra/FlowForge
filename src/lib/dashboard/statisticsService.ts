import { prisma } from '../prisma';
import { DashboardStats, SystemStatus, ServiceStatus } from '../../types/dashboard';

export class StatisticsService {
  /**
   * Get dashboard statistics for a user
   */
  async getDashboardStats(userId: string): Promise<DashboardStats> {
    try {
      // Mock data for now - in real implementation, these would query actual pipeline data
      const totalPipelines = await this.getTotalPipelines(userId);
      const activeExecutions = await this.getActiveExecutions(userId);
      const successRate = await this.getSuccessRate(userId);
      const dataProcessed = await this.getDataProcessed(userId);

      return {
        totalPipelines,
        activeExecutions,
        successRate,
        dataProcessed,
        lastUpdated: new Date(),
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw new Error('Failed to fetch dashboard statistics');
    }
  }

  /**
   * Get system status for monitoring
   */
  async getSystemStatus(): Promise<SystemStatus> {
    const apiStatus = await this.checkAPIStatus();
    const databaseStatus = await this.checkDatabaseStatus();
    const queueStatus = await this.checkQueueStatus();

    return {
      api: apiStatus,
      database: databaseStatus,
      queueProcessing: queueStatus,
      lastChecked: new Date(),
    };
  }

  /**
   * Get total pipelines for a user
   */
  private async getTotalPipelines(userId: string): Promise<number> {
    // Mock implementation - replace with actual pipeline count
    return Math.floor(Math.random() * 20) + 5;
  }

  /**
   * Get active executions for a user
   */
  private async getActiveExecutions(userId: string): Promise<number> {
    // Mock implementation - replace with actual active execution count
    return Math.floor(Math.random() * 5);
  }

  /**
   * Get success rate for a user's pipelines
   */
  private async getSuccessRate(userId: string): Promise<number> {
    // Mock implementation - replace with actual success rate calculation
    return Math.round((Math.random() * 10 + 90) * 100) / 100;
  }

  /**
   * Get total data processed for a user
   */
  private async getDataProcessed(userId: string): Promise<string> {
    // Mock implementation - replace with actual data processing metrics
    const sizes = ['MB', 'GB', 'TB'];
    const size = Math.random() * 10 + 1;
    const unit = sizes[Math.floor(Math.random() * sizes.length)];
    return `${size.toFixed(1)}${unit}`;
  }

  /**
   * Check API status
   */
  private async checkAPIStatus(): Promise<ServiceStatus> {
    try {
      const start = Date.now();
      // Simple health check - could ping actual API endpoints
      await new Promise(resolve => setTimeout(resolve, Math.random() * 50));
      const responseTime = Date.now() - start;

      return {
        status: 'operational',
        responseTime,
        uptime: 99.9,
      };
    } catch (error) {
      return {
        status: 'down',
        responseTime: 0,
        uptime: 0,
      };
    }
  }

  /**
   * Check database status
   */
  private async checkDatabaseStatus(): Promise<ServiceStatus> {
    try {
      const start = Date.now();
      await prisma.$queryRaw`SELECT 1`;
      const responseTime = Date.now() - start;

      return {
        status: 'operational',
        responseTime,
        uptime: 99.8,
      };
    } catch (error) {
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
      // Mock queue status check
      const load = Math.random();
      const status = load > 0.8 ? 'degraded' : 'operational';

      return {
        status,
        responseTime: Math.floor(Math.random() * 100),
        uptime: 99.5,
      };
    } catch (error) {
      return {
        status: 'down',
        responseTime: 0,
        uptime: 0,
      };
    }
  }

  /**
   * Record system metric
   */
  async recordMetric(name: string, value: number, unit?: string, metadata?: Record<string, unknown>): Promise<void> {
    try {
      await prisma.systemMetric.create({
        data: {
          name,
          value,
          unit,
          metadata,
        },
      });
    } catch (error) {
      console.error('Error recording metric:', error);
      // Don't throw - metrics recording shouldn't break the application
    }
  }

  /**
   * Get metrics for a time range
   */
  async getMetrics(name: string, startDate: Date, endDate: Date): Promise<Array<{ value: number; timestamp: Date }>> {
    try {
      const metrics = await prisma.systemMetric.findMany({
        where: {
          name,
          timestamp: {
            gte: startDate,
            lte: endDate,
          },
        },
        select: {
          value: true,
          timestamp: true,
        },
        orderBy: {
          timestamp: 'asc',
        },
      });

      return metrics;
    } catch (error) {
      console.error('Error fetching metrics:', error);
      return [];
    }
  }
}

export const statisticsService = new StatisticsService();