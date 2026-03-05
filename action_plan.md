# Finloom — Live-Ready Action Plan

> **Scope of this app:** Challenge platform only — signup, KYC, payment, simulated trading evaluation, pass/fail determination.  
> **Out of scope (separate platform):** Funded account provisioning, live trading, payout management, funded trader dashboard.  
> Target: Indian retail traders | Challenge: mock simulation | On pass: trader directed to funded platform  
> Priority order: P0 = launch blocker · P1 = pre-launch must-have · P2 = first 30 days post-launch

---

## 1. Trading Model Clarification (Architecture Decision)

### What this app does vs. what the funded platform does

| Responsibility | Finloom (this app) | Funded Platform (separate) |
|---|---|---|
| Trading during evaluation | **Simulated / mock** — live NSE/BSE prices, no real orders | Real orders via partner broker |
| Account type | Platform simulation account | Partner broker sub-account |
| Pass/fail determination | ✅ Finloom | — |
| Dashboard & analytics | Challenge metrics only | Funded trader P&L, stats |
| Payouts & profit split | ❌ Not here | ✅ Funded platform |

**Implication:** The trading terminal in Finloom never executes real orders. It uses live prices for accurate P&L simulation only. When a trader passes, Finloom marks the challenge as PASSED, shows a success screen, and directs the trader to the separate funded platform for account setup and live trading. Finloom does not provision broker accounts or handle payouts.

---

## Phase 0 — Foundation Fixes (P0 — Immediate, before any marketing)

### 0.1 Remove all mock-payment code paths

**Current state:** Payment is a fake "confirm" button with no real transaction.  
**Action:**
- [x] Integrate **Razorpay Payment Gateway** (Standard Checkout or Orders API)
  - Use `razorpay` Node SDK
  - Create `/api/payment/razorpay/create-order` → returns `order_id` ✅
  - Create `/api/payment/razorpay/verify` → validates `razorpay_signature` with HMAC-SHA256 ✅
  - On verified payment, activate challenge (same logic as current mock route) ✅
  - Retire `/app/payments/mock/` page entirely (replace with real Razorpay Checkout page) ✅
- [x] Store `razorpayOrderId`, `razorpayPaymentId`, `razorpaySignature` in `MockedPayment` ✅ (schema updated)
- [ ] Send payment confirmation email (see §0.4)
- [ ] Generate GST invoice PDF (see §3.3)

**Env vars to add:**
```
RAZORPAY_KEY_ID=rzp_live_...
RAZORPAY_KEY_SECRET=...
RAZORPAY_WEBHOOK_SECRET=...
```

---

### 0.2 KYC — Manual admin review (no third-party integration)

**Approach:** Trader submits PAN details via the existing KYC form. Admin reviews and approves/rejects manually within 1–2 business days. No external API integration required.

**Current state:** Auto-approve flag exists but no proper admin review UI or rejection reason.  
**Action:**
- [x] Update KYC form to collect: Full name, PAN number, date of birth, address, phone number ✅
- [ ] Add PAN card photo upload field (store securely in cloud storage, e.g. S3/Cloudflare R2) — deferred (needs cloud storage setup)
- [x] Remove `autoApproveKyc` flag from `AdminSettings` — removed from submit logic ✅
- [x] Build **Admin KYC Review Queue** ✅
  - [x] List all pending KYC submissions with trader name, PAN, submitted date ✅
  - [ ] View submitted PAN photo and entered details side-by-side — deferred (no photo upload yet)
  - [x] Approve button → sets status to `APPROVED`, records `approvedBy` + `approvedAt` ✅
  - [x] Reject button → requires rejection reason text → sets status to `REJECTED` ✅
  - [x] Target SLA shown on admin screen: **approve or reject within 2 business days** ✅
- [ ] Email trader on approval and rejection (see §0.4)
- [ ] Block challenge enrolment until KYC status = `APPROVED` — API-level guard (partially in create-order route)
- [ ] Store PAN number encrypted at rest; never log it — deferred

**No new env vars needed for this section.**

---

### 0.3 Live market data feed for mock trading

**Current state:** `mockMetrics.ts` generates random P&L curves. No real prices.  
**Action:**
- [ ] Connect to **AngelOne SmartAPI** (already partially scaffolded in `/lib/angelone.ts`) for live NSE/BSE quotes
  - WebSocket feed for LTP updates during market hours (09:15–15:30 IST)
  - REST fallback for OHLC snapshots
  - Cache snapshots in Redis/DB to serve the terminal without hammering the API
