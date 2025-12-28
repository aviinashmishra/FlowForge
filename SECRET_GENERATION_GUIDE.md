# 🔐 Secret Generation Guide for FlowForge

## 🎯 Quick Generation (Recommended)

Use the provided script:
```bash
node scripts/generate-secrets.js
```

## 🔑 Your Generated Secrets

**Copy these to your environment variables:**

```env
# JWT Secret (for token signing)
JWT_SECRET="0fc938b51e4e2ca3c42bb08657d8a708136cb238077cbc36984afd5ad5ca940e"

# NextAuth Secret (for NextAuth.js)
NEXTAUTH_SECRET="79d307f123b3db3bce99ffb4428ea5cb327ddf1f3d18684f32e02c0b52dd4af7"
```

## 🛠️ Alternative Methods

### Method 1: OpenSSL (Linux/Mac/WSL)
```bash
# Generate JWT Secret
openssl rand -hex 32

# Generate NextAuth Secret  
openssl rand -hex 32
```

### Method 2: Node.js Command Line
```bash
# Generate JWT Secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate NextAuth Secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Method 3: Online Generator (Use with caution)
- Visit: https://generate-secret.vercel.app/32
- **⚠️ Only use for development, not production**

### Method 4: PowerShell (Windows)
```powershell
# Generate random hex string
[System.Web.Security.Membership]::GeneratePassword(64, 0)
```

## 📝 Setting Up Environment Variables

### For Local Development (.env.local)
```env
# Database
DATABASE_URL="your_database_connection_string"

# Authentication Secrets
JWT_SECRET="0fc938b51e4e2ca3c42bb08657d8a708136cb238077cbc36984afd5ad5ca940e"
NEXTAUTH_SECRET="79d307f123b3db3bce99ffb4428ea5cb327ddf1f3d18684f32e02c0b52dd4af7"
NEXTAUTH_URL="http://localhost:3000"

# Optional
NODE_ENV="development"
```

### For Vercel Production

1. **Go to Vercel Dashboard**
2. **Select your project**
3. **Settings → Environment Variables**
4. **Add each variable:**

| Name | Value | Environment |
|------|-------|-------------|
| `DATABASE_URL` | `your_production_db_url` | Production |
| `JWT_SECRET` | `0fc938b51e4e2ca3c42bb08657d8a708136cb238077cbc36984afd5ad5ca940e` | Production |
| `NEXTAUTH_SECRET` | `79d307f123b3db3bce99ffb4428ea5cb327ddf1f3d18684f32e02c0b52dd4af7` | Production |
| `NEXTAUTH_URL` | `https://your-app.vercel.app` | Production |

## 🔒 Security Best Practices

### ✅ Do's
- **Use different secrets** for development and production
- **Store secrets securely** in environment variables
- **Rotate secrets periodically** (every 6-12 months)
- **Use strong, random secrets** (32+ bytes)
- **Keep secrets private** - never share or commit them

### ❌ Don'ts
- **Never commit secrets** to version control
- **Don't use weak or predictable secrets**
- **Don't share secrets** in plain text
- **Don't reuse secrets** across different applications
- **Don't use online generators** for production secrets

## 🎯 What Each Secret Does

### JWT_SECRET
- **Purpose**: Signs and verifies JWT tokens
- **Used for**: User authentication, session management
- **Security**: Must be kept secret to prevent token forgery

### NEXTAUTH_SECRET
- **Purpose**: Encrypts NextAuth.js session cookies
- **Used for**: Session encryption, CSRF protection
- **Security**: Required for secure session management

## 🔄 Rotating Secrets

When you need to change secrets:

1. **Generate new secrets** using the script
2. **Update environment variables** in all environments
3. **Deploy the changes**
4. **Existing sessions will be invalidated** (users need to log in again)

## 🚨 Emergency: Compromised Secrets

If secrets are compromised:

1. **Immediately generate new secrets**
2. **Update all environments**
3. **Deploy immediately**
4. **Invalidate all existing sessions**
5. **Notify users if necessary**

## 📞 Need Help?

- **Script issues**: Check Node.js is installed
- **Vercel deployment**: Ensure all environment variables are set
- **Authentication errors**: Verify secrets match between environments

---

**Generated on**: December 28, 2024  
**Status**: ✅ Ready for deployment