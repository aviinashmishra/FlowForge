'use client';

import { ProtectedRoute } from '../../../components/auth/ProtectedRoute';
import { DashboardLayout } from '../../../components/dashboard/DashboardLayout';
import { ProfileManager } from '../../../components/dashboard/ProfileManager';
import { PasswordChangeForm } from '../../../components/dashboard/PasswordChangeForm';
import { AccountInfo } from '../../../components/dashboard/AccountInfo';
import { useAuth } from '../../../contexts/AuthContext';

export default function ProfilePage() {
  const { user } = useAuth();

  const handlePasswordChange = async (data: any) => {
    // Mock implementation - replace with actual API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('Password change data:', data);
  };

  return (
    <ProtectedRoute requireAuth={true}>
      <DashboardLayout>
        <div className="p-6 sm:p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Profile</h1>
            <p className="text-gray-600">Manage your account information and preferences</p>
          </div>

          <div className="max-w-4xl space-y-8">
            {/* Profile Management */}
            <ProfileManager />

            {/* Password Change */}
            <PasswordChangeForm onPasswordChange={handlePasswordChange} />

            {/* Account Information */}
            <AccountInfo />
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}