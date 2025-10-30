# User Flow Documentation

## Application Overview

This is a **Prop Trading Firm Challenge Platform** that allows traders to prove their skills through evaluation challenges and get funded with real capital. The platform manages the complete lifecycle from registration through funded trading and payouts.

---

##  USER SIDE FLOW

### 1. Registration Stage
**User Action:** Sign up + KYC  
**System Action:** Create user ID

**Development Scope:**
- User registration form with email/password authentication
- KYC (Know Your Customer) integration
  - ID verification (Aadhaar, PAN, Passport)
  - Address proof
  - Photo verification
- Email verification workflow
- Database: User table with fields for personal info, KYC status, verification documents
- File upload system for KYC documents
- Integration with KYC verification service (optional third-party)

**Technical Requirements:**
- Secure authentication (JWT/Session)
- Password hashing (bcrypt)
- File storage for documents (AWS S3/local storage)
- Email service integration (SendGrid/SMTP)

---

### 2. Choose Plan Stage
**User Action:** Select challenge  
**System Action:** Show details & rules

**Development Scope:**
- Challenge plan listing page with filtering/sorting
- Plan cards displaying:
  - Challenge fee amount
  - Profit target percentage
  - Maximum loss limit
  - Maximum daily loss limit
  - Challenge duration
  - Allowed instruments (Equity/F&O/Crypto)
  - Profit split percentage
- Detailed plan view with complete rules and conditions
- Database: Challenge Plans table with all plan configurations

**Technical Requirements:**
- Dynamic pricing display
- Plan comparison feature
- Terms & conditions modal
- Plan availability status

---

### 3. Payment Stage
**User Action:** Pay fee  
**System Action:** Generate challenge account

**Development Scope:**
- Payment gateway integration (Razorpay/Stripe/PayPal)
- Payment processing workflow
- Order creation and tracking
- Payment confirmation page
- Invoice generation
- Database: Payments table (transaction ID, amount, status, timestamp)
- Automatic challenge account creation on successful payment
- Email notification with challenge account credentials

**Technical Requirements:**
- Secure payment handling
- Transaction logging
- Refund mechanism (if applicable)
- Payment status webhooks
- Error handling for failed payments

---

### 4. Trade Stage (Demo)
**User Action:** Trade in demo  
**System Action:** Track metrics via API

**Development Scope:**
- Trading dashboard with real-time market data
- Integration with broker API for demo account
- Order placement system (Buy/Sell)
- Position management
- Real-time P&L tracking
- Trade history log
- Challenge progress indicators:
  - Current profit/loss
  - Daily loss tracker
  - Profit target progress bar
  - Days remaining counter
  - Maximum drawdown indicator
- Database: Trades table (symbol, entry/exit, quantity, P&L, timestamp)

**Technical Requirements:**
- WebSocket for real-time data updates
- Broker API integration (Zerodha/Interactive Brokers/MetaTrader)
- Order execution system
- Risk management calculations
- Session management

---

### 5. Evaluation Stage
**User Action:** Pass/fail check  
**System Action:** Update dashboard

**Development Scope:**
- Automated rule engine that monitors:
  - Profit target achievement
  - Daily loss violations
  - Maximum drawdown violations
  - Trading day requirements
  - Consistency rules
- Challenge completion screen
- Pass/Fail notification system
- Performance report generation
- Email notification of results
- Database: Challenge Results table (userId, challengeId, status, finalPnL, violations)

**Technical Requirements:**
- Background job/cron for continuous monitoring
- Rule violation detection algorithm
- Dashboard status updates
- Historical performance charts
- Violation logging

---

### 6. Funded Phase
**User Action:** Trade real  
**System Action:** Track PnL

**Development Scope:**
- Funded account dashboard (similar to demo but with real account)
- Real money broker API integration
- Live account credentials provisioning
- Enhanced risk monitoring
- Real-time PnL tracking
- Scaling plan progression (if applicable)
- Database: Funded Accounts table (userId, accountBalance, activeStatus, fundedDate)

**Technical Requirements:**
- Secure real account management
- Enhanced risk controls
- Real-time position monitoring
- Stop-loss enforcement
- Account suspension mechanism for rule violations

---

