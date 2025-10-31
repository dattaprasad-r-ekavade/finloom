# Finloom Deployment Guide

## 📋 Prerequisites

- Vercel account (or other hosting platform)
- PostgreSQL database (Neon, Railway, Supabase, etc.)
- Node.js 18+ locally for setup
- Git repository

## 🚀 Vercel Deployment (Recommended)

### Step 1: Prepare Your Database

1. **Create Production Database**
   - Sign up at [Neon](https://neon.tech), [Railway](https://railway.app), or [Supabase](https://supabase.com)
   - Create a new PostgreSQL database
   - Copy the connection string (should include `?sslmode=require`)

2. **Run Migrations**
   ```bash
   # Set your production DATABASE_URL temporarily
   DATABASE_URL="your-production-connection-string" npx prisma migrate deploy
   
   # Seed the database with challenge plans
   DATABASE_URL="your-production-connection-string" npm run seed
   ```

### Step 2: Configure Vercel

1. **Install Vercel CLI** (optional)
   ```bash
   npm i -g vercel
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Or use CLI: `vercel`

3. **Set Environment Variables**
   
   In Vercel Dashboard → Settings → Environment Variables, add:
   
   ```env
   DATABASE_URL=postgresql://user:password@host:5432/database?sslmode=require
   JWT_SECRET=<generate-with-openssl-rand-base64-32>
   NODE_ENV=production
   ```

   **Important:** Generate a NEW JWT_SECRET for production:
   ```bash
   openssl rand -base64 32
   ```

4. **Deploy**
   ```bash
   # Via CLI
   vercel --prod
   
   # Or via GitHub
   # Push to main branch - Vercel will auto-deploy
   ```

### Step 3: Verify Deployment

1. Visit your Vercel URL (e.g., `https://finloom.vercel.app`)
2. Test signup/login flow
3. Check database connection at `/db-test`
4. Verify all features work:
   - ✅ User registration
   - ✅ KYC submission
   - ✅ Challenge selection
   - ✅ Payment processing
   - ✅ Dashboard access
   - ✅ Admin features

## 🔧 Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db?sslmode=require` |
| `JWT_SECRET` | Secret key for JWT signing (32+ chars) | Use `openssl rand -base64 32` |
| `NODE_ENV` | Environment mode | `production` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_APP_URL` | Public app URL | Auto-detected |

## 📊 Database Configuration

### Connection Pooling

Neon and most cloud PostgreSQL providers include connection pooling by default. Your connection string should use the pooler endpoint:

```
postgresql://user:pass@ep-xxx-pooler.region.aws.neon.tech/db
```

### Indexes (Already Applied)

The following indexes are configured for optimal performance:

- `UserChallenge`: userId, status, userId+status
- `MockedPayment`: userId, challengeId
- `ChallengeMetrics`: challengeId, challengeId+date
- `ChallengePlan`: isActive, level

### Migrations

```bash
# Apply all migrations to production
DATABASE_URL="production-url" npx prisma migrate deploy

# Generate Prisma client
npx prisma generate

# Seed challenge plans
DATABASE_URL="production-url" npm run seed
```

## ⚡ Performance Optimizations

### Database Optimizations ✅
- Indexes on frequently queried fields
- Connection pooling enabled
- Cascade deletes configured
- Efficient Prisma queries with selective field loading

### Next.js Optimizations ✅
- Static generation for public pages
- Server-side rendering for dynamic content
- Turbopack for fast builds
- Automatic code splitting
- Image optimization (next/image)

### Bundle Size ✅
- Production build optimized
- 32 routes compiled successfully
- Material-UI tree shaking enabled
- No critical bundle size issues

## 🔐 Security Checklist

- ✅ JWT_SECRET unique per environment
- ✅ HTTP-only cookies for auth tokens
- ✅ Secure cookies in production (HTTPS only)
- ✅ Password hashing with bcrypt (12 rounds)
- ✅ SQL injection prevention (Prisma ORM)
- ✅ XSS prevention (React escaping)
- ✅ CSRF protection (SameSite cookies)
- ✅ Environment variables not committed to git
- ✅ Database connection with SSL
- ✅ Role-based access control (middleware)

## 🧪 Post-Deployment Testing

### Automated Tests
```bash
# Build test
npm run build

# Type checking
npx tsc --noEmit
```

### Manual Testing Checklist

**Authentication:**
- [ ] Sign up as TRADER
- [ ] Sign up as ADMIN
- [ ] Log in with valid credentials
- [ ] Log in with invalid credentials
- [ ] Session persists after refresh
- [ ] Logout clears session

**Trader Flow:**
- [ ] Complete KYC form
- [ ] View challenge plans
- [ ] Select a challenge plan
- [ ] Process mocked payment
- [ ] View challenge dashboard
- [ ] Monitor challenge metrics
- [ ] View challenge completion results

**Admin Flow:**
- [ ] Access admin dashboard
- [ ] View platform statistics
- [ ] Search/filter users
- [ ] View challenge overview

**Error Handling:**
- [ ] 404 page displays correctly
- [ ] Invalid API requests return proper errors
- [ ] Form validation works
- [ ] Empty states display correctly

## 🌐 Custom Domain (Optional)

### Add Custom Domain to Vercel

1. Go to Vercel Dashboard → Project → Settings → Domains
2. Add your custom domain (e.g., `finloom.com`)
3. Configure DNS records:
   ```
   Type: A
   Name: @
   Value: 76.76.21.21
   
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```
4. Wait for DNS propagation (up to 48 hours)
5. Vercel auto-configures SSL certificate

## 📈 Monitoring & Maintenance

### Vercel Analytics
- Enable Analytics in Vercel Dashboard
- Monitor page views, unique visitors, and performance

### Database Monitoring
- Monitor connection pool usage
- Check query performance
- Set up database backups (Neon has automatic backups)

### Error Tracking
Consider integrating:
- [Sentry](https://sentry.io) for error tracking
- [LogRocket](https://logrocket.com) for session replay
- [Vercel Analytics](https://vercel.com/analytics) for performance monitoring

## 🔄 Continuous Deployment

### GitHub Integration (Recommended)

Vercel auto-deploys when you push to GitHub:

```bash
git add .
git commit -m "Deploy updates"
git push origin main
```

Vercel will:
1. Detect the push
2. Run the build
3. Run tests
4. Deploy to production
5. Notify you of deployment status

### Manual Deployment

```bash
# Deploy to production
vercel --prod

# Deploy to preview
vercel
```

## 🛠️ Troubleshooting

### Build Fails

**Issue:** TypeScript errors
```bash
# Check types locally
npx tsc --noEmit
```

**Issue:** Prisma client out of sync
```bash
npx prisma generate
```

### Database Connection Fails

**Issue:** Connection timeout
- Verify DATABASE_URL includes `?sslmode=require`
- Check if database allows connections from Vercel IPs
- Verify connection pooling is enabled

**Issue:** Migrations not applied
```bash
DATABASE_URL="prod-url" npx prisma migrate deploy
```

### Authentication Issues

**Issue:** JWT tokens not working
- Verify JWT_SECRET is set in production
- Check if cookies are being set (secure flag in production)
- Verify middleware is protecting routes

## 📞 Support

- **Documentation:** See [README.md](./README.md)
- **Prisma Docs:** https://www.prisma.io/docs
- **Next.js Docs:** https://nextjs.org/docs
- **Vercel Docs:** https://vercel.com/docs

## 📝 Deployment Checklist

Before going live:

- [ ] Production database created and seeded
- [ ] All environment variables set in Vercel
- [ ] JWT_SECRET generated uniquely for production
- [ ] Database migrations applied
- [ ] Build succeeds locally (`npm run build`)
- [ ] Manual testing completed
- [ ] Custom domain configured (optional)
- [ ] Monitoring/analytics enabled
- [ ] Backup strategy in place
- [ ] Team has access to Vercel project

---

**Last Updated:** October 31, 2025  
**Deployment Status:** ✅ Live on Vercel
