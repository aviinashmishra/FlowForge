import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '../../../../lib/auth/middleware';
import { prisma } from '../../../../lib/prisma';
import { hash, compare } from 'bcryptjs';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);

    const userProfile = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        avatar: true,
        verified: true,
        createdAt: true,
        updatedAt: true,
        bio: true,
        timezone: true,
        language: true,
        accountType: true,
        subscriptionStatus: true,
        lastLoginAt: true,
        loginCount: true,
        twoFactorEnabled: true,
      },
    });

    if (!userProfile) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: userProfile,
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await requireAuth(request);

    const body = await request.json();
    
    // Validate and prepare update data
    const updateData: any = {};
    const allowedFields = ['firstName', 'lastName', 'bio', 'timezone', 'language', 'avatar'];
    
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    // Validate required fields
    if (updateData.firstName !== undefined && !updateData.firstName.trim()) {
      return NextResponse.json(
        { success: false, error: 'First name is required' },
        { status: 400 }
      );
    }

    if (updateData.lastName !== undefined && !updateData.lastName.trim()) {
      return NextResponse.json(
        { success: false, error: 'Last name is required' },
        { status: 400 }
      );
    }

    // Validate bio length
    if (updateData.bio && updateData.bio.length > 500) {
      return NextResponse.json(
        { success: false, error: 'Bio must be less than 500 characters' },
        { status: 400 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        avatar: true,
        verified: true,
        createdAt: true,
        updatedAt: true,
        bio: true,
        timezone: true,
        language: true,
        accountType: true,
        subscriptionStatus: true,
        lastLoginAt: true,
        loginCount: true,
        twoFactorEnabled: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedUser,
      message: 'Profile updated successfully',
    });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}

// Password change endpoint
export async function PATCH(request: NextRequest) {
  try {
    const user = await requireAuth(request);

    const body = await request.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { success: false, error: 'Current password and new password are required' },
        { status: 400 }
      );
    }

    // Validate new password strength
    if (newPassword.length < 8) {
      return NextResponse.json(
        { success: false, error: 'New password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)) {
      return NextResponse.json(
        { success: false, error: 'New password must contain at least one uppercase letter, one lowercase letter, and one number' },
        { status: 400 }
      );
    }

    // Get current user with password
    const userWithPassword = await prisma.user.findUnique({
      where: { id: user.id },
      select: { id: true, password: true },
    });

    if (!userWithPassword) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Verify current password
    const isCurrentPasswordValid = await compare(currentPassword, userWithPassword.password);
    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        { success: false, error: 'Current password is incorrect' },
        { status: 400 }
      );
    }

    // Check if new password is different from current
    const isSamePassword = await compare(newPassword, userWithPassword.password);
    if (isSamePassword) {
      return NextResponse.json(
        { success: false, error: 'New password must be different from current password' },
        { status: 400 }
      );
    }

    // Hash new password and update
    const hashedNewPassword = await hash(newPassword, 12);
    
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedNewPassword },
    });

    return NextResponse.json({
      success: true,
      message: 'Password updated successfully',
    });
  } catch (error) {
    console.error('Password change error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to change password' },
      { status: 500 }
    );
  }
}