import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '../../../../lib/auth/middleware';
import { systemMonitoringService } from '../../../../lib/dashboard/systemMonitoringService';
import { statisticsService } from '../../../../lib/dashboard/statisticsService';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const { searchParams } = new URL(request.url);
    
    const type = searchParams.get('type');
    
    if (type === 'status') {
      const systemStatus = await systemMonitoringService.getSystemStatus();
      return NextResponse.json({
        success: true,
        data: systemStatus,
      });
    }

    if (type === 'metrics') {
      const systemMetrics = await systemMonitoringService.getSystemMetrics();
      return NextResponse.json({
        success: true,
        data: systemMetrics,
      });
    }

    if (type === 'alerts') {
      const alerts = await systemMonitoringService.getSystemAlerts();
      return NextResponse.json({
        success: true,
        data: alerts,
      });
    }

    if (type === 'growth') {
      const days = parseInt(searchParams.get('days') || '30');
      const growthMetrics = await statisticsService.getUserGrowthMetrics(days);
      return NextResponse.json({
        success: true,
        data: growthMetrics,
      });
    }

    if (type === 'activity-trends') {
      const days = parseInt(searchParams.get('days') || '7');
      const activityTrends = await statisticsService.getActivityTrends(user.id, days);
      return NextResponse.json({
        success: true,
        data: activityTrends,
      });
    }

    if (type === 'cache-stats') {
      const cacheStats = statisticsService.getCacheStats();
      return NextResponse.json({
        success: true,
        data: cacheStats,
      });
    }

    // Default: comprehensive system overview
    const [systemStatus, systemMetrics, alerts] = await Promise.all([
      systemMonitoringService.getSystemStatus(),
      systemMonitoringService.getSystemMetrics(),
      systemMonitoringService.getSystemAlerts(),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        status: systemStatus,
        metrics: systemMetrics,
        alerts,
      },
    });
  } catch (error) {
    console.error('System monitoring error:', error);
    
    if (error instanceof Error && error.message.includes('Authentication')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to fetch system data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const body = await request.json();
    const { action, type, message, metadata } = body;

    if (action === 'record-event') {
      await systemMonitoringService.recordSystemEvent(type, message, metadata);
      return NextResponse.json({
        success: true,
        message: 'System event recorded',
      });
    }

    if (action === 'clear-cache') {
      const cacheType = body.cacheType;
      
      if (cacheType === 'system') {
        systemMonitoringService.clearStatusCache();
      } else if (cacheType === 'stats') {
        statisticsService.clearStatsCache(user.id);
      } else if (cacheType === 'all') {
        systemMonitoringService.clearStatusCache();
        statisticsService.clearStatsCache();
      }

      return NextResponse.json({
        success: true,
        message: `${cacheType} cache cleared`,
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('System action error:', error);
    
    if (error instanceof Error && error.message.includes('Authentication')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to process system action' },
      { status: 500 }
    );
  }
}