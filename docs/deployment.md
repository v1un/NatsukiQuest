# 🚀 Deployment Guide

This guide covers production deployment strategies for Natsuki Quest, including platform-specific instructions and best practices.

## Overview

Natsuki Quest can be deployed on various platforms. This guide covers the most common deployment scenarios:

- **Vercel** (Recommended for Next.js apps)
- **Railway** (Database + App hosting)
- **PlanetScale/Neon** (Managed PostgreSQL)
- **Firebase Hosting** (Alternative with Genkit integration)

## Vercel Deployment (Recommended)

### Prerequisites

- Vercel account
- GitHub repository
- External PostgreSQL database (PlanetScale, Neon, or Railway)

### 1. Environment Variables Setup

Configure the following environment variables in Vercel dashboard:

```bash
# Database
DATABASE_URL="postgresql://username:password@host:port/database"

# NextAuth
NEXTAUTH_SECRET="your-production-secret-key"
NEXTAUTH_URL="https://your-app.vercel.app"

# Discord OAuth
DISCORD_CLIENT_ID="your-discord-client-id"
DISCORD_CLIENT_SECRET="your-discord-client-secret"

# Google AI
GOOGLE_API_KEY="your-google-ai-api-key"

# Optional: Firebase
FIREBASE_PROJECT_ID="your-firebase-project-id"
```

### 2. Deployment Configuration

Create `vercel.json`:

```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "installCommand": "npm install",
  "functions": {
    "src/ai/flows/*.ts": {
      "maxDuration": 30
    }
  },
  "env": {
    "SKIP_ENV_VALIDATION": "1"
  }
}
```

### 3. Database Migration for Production

```bash
# Production migration (run once)
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate
```

### 4. Build Configuration

Update `next.config.ts`:

```typescript
const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: false, // Enable for production
  },
  eslint: {
    ignoreDuringBuilds: false, // Enable for production
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
      {
        protocol: 'https',
        hostname: 'cdn.discordapp.com', // Discord avatars
      },
    ],
  },
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client'],
  },
};
```

### 5. Deployment Steps

1. **Connect Repository**:
   ```bash
   # Push to GitHub
   git push origin main
   ```

2. **Import to Vercel**:
   - Visit [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Configure environment variables
   - Deploy

3. **Post-deployment**:
   ```bash
   # Run database migration on production
   vercel env pull .env.production
   DATABASE_URL="your-production-db" npx prisma migrate deploy
   ```

## Database Hosting Options

### Option 1: PlanetScale (MySQL Compatible)

**Setup**:
```bash
# Install PlanetScale CLI
npm install -g @planetscale/cli

# Create database
pscale database create natsuki-quest

# Get connection string
pscale connect natsuki-quest main --port 3309
```

**Prisma Configuration**:
```prisma
datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
  relationMode = "prisma"
}
```

### Option 2: Neon (PostgreSQL)

**Setup**:
1. Visit [neon.tech](https://neon.tech)
2. Create new project
3. Copy connection string
4. No schema changes needed

**Connection String Format**:
```bash
DATABASE_URL="postgresql://username:password@hostname/database?sslmode=require"
```

### Option 3: Railway PostgreSQL

**Setup**:
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and create project
railway login
railway init

# Add PostgreSQL
railway add postgresql

# Get variables
railway variables
```

## Firebase Hosting with Genkit

### Prerequisites

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login
```

### Configuration

Create `firebase.json`:

```json
{
  "hosting": {
    "public": "out",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  },
  "functions": {
    "source": ".",
    "runtime": "nodejs20",
    "predeploy": ["npm run build"],
    "ignore": [
      "node_modules",
      ".git",
      "firebase-debug.log",
      "firebase-debug.*.log"
    ]
  }
}
```

### Deployment Steps

```bash
# Export static site
npm run build
npm run export

# Deploy to Firebase
firebase deploy
```

## Railway Full-Stack Deployment

### 1. Railway Setup

```bash
# Install CLI
npm install -g @railway/cli

# Initialize project
railway login
railway init

# Add services
railway add postgresql
railway add nodejs
```

### 2. Railway Configuration

Create `railway.toml`:

```toml
[build]
builder = "nixpacks"
buildCommand = "npm run build"

[deploy]
startCommand = "npm run start"
healthcheckPath = "/"
healthcheckTimeout = 100
restartPolicyType = "never"

[[services]]
name = "web"
source = "."

[[services]]
name = "database"
source = "postgresql"
```

### 3. Environment Variables

```bash
# Set variables via CLI
railway variables set NEXTAUTH_SECRET="your-secret"
railway variables set GOOGLE_API_KEY="your-key"

# Or use Railway dashboard
```

## Production Optimizations

### 1. Performance Optimizations

Update `next.config.ts`:

```typescript
const nextConfig: NextConfig = {
  // Production optimizations
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  },
  
  // Bundle analysis
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    return config;
  },
};
```

### 2. Caching Strategy

```typescript
// src/lib/cache.ts
import { unstable_cache } from 'next/cache';

export const getCachedInitialState = unstable_cache(
  async () => {
    return initialGameState;
  },
  ['initial-game-state'],
  {
    revalidate: 3600, // 1 hour
  }
);
```

### 3. Database Connection Pooling

```typescript
// src/lib/prisma.ts (Production)
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
```

## Monitoring and Analytics

### 1. Error Tracking with Sentry

```bash
npm install @sentry/nextjs
```

Create `sentry.client.config.ts`:

```typescript
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
  debug: false,
  replaysOnErrorSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  integrations: [
    new Sentry.Replay({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
});
```

### 2. Analytics Setup

```typescript
// src/lib/analytics.ts
export function trackGameEvent(event: string, properties?: Record<string, any>) {
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
    // Google Analytics
    gtag('event', event, properties);
    
    // Or Mixpanel/PostHog
    // mixpanel.track(event, properties);
  }
}

// Usage in components
trackGameEvent('choice_made', {
  choice: selectedChoice,
  loop: gameState.currentLoop,
});
```

### 3. Performance Monitoring

```typescript
// src/lib/monitoring.ts
export function measurePerformance(name: string, fn: () => Promise<any>) {
  return async (...args: any[]) => {
    const start = performance.now();
    
    try {
      const result = await fn(...args);
      const duration = performance.now() - start;
      
      console.log(`${name} took ${duration.toFixed(2)}ms`);
      
      // Send to monitoring service
      if (process.env.NODE_ENV === 'production') {
        // trackMetric(name, duration);
      }
      
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      console.error(`${name} failed after ${duration.toFixed(2)}ms`, error);
      throw error;
    }
  };
}
```

## Security Considerations

### 1. Environment Variable Security

```bash
# Vercel
vercel env add NEXTAUTH_SECRET production
vercel env add GOOGLE_API_KEY production

# Ensure secrets are not in git
echo "*.env*" >> .gitignore
echo "!.env.example" >> .gitignore
```

### 2. Content Security Policy

Create `next.config.ts` CSP:

```typescript
const ContentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline' *.vercel-scripts.com;
  child-src *.youtube.com *.google.com *.twitter.com;
  style-src 'self' 'unsafe-inline' *.googleapis.com;
  img-src * blob: data:;
  media-src 'none';
  connect-src *;
  font-src 'self' *.gstatic.com;
`;

const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: ContentSecurityPolicy.replace(/\n/g, ''),
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin',
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
];

const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
};
```

### 3. Rate Limiting

```typescript
// src/lib/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.REDIS_URL!,
  token: process.env.REDIS_TOKEN!,
});

