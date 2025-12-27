#!/usr/bin/env node

/**
 * Pre-deployment check script
 * Validates the project is ready for Vercel deployment
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 Running pre-deployment checks...\n');

// Check 1: Verify required files exist
const requiredFiles = [
  'package.json',
  'next.config.js',
  'tsconfig.json',
  'vercel.json'
];

console.log('📁 Checking required files...');
requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file} exists`);
  } else {
    console.log(`❌ ${file} missing`);
    process.exit(1);
  }
});

// Check 2: Validate package.json scripts
console.log('\n📦 Checking package.json scripts...');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const requiredScripts = ['build', 'start'];

requiredScripts.forEach(script => {
  if (packageJson.scripts && packageJson.scripts[script]) {
    console.log(`✅ Script "${script}" exists`);
  } else {
    console.log(`❌ Script "${script}" missing`);
    process.exit(1);
  }
});

// Check 3: Test build
console.log('\n🔨 Testing build process...');
try {
  execSync('npm run build', { stdio: 'pipe' });
  console.log('✅ Build successful');
} catch (error) {
  console.log('❌ Build failed');
  console.log(error.stdout?.toString() || error.message);
  process.exit(1);
}

// Check 4: Verify environment variables
console.log('\n🔐 Checking environment configuration...');
if (fs.existsSync('.env.example')) {
  console.log('✅ .env.example exists (reference for required variables)');
} else {
  console.log('⚠️  .env.example not found');
}

console.log('\n🎉 All checks passed! Project is ready for deployment.');
console.log('\n📝 Deployment checklist:');
console.log('1. Ensure all environment variables are set in Vercel dashboard');
console.log('2. Database URL should point to production database');
console.log('3. JWT secrets should be different from development');
console.log('4. NEXTAUTH_URL should match your production domain');