'use client';

import React, { useState, useEffect } from 'react';
import { SimpleButton } from '../auth/SimpleButton';
import { SimpleInput } from '../auth/SimpleInput';

interface TwoFactorSetupProps {
  isEnabled?: boolean;
  onEnable?: (secret: string, code: string) => Promise<void>;
  onDisable?: () => Promise<void>;
}

export function TwoFactorSetup({ isEnabled = false, onEnable, onDisable }: TwoFactorSetupProps) {
  const [showSetup, setShowSetup] = useState(false);
  const [step, setStep] = useState<'generate' | 'verify' | 'complete'>('generate');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [secret, setSecret] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);

  const generateQRCode = async () => {
    setIsLoading(true);
    setError('');

    try {
      // Mock QR code generation - replace with actual implementation
      const mockSecret = 'JBSWY3DPEHPK3PXP';
      const mockQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=otpauth://totp/FlowForge:user@example.com?secret=${mockSecret}&issuer=FlowForge`;
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSecret(mockSecret);
      setQrCodeUrl(mockQrUrl);
      setStep('verify');
    } catch (err: any) {
      setError(err.message || 'Failed to generate QR code');
    } finally {
      setIsLoading(false);
    }
  };

  const verifyCode = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      if (onEnable) {
        await onEnable(secret, verificationCode);
      } else {
        // Mock verification
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Generate backup codes
      const codes = Array.from({ length: 8 }, () => 
        Math.random().toString(36).substring(2, 8).toUpperCase()
      );
      setBackupCodes(codes);
      
      setStep('complete');
      setSuccessMessage('Two-factor authentication has been enabled successfully!');
    } catch (err: any) {
      setError(err.message || 'Invalid verification code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisable = async () => {
    if (!confirm('Are you sure you want to disable two-factor authentication? This will make your account less secure.')) {
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      if (onDisable) {
        await onDisable();
      } else {
        // Mock disable
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      setSuccessMessage('Two-factor authentication has been disabled.');
      setShowSetup(false);
      setStep('generate');
    } catch (err: any) {
      setError(err.message || 'Failed to disable two-factor authentication');
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = () => {
    setShowSetup(false);
    setStep('generate');
    setVerificationCode('');
    setQrCodeUrl('');
    setSecret('');
    setBackupCodes([]);
  };

  const downloadBackupCodes = () => {
    const content = `FlowForge Two-Factor Authentication Backup Codes\n\nGenerated: ${new Date().toLocaleString()}\n\nBackup Codes:\n${backupCodes.map((code, i) => `${i + 1}. ${code}`).join('\n')}\n\nImportant:\n- Keep these codes in a safe place\n- Each code can only be used once\n- Use these codes if you lose access to your authenticator app`;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'flowforge-backup-codes.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!showSetup) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Two-Factor Authentication</h3>
            <p className="text-sm text-gray-600 mt-1">
              {isEnabled 
                ? 'Two-factor authentication is currently enabled for your account.'
                : 'Add an extra layer of security to your account.'
              }
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              isEnabled 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {isEnabled ? 'Enabled' : 'Disabled'}
            </span>
            {isEnabled ? (
              <SimpleButton
                variant="secondary"
                size="sm"
                onClick={handleDisable}
                loading={isLoading}
              >
                Disable
              </SimpleButton>
            ) : (
              <SimpleButton
                variant="primary"
                size="sm"
                onClick={() => setShowSetup(true)}
              >
                Enable 2FA
              </SimpleButton>
            )}
          </div>
        </div>

        {successMessage && (
          <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 mt-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <p className="text-green-700 text-sm font-medium">{successMessage}</p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 mt-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <p className="text-red-700 text-sm font-medium">{error}</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Enable Two-Factor Authentication</h3>
        <button
          onClick={() => setShowSetup(false)}
          className="text-gray-400 hover:text-gray-600"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center space-x-4">
          <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
            step === 'generate' ? 'bg-blue-600 text-white' : 'bg-green-600 text-white'
          }`}>
            1
          </div>
          <div className={`w-16 h-1 ${step !== 'generate' ? 'bg-green-600' : 'bg-gray-300'}`}></div>
          <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
            step === 'verify' ? 'bg-blue-600 text-white' : 
            step === 'complete' ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-600'
          }`}>
            2
          </div>
          <div className={`w-16 h-1 ${step === 'complete' ? 'bg-green-600' : 'bg-gray-300'}`}></div>
          <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
            step === 'complete' ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-600'
          }`}>
            3
          </div>
        </div>
      </div>

      {step === 'generate' && (
        <div className="text-center">
          <div className="mb-6">
            <h4 className="text-lg font-medium text-gray-900 mb-2">Step 1: Install Authenticator App</h4>
            <p className="text-gray-600 mb-4">
              First, install an authenticator app on your phone. We recommend:
            </p>
            <div className="flex justify-center space-x-4 mb-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-2">
                  📱
                </div>
                <p className="text-sm font-medium">Google Authenticator</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-2">
                  🔐
                </div>
                <p className="text-sm font-medium">Authy</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-2">
                  🛡️
                </div>
                <p className="text-sm font-medium">1Password</p>
              </div>
            </div>
          </div>
          <SimpleButton
            variant="primary"
            onClick={generateQRCode}
            loading={isLoading}
            disabled={isLoading}
          >
            {isLoading ? 'Generating...' : 'Continue'}
          </SimpleButton>
        </div>
      )}

      {step === 'verify' && (
        <div className="text-center">
          <div className="mb-6">
            <h4 className="text-lg font-medium text-gray-900 mb-2">Step 2: Scan QR Code</h4>
            <p className="text-gray-600 mb-4">
              Scan this QR code with your authenticator app:
            </p>
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-white border-2 border-gray-200 rounded-lg">
                <img src={qrCodeUrl} alt="QR Code" className="w-48 h-48" />
              </div>
            </div>
            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-2">Or enter this code manually:</p>
              <code className="px-3 py-1 bg-gray-100 rounded text-sm font-mono">{secret}</code>
            </div>
            <div className="max-w-xs mx-auto">
              <SimpleInput
                type="text"
                label="Verification Code"
                value={verificationCode}
                onChange={setVerificationCode}
                placeholder="Enter 6-digit code"
                maxLength={6}
                error={error}
              />
            </div>
          </div>
          <div className="flex justify-center space-x-3">
            <SimpleButton
              variant="secondary"
              onClick={() => setStep('generate')}
            >
              Back
            </SimpleButton>
            <SimpleButton
              variant="primary"
              onClick={verifyCode}
              loading={isLoading}
              disabled={isLoading || verificationCode.length !== 6}
            >
              {isLoading ? 'Verifying...' : 'Verify & Enable'}
            </SimpleButton>
          </div>
        </div>
      )}

      {step === 'complete' && (
        <div className="text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">Two-Factor Authentication Enabled!</h4>
            <p className="text-gray-600 mb-6">
              Your account is now protected with two-factor authentication.
            </p>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <h5 className="font-medium text-yellow-800 mb-2">Important: Save Your Backup Codes</h5>
              <p className="text-sm text-yellow-700 mb-4">
                These backup codes can be used to access your account if you lose your authenticator device. 
                Each code can only be used once.
              </p>
              <div className="grid grid-cols-2 gap-2 mb-4">
                {backupCodes.map((code, index) => (
                  <code key={index} className="px-2 py-1 bg-white rounded text-sm font-mono">
                    {code}
                  </code>
                ))}
              </div>
              <SimpleButton
                variant="secondary"
                size="sm"
                onClick={downloadBackupCodes}
              >
                Download Backup Codes
              </SimpleButton>
            </div>
          </div>
          <SimpleButton
            variant="primary"
            onClick={handleComplete}
          >
            Complete Setup
          </SimpleButton>
        </div>
      )}

      {error && step !== 'verify' && (
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 mt-4">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <p className="text-red-700 text-sm font-medium">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
}