# Finloom - Prop Trading Challenge Platform

A modern, full-stack prop trading firm challenge platform built with Next.js 16, TypeScript, Prisma, and PostgreSQL. Finloom enables traders to participate in evaluation challenges, progress through multiple levels, and allows admins to manage the entire platform with comprehensive analytics.

##  MVP Status

**Current Version:** 0.1.0 MVP Complete   
**Last Updated:** November 4, 2025  
**Build Status:** Production Ready (32 API routes + pages compiled)  
**Overall Progress:** 100% Complete (All MVP features implemented)

###  Completed Features
All MVP development phases are complete:
-  **Project Setup & Infrastructure** - Next.js 16 + TypeScript + Prisma
-  **Authentication System** - JWT sessions with HTTP-only cookies
-  **Dashboard UI** - Trader & Admin dashboards with real-time data
-  **Database Schema** - 7 models with 4 migrations
-  **Mocked KYC Flow** - Auto-approval system
-  **Challenge Plan Selection** - 3-tier challenge system
-  **Mocked Payment Processing** - Razorpay-style simulation
-  **Challenge Dashboard & Monitoring** - Real-time metrics and P&L tracking
-  **Automated Challenge Evaluation** - Rule-based pass/fail system
-  **Challenge Progression System** - Sequential level unlocking
-  **Admin Dashboard Enhancements** - User management and analytics
-  **Authentication & Authorization** - Next.js middleware with role-based access
-  **Error Handling & Validation** - Standardized API responses and custom error pages
-  **UI/UX Polish** - Material-UI theming and responsive design

###  Key Achievements
-  Zero TypeScript compilation errors
-  32 API routes fully implemented and tested
-  JWT-based authentication with HTTP-only cookies (7-day expiration)
-  Role-based access control with Next.js middleware
-  Automated challenge evaluation with rule engine
-  Sequential challenge progression (Level 1 → 2 → 3)
-  Comprehensive admin analytics dashboard with Recharts
-  7 database models with proper relationships and indexes
-  4 database migrations successfully applied
-  Material-UI v7 with custom gradient theme
-  Production-ready deployment configuration for Vercel

##  Features

### For Traders
- **Secure Authentication** - JWT-based sessions with HTTP-only cookies (7-day expiration)
- **Auto-Approval KYC** - Instant verification for rapid onboarding (mocked for MVP)
- **Three Challenge Levels** - Progressive difficulty with larger account sizes
  - Level 1: ₹10 Lakh account, ₹9,999 fee, 30 days, 80% profit split
  - Level 2: ₹25 Lakh account, ₹19,999 fee, 45 days, 85% profit split (unlocked after Level 1)
  - Level 3: ₹50 Lakh account, ₹29,999 fee, 60 days, 90% profit split (unlocked after Level 2)
- **Mocked Payment Processing** - Razorpay-style payment simulation with transaction tracking
- **Real-time Challenge Monitoring** - Live P&L tracking, drawdown indicators, violation alerts
- **Integrated Demo Trading Terminal** - TradingView-powered charting, order placement, trade history, and capital analytics inside the dashboard
- **Automated Evaluation System** - Rule-based pass/fail determination
  - Profit target achievement (8% of account size)
  - Max loss enforcement (5% max drawdown)
  - Daily loss violations (2% daily limit)
  - Challenge duration tracking (30/45/60 days by level)
- **Allowed Instruments** - Trade Equities, Futures, and Options across all challenge levels
- **Sequential Progression** - Unlock higher levels by passing previous challenges
- **Demo Trading Credentials** - Simulated account credentials for external platform integration
- **Challenge Result Pages** - Detailed performance summaries with next actions

### For Admins
- **Comprehensive Dashboard** - Platform-wide statistics and revenue analytics
  - Total/active/passed/failed challenge counts
  - Pass rate percentage and average completion time
  - Revenue breakdown by challenge level
  - User statistics with KYC approval rates
- **User Management Interface** - Full user oversight with advanced filtering
  - Search by name or email
  - Filter by role (TRADER/ADMIN), KYC status, active challenges
  - Pagination for large datasets
  - View challenge statistics per user