### 7. Payout Stage
**User Action:** Request profit  
**System Action:** Process via admin

**Development Scope:**
- Payout request form
- Bank account details management
- Profit calculation (user share percentage)
- Payout request queue
- Payout history tracking
- Email notification on payout approval/rejection
- Database: Payouts table (userId, amount, requestDate, status, processedDate)

**Technical Requirements:**
- Withdrawal limits
- Payout schedule rules
- Admin approval workflow
- Payment processing integration
- Tax documentation (if required)

---

##  ADMIN SIDE FLOW

### 1. Admin Dashboard Overview
**Purpose:** Centralized monitoring and analytics

**Development Scope:**
- Comprehensive admin dashboard with:
  - Total users count (registered, active, funded)
  - Active challenges statistics
  - Pass/Fail ratio metrics
  - Total funded capital exposure
  - Upcoming payouts summary
  - Revenue analytics
  - Plan conversion rates
  - Retention statistics
- Real-time updates using WebSocket/polling
- Data visualization (charts, graphs)
- Date range filters for analytics

**Technical Requirements:**
- Database aggregation queries
- Caching for performance
- Role-based access control (RBAC)
- Multi-admin support
- Activity logging

---

### 2. Challenge Control Panel
**Purpose:** Create and manage challenge plans

**Development Scope:**
- Challenge plan creation form with fields:
  - Plan name and description
  - Account size
  - Profit target percentage
  - Maximum loss percentage
  - Maximum daily loss percentage
  - Challenge fee amount
  - Duration (days)
  - Allowed instruments (Equity/F&O/Crypto)
  - Number of trading days required
  - Profit split ratio
  - Scaling plan options
- Plan editing functionality
- Plan activation/deactivation
- Plan duplication feature
- Database: Challenge Plans table

**Technical Requirements:**
- Form validation
- Plan versioning (track changes)
- Soft delete for plans with active users
- Plan pricing tiers

---

### 3. User Management
**Purpose:** Complete user lifecycle management

**Development Scope:**
- User listing with search and filters
- User detail view showing:
  - Personal information
  - KYC status and documents
  - Payment history
  - Challenge history
  - Current challenge status
  - Funded account status
  - Violation history
- Actions available:
  - Approve/Reject KYC
  - Assign challenge accounts
  - Revoke/Suspend accounts
  - Reset passwords
  - Extend challenge duration
  - View trade history
  - Add notes/comments
- Bulk actions for user management

**Technical Requirements:**
- Advanced search with multiple filters
- Pagination for large datasets
- Export to CSV/Excel
- Admin action audit trail

---

### 4. Broker / API Integration
**Purpose:** Connect with trading platforms

**Development Scope:**
- Broker configuration panel
- API credentials management (encrypted storage)
- Multiple broker support:
  - Zerodha
  - Interactive Brokers
  - MetaTrader 4/5
  - Other brokers
- Account creation automation:
  - Demo account generation
  - Real account provisioning
- Data sync configuration
- API health monitoring
- Test connection functionality

**Technical Requirements:**
- Secure credential storage (encryption)
- API rate limit handling
- Error handling and retry logic
- Broker API abstraction layer
- Fallback mechanisms

---

### 5. Monitoring & Rule Engine
**Purpose:** Automated compliance and risk management

**Development Scope:**
- Real-time monitoring system that checks:
  - Daily loss limit violations
  - Maximum drawdown breaches
  - Challenge duration expiration
  - Profit target achievement
  - Trading rules compliance
  - Consistency requirements
- Alert system:
  - Email alerts to admin
  - Dashboard notifications
  - User notifications
- Automated actions:
  - Auto-fail accounts on violation
  - Auto-pass on target achievement
  - Account suspension
- Violation logging and history
- Manual override capability

**Technical Requirements:**
- Background workers/schedulers (cron jobs)
- Real-time event processing
- WebSocket notifications
- Queue system for scalability
- Configurable rule parameters

---

### 6. Evaluation & Funded Upgrade
**Purpose:** Review and approve trader progression

**Development Scope:**
- Evaluation queue dashboard
- User performance review interface showing:
  - Complete trade log
  - P&L curve/chart
  - Drawdown analysis
  - Winning/losing trade ratio
  - Average profit/loss
  - Best/worst trades
  - Rule compliance summary
