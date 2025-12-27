import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '../../../../lib/auth/middleware';
import { statisticsService } from '../../../../lib/dashboard/statisticsService';

export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const stats = await statisticsService.getDashboardStats(authResult.user.id);
    const systemStatus = await statisticsService.getSystemStatus();

    return NextResponse.json({
      success: true,
      data: {
        stats,
        systemStatus,
      },
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dashboard statistics' },
      { status: 500 }
    );
  }
}