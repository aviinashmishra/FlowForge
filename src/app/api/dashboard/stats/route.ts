import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '../../../../lib/auth/middleware';
import { statisticsService } from '../../../../lib/dashboard/statisticsService';
import { systemMonitoringService } from '../../../../lib/dashboard/systemMonitoringService';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);

    const [stats, quickActions, systemStatus] = await Promise.all([
      statisticsService.getDashboardStats(user.id),
      statisticsService.getQuickActions(user.id),
      systemMonitoringService.getSystemStatus(),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        stats,
        quickActions,
        systemStatus,
      },
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    
    if (error instanceof Error && error.message.includes('Authentication')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to fetch dashboard statistics' },
      { status: 500 }
    );
  }
}