- One-click approval/rejection
- Automated funded account creation on approval
- Notification to user
- Database: Evaluations table

**Technical Requirements:**
- Performance calculation algorithms
- Chart generation libraries
- Bulk approval functionality
- Evaluation criteria templates

---

### 7. Payout & Accounting
**Purpose:** Manage trader withdrawals and firm finances

**Development Scope:**
- Payout request queue
- Payout approval interface showing:
  - User details
  - Requested amount
  - Available balance
  - Profit split calculation
  - Previous payouts
- Approval/Rejection workflow
- Payout processing:
  - Manual bank transfer
  - Automated payment gateway
- Accounting dashboard:
  - Total payouts processed
  - Pending payouts
  - Profit sharing records
  - Revenue vs. payout analysis
- Export functionality (Excel/CSV)
- Tax reporting (Form generation)

**Technical Requirements:**
- Payment gateway integration for payouts
- Accounting calculations
- Transaction reconciliation
- Report generation
- Audit trail

---

### 8. Analytics & Risk Control
**Purpose:** Business intelligence and risk management

**Development Scope:**
- Comprehensive analytics dashboard:
  - Conversion funnel (Signup → Paid → Pass → Funded)
  - Challenge success/failure distribution
  - Revenue breakdown by plan
  - User acquisition trends
  - Retention and churn rates
  - Average time to pass challenge
  - Popular trading instruments
  - Peak trading hours
- Risk analytics:
  - Total capital exposure
  - Funded trader performance
  - Win rate distribution
  - Firm P&L by trader
  - Risk-adjusted returns
- Broker performance comparison
- Export and scheduling of reports
- Custom date range analysis

**Technical Requirements:**
- Data warehousing
- Analytics queries optimization
- Visualization libraries (Chart.js, D3.js)
- Scheduled report generation
- Data export in multiple formats

---

##  DATABASE SCHEMA OVERVIEW

### Core Tables Required:

1. **Users**
   - id, email, password_hash, name, phone, kyc_status, created_at, updated_at

2. **KYC_Documents**
   - id, user_id, document_type, file_url, verification_status, verified_at

3. **Challenge_Plans**
   - id, name, description, account_size, profit_target_pct, max_loss_pct, daily_loss_pct, fee, duration_days, instruments_allowed, profit_split, is_active

4. **User_Challenges**
   - id, user_id, plan_id, account_credentials, start_date, end_date, status, final_pnl, created_at

5. **Payments**
   - id, user_id, challenge_id, amount, payment_method, transaction_id, status, paid_at

6. **Trades**
   - id, user_id, challenge_id, symbol, side, quantity, entry_price, exit_price, pnl, timestamp

7. **Challenge_Metrics**
   - id, challenge_id, date, daily_pnl, cumulative_pnl, max_drawdown, trades_count

8. **Funded_Accounts**
   - id, user_id, account_number, balance, broker, status, funded_at

9. **Payouts**
   - id, user_id, amount, requested_at, processed_at, status, admin_notes

10. **Violations**
    - id, challenge_id, violation_type, description, timestamp

11. **Admin_Users**
    - id, email, password_hash, role, permissions, created_at

12. **System_Logs**
    - id, entity_type, entity_id, action, admin_id, timestamp, details

---

## ️ TECHNOLOGY STACK RECOMMENDATIONS

### Frontend:
- **Framework:** Next.js 14+ (React)
- **UI Library:** Material-UI / Tailwind CSS
- **State Management:** Zustand (already in use)
- **Charts:** Chart.js or Recharts
- **Real-time:** Socket.io client

### Backend:
- **API:** Next.js API Routes / Express.js
- **Database:** PostgreSQL with Prisma ORM (already in use)
- **Authentication:** NextAuth.js / JWT
- **Caching:** Redis
- **Queue:** Bull / BullMQ
- **WebSocket:** Socket.io

### Third-Party Services:
- **Payment:** Razorpay / Stripe
- **Email:** SendGrid / AWS SES
- **Storage:** AWS S3 / Cloudinary
- **KYC:** Aadhaar API / third-party KYC service
- **Broker APIs:** Zerodha Kite, Interactive Brokers, MetaTrader

