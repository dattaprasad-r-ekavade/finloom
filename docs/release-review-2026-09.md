# Finloom: project review and India release plan

Initial review: 22 September 2026, checkout `99a92e3`. Engineering follow-up: 23 September 2026, branch `codex/historical-replay-ui-release`.

Strategy updated 23 September 2026: historical replay and paper trades on sessions at least 30 full days old are the planned launch data mode. The original code findings below remain a snapshot of the reviewed implementation; this document does not claim replay has been implemented.

## Confirmed product scope (founder clarification)

- Customers pay a subscription for simulated trading assessments. All trading profits and losses are virtual; participants receive no payment for them.
- Passing all stages earns a Finloom approval certificate, required to apply for a separate prop-desk job. Passing does not itself constitute hiring, capital allocation or a guaranteed income.
- Angel One integration is for internal development/testing. Production is planned around appropriately licensed NSE historical replay and paper trades on old sessions, with a minimum age of 30 full days. This supersedes the short-delay feed proposal. Obtain the relevant commercial display/replay/assessment rights; licensing and data age alone do not resolve every regulatory question.
- The release roadmap is therefore for assessment, certification and application eligibility. Customer trading payouts and live funded accounts are outside this application's confirmed scope. References to those features below describe existing marketing discrepancies or conditional future work, not requirements to add them.

This clarification materially reduces the direct simulation-for-cash concern. It does not establish a statutory exemption for mandatory paid certification tied to recruitment. Certificate issuance, verification, appeals and recruitment disclosures replace customer payout features as product priorities.

## Verdict and rating

**Current India paid-product release readiness: 4/10** (up from the 3/10 baseline review). The build and several high-risk account/payment paths have been repaired, and production now presents a preview-only learning and assessment offer. Finloom is still not ready to accept paid learners: licensed replay, final assessment rules, certificate lifecycle, operating policies and India model review remain open.

As a prototype, it is approximately **6/10**: there is substantial implementation across onboarding, dashboards, KYC review, challenges, charting, simulated trades, and broker data integration. This is not a visual-design rating; browser usability and accessibility were not tested in this review.

The release score is a judgment about readiness, not a percentage of code completed. Security and legal blockers cannot be averaged away by adding more features.

| Area | Score | Assessment |
| --- | ---: | --- |
| Product structure and feature coverage | 5/10 | Learning/replay positioning is clearer; replay, learning modules, certificate lifecycle and application eligibility are not implemented. |
| Architecture and maintainability | 5/10 | Sensible Next.js/Prisma foundation; business logic is spread across handlers and duplicated calculations. |
| Trading and evaluation integrity | 3/10 | Terminal result conflicts and P&L source were corrected; atomic risk, complete event history and replay correctness remain open. |
| Security and privacy | 3/10 | Login bootstrap and reset-token logging were removed; encrypted broker-secret writes and production data-collection gates were added. Key rotation, email recovery, MFA, privacy operations and audit remain open. |
| Payments and financial operations | 3/10 | Orders are persisted and captured payments are verified and atomically activated; production checkout is disabled pending launch gates. Webhooks, reconciliation, refunds and disputes remain open. |
| Testing and deployment reliability | 4/10 | Production build and TypeScript checks pass; lint has 8 warnings. No committed automated regression suite or CI pipeline found. |
| India regulatory and commercial readiness | 2/10 | Legal pages exist, but model approval, data rights, provider acceptance and operating evidence are unverified. |

**10/10 means a narrowly defined product that meets all release gates below and proves them in operation. It does not mean zero risk, unlimited scale, or guaranteed regulatory approval.**

## Review scope and verification

Reviewed source for authentication, authorization, payments, KYC, challenge selection/evaluation, trade execution/closing, market data, broker secrets, schema/migrations, public claims, and build configuration. Checked official India sources relevant to this product.

| Check performed | Result |
| --- | --- |
| `npm run lint` | Passed with 8 existing warnings and no errors. |
| `npx prisma validate` / `npx prisma generate` | Passed with Prisma 6.19.3; Prisma 7 config deprecation warning remains. |
| `npm run build` | Passed, including Next.js TypeScript validation and static page generation. |
| `npm audit --omit=dev` | Passed with 0 vulnerabilities after pinning the compatible `deepmerge-ts` 8.0.1 override under Prisma config. |
| Evaluation review | Reworked to use current challenge P&L plus daily-summary history and to return mutually exclusive terminal outcomes. No regression suite or production data run has verified every edge case. |
| Migration/source inspection | Added a forward migration for the identified reset, KYC, exchange, Razorpay and order fields. Migration was not applied to a database in this task. |
| Browser review | Local homepage opened and visually reviewed at a narrow viewport; no desktop or accessibility audit was completed. |
| Test/CI inventory | No automated regression suite, test script, or committed CI pipeline found; `scripts/test-angelone.ts` is an integration diagnostic. |
| Git tracking check | `.env` and `.env.local` are not tracked in the current index; no historical secret-leak audit was performed. |