- **Challenge Oversight** - Monitor all platform challenges
  - Recent challenges feed with user context
  - Challenge status distribution (pie chart)
  - Revenue analytics (bar chart)
- **Role-Based Access Control** - Secure admin-only routes with middleware protection

## ️ Tech Stack

### Frontend
- **Next.js 16.0.1** - React framework with App Router (latest stable)
- **React 19.2.0** - Latest React with server components and concurrent features
- **TypeScript 5** - Type-safe development
- **Material-UI v7.3.4** - Modern component library with Emotion styling
- **Recharts 3.3.0** - Data visualization for dashboards
- **Zustand 5.0.8** - Lightweight state management for authentication

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **Prisma 6.18.0** - Type-safe ORM with PostgreSQL
- **PostgreSQL** - Production database (Neon-compatible)
- **bcryptjs 3.0.2** - Secure password hashing
- **jsonwebtoken 9.0.2** - JWT session management

### Development & Deployment
- **ESLint 9** - Code quality with Next.js config
- **Tailwind CSS 4** - Utility-first CSS framework
- **PostCSS** - CSS processing with Tailwind
- **Vercel Analytics** - Performance monitoring
- **Git** - Version control

##  User Flows

### Trader Journey
1. **Sign Up** → Create account with email/password (select TRADER role)
2. **Complete KYC** → Submit personal information (auto-approved)
3. **Select Challenge** → Choose from available challenge levels (locked levels require progression)
4. **Make Payment** → Process mocked payment (simulated Razorpay)
5. **Receive Credentials** → Get demo trading account credentials
6. **Monitor Challenge** → Track P&L, violations, and progress in real-time
7. **Complete Challenge** → View results and unlock next level
8. **Progress to Higher Levels** → Unlock Level 2 and Level 3 sequentially

### Admin Journey
1. **Sign Up/Login** → Access admin portal (select ADMIN role)
2. **View Dashboard** → Monitor platform statistics and revenue
3. **Manage Users** → Search, filter, and view user details
4. **Oversee Challenges** → Track active challenges and pass rates
5. **Access Analytics** → Review revenue breakdowns and user metrics

##  Installation

### Prerequisites
- Node.js 18+ 
- PostgreSQL database (local or cloud provider like Neon)
- npm/yarn/pnpm
- Git

### Quick Start

1. **Clone the repository**
```bash
git clone https://github.com/dattaprasad-r-ekavade/finloom.git
cd finloom
```

2. **Install dependencies**
```bash
npm install
# Note: This automatically runs 'prisma generate' via postinstall hook
```

3. **Set up environment variables**

Create a `.env` file in the root directory:
```env
# Database Connection
DATABASE_URL="postgresql://user:password@localhost:5432/finloom?schema=public&sslmode=require"

# JWT Secret (generate with: openssl rand -base64 32)
JWT_SECRET="your-secure-jwt-secret-here"

# Environment
NODE_ENV="development"
```

4. **Set up the database**
```bash
# Generate Prisma Client (auto-runs via postinstall)
npx prisma generate

# Run migrations to create all tables
npx prisma migrate deploy

# Seed database with 3 challenge plans
npm run seed
# Or manually: node prisma/seed.js
```

5. **Run the development server**
```bash
npm run dev
```

6. **Open the application**

