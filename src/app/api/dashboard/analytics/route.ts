import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '../../../../lib/auth/middleware';
import { analyticsService } from '../../../../lib/dashboard/analyticsService';
import { AnalyticsFilters } from '../../../../types/dashboard';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const { searchParams } = new URL(request.url);
    
    // Parse filters from query parameters
    const filters: AnalyticsFilters = {
      dateRange: {
        start: searchParams.get('startDate') 
          ? new Date(searchParams.get('startDate')!) 
          : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        end: searchParams.get('endDate') 
          ? new Date(searchParams.get('endDate')!) 
          : new Date(),
      },
      status: (searchParams.get('status') as 'success' | 'error' | 'all') || 'all',
    };

    if (searchParams.get('pipelineIds')) {
      filters.pipelineIds = searchParams.get('pipelineIds')!.split(',');
    }

    // Check for specific analytics requests
    const type = searchParams.get('type');
    
    if (type === 'realtime') {
      const realtimeData = await analyticsService.getRealtimeAnalytics(user.id);
      return NextResponse.json({
        success: true,
        data: realtimeData,
      });
    }

    if (type === 'top-performing') {
      const limit = parseInt(searchParams.get('limit') || '5');
      const topPipelines = await analyticsService.getTopPerformingPipelines(user.id, limit);
      return NextResponse.json({
        success: true,
        data: topPipelines,
      });
    }

    if (type === 'compare' && searchParams.get('pipelineIds')) {
      const pipelineIds = searchParams.get('pipelineIds')!.split(',');
      const comparison = await analyticsService.comparePipelines(user.id, pipelineIds);
      return NextResponse.json({
        success: true,
        data: comparison,
      });
    }

    // Default: get comprehensive analytics data
    const analyticsData = await analyticsService.getAnalyticsData(user.id, filters);

    return NextResponse.json({
      success: true,
      data: analyticsData,
    });
  } catch (error) {
    console.error('Analytics data error:', error);
    
    if (error instanceof Error && error.message.includes('Authentication')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to fetch analytics data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const body = await request.json();
    const { action, filters } = body;

    if (action === 'export') {
      const csvData = await analyticsService.exportAnalyticsData(user.id, filters);
      
      return new NextResponse(csvData, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="analytics-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    }

    if (action === 'clear-cache') {
      analyticsService.clearAnalyticsCache(user.id);
      return NextResponse.json({
        success: true,
        message: 'Analytics cache cleared',
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Analytics action error:', error);
    
    if (error instanceof Error && error.message.includes('Authentication')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to process analytics action' },
      { status: 500 }
    );
  }
}