- [x] Update `market-data/[scrip]` route to use `getLivePrice()` from AngelOne instead of `mockedMarketData` ✅
- [ ] Replace `mockMetrics.ts` usage in challenge status API with real `Trade`-based P&L calculation
  - `currentPnl` on `UserChallenge` = sum of realized + unrealized P&L from `Trade` table
  - `ChallengeMetrics` records written from real trade data, not randomly generated
- [ ] Auto square-off at **15:20 IST** (10 min before close, safer than 15:30)
- [ ] Market hours gate: disable order form outside 09:15–15:30 IST on weekdays, show market-closed banner

---

### 0.4 Transactional email system

**Current state:** No emails sent at any point.  
**Action:**
- [ ] Integrate **Nodemailer + AWS SES** or **Resend** (simpler, developer-friendly)
- [ ] Email triggers:
  - Signup welcome + email verification OTP
  - KYC submitted confirmation
  - KYC approved / rejected (with reason)
  - Payment confirmation with invoice PDF attached
  - Challenge activated
  - Daily P&L summary (optional, toggle in settings)
  - Challenge passed 🎉 — congratulations + clear CTA directing trader to the funded platform (link + instructions provided by the funded platform team)
  - Challenge failed — with cool-down period, reason summary, and retry / next-level option
  - Risk violation alert (daily loss limit breached warning at 80% threshold)
- [ ] Add email verification step at signup (OTP, 10-minute expiry using `otplib` — already installed)

**Env vars to add:**
```
RESEND_API_KEY=re_...       # or AWS_SES_REGION / credentials
EMAIL_FROM=noreply@finloom.in
```

---

### 0.5 Password reset flow

**Current state:** No forgot-password route exists.  
**Action:**
- [x] Add `/forgot-password` page: email input → send reset link ✅
- [x] Add `/reset-password?token=xxx` page: new password form ✅
- [x] Store `passwordResetToken` (hashed), `passwordResetExpiry` on `User` model ✅ (schema updated)
- [x] Token expires in 15 minutes; single use ✅
- [ ] Send reset link via email — deferred until email system integrated (§0.4)

---

## Phase 2 — Landing Page Overhaul (P1)

### 2.1 Remove all hardcoded/fictional stats

**Current fictional stats to remove:**
- `+₹2.8M` Live Profit — remove entirely until real aggregated data exists
- `-₹320K` Drawdown Watch — remove
- `18 Pending Verifications` — remove

**Replace hero stats panel with honest messaging:**

| Replacement widget | Source |
|---|---|
| Challenge levels: ₹10L / ₹25L / ₹50L | Static — accurate |
| Profit split: up to 90% | Static — accurate |
| Evaluation duration: 30–60 days | Static — accurate |

> Once real users exist, replace with dynamic stats pulled from DB: "X traders funded", "₹Y total payout", "Z% pass rate"

---

### 2.2 Rewrite landing page copy for Indian traders

**Hero headline options:**
- *"Prove your edge. Trade with firm capital."*  
- *"India's prop trading evaluation platform. Pass the challenge, get funded."*

**Hero sub-headline:**
> Finloom evaluates your trading skill across NSE & BSE instruments. Pass the challenge, and you’ll be onboarded to our funded trading platform where you keep up to 90% of profits.

