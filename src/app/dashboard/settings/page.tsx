'use client';

import { ProtectedRoute } from '../../../components/auth/ProtectedRoute';
import { DashboardLayout } from '../../../components/dashboard/DashboardLayout';
import { SettingsPanel } from '../../../components/dashboard/SettingsPanel';
import { TwoFactorSetup } from '../../../components/dashboard/TwoFactorSetup';
import { UserSettings } from '../../../types/dashboard';
import { useState } from 'react';

export default function SettingsPage() {
  const [settings, setSettings] = useState<UserSettings | undefined>(undefined);

  const handleSaveSettings = async (newSettings: Partial<UserSettings>) => {
    // Mock implementation - replace with actual API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('Saving settings:', newSettings);
    
    // Update local state
    setSettings(prev => ({ ...prev, ...newSettings } as UserSettings));
  };

  const handleEnable2FA = async (secret: string, code: string) => {
    // Mock implementation - replace with actual API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('Enabling 2FA:', { secret, code });
  };

  const handleDisable2FA = async () => {
    // Mock implementation - replace with actual API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('Disabling 2FA');
  };

  return (
    <ProtectedRoute requireAuth={true}>
      <DashboardLayout>
        <div className="p-6 sm:p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Settings</h1>
            <p className="text-gray-600">Manage your account preferences and security settings</p>
          </div>

          <div className="max-w-6xl space-y-8">
            {/* Main Settings Panel */}
            <SettingsPanel 
              settings={settings}
              onSave={handleSaveSettings}
            />

            {/* Two-Factor Authentication */}
            <TwoFactorSetup
              isEnabled={false}
              onEnable={handleEnable2FA}
              onDisable={handleDisable2FA}
            />
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}