# Vercel Deployment Guide for FlowForge

## ✅ Prisma Issue Fixed

The Prisma Client initialization error has been resolved with the following changes:

### 1. Updated Build Scripts
```json
{
  "scripts": {
    "build": "prisma generate && next build",
    "postinstall": "prisma generate"
  }
}
```

### 2. Moved Prisma CLI to DevDependencies
- `@prisma/client` stays in `dependencies` (needed at runtime)
- `prisma` CLI moved to `devDependencies` (only needed for generation)

### 3. Added Vercel Configuration
Created `vercel.json` with:
- Custom build command that includes Prisma generation
- API function timeout settings
- Environment variable configuration

## 🚀 Deployment Steps

### Option 1: Vercel CLI (Recommended)
```bash
# Install Vercel CLI globally
npm i -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod
```

### Option 2: GitHub Integration
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Vercel will automatically deploy on every push

## 🔧 Environment Variables

Set these in your Vercel dashboard:

### Required Variables
```env
DATABASE_URL=your_production_database_url
JWT_SECRET=your_secure_jwt_secret_key
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=https://your-domain.vercel.app
```

### Optional Variables
```env
NODE_ENV=production
PRISMA_GENERATE_SKIP_AUTOINSTALL=true
```

## 📊 Database Setup

### For PostgreSQL (Recommended)
1. **Neon** (Free tier available):
   ```bash
   # Get connection string from Neon dashboard
   DATABASE_URL="postgresql://username:password@host/database?sslmode=require"
   ```

2. **Supabase** (Free tier available):
   ```bash
   # Get connection string from Supabase dashboard
   DATABASE_URL="postgresql://postgres:password@host:5432/postgres"
   ```

3. **PlanetScale** (MySQL):
   ```bash
   # Get connection string from PlanetScale dashboard
   DATABASE_URL="mysql://username:password@host/database?sslaccept=strict"
   ```

### Database Migration
After setting up your database:
```bash
# Run migrations (do this locally first)
npx prisma migrate deploy

# Or reset and seed (for new databases)
npx prisma migrate reset
```

## 🔍 Troubleshooting

### Common Issues and Solutions

1. **"Prisma Client not found" Error**
   - ✅ Fixed with updated build script
   - Vercel now runs `prisma generate` before building

2. **Database Connection Issues**
   - Check your `DATABASE_URL` in Vercel dashboard
   - Ensure database allows connections from Vercel IPs
   - For PostgreSQL, make sure `?sslmode=require` is in connection string

3. **Build Timeouts**
   - ✅ Added function timeout configuration in `vercel.json`
   - API routes now have 30-second timeout limit

4. **Environment Variables Not Loading**
   - Set variables in Vercel dashboard, not in `.env` files
   - Redeploy after adding new environment variables

## 📝 Deployment Checklist

- [x] Updated `package.json` with Prisma generation
- [x] Created `vercel.json` configuration
- [x] Added `.vercelignore` file
- [x] Moved Prisma CLI to devDependencies
- [ ] Set up production database
- [ ] Configure environment variables in Vercel
- [ ] Run database migrations
- [ ] Deploy to Vercel
- [ ] Test all functionality

## 🎯 Post-Deployment Testing

After deployment, test these key features:
1. **Landing Page**: Verify particle effects and navigation
2. **Authentication**: Test signup, signin, password reset
3. **Dashboard**: Check profile, analytics, settings pages
4. **Pipeline Builder**: Test node creation and connections
5. **API Routes**: Verify all endpoints respond correctly

## 🔗 Useful Commands

```bash
# Check deployment status
vercel ls

# View deployment logs
vercel logs [deployment-url]

# Set environment variable
vercel env add [name]

# Pull environment variables locally
vercel env pull .env.local
```

## 🎉 Success!

Your FlowForge application is now properly configured for Vercel deployment with Prisma support!

---

**Last Updated**: December 28, 2024  
**Status**: ✅ READY FOR VERCEL DEPLOYMENT