**Update feature cards** (current ones describe enterprise SaaS features Finloom doesn't have):

| Current (remove) | Replacement (accurate) |
|---|---|
| "Institutional Execution — sub-3ms routing" | "NSE & BSE Instruments — trade Equities, F&O across all challenge levels" |
| "Advanced Intelligence — anomaly detection" | "Real-time Risk Dashboard — live drawdown, daily loss, and profit tracking" |
| "Bank-Level Security — biometric SSO" | "Transparent Rules — clear profit targets and loss limits, no hidden conditions" |
| "Lightning Performance — GPU-accelerated" | "Structured Evaluation — 30 to 60-day challenges with automated pass/fail" |
| "Capital Allocation — funding rounds" | "Simulated Trading, Real Stakes — challenge P&L uses live NSE/BSE prices" |
| "Precision Reporting — audit-ready exports" | "Get Funded on Pass — successful traders are directed to our funded platform to start live trading" |

**Dashboard section copy** (currently describes features that don't exist):

*Trader Workspace:*
> Track your challenge P&L, daily limits, and trade history across simulated positions — powered by live market data.
- Daily P&L vs. target progress bar
- Real-time drawdown meter
- Trade log with entry/exit and realised P&L

*Admin Command Center:*
> Manage KYC approvals, monitor active challenges, and track pass/fail outcomes from a single dashboard.
- KYC review queue with approve/reject
- Challenge status overview (active, passed, failed)
- Pass result handoff tracking — confirm traders have been directed to the funded platform

**CTA section:**
> Ready to get funded? Start your evaluation today.  
> *(Button: Begin Challenge — routes to /signup)*

---

### 2.3 Add a "How It Works" section to the landing page

Four-step process graphic:

```
1. Sign Up & Complete KYC
   Verify your identity with PAN — reviewed by our team within 1–2 business days.

2. Choose a Challenge Plan
   Monthly plan or daily entry — pick ₹10L, ₹25L, or ₹50L account size and pay the fee.

3. Trade & Pass the Evaluation
   Hit the profit target without breaching daily loss or max drawdown limits.

4. Get Funded
   On passing, you'll be directed to our funded trading platform where a real broker account is set up for you. Trade live and keep up to 90% of profits.
```

---

### 2.4 Add a transparent FAQ section

Key questions to address (regulatory and trust-related for Indian audience):

- *Is this SEBI-regulated?* — Be honest about current regulatory status
- *What instruments can I trade?* — Equities, Futures, Options on NSE/BSE
- *What happens after I pass?* — You are directed to our funded trading platform (separate product) where a live broker account is set up for you
- *Are challenge fees refundable?* — Link to Refund Policy
- *What's in the profit split?* — Clear % per level
- *Can I use any trading strategy?* — Permitted strategies and prohibited practices

---

## Phase 3 — India-Specific Compliance & Operations

> Tasks ordered by when they must be done relative to launch.

### 3.1 Before launch — Legal & regulatory foundation

- [ ] Consult CA/legal counsel on SEBI classification (prop firm evaluation ≠ investment advisory)
- [ ] Ensure T&C clearly states: "All challenge trading is simulated. No real capital is deployed during the evaluation phase."
- [ ] Add **risk disclosure** banner on trading terminal and signup page
- [ ] Register entity under **IT Act 2000**; confirm data localisation requirements
- [ ] Register for **GST** if fees collected will exceed ₹20L/year (18% on services) — do this before first payment is collected

### 3.2 Before launch — Payment & invoicing

- [ ] Razorpay supports: UPI, PhonePe, GPay, Paytm, NEFT, IMPS, debit/credit cards, net banking — all enabled by default
- [ ] Show UPI as the primary payment option (highest conversion for Indian users)
- [ ] Add EMI option via Razorpay for higher-tier plans (₹19,999 and ₹29,999)
- [ ] Auto-generate **GST invoice PDF** on every successful payment
  - Include: GSTIN, trader name/address, HSN/SAC code, base amount + 18% GST, transaction ID
  - Email PDF to trader alongside payment confirmation
- [ ] Maintain Razorpay settlement records for GST filing (monthly)
- [ ] **TDS on payouts is out of scope** — handled by the funded platform

### 3.3 Before launch — Data & privacy

- [ ] Host database on **India region** (AWS ap-south-1 / Mumbai or Neon India endpoint)
- [ ] Draft **Privacy Policy** compliant with **DPDP Act 2023**
  - Consent checkbox at signup
  - Right to erasure request form in account settings
  - Data retention policy: 3 years for financial records, 1 year for session data
- [ ] PAN numbers stored encrypted at rest, never logged
- [ ] PAN card photos in private cloud bucket — accessed only via short-expiry signed URLs, never publicly accessible

### 3.4 Before launch — Market hours & calendar

- [ ] **Market hours gate:** disable order placement outside 09:15–15:30 IST on weekdays
- [ ] Show **IST clock** on trading terminal (not UTC)
- [ ] Seed **NSE holiday list** for current year into DB or config; block trading on holidays with a banner
- [ ] Auto square-off at **15:20 IST** (already planned in §0.3)
- [ ] Update holiday list at the start of each calendar year (admin task, not automated)

### 3.5 Within 30 days of launch — Customer support

- [ ] Add **WhatsApp Business** contact button (most preferred support channel in India)
- [ ] Publish FAQ / Help Centre (Notion public page is fine initially)
- [ ] Add **Grievance Officer** name, email, and address to contact page (required under Consumer Protection (E-Commerce) Rules)
- [ ] Define response SLAs and communicate them: KYC decisions ≤ 2 business days, payment disputes ≤ 48 hours

---

## Phase 4 — Pricing Model Expansion (P1)

### 4.1 Daily entry fee model

**Current state:** Only monthly challenge plans exist (fixed fee, fixed duration).  
**New model:** Traders can also enter a challenge by paying a **daily fee** — they are charged per trading day they participate, up to the challenge duration. This lowers the upfront barrier and suits traders who want to trade intermittently.

**How it works:**
- Trader selects a challenge plan and chooses **Daily Entry** pricing tier
- A daily fee is charged each day the trader places at least one trade (or simply each calendar trading day the challenge is active — define rule clearly in T&C)
- Maximum total cost = daily fee × duration days (capped; should be slightly higher than flat monthly fee to incentivise monthly plans)
- Razorpay UPI AutoPay / e-mandate used for recurring daily deduction

**Action:**
- [ ] Add `pricingType` enum to `ChallengePlan`: `MONTHLY | DAILY`  
  Or add a `dailyFee` field alongside `fee` (monthly) on the same plan — admin can set both, trader chooses at enrolment
- [ ] Add `pricingType` and `dailyFeeAccrued` to `UserChallenge` to track which model the trader enrolled under and total fees collected
- [ ] Update challenge plan selection UI: show both pricing options side-by-side with total cost comparison
- [ ] Razorpay integration for daily deduction:
  - Set up **UPI AutoPay / e-Mandate** via Razorpay Subscriptions API
  - Create subscription on enrolment; cancel on challenge end (pass/fail/expired)
  - Webhook: on each successful daily charge, record payment and continue challenge; on failed charge, pause challenge and notify trader
- [ ] Admin plan management UI (§5.6) must support setting both `fee` (monthly) and `dailyFee`
- [ ] Update GST invoicing to handle daily micro-invoices or a consolidated monthly invoice — confirm with CA
- [ ] Update landing page "How It Works" and pricing cards to show both options

**New DB fields:**
```prisma
// On ChallengePlan
dailyFee     Int?        // null = daily option not available for this plan

// On UserChallenge  
pricingType  PricingType @default(MONTHLY)
dailyFeeAccrued Int      @default(0)  // running total of daily fees charged
razorpaySubscriptionId String?        // for daily plan e-mandate

enum PricingType { MONTHLY DAILY }
```

---

### 4.2 BYOK — Bring Your Own AngelOne API Key (Optional)

**Context:** Traders who already have an AngelOne account can optionally connect it to Finloom. Their challenge trades will use their own AngelOne account for **live market data and order simulation** (still simulated — no real orders placed), giving them a more personalised and accurate experience (their own watchlists, margin data, etc.).

**This is optional.** Traders without their own key continue to use Finloom's shared AngelOne market data feed.

**Action:**
- [ ] Add **"Connect AngelOne" section** in trader account settings:
  - Input fields: Client ID, API Key, TOTP secret (or PIN)
  - On save: validate credentials against AngelOne SmartAPI (`/rest/auth/angelbroking/user/v1/loginByPassword`)
  - If valid: encrypt and store against user; show connected status with client name
  - Disconnect option: clears stored credentials
- [ ] Store credentials encrypted using existing `secretCrypto.ts`
- [ ] When placing simulated trades, if user has connected AngelOne key: use their session for LTP fetch (personalised); otherwise fall back to platform-level feed
- [ ] Clear disclaimer in UI: *"Your AngelOne credentials are used only to fetch market data for your challenge simulation. No real orders are placed on your account."*
- [ ] Admin view: see which traders have connected their own key (for support/debugging purposes only — credentials never visible to admin)

**New DB fields:**
```prisma
// On User
angeloneClientId     String?   // plaintext (non-sensitive)
angeloneCredEnc      String?   // encrypted { apiKey, totpSecret }
angeloneConnectedAt  DateTime?
```

**Env vars:** No new ones needed — existing `ENCRYPTION_SECRET` handles credential encryption.

---

## Phase 5 — Growth & Retention (P2 — Post-launch)

### 5.1 Referral program

- [ ] Unique referral code per user
- [ ] Referrer gets ₹500–₹1,000 credit on dashboard when referred user makes first payment
- [ ] Track: `referrals` table, `referralCode` on `User`
- [ ] Display referral stats and earnings in user dashboard

### 4.2 Challenge history & trader profile

- [ ] Trader profile page showing: all past challenges, pass/fail, P&L achieved, current streak
- [ ] Shareable "passed" certificate (PDF or image) for social proof — traders love posting on Twitter/X and trading communities
- [ ] Trader leaderboard (opt-in, anonymous by default)

### 4.3 Notifications

- [ ] In-app notification bell (challenge status changes, risk alerts, pass/fail results)
- [ ] WhatsApp notifications via WhatsApp Cloud API (optional opt-in)
- [ ] Daily P&L digest email (opt-in, sent at 16:00 IST)

> Payout notifications are handled by the funded platform, not here.

### 4.4 Pricing & promotions

- [ ] Admin panel: create discount coupons (% off or flat INR off)
- [ ] Runner promo: "Repeat attempt at 50% off if you fail" — drives re-enrolment
- [ ] Bundle: "Buy Level 1 + Level 2 together at 15% off"
- [ ] Seasonal offers: Diwali, New Year promotions

---

## Phase 6 — Technical Debt & Code Cleanup (Parallel with above)

### 6.1 Remove `demoAccountCredentials` from schema

- [ ] Create Prisma migration to drop `demoAccountCredentials` column from `UserChallenge`
- [ ] Remove field from all TypeScript types in `dashboard/user/page.tsx`, `challenge-plans/page.tsx`, `payments/mock/page.tsx`
- [ ] Remove from `/api/challenges/select/route.ts` and `/api/challenges/status/[id]/route.ts`
- [ ] Remove from `/api/payment/mock/route.ts` (retire this route — see §0.1)

### 6.2 Retire `mockMetrics.ts`

- [ ] Replace all imports of `mockMetrics.ts` with real trade-based calculation
- [ ] Delete file once no more references
- [ ] Add `MOCK_METRICS=false` env guard for local dev if needed during transition

### 6.3 Password reset (already in §0.5 — track here too)

### 6.4 JWT hardening

- [ ] Add refresh token flow (short-lived access token 15 min + long-lived refresh token 7 days, HTTP-only)
- [ ] Token revocation list in Redis for logout and security events
- [ ] Rate-limit login endpoint (5 attempts / 15 min per IP)

### 6.5 Prisma seed idempotency

- [ ] Wrap all `seed.js` creates in `upsert` to prevent duplicate challenge plans on re-run

### 6.6 Admin plan management UI

- [ ] Admin page: create/edit/deactivate challenge plans without code deploy
- [ ] Fields: name, account size, monthly fee, daily fee, profit target %, max loss %, daily loss %, duration, profit split, instruments, level

---

## Summary Sequence

```
Week 1–2   §0.4 Emails · §0.5 Password reset · §6.1–6.5 Tech debt cleanup
           §3.1 Legal/regulatory consult · §3.3 Data & privacy (DB region, privacy policy)
Week 3–4   §0.2 KYC admin review UI · §0.3 Live market data feed
Week 5–6   §0.1 Razorpay integration · §3.2 GST invoicing · §3.2 Indian payment UX
Week 7–8   §4.1 Daily entry fee model · §3.4 Market hours & holiday calendar
Week 9–10  §4.2 BYOK AngelOne key · §2.1–2.4 Landing page full rewrite
Week 11–12 §3.5 Customer support setup · §6.6 Admin plan management UI
Post-launch §5.1–5.4 Referral · Challenge history · Notifications · Promotions
```

---

## Environment Variables Checklist (complete set for production)

```env
# Database
DATABASE_URL=postgresql://...ap-south-1...

# Auth
JWT_SECRET=...
JWT_REFRESH_SECRET=...

# Razorpay (payments in)
RAZORPAY_KEY_ID=rzp_live_...
RAZORPAY_KEY_SECRET=...
RAZORPAY_WEBHOOK_SECRET=...

# Note: Razorpay Payouts not needed here — payouts are handled by the funded platform

# KYC — manual admin review, no API keys needed
# Cloud storage for PAN card photo uploads
STORAGE_BUCKET=finloom-kyc-docs
STORAGE_ACCESS_KEY=...
STORAGE_SECRET_KEY=...
STORAGE_REGION=ap-south-1        # keep data in India

# Email
RESEND_API_KEY=re_...
EMAIL_FROM=noreply@finloom.in

# Partner Broker (AngelOne)
ANGELONE_API_KEY=...
ANGELONE_CLIENT_ID=...
ANGELONE_CLIENT_SECRET=...

# Market Data
MARKET_DATA_WS_URL=wss://smartapisocket.angelone.in/...

# Encryption (already exists)
ENCRYPTION_SECRET=...

# App
NEXT_PUBLIC_APP_URL=https://finloom.in
FUNDED_PLATFORM_URL=https://funded.finloom.in   # URL shown on pass result screen & email
CRON_SECRET=...
```

---

*Last updated: March 5, 2026*
