#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { generateSecrets } = require('./generate-secrets');

/**
 * Setup local environment file with generated secrets
 */
function setupEnvironment() {
  console.log('🚀 Setting up FlowForge environment...\n');
  
  const envLocalPath = path.join(process.cwd(), '.env.local');
  const envExamplePath = path.join(process.cwd(), '.env.example');
  
  // Check if .env.local already exists
  if (fs.existsSync(envLocalPath)) {
    console.log('⚠️  .env.local already exists!');
    console.log('   To avoid overwriting, please:');
    console.log('   1. Backup your current .env.local');
    console.log('   2. Delete it');
    console.log('   3. Run this script again\n');
    return;
  }
  
  // Generate secrets
  console.log('🔐 Generating secure secrets...');
  const secrets = generateSecrets();
  
  // Read .env.example
  let envContent = '';
  if (fs.existsSync(envExamplePath)) {
    envContent = fs.readFileSync(envExamplePath, 'utf8');
  } else {
    // Create basic template if .env.example doesn't exist
    envContent = `# Database
DATABASE_URL="postgresql://username:password@localhost:5432/flowforge"

# Authentication Secrets
JWT_SECRET="generate-with-node-scripts-generate-secrets-js"
NEXTAUTH_SECRET="generate-with-node-scripts-generate-secrets-js"
NEXTAUTH_URL="http://localhost:3000"

# App Configuration
NODE_ENV="development"
`;
  }
  
  // Replace placeholder secrets with generated ones
  envContent = envContent
    .replace(/JWT_SECRET="[^"]*"/, `JWT_SECRET="${secrets.jwtSecret}"`)
    .replace(/NEXTAUTH_SECRET="[^"]*"/, `NEXTAUTH_SECRET="${secrets.nextAuthSecret}"`)
    .replace(/NEXTAUTH_URL="[^"]*"/, 'NEXTAUTH_URL="http://localhost:3000"')
    .replace(/NODE_ENV="[^"]*"/, 'NODE_ENV="development"');
  
  // Write .env.local
  fs.writeFileSync(envLocalPath, envContent);
  
  console.log('\n✅ Environment setup complete!');
  console.log(`📁 Created: ${envLocalPath}`);
  console.log('\n📝 Next steps:');
  console.log('   1. Update DATABASE_URL in .env.local with your database connection');
  console.log('   2. Configure other environment variables as needed');
  console.log('   3. Run: npm run dev');
  console.log('\n🔒 Security reminder:');
  console.log('   • .env.local is in .gitignore (good!)');
  console.log('   • Never commit secrets to version control');
  console.log('   • Use different secrets for production\n');
}

// Run if called directly
if (require.main === module) {
  setupEnvironment();
}

module.exports = { setupEnvironment };