export const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '1 m'), // 10 requests per minute
});

// Usage in API routes/server actions
export async function withRateLimit(identifier: string, fn: () => Promise<any>) {
  const { success } = await ratelimit.limit(identifier);
  
  if (!success) {
    throw new Error('Rate limit exceeded');
  }
  
  return fn();
}
```

## CI/CD Pipeline

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - run: npm ci
      - run: npm run typecheck
      - run: npm run lint
      - run: npm run test
      - run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v4
      - uses: vercel/action@v1
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

## Maintenance and Updates

### 1. Database Migrations

```bash
# Production migration workflow
# 1. Test migration locally
npx prisma migrate dev --name migration_name

# 2. Apply to production
DATABASE_URL="production-url" npx prisma migrate deploy

# 3. Verify migration
DATABASE_URL="production-url" npx prisma db seed
```

### 2. Dependency Updates

```bash
# Check for updates
npm outdated

# Update dependencies safely
npm update

# Update major versions carefully
npm install @latest package-name

# Test after updates
npm run test
npm run build
```

### 3. Backup Strategy

```bash
# Database backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump $DATABASE_URL > backups/backup_$DATE.sql
gzip backups/backup_$DATE.sql

# Cleanup old backups (keep last 30 days)
find backups/ -name "*.sql.gz" -mtime +30 -delete
```

## Troubleshooting Production Issues

### 1. Common Deployment Errors

**Build Failures**:
```bash
# Clear build cache
rm -rf .next
npm run build

# Check TypeScript errors
npm run typecheck
```

**Database Connection**:
```bash
# Test connection
DATABASE_URL="your-url" npx prisma db ping

# Check migration status
DATABASE_URL="your-url" npx prisma migrate status
```

**Environment Variables**:
```bash
# Verify env vars are set
vercel env ls

# Pull production env for testing
vercel env pull .env.production
```

### 2. Performance Issues

**Slow API Responses**:
- Check database query performance
- Monitor AI API response times
- Implement caching where appropriate

**High Memory Usage**:
- Optimize bundle size
- Lazy load components
- Implement proper cleanup in useEffect

### 3. Monitoring Checklist

- [ ] Error rates < 1%
- [ ] Response times < 2s for API calls
- [ ] Database connection pool healthy
- [ ] AI API quota within limits
- [ ] Memory usage stable
- [ ] No memory leaks in long-running sessions

## Related Documentation

- 🛠️ [Setup Guide](setup.md) - Local development environment (prerequisite)
- 🏗️ [Architecture Overview](architecture.md) - Understanding production architecture
- 🗄️ [Database Schema](database.md) - Production database considerations
- 👩‍💻 [Development Guide](development.md) - Pre-deployment development workflow
- 🤖 [AI System](ai-system.md) - Production AI configuration
- 🔌 [API Documentation](api.md) - Production API considerations

## Deployment Resources

- [Vercel Documentation](https://vercel.com/docs) - Primary deployment platform
- [PlanetScale Docs](https://planetscale.com/docs) - Database hosting option
- [Neon Database Docs](https://neon.tech/docs) - PostgreSQL hosting option
- [Railway Docs](https://docs.railway.app/) - Full-stack hosting option

---

This deployment guide ensures a smooth transition from development to production while maintaining performance, security, and reliability standards.