The follow-up upgraded Next.js to 16.3.6, Prisma to 6.19.3, installed Razorpay, regenerated the lockfile/client and added a migration. No production database migration, real order, payment, exploit, or payout was executed. Vercel configuration, existing contracts, company registration, actual customer behavior and production infrastructure were not verified. Historical replay is not implemented; the homepage chart is explicitly illustrative.

## Implementation status on this branch

- **Build blocker repaired:** fixed duplicate loading state and malformed request parsing; the production build and Prisma schema validation now pass.
- **Account controls improved:** removed unauthenticated administrator bootstrap from login; reset tokens are no longer logged. Password recovery is explicitly unavailable in production until transactional email exists.
- **Secrets improved:** broker credentials are written using AES-256-GCM with a versioned format. Configure `ANGELONE_CREDENTIALS_KEY` before any local credential write; old plaintext records still need rotation.
- **Payment checks improved:** created a persistent Razorpay-order binding and verify captured provider amount/currency/order before atomic activation. Mock payment, production KYC, AngelOne tools and live-data practice are blocked in production. Checkout additionally requires explicit `RELEASE_COMMERCE_ENABLED=true` and the public UI flag; do not enable until launch gates pass.
- **Evaluation corrected:** status output is mutually exclusive; evaluation uses `UserChallenge.currentPnl` and derives daily history from `DailyTradeSummary`. This remains a first repair, not a proven accounting ledger or regression-tested scoring engine.
- **Public claims corrected:** home/about/auth and policy-preview pages now distinguish simulation, private certification and a separate hiring decision. Placeholder support/legal terms and unverified company details are marked as launch work.
- **Still not built:** licensed 30-day-old historical ingestion/replay, NISM lessons, assessment/certificate issuance and verification, replay-session integrity, support, refunds, finance reconciliation, legal/data approvals, CI, automated regression tests and operational monitoring.

## What is worth keeping

- Next.js, TypeScript, PostgreSQL and Prisma are sufficient for an initial product. A wholesale rewrite or microservice architecture is unnecessary.
- API helpers verify JWTs and reload the user from the database; reviewed trading handlers enforce ownership. Password hashing uses bcrypt and login cookies are HTTP-only with production Secure enabled.
- Prisma relations and indexes provide a reasonable starting point, including uniqueness for daily summaries.
- Reusable trading components and hooks, user/admin separation, and challenge-plan concepts reduce the remaining product work.
- Razorpay order/signature work and Angel One data adapters are real integration attempts, although neither establishes production readiness.
- KYC submission currently enters a manual `PENDING` review flow. The README's blanket auto-approval description is outdated.

## Highest-priority code findings

P0 means release blocker; P1 means required before an external paid beta. Locations refer to this checkout.

### P0-1: Production build is broken

`src/app/challenge-plans/page.tsx:61` and `:247` declare `isLoading` twice in the same scope. `src/app/api/payment/razorpay/create-order/route.ts:96` parses `request.json()` outside the request handler. The installed environment also cannot resolve Razorpay.

**Fix:** repair scope/declarations, reproduce from a clean lockfile install, generate Prisma Client, pin a supported Node runtime, and make type checking plus production build mandatory CI gates. Do not suppress type errors to pass a deployment.

**Branch status:** duplicate loading state and invalid request scope are repaired, dependencies/client are installed, and `npm run build` passes. Node pinning, CI and clean-install automation remain.

### P0-2: Known administrator credentials can be provisioned through login

`src/lib/adminAccount.ts:16` creates a known default administrator when no admin exists. `src/app/api/auth/login/route.ts:36` invokes this when an unauthenticated request supplies `expectedRole: ADMIN`; there is no production exclusion on this bootstrap path.

**Fix:** remove request-triggered bootstrap; provision the initial admin through a controlled one-time command. Rotate any deployed default account, require admin MFA, add session revocation and audit records. This is conditional on no existing admin; it is not a claim that every deployment is already compromised.

