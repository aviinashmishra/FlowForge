import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '../../../../lib/auth/middleware';
import { activityService } from '../../../../lib/dashboard/activityService';
import { ActivityType } from '../../../../types/dashboard';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const { searchParams } = new URL(request.url);
    
    const requestType = searchParams.get('requestType');
    
    // Handle different types of activity requests
    if (requestType === 'analytics') {
      const days = parseInt(searchParams.get('days') || '30');
      const analytics = await activityService.getActivityAnalytics(user.id, days);
      return NextResponse.json({
        success: true,
        data: analytics,
      });
    }

    if (requestType === 'security') {
      const limit = parseInt(searchParams.get('limit') || '20');
      const securityActivities = await activityService.getSecurityActivities(user.id, limit);
      return NextResponse.json({
        success: true,
        data: securityActivities,
      });
    }

    if (requestType === 'filtered') {
      const filters = {
        types: searchParams.get('types')?.split(',') as ActivityType[],
        dateRange: searchParams.get('startDate') && searchParams.get('endDate') ? {
          start: new Date(searchParams.get('startDate')!),
          end: new Date(searchParams.get('endDate')!),
        } : undefined,
        search: searchParams.get('search') || undefined,
        status: searchParams.get('status') as 'success' | 'error' | 'warning' | undefined,
        limit: parseInt(searchParams.get('limit') || '50'),
        offset: parseInt(searchParams.get('offset') || '0'),
      };

      const result = await activityService.getFilteredActivities(user.id, filters);
      return NextResponse.json({
        success: true,
        data: result.activities,
        pagination: {
          total: result.total,
          limit: filters.limit,
          offset: filters.offset,
        },
      });
    }

    // Default: get recent activities
    const limit = parseInt(searchParams.get('limit') || '50');
    const type = searchParams.get('type') as ActivityType;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    let activities;

    if (startDate && endDate) {
      activities = await activityService.getActivitiesInRange(
        user.id,
        new Date(startDate),
        new Date(endDate),
        limit
      );
    } else if (type) {
      activities = await activityService.getActivitiesByType(
        user.id,
        type,
        limit
      );
    } else {
      activities = await activityService.getRecentActivities(
        user.id,
        limit
      );
    }

    return NextResponse.json({
      success: true,
      data: activities,
    });
  } catch (error) {
    console.error('Activity fetch error:', error);
    
    if (error instanceof Error && error.message.includes('Authentication')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to fetch activities' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const body = await request.json();
    const { action, type, resource, details, activities } = body;

    // Get client IP and user agent
    const clientIP = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    if (action === 'log') {
      await activityService.logActivity(
        user.id,
        type,
        action,
        resource,
        details,
        undefined, // sessionId - could be extracted from JWT
        clientIP,
        userAgent
      );

      return NextResponse.json({
        success: true,
        message: 'Activity logged successfully',
      });
    }

    if (action === 'batch-log' && activities) {
      const enhancedActivities = activities.map((activity: any) => ({
        ...activity,
        userId: user.id,
        ipAddress: clientIP,
        userAgent,
      }));

      await activityService.logBatchActivities(enhancedActivities);

      return NextResponse.json({
        success: true,
        message: `${activities.length} activities logged successfully`,
      });
    }

    if (action === 'clear-cache') {
      activityService.clearActivityCache(user.id);
      return NextResponse.json({
        success: true,
        message: 'Activity cache cleared',
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Activity action error:', error);
    
    if (error instanceof Error && error.message.includes('Authentication')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to process activity action' },
      { status: 500 }
    );
  }
}