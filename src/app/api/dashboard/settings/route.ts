import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '../../../../lib/auth/middleware';
import { prisma } from '../../../../lib/prisma';
import { UserSettings } from '../../../../types/dashboard';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);

    const settings = await prisma.userSettings.findUnique({
      where: { userId: user.id },
    });

    // Return default settings if none exist
    const defaultSettings: Partial<UserSettings> = {
      emailNotifications: true,
      pushNotifications: true,
      marketingEmails: false,
      securityAlerts: true,
      profileVisibility: 'private',
      dataSharing: false,
      analyticsOptOut: false,
      theme: 'light',
      language: 'en',
      timezone: 'UTC',
      defaultDashboardView: 'overview',
      showWelcomeMessage: true,
      compactMode: false,
    };

    return NextResponse.json({
      success: true,
      data: settings || defaultSettings,
    });
  } catch (error) {
    console.error('Settings fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await requireAuth(request);

    const body = await request.json();
    
    // Validate settings data
    const allowedFields = [
      'emailNotifications',
      'pushNotifications', 
      'marketingEmails',
      'securityAlerts',
      'profileVisibility',
      'dataSharing',
      'analyticsOptOut',
      'theme',
      'language',
      'timezone',
      'defaultDashboardView',
      'showWelcomeMessage',
      'compactMode',
    ];

    const updateData: any = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    // Validate specific field values
    if (updateData.profileVisibility && !['public', 'private', 'friends'].includes(updateData.profileVisibility)) {
      return NextResponse.json(
        { success: false, error: 'Invalid profile visibility value' },
        { status: 400 }
      );
    }

    if (updateData.theme && !['light', 'dark', 'auto'].includes(updateData.theme)) {
      return NextResponse.json(
        { success: false, error: 'Invalid theme value' },
        { status: 400 }
      );
    }

    if (updateData.defaultDashboardView && !['overview', 'analytics', 'pipelines'].includes(updateData.defaultDashboardView)) {
      return NextResponse.json(
        { success: false, error: 'Invalid default dashboard view value' },
        { status: 400 }
      );
    }

    const settings = await prisma.userSettings.upsert({
      where: { userId: user.id },
      update: updateData,
      create: {
        userId: user.id,
        ...updateData,
      },
    });

    return NextResponse.json({
      success: true,
      data: settings,
      message: 'Settings updated successfully',
    });
  } catch (error) {
    console.error('Settings update error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}