**Branch status:** removed the login-triggered bootstrap. Local development provisioning remains restricted to local development; MFA, session revocation, audit and deployment review remain.

### P0-3: Broker secrets and reset tokens are insufficiently protected

`src/lib/secretCrypto.ts:16` returns plaintext from `encryptSecret`. The broker model stores MPIN, TOTP seed and session tokens. `src/app/api/auth/forgot-password/route.ts:47` logs the raw reset token regardless of environment. Production email delivery is not implemented.

**Fix:** use managed secrets or application-level envelope encryption with separate key custody and rotation, redact logs, remove token logging, and implement transactional email. Make reset-token consumption atomic and revoke previous sessions after resets. Assess credential exposure and rotate affected credentials where warranted. Database-provider disk encryption alone does not replace these controls.

**Branch status:** new broker-secret writes use versioned AES-256-GCM, and reset tokens are not logged. Existing plaintext credentials need rotation; key custody/rotation and email-based recovery remain open. Production reset requests fail closed until email is implemented.

### P0-4: Mock payment can activate a challenge without collecting money

`src/app/api/payment/mock/route.ts` permits an authenticated KYC-approved trader to activate a pending challenge with no environment/feature isolation. Hiding the UI is insufficient.

**Fix:** remove or hard-disable this endpoint in production and separate demo fixtures from customer payment records. Prove that no production request can activate a paid challenge through this route.

**Branch status:** the mock-payment endpoint returns unavailable in production, and dashboard links now point only to Razorpay. Verify again against the deployed Vercel preview.

### P0-5: A valid payment is not securely bound to the purchased challenge

The Razorpay create-order handler does not persist an authoritative order-to-user/challenge/amount mapping. The verify handler accepts client-supplied order and challenge IDs, validates the signature, then attaches payment to a pending challenge. It does not establish that this order paid the correct challenge fee, currency, and captured amount. The duplicate lookup is scoped to the challenge, and provider IDs lack database uniqueness.

**Impact:** valid payment evidence may be reused or attached to a different pending challenge; concurrent callbacks can create duplicate records. These are code-path findings, not live payment exploit tests.

