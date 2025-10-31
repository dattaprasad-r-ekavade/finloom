# Finloom - Prop Trading Challenge Platform

A modern, full-stack prop trading firm challenge platform built with Next.js 16, TypeScript, Prisma, and PostgreSQL. Finloom enables traders to participate in evaluation challenges and admins to manage users and monitor platform performance.

## 🚀 Features

### For Traders
- **User Authentication** - Secure JWT-based authentication with HTTP-only cookies
- **KYC Verification** - Mocked auto-approval KYC process for rapid onboarding
- **Challenge Plans** - Three challenge levels with varying account sizes and targets
- **Payment Processing** - Mocked Razorpay payment integration
- **Challenge Monitoring** - Real-time dashboard with P&L tracking, metrics, and progress indicators
- **Automated Evaluation** - Rule-based challenge evaluation system (profit targets, drawdowns, violations)
- **Challenge Progression** - Sequential level unlocking based on challenge completion
- **Demo Credentials** - Simulated trading account credentials for external platform integration

### For Admins
- **Admin Dashboard** - Platform-wide statistics, revenue tracking, and user analytics
- **User Management** - Comprehensive user listing with search, filters, and pagination
- **Challenge Oversight** - Monitor active challenges, pass rates, and completion metrics
- **Role-Based Access** - Separate admin and trader routes with middleware protection

## 🛠️ Tech Stack

### Frontend
- **Next.js 16** - React framework with App Router and Turbopack
- **TypeScript 5** - Type-safe development
- **Material-UI v7** - Component library with custom theme
- **Recharts** - Data visualization for dashboards
- **Zustand** - State management for authentication

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **Prisma 6** - Type-safe ORM for database operations
- **PostgreSQL** - Production database (compatible with Neon)
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT authentication

### Development
- **ESLint** - Code linting with Next.js config
- **PostCSS** - CSS processing
- **Git** - Version control

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- PostgreSQL database (or Neon account)
- npm/yarn/pnpm

### Steps

1. **Clone the repository**
```bash
git clone https://github.com/dattaprasad-r-ekavade/finloom.git
cd finloom
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**

Create a `.env` file in the root directory (see `.env.example`):
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/finloom?schema=public&sslmode=require"

# JWT Secret (generate a secure random string)
JWT_SECRET="your-secure-jwt-secret-here"

# Node Environment
NODE_ENV="development"
```

4. **Set up the database**
```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Seed the database with challenge plans
npm run seed
```

5. **Run the development server**
```bash
npm run dev
```

6. **Open the application**

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## 🗄️ Database Setup

### PostgreSQL Configuration

