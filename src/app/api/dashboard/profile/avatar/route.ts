import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '../../../../../lib/auth/middleware';
import { prisma } from '../../../../../lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);

    const formData = await request.formData();
    const file = formData.get('avatar') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid file type. Only JPEG, PNG, and GIF are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size (2MB limit)
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: 'File size must be less than 2MB' },
        { status: 400 }
      );
    }

    // In a real implementation, you would:
    // 1. Upload the file to a cloud storage service (AWS S3, Cloudinary, etc.)
    // 2. Get the public URL of the uploaded file
    // 3. Update the user's avatar field with the URL
    
    // For now, we'll simulate this process
    const mockAvatarUrl = `https://example.com/avatars/${user.id}-${Date.now()}.jpg`;

    // Update user's avatar in database
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { avatar: mockAvatarUrl },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        avatar: true,
        verified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        user: updatedUser,
        avatarUrl: mockAvatarUrl,
      },
      message: 'Avatar updated successfully',
    });
  } catch (error) {
    console.error('Avatar upload error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to upload avatar' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await requireAuth(request);

    // Remove avatar from user
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { avatar: null },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        avatar: true,
        verified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: { user: updatedUser },
      message: 'Avatar removed successfully',
    });
  } catch (error) {
    console.error('Avatar removal error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to remove avatar' },
      { status: 500 }
    );
  }
}