Visit [http://localhost:3000](http://localhost:3000) and start testing!

## ️ Database Architecture

### Database Models

The application uses Prisma with PostgreSQL. All models are production-ready with proper relationships and indexes.

| Model | Purpose | Key Fields |
|-------|---------|------------|
| **User** | User accounts | email, passwordHash, role (TRADER/ADMIN), name |
| **MockedKYC** | KYC records | userId, fullName, phoneNumber, idNumber, address, status (PENDING/APPROVED/AUTO_APPROVED) |
| **ChallengePlan** | Challenge definitions | level (1-3), accountSize, profitTargetPct, maxLossPct, dailyLossPct, fee, durationDays |
| **UserChallenge** | Challenge enrollments | userId, planId, status (PENDING/ACTIVE/PASSED/FAILED), demoAccountCredentials, currentPnl |
| **MockedPayment** | Payment transactions | userId, challengeId, amount, mockTransactionId, status (SUCCESS), paidAt |
| **ChallengeMetrics** | Daily trading data | challengeId, date, dailyPnl, cumulativePnl, tradesCount, winRate, maxDrawdown, violations |
| **AdminSettings** | Admin configuration | autoApproveKyc (boolean) |

### Challenge Plans (Seeded Data)

Three progressive challenge levels are pre-seeded in the database:

| Level | Account Size | Profit Target | Max Loss | Daily Loss | Fee | Duration | Profit Split |
|-------|-------------|---------------|----------|------------|-----|----------|--------------|
| **Level 1** | ₹10,00,000 | 8% (₹80,000) | 5% | 2% | ₹9,999 | 30 days | 80% |
| **Level 2** | ₹25,00,000 | 8% (₹2,00,000) | 5% | 2% | ₹19,999 | 45 days | 85% |
| **Level 3** | ₹50,00,000 | 8% (₹4,00,000) | 5% | 2% | ₹29,999 | 60 days | 90% |

### Migrations

Four database migrations manage schema evolution:
1. `20251030093702_phase1_challenge_models` - Initial challenge system models
2. `20251031050256_add_performance_indexes` - Performance optimization indexes
3. `20251101191024_add_kyc_approval_and_settings` - KYC and settings enhancement
4. `20251102000000_update_kyc_table` - KYC table refinements

##  Testing & Verification

### Database Connection Test

Visit [http://localhost:3000/db-test](http://localhost:3000/db-test) to verify database connectivity.

### Manual Testing Flows

**Trader Flow (End-to-End):**
1. Navigate to `/signup` and create a TRADER account
2. Login at `/login` with your credentials
3. Complete KYC form at `/kyc` (auto-approved instantly)
4. Browse challenge plans at `/challenge-plans`
5. Select Level 1 challenge (Levels 2-3 are locked initially)
6. Complete mocked payment at `/payments/mock`
7. Copy demo trading credentials from confirmation page
8. View challenge status at `/dashboard/user`
9. Monitor detailed metrics at `/dashboard/user/challenge`
10. Check evaluation results at `/challenges/[id]/result` after completion

**Admin Flow:**
1. Navigate to `/signup` and create an ADMIN account
2. Login at `/admin/login` with admin credentials
3. View platform overview at `/dashboard/admin`
   - Check total users, challenges, revenue
   - Review pass rates and completion times
   - Analyze revenue by challenge level
4. Manage users at `/dashboard/admin/users`
   - Search for specific users
   - Filter by role, KYC status, or active challenges
   - View user statistics and challenge history

### API Testing

Test API endpoints directly:

```bash
# Authentication
curl -X POST http://localhost:3000/api/auth/signup -H "Content-Type: application/json" -d '{"email":"test@example.com","password":"password123","name":"Test User","role":"TRADER"}'

# Get Challenge Plans
curl http://localhost:3000/api/challenges/plans

# Check User Session
curl http://localhost:3000/api/auth/me
```

##  Available Scripts

### Development Commands
```bash
npm run dev          # Start development server (http://localhost:3000)
npm run build        # Build production bundle (validates all routes)
npm run start        # Start production server (runs on build output)
npm run lint         # Run ESLint code quality checks (ESLint 9)
```

### Database Commands
```bash
npm run seed              # Seed database with 3 challenge plans (via postinstall hook)
npx prisma studio         # Open Prisma Studio GUI (visual database browser)
npx prisma migrate dev    # Create new migration (development)
npx prisma migrate deploy # Apply migrations (production)
npx prisma generate       # Regenerate Prisma Client (auto-runs after npm install)
```

### Useful Development Commands
```bash
npx prisma db push        # Push schema changes without creating migration
npx prisma db seed        # Manually run seed script
npx prisma migrate reset  # Reset database and reapply all migrations (️ DELETES ALL DATA)
npx prisma format         # Format prisma schema file
```

##  Project Structure

```
finloom/
├── prisma/
│   ├── schema.prisma                    # Database schema with 6 models
│   ├── seed.js                          # Seed script (3 challenge plans)
│   └── migrations/                      # Database migrations (4 migrations)
├── src/
│   ├── app/                             # Next.js App Router (30+ routes)
│   │   ├── api/                         # API Routes
│   │   │   ├── auth/                    # Authentication endpoints
│   │   │   │   ├── login/route.ts       # Login API
│   │   │   │   ├── signup/route.ts      # Signup API
│   │   │   │   ├── logout/route.ts      # Logout API
│   │   │   │   └── me/route.ts          # Session validation API
│   │   │   ├── kyc/submit/route.ts      # KYC submission API
│   │   │   ├── challenges/              # Challenge management APIs
│   │   │   │   ├── plans/route.ts       # List challenge plans
│   │   │   │   ├── select/route.ts      # Select challenge
│   │   │   │   ├── selection/route.ts   # Get user selection
│   │   │   │   ├── evaluate/route.ts    # Evaluate challenges
│   │   │   │   ├── next-level/route.ts  # Progression logic
│   │   │   │   └── status/[id]/route.ts # Challenge status
│   │   │   ├── payment/mock/route.ts    # Mocked payment processing
│   │   │   └── admin/                   # Admin APIs
│   │   │       ├── users/route.ts       # User management
│   │   │       ├── challenges/overview/route.ts # Analytics
│   │   │       ├── kyc/route.ts         # KYC management
│   │   │       └── settings/route.ts    # Admin settings
│   │   ├── dashboard/
│   │   │   ├── user/                    # Trader dashboards
│   │   │   │   ├── page.tsx             # Main trader dashboard
│   │   │   │   └── challenge/page.tsx   # Challenge monitoring
│   │   │   └── admin/                   # Admin dashboards
│   │   │       ├── page.tsx             # Admin overview
│   │   │       ├── users/page.tsx       # User management UI
│   │   │       └── settings/page.tsx    # Admin settings UI
│   │   ├── challenges/
│   │   │   └── [id]/
│   │   │       ├── page.tsx             # Challenge details
│   │   │       └── result/page.tsx      # Challenge results
│   │   ├── challenge-plans/page.tsx     # Plan selection with progression locks
│   │   ├── kyc/page.tsx                 # KYC form with auto-approval
│   │   ├── payments/mock/page.tsx       # Payment confirmation with credentials
│   │   ├── login/page.tsx               # Main login page
│   │   ├── signup/page.tsx              # Main signup page
│   │   ├── admin/                       # Admin authentication
│   │   │   ├── login/page.tsx           # Admin login
│   │   │   └── signup/page.tsx          # Admin signup
│   │   ├── trader/                      # Trader authentication
│   │   │   ├── login/page.tsx           # Trader login
│   │   │   └── signup/page.tsx          # Trader signup
│   │   ├── db-test/page.tsx             # Database connection test
│   │   ├── page.tsx                     # Homepage
│   │   ├── error.tsx                    # Global error boundary (500)
│   │   ├── not-found.tsx                # 404 page
│   │   ├── unauthorized/page.tsx        # 401 page
│   │   ├── forbidden/page.tsx           # 403 page
│   │   └── layout.tsx                   # Root layout with providers
│   ├── components/
│   │   └── Navbar.tsx                   # Navigation component
│   ├── lib/                             # Utility libraries
│   │   ├── prisma.ts                    # Prisma client singleton
│   │   ├── jwt.ts                       # JWT sign/verify functions
│   │   ├── validation.ts                # Form validators
│   │   ├── apiResponse.ts               # Standardized API responses
│   │   ├── evaluateChallenge.ts         # Challenge evaluation engine
│   │   ├── mockMetrics.ts               # Mocked analytics generator
│   │   ├── challengeCredentials.ts      # Demo credentials generator
│   │   ├── dateFormat.ts                # Date formatting utilities
│   │   └── ensureDatabase.ts            # Database connection helper
│   ├── store/
│   │   └── authStore.ts                 # Zustand auth state management
│   ├── theme/
│   │   ├── theme.ts                     # MUI theme configuration
│   │   └── ThemeProvider.tsx            # Theme provider component
│   └── middleware.ts                    # Next.js middleware (route protection)
├── public/                              # Static assets
├── .env                                 # Environment variables (gitignored)
├── next.config.ts                       # Next.js configuration
├── tsconfig.json                        # TypeScript configuration
├── eslint.config.mjs                    # ESLint 9 configuration
├── postcss.config.mjs                   # PostCSS with Tailwind config
└── package.json                         # Dependencies and scripts

### Key Utility Functions
- **evaluateChallenge.ts** - Challenge evaluation engine with violation detection
- **mockMetrics.ts** - Generates realistic mock trading data (P&L, trades, win rate)
- **challengeCredentials.ts** - Creates demo account credentials
- **apiResponse.ts** - Standardized API response handlers
- **validation.ts** - Client-side form validation helpers
- **jwt.ts** - JWT token signing, verification, and decoding
- **dateFormat.ts** - Date formatting utilities
- **ensureDatabase.ts** - Database connection helper
- **prisma.ts** - Prisma client singleton
```

##  Authentication & Authorization

### Session Management
- **JWT Tokens** - Signed with HS256 algorithm, stored in HTTP-only cookies
- **Cookie Security** - `httpOnly: true`, `secure: true` (production), `sameSite: 'lax'`
- **Expiration** - 7-day token lifetime with automatic refresh
- **Secret Key** - Configurable via `JWT_SECRET` environment variable

### Route Protection
- **Next.js Middleware** - Automatic authentication on all protected routes
- **Role-Based Access** - TRADER and ADMIN roles with separate dashboards
- **Session Validation** - `/api/auth/me` endpoint checks token validity and user existence
- **Redirect Handling** - Preserves intended destination via `?redirect=/path` query parameter

### Route Access Matrix

| Route Pattern | Public | TRADER | ADMIN |
|---------------|--------|--------|-------|
| `/`, `/login`, `/signup` |  |  |  |
| `/dashboard/user/*` |  |  |  |
| `/kyc`, `/challenge-plans`, `/payments/*` |  |  |  |
| `/api/challenges/*`, `/api/kyc/*`, `/api/payment/*` |  |  |  |
| `/dashboard/admin/*` |  |  |  |
| `/api/admin/*` |  |  |  |

### Security Features
- **Password Hashing** - bcryptjs with salt rounds (bcrypt cost factor: 10)
- **SQL Injection Protection** - Prisma's parameterized queries
- **XSS Protection** - HTTP-only cookies prevent client-side JS access
- **CSRF Protection** - SameSite cookie attribute

##  API Endpoints Reference

### Authentication APIs
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/signup` | Create new user account |  |
| POST | `/api/auth/login` | Login and receive JWT cookie |  |
| POST | `/api/auth/logout` | Clear session cookie |  |
| GET | `/api/auth/me` | Get current user session data |  |

### KYC APIs
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/kyc/submit` | Submit KYC (auto-approved) |  TRADER |

### Challenge APIs
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/challenges/plans` | List all challenge plans |  TRADER |
| POST | `/api/challenges/select` | Select challenge plan |  TRADER |
| GET | `/api/challenges/selection` | Get user's selection |  TRADER |
| GET | `/api/challenges/status/[id]` | Get challenge metrics |  TRADER |
| POST | `/api/challenges/evaluate` | Evaluate challenge pass/fail |  TRADER |
| GET | `/api/challenges/next-level` | Check progression eligibility |  TRADER |

### Payment APIs
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/payment/mock` | Process mocked payment |  TRADER |

### Admin APIs
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/admin/users` | List users (with filters/pagination) |  ADMIN |
| GET | `/api/admin/challenges/overview` | Platform analytics and statistics |  ADMIN |
| GET/POST | `/api/admin/kyc` | KYC management and approval |  ADMIN |
| GET/POST | `/api/admin/settings` | Platform settings management |  ADMIN |

### Trading APIs
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/trading/market-data` | List available scrips with current mock LTP | TRADER |
| GET | `/api/trading/market-data/[scrip]` | Fetch snapshot for a specific scrip | TRADER |
| POST | `/api/trading/market-data/update` | Randomize mock LTPs (admin/cron utility) | ADMIN or CRON |
| POST | `/api/trading/execute` | Execute demo buy/sell trade | TRADER |
| POST | `/api/trading/square-off` | Close a single open trade | TRADER |
| POST | `/api/trading/auto-square-off` | Auto close all open trades at 3:30 PM IST | ADMIN or CRON |
| GET | `/api/trading/trades` | Fetch trade history with pagination | TRADER |
| GET | `/api/trading/summary` | Daily trading summary and portfolio snapshot | TRADER |

### API Response Format
All APIs follow a standardized response format:

**Success Response:**
```json
{
  "success": true,
  "data": { ... }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Error message here"
}
```

##  Environment Variables

Create a `.env` file in the root directory with the following variables:

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| DATABASE_URL | Yes | PostgreSQL connection string | postgresql://user:pass@host:5432/finloom?schema=public |
| JWT_SECRET | Yes | Secret key for JWT signing (32+ chars) | Generate with openssl rand -base64 32 |
| CRON_SECRET | Optional | Shared secret header for cron-triggered trading tasks | demo-trading-cron-secret |
| NODE_ENV | Yes | Environment mode | development or production |

**Security Note:** Never commit `.env` to version control. Use `.env.example` as a template.

## � Deployment

### Vercel Deployment (Recommended)

1. **Prepare Production Database**
   - Create PostgreSQL database on [Neon](https://neon.tech), [Railway](https://railway.app), or [Supabase](https://supabase.com)
   - Run migrations: `DATABASE_URL="your-prod-url" npx prisma migrate deploy`
   - Seed database: `DATABASE_URL="your-prod-url" npm run seed`

2. **Deploy to Vercel**
   - Connect GitHub repository to Vercel
   - Set environment variables in Vercel dashboard
   - Deploy: `vercel --prod` or push to main branch

3. **Verify Deployment**
   - Test authentication flows
   - Check database connectivity at `/db-test`
   - Verify all features work end-to-end

See detailed deployment instructions in production documentation.

##  MVP Scope

###  Included in MVP
-  User registration and authentication (TRADER/ADMIN roles)
-  Mocked KYC process (auto-approval)
-  Challenge plan selection with progression system
-  Mocked payment processing (Razorpay simulation)
-  Demo trading account credentials
-  Mocked analytics dashboard with real-time metrics
-  Automated challenge evaluation (pass/fail system)
-  Admin dashboard with user management
-  Challenge level progression (sequential unlocking)
-  Role-based access control with middleware
-  Comprehensive error handling and validation

###  Not Included in MVP (Future Enhancements)
-  Real KYC verification integration
-  Live payment gateway (Razorpay/Stripe)
-  Real broker API integration
-  Live trading data feeds
-  Funded account management
-  Real payout processing
-  Email notification system
-  SMS notifications
-  Mobile application
-  Advanced analytics and reporting
-  Multi-language support

##  Known Issues & Limitations

- KYC is mocked with instant auto-approval (no real verification)
- Payment processing is simulated (no actual money transfer)
- Trading metrics are generated with mock data (no real broker integration)
- Demo credentials are randomly generated (not connected to real trading platform)
- Challenge evaluation uses mocked metrics (simulated trading activity)

##  Troubleshooting

### Common Issues

**Database Connection Errors:**
```bash
# Ensure PostgreSQL is running and DATABASE_URL is correct
npx prisma db pull  # Test connection
```

**Prisma Client Not Generated:**
```bash
# Manually generate Prisma Client
npx prisma generate
```

**Build Errors:**
```bash
# Clear Next.js cache and rebuild
rm -rf .next
npm run build
```

**Port Already in Use:**
```bash
# Run on different port
npm run dev -- -p 3001
```

**Migration Issues:**
```bash
# Reset and reapply migrations (️ deletes all data)
npx prisma migrate reset
```

##  Additional Resources

- **[Next.js Documentation](https://nextjs.org/docs)** - Framework documentation
- **[Prisma Documentation](https://www.prisma.io/docs)** - ORM guide
- **[Material-UI Documentation](https://mui.com/material-ui/)** - Component library
- **[Vercel Deployment Guide](https://vercel.com/docs)** - Hosting platform

##  License

This project is private and proprietary. All rights reserved.

##  Author

**Dattaprasad R Ekavade**  
GitHub: [@dattaprasad-r-ekavade](https://github.com/dattaprasad-r-ekavade)

---

**Built with ️ using Next.js 16, TypeScript, Prisma, and Material-UI**