The application uses Prisma with PostgreSQL. You can use a local PostgreSQL instance or a cloud provider like [Neon](https://neon.tech).

### Database Schema

The database includes the following main models:
- **User** - User accounts (TRADER/ADMIN roles)
- **MockedKYC** - Auto-approved KYC records
- **ChallengePlan** - Challenge level definitions (3 levels)
- **UserChallenge** - User challenge enrollments with status tracking
- **MockedPayment** - Simulated payment transactions
- **ChallengeMetrics** - Daily trading metrics for challenges

### Seed Data

Run the seed script to populate challenge plans:
```bash
npm run seed
```

This creates three challenge levels:
- **Level 1**: ₹10 Lakh account, 8% profit target, ₹9,999 fee
- **Level 2**: ₹25 Lakh account, 8% profit target, ₹19,999 fee
- **Level 3**: ₹50 Lakh account, 8% profit target, ₹29,999 fee

## 🧪 Testing

### Database Connection Test

Visit [http://localhost:3000/db-test](http://localhost:3000/db-test) to verify database connectivity.

### Manual Testing Flow

**Trader Flow:**
1. Sign up at `/signup` (choose TRADER role)
2. Complete KYC at `/kyc`
3. Select a challenge plan at `/challenge-plans`
4. Complete mocked payment at `/payments/mock`
5. View challenge dashboard at `/dashboard/user`
6. Monitor challenge at `/dashboard/user/challenge`

**Admin Flow:**
1. Sign up at `/signup` (choose ADMIN role)
2. View platform stats at `/dashboard/admin`
3. Manage users at `/dashboard/admin/users`

## 📝 Scripts

```bash
# Development
npm run dev          # Start dev server with Turbopack
npm run build        # Build production bundle
npm run start        # Start production server
npm run lint         # Run ESLint

# Database
npm run seed         # Seed database with challenge plans
npx prisma studio    # Open Prisma Studio GUI
npx prisma migrate dev # Create new migration
```

## 🎨 Project Structure

```
finloom/
├── prisma/
│   ├── schema.prisma        # Database schema
│   ├── seed.js              # Seed script
│   └── migrations/          # Database migrations
├── src/
│   ├── app/                 # Next.js App Router pages
│   │   ├── api/             # API routes
│   │   ├── dashboard/       # Dashboard pages
│   │   ├── login/           # Login page
│   │   ├── signup/          # Signup page
│   │   ├── kyc/             # KYC form page
│   │   └── ...
│   ├── components/          # React components
│   ├── lib/                 # Utilities
│   │   ├── prisma.ts        # Prisma client
│   │   ├── jwt.ts           # JWT utilities
│   │   ├── validation.ts    # Form validation
│   │   └── apiResponse.ts   # API error handlers
│   ├── store/               # Zustand stores
│   ├── theme/               # MUI theme configuration
│   └── middleware.ts        # Next.js middleware (auth)
├── public/                  # Static assets
├── .env                     # Environment variables (create from .env.example)
├── .env.example             # Environment template
├── next.config.ts           # Next.js configuration
├── tsconfig.json            # TypeScript configuration
└── package.json             # Dependencies
```

## 🔐 Authentication & Authorization

- **JWT Tokens** - Stored in HTTP-only cookies (7-day expiration)
- **Middleware Protection** - Automatic route protection with role-based access control
- **Session Management** - `/api/auth/me` endpoint for session validation
- **Public Routes** - Home, login, signup pages accessible without authentication
- **Protected Routes**:
  - Trader routes: `/dashboard/user`, `/kyc`, `/challenge-plans`, `/payments`
  - Admin routes: `/dashboard/admin`, `/dashboard/admin/users`

## 🎯 API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new account
- `POST /api/auth/login` - Login with credentials
- `POST /api/auth/logout` - Logout and clear session
- `GET /api/auth/me` - Get current user session

### KYC
- `POST /api/kyc/submit` - Submit KYC information (auto-approved)

### Challenges
- `GET /api/challenges/plans` - List all active challenge plans
- `POST /api/challenges/select` - Select a challenge plan
- `GET /api/challenges/selection` - Get user's current selection
- `GET /api/challenges/status/[id]` - Get challenge status with metrics
- `POST /api/challenges/evaluate` - Evaluate challenge (admin)
- `GET /api/challenges/next-level` - Get progression eligibility

### Payment
- `POST /api/payment/mock` - Process mocked payment

### Admin
- `GET /api/admin/users` - List users with filters and pagination
- `GET /api/admin/challenges/overview` - Platform-wide statistics

## 🚦 Environment Variables

See `.env.example` for required environment variables:

- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret key for JWT signing (generate with `openssl rand -base64 32`)
- `NODE_ENV` - Environment mode (`development` or `production`)

## 📄 License

This project is private and proprietary. All rights reserved.

## 👥 Author

**Dattaprasad R Ekavade**
- GitHub: [@dattaprasad-r-ekavade](https://github.com/dattaprasad-r-ekavade)

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org)
- UI components from [Material-UI](https://mui.com)
- Database ORM by [Prisma](https://prisma.io)
- Charts powered by [Recharts](https://recharts.org)

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