### DevOps:
- **Hosting:** Vercel / AWS / DigitalOcean
- **CI/CD:** GitHub Actions
- **Monitoring:** Sentry / LogRocket
- **Analytics:** Google Analytics / Mixpanel

---

##  SECURITY CONSIDERATIONS

1. **Authentication & Authorization:**
   - Secure JWT token management
   - Role-based access control (User, Admin, Super Admin)
   - Two-factor authentication for admin
   - Session management

2. **Data Protection:**
   - Encryption at rest for sensitive data
   - HTTPS/TLS for all communications
   - PCI DSS compliance for payment data
   - GDPR compliance for user data

3. **API Security:**
   - Rate limiting
   - API key encryption
   - Broker credentials in environment variables/secrets manager
   - Input validation and sanitization

4. **Trading Security:**
   - Order validation before execution
   - Position size limits
   - Account balance checks
   - Suspicious activity detection

---

##  ADDITIONAL FEATURES TO CONSIDER

1. **User Features:**
   - Trading journal/notes
   - Performance analytics dashboard
   - Social features (leaderboard, community)
   - Educational resources
   - Mobile app (React Native)
   - Push notifications
   - Referral program

2. **Admin Features:**
   - Multi-language support
   - White-label customization
   - A/B testing for plans
   - Automated marketing campaigns
   - Customer support ticketing
   - Live chat integration
   - Backup and disaster recovery

3. **Advanced Trading:**
   - Copy trading for funded traders
   - Algorithmic trading support
   - Trading bots integration
   - Multiple accounts per user
   - Portfolio diversification rules

---

##  DEVELOPMENT PHASES

### Phase 1: MVP (Minimum Viable Product)
- User registration and authentication
- Basic KYC workflow
- Single challenge plan
- Payment integration
- Demo trading with manual broker account
- Basic admin dashboard
- Manual evaluation and approval

### Phase 2: Automation
- Automated rule engine
- Real-time monitoring
- Multiple challenge plans
- Broker API integration
- Automated account creation
- Enhanced analytics

### Phase 3: Scaling
- Funded account management
- Payout system
- Advanced analytics
- Mobile app
- Multiple broker support
- Scaling plans

### Phase 4: Advanced Features
- Social features
- Educational content
- Advanced trading tools
- White-label solution
- API for third-party integrations

---

##  SUCCESS METRICS

1. **User Metrics:**
   - Registration to payment conversion rate
   - Challenge pass rate
   - Average time to complete challenge
   - Funded trader retention rate

2. **Business Metrics:**
   - Monthly Recurring Revenue (MRR)
   - Customer Acquisition Cost (CAC)
   - Lifetime Value (LTV)
   - Profit margin per funded trader

3. **Technical Metrics:**
   - API uptime
   - Page load time
   - Trade execution speed
   - System error rate

---

##  COMPLIANCE & LEGAL

1. **Regulatory Requirements:**
   - SEBI regulations (if operating in India)
   - FINRA/SEC compliance (if operating in US)
   - AML (Anti-Money Laundering) checks
   - KYC compliance

2. **Terms & Policies:**
   - Terms of Service
   - Privacy Policy
   - Risk Disclosure
   - Refund Policy
   - Challenge Rules Document

3. **Documentation:**
   - API documentation
   - User guides
   - Trading rules
   - FAQ section

---

##  CONCLUSION

This application is a comprehensive prop trading evaluation platform that requires:
- **Robust trading infrastructure** with real-time data processing
- **Secure authentication and authorization** systems
- **Automated compliance monitoring** and risk management
- **Seamless payment integration** for fees and payouts
- **Advanced analytics** for both users and admins
- **Scalable architecture** to handle multiple concurrent traders

The development requires expertise in:
- Full-stack web development (Next.js, React)
- Financial APIs and broker integration
- Real-time data processing
- Database design and optimization
- Security best practices
- Payment gateway integration
- DevOps and cloud infrastructure

**Estimated Development Timeline:** 4-6 months for MVP, 12-18 months for complete platform with all advanced features.

**Team Requirements:**
- 2-3 Full-stack developers
- 1 DevOps engineer
- 1 UI/UX designer
- 1 QA engineer
- 1 Project manager
- Part-time: Legal consultant, Financial compliance expert
