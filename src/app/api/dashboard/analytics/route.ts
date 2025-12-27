import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '../../../../lib/auth/middleware';
import { analyticsService } from '../../../../lib/dashboard/analyticsService';
import { AnalyticsFilters } from '../../../../types/dashboard';

export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

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

    const analyticsData = await analyticsService.getAnalyticsData(authResult.user.id, filters);

    return NextResponse.json({
      success: true,
      data: analyticsData,
    });
  } catch (error) {
    console.error('Analytics data error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch analytics data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { action, filters } = body;

    if (action === 'export') {
      const csvData = await analyticsService.exportAnalyticsData(authResult.user.id, filters);
      
      return new NextResponse(csvData, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="analytics-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Analytics export error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to export analytics data' },
      { status: 500 }
    );
  }
}