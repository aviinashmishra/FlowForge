import { NextRequest, NextResponse } from 'next/server';
import { userService } from '../../../../lib/auth/userService';
import { requireAuth } from '../../../../lib/auth/middleware';
import { ProfileUpdates } from '../../../../types/auth';

// Input validation for profile updates
function validateProfileUpdates(data: any): data is ProfileUpdates {
  const validKeys = ['firstName', 'lastName', 'avatar'];
  const keys = Object.keys(data);
  
  // Check that only valid keys are present
  if (!keys.every(key => validKeys.includes(key))) {
    return false;
  }
  
  // Validate individual fields if present
  if (data.firstName !== undefined && (typeof data.firstName !== 'string' || data.firstName.trim().length === 0)) {
    return false;
  }
  
  if (data.lastName !== undefined && (typeof data.lastName !== 'string' || data.lastName.trim().length === 0)) {
    return false;
  }
  
  if (data.avatar !== undefined && typeof data.avatar !== 'string') {
    return false;
  }
  
  return true;
}

// GET - Get current user profile
export async function GET(request: NextRequest) {
  try {
    const authUser = await requireAuth(request);
    
    const user = await userService.getUserById(authUser.id);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, user },
      { status: 200 }
    );

  } catch (error) {
    console.error('Get profile error:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'An error occurred.' },
      { status: 500 }
    );
  }
}

// PUT - Update user profile
export async function PUT(request: NextRequest) {
  try {
    const authUser = await requireAuth(request);
    const body = await request.json();
    
    // Validate input
    if (!validateProfileUpdates(body)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid profile data. Only firstName, lastName, and avatar can be updated.' 
        },
        { status: 400 }
      );
    }

    // Check if there are any updates
    if (Object.keys(body).length === 0) {
      return NextResponse.json(
        { success: false, error: 'No updates provided.' },
        { status: 400 }
      );
    }

    // Update user profile
    const updatedUser = await userService.updateUser(authUser.id, body);

    return NextResponse.json(
      { success: true, user: updatedUser },
      { status: 200 }
    );

  } catch (error) {
    console.error('Update profile error:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'An error occurred while updating profile.' },
      { status: 500 }
    );
  }
}