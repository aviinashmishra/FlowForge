import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '../../../../lib/auth/middleware';
import { activityService } from '../../../../lib/dashboard/activityService';
import { ActivityType } from '../../../../types/dashboard';

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
    const limit = parseInt(searchParams.get('limit') || '50');
    const type = searchParams.get('type') as ActivityType;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    let activities;

    if (startDate && endDate) {
      activities = await activityService.getActivitiesInRange(
        authResult.user.id,
        new Date(startDate),
        new Date(endDate),
        limit
      );
    } else if (type) {
      activities = await activityService.getActivitiesByType(
        authResult.user.id,
        type,
        limit
      );
    } else {
      activities = await activityService.getRecentActivities(
        authResult.user.id,
        limit
      );
    }

    return NextResponse.json({
      success: true,
      data: activities,
    });
  } catch (error) {
    console.error('Activity fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch activities' },
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
    const { type, action, resource, details } = body;

    // Get client IP and user agent
    const clientIP = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    await activityService.logActivity(
      authResult.user.id,
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
  } catch (error) {
    console.error('Activity logging error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to log activity' },
      { status: 500 }
    );
  }
}