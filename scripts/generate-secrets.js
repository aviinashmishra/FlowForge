#!/usr/bin/env node

const crypto = require('crypto');

/**
 * Generate secure secrets for JWT and NextAuth
 */
function generateSecrets() {
  console.log('🔐 Generating Secure Secrets for FlowForge\n');
  
  // Generate JWT Secret (32 bytes = 256 bits)
  const jwtSecret = crypto.randomBytes(32).toString('hex');
  
  // Generate NextAuth Secret (32 bytes = 256 bits)
  const nextAuthSecret = crypto.randomBytes(32).toString('hex');
  
  // Generate additional secrets you might need
  const encryptionKey = crypto.randomBytes(32).toString('base64');
  const sessionSecret = crypto.randomBytes(24).toString('hex');
  
  console.log('📋 Copy these secrets to your environment variables:\n');
  
  console.log('🔑 JWT_SECRET (for JWT token signing):');
  console.log(`JWT_SECRET="${jwtSecret}"\n`);
  
  console.log('🔑 NEXTAUTH_SECRET (for NextAuth.js):');
  console.log(`NEXTAUTH_SECRET="${nextAuthSecret}"\n`);
  
  console.log('🔑 Additional secrets (optional):');
  console.log(`ENCRYPTION_KEY="${encryptionKey}"`);
  console.log(`SESSION_SECRET="${sessionSecret}"\n`);
  
  console.log('📝 For Vercel deployment, add these in your Vercel dashboard:');
  console.log('   Settings → Environment Variables\n');
  
  console.log('🔒 Security Notes:');
  console.log('   • Keep these secrets private and secure');
  console.log('   • Never commit them to version control');
  console.log('   • Use different secrets for development and production');
  console.log('   • Rotate secrets periodically for better security\n');
  
  return {
    jwtSecret,
    nextAuthSecret,
    encryptionKey,
    sessionSecret
  };
}

// Run if called directly
if (require.main === module) {
  generateSecrets();
}

module.exports = { generateSecrets };