**Fix:** create a durable purchase/order record; bind it server-side to user, versioned offer, amount and currency; verify provider capture state; use unique provider IDs and atomic activation. Add signed webhooks, duplicate/out-of-order handling, scheduled reconciliation, refunds and disputes. See [Razorpay integration guidance](https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/integration-steps/) and [webhook validation](https://razorpay.com/docs/webhooks/validate-test/).

**Branch status:** added `ChallengeOrder`, user/challenge/amount/currency binding, captured-payment provider verification, unique identifiers and transactional activation. Paid checkout is production-disabled. Signed webhooks, retries, reconciliation, refund/dispute operations, invoices and a real sandbox transaction remain required before paid beta.

### P0-6: Challenge evaluation can produce an incorrect pass

`src/lib/evaluateChallenge.ts` sets `passed` in its expiry branch, then can also set `failed` for drawdown or daily-loss breaches. Final status prioritizes `passed` at line 145. The isolated reproduction returned both flags true and status PASSED.

Execution and square-off handlers update `Trade`, `DailyTradeSummary` and `UserChallenge.currentPnl`; evaluation instead reads `ChallengeMetrics`. No writer for those evaluation metrics was found in the current application paths. The evaluation endpoint can also overwrite a losing terminal challenge's `currentPnl` with zero when progress is non-positive.

**Fix:** define one authoritative equity/event history; derive UI and evaluator results from it. Use mutually exclusive terminal outcomes, preserve actual losses, make breaches irreversible according to published rules, and record rule version, inputs, timestamps and reason for every decision. Define exact expiry and boundary semantics.

**Branch status:** contradictory outcomes and loss overwrites were corrected; evaluation now uses current challenge P&L and daily summaries. The old system still lacks an authoritative immutable event ledger, rule versioning and regression evidence. Build these into replay rather than extending the disabled live-feed path.

### P0-7: Trades are not protected by atomic risk controls

`src/app/api/trading/execute/route.ts` reads capital/open trades and later inserts a trade outside one serialized transaction. Concurrent submissions can pass the same capital/trade-count check. Reviewed execute logic does not enforce challenge expiry, permitted instruments, exchange sessions, or daily/max loss before entry. Close operations also read OPEN then update by ID without an atomic OPEN-state predicate.

**Fix:** centralize a transactionally consistent order/risk service with idempotency, conditional state changes and concurrency tests. Reserve capital atomically; enforce instrument and session rules; calculate equity including unrealized losses and costs. Do not rely on UI checks or occasional evaluation calls.

### P0-8: Data failures can fabricate fills and erase losses

`src/lib/angeloneLivePrice.ts` uses the latest one-minute candle close as an execution price, without returning/validating its age to the execution handler. `getLivePriceMap` falls back to entry price on failure; auto-square-off can therefore close a losing position at entry. Instrument lookup may select the first derivative result; price maps key only by symbol, ignoring exchange.

**Fix:** use exact instrument IDs, exchange/expiry/lot/tick metadata and explicit quote timestamps. Freeze or reject execution when prices are unavailable; mark valuation stale rather than silently replacing it. Persist quote provenance and simulated fill/slippage rules. Never finalize a financial outcome from a fallback entry price.

### P0-9: Dependencies require security remediation

The production audit includes a critical entry for Next.js and high-severity direct/transitive entries. Installed Next.js is 16.0.7. The official [December 2025 security update](https://nextjs.org/blog/security-update-2025-12-11) already documented additional fixes after that version; do not assume the earlier React2Shell patch covered later issues.

**Fix:** triage exact current advisories, upgrade to a currently supported patched release set, align Next/React/ESLint packages, regenerate the lockfile and rerun verification. Do not blindly use `npm audit fix --force`; audit suggestions can include disruptive version changes. Require zero unmitigated critical/high production findings.

**Branch status:** Next.js/ESLint are aligned at 16.3.6. The lockfile pins `deepmerge-ts` 8.0.1 under Prisma config; Prisma validation/generation and `npm audit --omit=dev` pass with zero reported vulnerabilities. Keep the override documented and verify it during Prisma upgrades.

### P1: Remaining engineering and product gaps

| Gap | Evidence / consequence | Required work |
| --- | --- | --- |
| Schema/deployment drift | Schema fields absent from migration history; request-time DDL in `src/lib/ensureDatabase.ts` | Add forward migrations; test fresh and upgraded databases; remove runtime DDL and restrict app DB privileges. |
| Page/auth inconsistency | `src/proxy.ts` verifies signature but not JWT expiry; forgot/reset pages absent from public allowlist | Unify verification, reject expired/malformed tokens, permit logged-out recovery, test page/API authorization separately. API JWT verification does check expiry. |
| Abuse controls | No application rate limiter found on sensitive endpoints | Distributed login/reset/signup/order limits, body bounds, schema validation, CSRF/origin review and appropriate security headers. |
| Recovery lifecycle | No durable sessions/token version in user model | Session invalidation, logout-all, verified email and optional trader MFA. |
| Floating-point accounting | Price/P&L fields are `Float` | Decimal or integer minor-unit accounting with explicit rounding; immutable money ledger and reconciliation. |
| Mutable purchased rules | Challenges reference the current plan; no purchased rule snapshot | Version offers and freeze purchased terms/fees/risk parameters. |
| Progression enforcement | Selection handler checks KYC/active plan but not previous-level completion | If sequential progression remains the product rule, enforce it server-side. |
| Market calendar/timezone | `tradingUtils.ts` adds IST offset then uses host-local date methods | Use timezone-safe calculations, exchange holidays and instrument-specific sessions; verify in UTC and Asia/Kolkata. |
| Feed scaling | Each SSE connection polls the broker every five seconds | Shared ingestion/cache/fan-out, provider budget controls, backpressure, timeouts, heartbeat and quote-age alerts. Fix error paths that skip backoff. |
| Background execution | Square-off endpoint exists; no committed scheduler/recovery configuration found | Durable jobs, retries, idempotency, missed-run recovery, alerts and a trading kill switch. Verify actual hosting separately. |
| Sensitive diagnostic tools | DB diagnostic page exposes errors; admin test endpoint can place actual broker orders | Remove/gate production diagnostics; separate simulated and live capabilities with strict operational controls. |
| Customer support | Contact button has no submit handler and phone is a placeholder | Working ticket intake, acknowledgment, escalation, refund handling and verified contacts. |
| Unsupported claims | About promises funded institutional capital; terms promise real-time risk enforcement; privacy claims regular audits and encryption | Publish only demonstrable capabilities. Verify entity identity; distinguish simulated balances from withdrawable money. |
| Operational traceability | No audit/event/payout/refund models or operational monitoring pipeline found | Auditable admin actions, reconciliation dashboard, incident ownership and evidence retention. |

## India launch: choose a legally supportable product first

This is a product-risk assessment, not a legal opinion. A disclaimer that trading is simulated does not itself determine legality. Obtain a written opinion from Indian securities/technology counsel on the actual contracts, fees, data use, execution and rewards. Verify current notifications and any applicable court orders before launch.

### 1. Paid simulation, funded work, and brokerage are different models

The confirmed outcome is a private assessment certificate and eligibility to apply for a job, with no simulated-profit payouts. Existing funded-account/profit-share marketing must be corrected to match that outcome. Disclose the actual employer, further selection steps, vacancy availability, subscription/retry costs and absence of a job guarantee. Have counsel assess the mandatory paid credential and recruitment linkage, applicable consumer/employment rules, and the separately operated desk's securities/broker obligations.

India's PROG framework remains a classification question: the government's [2026 Rules explanation](https://www.pib.gov.in/PressReleaseIframePage.aspx?PRID=2254606&lang=2&reg=48) states the rules take effect on 1 May 2026 and classification considers fees/stakes, expected winnings and monetization. **Inference for Finloom:** no cash/redeemable simulation rewards makes an assessment-service characterization more plausible. It is not established here that a certificate or job-application eligibility constitutes winnings, nor that this structure is exempt. Obtain a written assessment of the actual service rather than treating every paid simulation as prohibited.

### 2. Market-data rights are a launch gate

SEBI's [8 May 2026 circular](https://www.sebi.gov.in/sebi_data/attachdocs/may-2026/1778242522289.pdf), effective 1 July 2026, specifies a 30-day lag for educational sharing/use under the described framework, no monetary incentives for that educational sharing, and appropriate agreements/audit trails. NISM has a specific exception; do not generalize it to Finloom. The earlier [2024 data-sharing norms](https://www.sebi.gov.in/legal/circulars/may-2024/norms-for-sharing-of-real-time-price-data-to-third-parties_83572.html) also restrict real-time third-party distribution.

**Action:** obtain written broker/data-vendor permission for this exact usage and user distribution, with counsel validating the lawful route. A working Angel One login or commercial data subscription is not proof that a paid evaluation use case is permitted. Do not launch a current-price educational simulator on the assumption that the old one-day delay remains sufficient.

For the historical replay product, obtain explicit rights for paid learning/assessment, chart display, simulated fills, subscriber distribution, storage, replay and derived analytics. [NSE's policy](https://www.nseindia.com/static/market-data/nse-data-policy) makes redistribution subject to the agreement; its [historical products](https://www.nseindia.com/static/market-data/eod-historical-data-subscription) include order/trade data. Ask for intraday sample coverage: daily OHLC is insufficient for intraday replay. Confirm instrument/index rights and applicable attribution. Internal development access should also comply with API terms.

Assessment integrity: users may look up known historical outcomes. Keep practice and assessment pools separate, assign sessions, record decisions and supplement P&L with risk/decision evaluation. Hiding dates alone cannot prevent recognition. No future event relative to the replay clock may be returned by chart, indicator, quote, order, export or review APIs during a scored attempt. All data can be old enough legally while still leaking the future within the simulation.

### Historical replay implementation specification

This is planned work, not a description of the current live-price handlers.

1. **Licensed archive ingestion:** preserve vendor/source IDs, license entitlement, exact instrument/contract identifiers, timestamps, timezone, resolution, corporate-action treatment and dataset version/checksum. Validate missing/duplicate/out-of-order records and quarantine incomplete sessions. Publish only sessions whose last included event is at least 30 full days old relative to server time, with a configurable conservative buffer or stricter license requirement. “Previous calendar month” is not sufficient. Apply the restriction to all customer-facing exports and cached content too.
2. **Authoritative replay sessions:** store user, mode, dataset version, session assignment, cursor/event sequence, permitted speed/pause policy and status. Keep the market-event clock separate from wall-clock subscription/payment time. Persist checkpoints and resume exactly after disconnects. Never trust a client-provided clock, price or completion flag.
3. **Virtual orders and fills:** retain atomic capital checks and ownership/idempotency controls. Execute at an explicitly defined next eligible event after order acceptance. With bars, a decision made after a completed bar cannot fill retrospectively at its close; use a documented next-bar model with costs/slippage assumptions. Unknown intrabar order and simultaneous stop/target touches require a published conservative policy or finer data. Do not infer actual liquidity from OHLC or advertise exchange-equivalent execution.
4. **One accounting source:** record virtual orders, fills, position/equity changes, risk decisions and rule version in a replayable event history. Use historical session boundaries for market-day resets and scheduled close; use wall-clock time for subscription expiry and any attempt time limit. Freeze rules before purchase. Never mix current Angel One prices with historical positions.
5. **Two modes:** practice supports pause, speed, step and rewind through a new branch/reset; it cannot issue assessment credentials. Assessment uses a published control policy, irreversible recorded actions, assigned holdout sessions, no rewind and an auditable retry lifecycle. Block ordering after a session completes or assessment terminates.
6. **No future leakage:** stream only authorized events. Do not preload the whole session into browser state/network caches. Derive indicators and higher-timeframe bars from revealed data only; do not reveal the eventual high/low/close of an unfinished bar. Authorize every request and bind pagination/cursors to server progress. Gate complete reports until completion and respect license limits on exports.
7. **Review and transparency:** show historical/simulated labels, data resolution, replay clock, fill assumptions, virtual P&L and end-of-session review. Chart and order ledger must use the same data version. Choose complete sessions and a consistent corporate-action basis; derivatives require historical expiry, lot/tick metadata and actual contract data.

Suggested records: `HistoricalDataset`, `HistoricalSession`, `ReplayAttempt`, `ReplayEvent`/`VirtualOrder`/`VirtualFill`, `AssessmentRuleVersion` and `AssessmentCertificate`, plus access/administrative audit records. Adapt names to the existing schema; these are conceptual entities, not approved migrations. Store large licensed archives in appropriate object storage and transactional attempt/accounting state in PostgreSQL. Prefer deterministic server event advancement over a live broker polling loop; benchmark delivery at intended replay speeds before selecting additional infrastructure.

**Replay acceptance tests:** 29-day-old or incomplete sessions cannot publish; eligible sessions can publish with the configured buffer; changing browser time cannot bypass the restriction; direct API requests cannot fetch future events; incomplete higher-timeframe candles do not leak; repeated/concurrent orders cannot duplicate fills or overspend; pause/disconnect/resume preserves ordering; rewind cannot improve a scored attempt; next-bar fills and ambiguous stop/target cases match the published model; identical dataset/rules/events yield identical final results. Unsupported/missing data fails closed without fabricated prices, and certificates cannot be issued from practice attempts.

### 3. Prefer a smaller first release if the paid model is unresolved

Recommended candidate: a clearly labeled practice/replay and trading-journal product, with no cash prizes or funded-capital promises, using synthetic or appropriately licensed historical data under the applicable rules. Validate this candidate too; it is not automatic legal clearance. Introduce a paid service only after its classification and provider acceptance are documented.

For a genuine firm-capital model, establish capital ownership, broker-approved authorized access, trader contracts, risk limits and settlement responsibilities before building customer payout automation. Do not pool customer deposits or offer offshore FX/CFD access as a shortcut; any such scope needs separate securities/FEMA analysis.

### 4. Privacy, security and customer operations

- Map collected data and purpose. Collect PAN, DOB, address and banking details only where necessary for the selected model; a practice product may not need full identity collection.
- MeitY has published [DPDP Rules 2025 and an enforcement timeline](https://www.meity.gov.in/documents/act-and-policies/digital-personal-data-protection-rules-2025-gDOxUjMtQWa?pageTitle=Digit). Have counsel map the phased commencement to launch date; do not treat all provisions as already effective. Implement notices, consent where appropriate, user requests, retention/deletion, processor contracts, breach response and age controls as release capabilities.
- Determine the identity verification standard required by the business/providers. Manual PAN-format review is not verified identity; use an appropriate provider where needed. Do not describe Finloom as RBI/SEBI-approved without actual authorization.
- For covered entities/incidents, [CERT-In's directions](https://www.cert-in.org.in/PDF/CERT-In_Directions_70B_28.04.2022.pdf) include six-hour reporting, a designated contact, clock synchronization and secure 180-day logs within Indian jurisdiction. Build an operational response path and review hosting/log architecture against applicable obligations.
- Verify legal entity, business bank account, actual address, support contacts, terms, grievance process and applicable consumer/e-commerce duties. Have a CA classify service revenue, GST/invoicing, withholding and any approved payout treatment; do not hardcode assumed tax rates before classification.
- Obtain written payment-provider acceptance of the exact business model. Implement INR/paise correctness, applicable receipts/tax invoices, refunds to original source, disputes and settlement reconciliation. Gateway activation is not regulatory approval.

## Steps to reach 10/10

Indicative sequencing for two experienced engineers plus part-time QA, counsel, security and finance support: **12–20 weeks for a constrained product after a viable model is selected**. This is an estimate, not a launch commitment; contracts, regulatory review or a genuine funded-trading operation may take substantially longer. Do not promise a launch date until Phase 0 is resolved.

### Phase 0 — Scope and legitimacy (start immediately; 1–3 weeks for initial decisions)

Owner: founder + Indian counsel + CA.

- [ ] Write a one-page operating model: users, eligibility, fees, simulated/live boundary, rewards, capital ownership and instruments.
- [ ] Obtain written regulatory classification and list of required permissions; explicitly cover PROG, SEBI/data use and any relevant state/FEMA issues.
- [ ] Secure data/broker/payment-provider acceptance or choose the smaller practice/replay scope.
- [ ] Verify entity details, funding source and customer-facing claims.
- [ ] Produce a unit-economics model including payment costs, data, infrastructure, support, acquisition, refunds, taxes and any payout obligations.

**Exit gate:** founder and advisers approve a documented scope with a lawful operating route; commercial partners accept that scope. Otherwise pivot before spending on payout/live-trading features.

### Phase 1 — Reproducible, secure foundation (weeks 1–3; can overlap classification)

Owner: engineering lead.

- [ ] Resolve P0-1 through P0-4 and P0-9; disable customer money/live order capabilities until their gates pass.
- [ ] Repair migration history with forward migrations and regenerate clients in a clean environment.
- [ ] Remove default admin bootstrap, plaintext-secret writes and sensitive logs; implement MFA/recovery/session invalidation.
- [ ] Add request validation, distributed abuse limits and production diagnostics restrictions.
- [ ] Establish CI: locked install, lint, types, tests, build, dependency scan and migration validation.

**Exit gate:** clean checkout builds; new and upgraded disposable databases work; no mock activation/default-admin path in production; no unmitigated critical/high dependency issue; auth/ownership/recovery negative tests pass.

### Phase 2 — Correct trading and evaluation core (weeks 3–7)

Owner: backend/risk engineer + QA.

- [ ] Specify risk semantics: realized/unrealized P&L, costs, drawdown basis, daily reset, expiry, open positions at pass, and equality boundaries.
- [ ] Implement one accounting/equity source, versioned rule snapshots, transactional orders and deterministic evaluation.
- [ ] Implement the historical archive age/entitlement gate, practice replay MVP, server-owned event clock, separate assessment mode and future-data protections specified above.
- [ ] Add instrument IDs, calendars, exact lot/tick rules, quote age/provenance and an approved simulated-fill model.
- [ ] Add idempotent closing/evaluation jobs, outage handling and a kill switch.
- [ ] Build regression cases for the two reproduced evaluator defects, concurrent entries/closes, stale feeds, restart/replay, timezone boundaries and terminal-state immutability.

**Exit gate:** the same event history produces the same result in dashboard, evaluation and support evidence; parallel requests cannot overspend capital; stale data cannot produce a final fill; daily and terminal outcomes reconcile exactly.

### Phase 3 — Complete the approved commercial lifecycle (weeks 6–10; depends on Phase 0)

Owner: payments engineer + finance/operations.

- [ ] Replace `MockedPayment` with purchase/payment/refund/dispute records and unique external identifiers.
- [ ] Bind checkout to a persisted offer; implement captured-payment activation, signed webhook inbox, retry and reconciliation.
- [ ] Add customer receipts/invoices, refund requests, finance exports and staff permissions.
- [ ] Add certificate records with unique identifiers, issuing rule/version, assessment evidence, issue date, status and audited revocation/reissue. Define validity/expiry rather than inventing one in the UI.
- [ ] Provide privacy-preserving certificate verification, user download, correction/appeal handling and separate job-application eligibility tracking.
- [ ] Replace immediate funding/profit-share promises with accurate private-certification and recruitment disclosures. Do not imply SEBI/NISM recognition or guaranteed hiring.
- [ ] Keep actual employment, firm capital and compensation administration in the separately reviewed prop-desk scope; do not build simulated-profit payouts for this release.

**Exit gate:** sandbox tests cover paid-but-browser-closed, duplicate callbacks, wrong amount/user/order, out-of-order webhooks, refunds and disputes; every state change has audit evidence. Real-money testing begins only after provider/model gates pass.

### Phase 4 — Customer trust and operations (weeks 8–12)

Owner: product/frontend + operations/privacy lead.

- [ ] Finish verification/recovery emails, working support tickets and outcome notifications.
- [ ] Display simulation/data-delay status, last-price time, purchased rules, fees, expiry, rejection reasons and refund status clearly.
- [ ] Replace placeholder contacts and unsupported claims; record acceptance of versioned terms/privacy notices.
- [ ] Add privacy request handling, retention jobs, audit access controls and incident procedures.
- [ ] Test mobile layouts, keyboard/screen-reader use, INR formatting and low-bandwidth/reconnect behavior with representative Indian users.
- [ ] Run interviews with 10–15 target users and observe complete onboarding/trading/support tasks; fix recurring confusion before acquisition spend.

**Exit gate:** a new user can understand the offer and complete the approved journey without staff intervention; support and refunds actually work; material accessibility issues and misleading claims are closed.

### Phase 5 — Controlled beta and public launch (weeks 12–20)

Owner: engineering + security reviewer + operations + founder.

- [ ] Launch an invite-only cohort of roughly 25–50 eligible users within the approved scope.
- [ ] Run an independent security assessment and remediate critical/high findings.
- [ ] Load-test at least 2x the explicitly planned initial concurrency, including broker/data limits and database saturation.
- [ ] Exercise failed feed, duplicate job, payment outage, backup restore, compromised admin and incident-response scenarios.
- [ ] Review activation, repeat use, support volume, refund causes and unit economics; set scale limits from measured data.
- [ ] Approve public launch only after the gates below have named owners and evidence.

## Measurable 10/10 release gates

These are proposed product targets, not existing measured results.

| Gate | Required evidence |
| --- | --- |
| Legal/commercial | Written approved scope, current legal assessment, applicable permissions, provider/data contracts, verified company and tax setup. |
| Build/release | Clean reproducible build and migrations; CI required for every change; tested rollback and separate staging/production credentials. |
| Security | No open critical/high assessment findings without a documented effective mitigation; admin MFA, revocable sessions, encrypted secrets, rate limits and audited privileged actions. |
| Correctness | All critical invariants tested: ownership, payment binding, exact accounting, concurrency, irreversible breaches and deterministic replay. |
| Money operations | 100% daily reconciliation; unresolved mismatches alert an owner and block affected fulfillment/payouts. Refund and dispute drills pass. |
| Reliability | Proposed 99.9% monthly core-service availability; 30-day beta evidence, monitored dependency failures and alert/on-call ownership. |
| Recovery | Proposed RPO <= 15 minutes and RTO <= 4 hours, proven by a restore drill; adapt targets to the approved money/risk exposure. |
| Performance | At planned load, p95 internal reads < 500 ms and internal writes < 1 s excluding provider calls; measure provider latency separately and show pending states. Mobile key pages target p75 LCP <= 2.5 s. |
| Data integrity | Licensed eligible historical sessions only; minimum 30-day age enforced server-side; no future replay data leakage; chart/fills/evaluation use the same version and clock; missing data cannot fabricate a fill. |
| Customer trust | Accurate contracts and UI, functional support/grievances, tested privacy requests, clear simulation/funding boundary and accessible critical journeys. |
| Business viability | Cohort-based evidence of repeat use and sustainable contribution economics; if payouts apply, documented liquidity/reserves and stress scenarios independent of continual new signups. |

## Practical first sprint

1. Founder: document paid-assessment -> private certificate -> separate job application; obtain review of mandatory certification and licensed historical replay using data at least 30 full days old.
2. Engineering: fix duplicate `isLoading` and misplaced request parsing; verify clean dependency install and complete migrations.
3. Security: remove default-admin creation, production mock activation and reset-token logging; replace plaintext broker-secret storage and patch dependencies.
4. Backend: write failing regression cases for contradictory pass/fail and disconnected P&L, then unify the calculation pipeline.
5. Payments: persist and bind orders, add uniqueness and capture verification before any paid beta.
6. Product: remove unsupported funding/security claims and make support functional.
7. Release owner: create a tracked backlog from this plan with owners, evidence links and dates; rerate after the first exit gates pass.

Do not prioritize a native mobile app, extra instruments, affiliate programs, AI signals, social leaderboards, elaborate animations or a platform rewrite ahead of these gates. The highest-value next work is proving that Finloom is permitted to sell its offer and can execute that offer correctly and reliably.
