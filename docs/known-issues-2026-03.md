# User-Facing Issues

## 1. Mock payment can activate the wrong challenge plan
- Severity: High
- Impact: A user can arrive on `/payments/mock?planId=...` for one plan, but the confirm action ignores that `planId` and activates whichever pending or active challenge was created most recently. This can charge/activate a different plan than the one shown in the URL or implied by the navigation flow.
- Evidence:
  - `src/app/payments/mock/page.tsx:127` reads `planId` from the URL only for display.
  - `src/app/payments/mock/page.tsx:194` posts to `/api/payment/mock` with no plan identifier.
  - `src/app/api/payment/mock/route.ts:48-60` selects the latest `PENDING`/`ACTIVE` challenge for the user, not the plan from the page.

## 2. Open positions modal shows wrong LTP and P&L for every symbol except the currently selected chart symbol
- Severity: High
- Impact: In `My Open Trades`, users see live LTP and unrealized P&L only for the instrument currently loaded in the chart. All other open positions fall back to entry price, so their displayed LTP and P&L are misleadingly flat.
- Evidence:
  - `src/app/dashboard/user/trading/page.tsx:958` uses `selectedScrip?.scrip.startsWith(trade.scrip) ? selectedScrip.ltp : trade.entryPrice`.
  - That means any open trade not matching the selected chart symbol gets `trade.entryPrice` as its "current" LTP, producing zero or stale P&L in the modal.

## 3. The dashboard shows fabricated trading stats and fallback charts instead of actual account data
- Severity: High
- Impact: A prop trading user can land on the dashboard and see hardcoded balances, P&L, win rate, and chart series that do not come from their challenge or trade history. This undermines trust immediately because the app presents demo numbers as if they were real account analytics.
- Evidence:
  - `src/app/dashboard/user/page.tsx:130-149` defines fallback performance/portfolio/trade-volume datasets.
  - `src/app/dashboard/user/page.tsx:315-320` uses those fallback datasets whenever `metrics.length === 0`.
  - `src/app/dashboard/user/page.tsx:346-375` hardcodes the summary cards (`54,200`, `1,680`, `12`, `68.5%`) rather than deriving them from live state.

## 4. Trading shortcuts are advertised as buy/sell actions but do not place or stage orders
- Severity: Medium
- Impact: The terminal advertises `B=Buy` and `S=Sell`, but pressing those keys only shows toast messages. A user expecting keyboard execution gets no actual trading action, which is especially misleading in a trading interface.
- Evidence:
  - `src/app/dashboard/user/trading/page.tsx:851-852` labels the shortcuts as `B=Buy, S=Sell, Ctrl+Q=Square Off All, R=Refresh, ESC=Close`.
  - `src/app/dashboard/user/trading/page.tsx:565-567` maps `onBuy` and `onSell` to informational toasts only.
  - `src/hooks/useKeyboardShortcuts.ts` confirms the key handlers just call those callbacks; there is no order submission path behind `B` or `S`.

## 5. Multiple pages render mojibake/encoding corruption in visible UI text
- Severity: Medium
- Impact: Several screens show broken characters like `Â·`, `â€¦`, `â€”`, and `â‚¹` instead of bullets, ellipses, dashes, and the rupee symbol. This is visible in core user flows and makes the product feel broken.
- Evidence:
  - `src/app/payments/mock/page.tsx:359`, `src/app/payments/mock/page.tsx:394-397`, `src/app/payments/mock/page.tsx:429`, `src/app/payments/mock/page.tsx:490`
  - `src/components/trading/TradesList.tsx:94`, `src/components/trading/TradesList.tsx:165`
  - `src/app/dashboard/user/trading/page.tsx` contains multiple visible strings with corrupted rupee symbols and separators, including the chart header and risk modal.

## 6. The trading terminal silently collapses to "No chart data" when symbol lookup or historical fetch fails
- Severity: Medium
- Impact: If AngelOne symbol resolution or historical candles fail, the user only sees an empty chart state. There is no error banner, retry guidance, or explanation of whether the symbol is unsupported, the market is closed, or data loading failed.
- Evidence:
  - `src/app/dashboard/user/trading/page.tsx:316-318` clears the live stream and returns when token resolution fails.
  - `src/app/dashboard/user/trading/page.tsx:371-372` only logs historical fetch errors to the console.
  - `src/app/dashboard/user/trading/page.tsx:667-669` renders a generic `No chart data` message with no actionable context.

## Notes
- `npm run lint` also fails currently, with React hook immutability errors in `src/components/trading/AngelOneChart.tsx`. I did not include that as a primary user issue unless the team wants a developer-quality pass as well.

## 7. Direct navigation to key user-flow pages can bounce authenticated users back to login before auth finishes loading
- Severity: High
- Impact: A signed-in user who refreshes or opens `/challenge-plans`, `/payments/mock`, or `/kyc` in a new tab can be redirected to `/login` before the app has checked the valid auth cookie. This breaks multi-step flows because the next screen assumes `user` must already be in the client store instead of waiting for server-backed auth revalidation.
- Evidence:
  - `src/app/challenge-plans/page.tsx:76-80` redirects immediately when `user` is null.
  - `src/app/payments/mock/page.tsx:129-133` does the same.
  - `src/app/kyc/page.tsx:39-43` does the same.
  - By contrast, `src/app/dashboard/user/page.tsx:179-193` waits for `checkAuth()` and `isLoading` before redirecting, which is the safer flow.

## 8. KYC state is modeled incorrectly, so pending/rejected KYC is treated as "completed"
- Severity: High
- Impact: The app treats the mere existence of a KYC record as completion, even though the payment and challenge APIs require approved KYC. This creates a broken sequence where the UI can say KYC is complete and route the user forward, but the next action still fails because approval never happened.
- Evidence:
  - `src/app/api/auth/me/route.ts:50-56` returns `hasCompletedKyc: Boolean(user.mockedKyc)`.
  - `src/app/api/auth/login/route.ts:61-67` does the same in login responses.
  - `src/app/api/kyc/submit/route.ts:57-71` always writes/rewrites submitted KYC as `PENDING`.
  - `src/app/payments/mock/page.tsx:135-137` gates access on `user.hasCompletedKyc`, so a merely submitted KYC record can unlock the page even though `/api/payment/mock` still rejects non-approved KYC.

## 9. Switching challenge plans reuses the old challenge record, which can leak stale payments, trades, and metrics into the new plan
- Severity: High
- Impact: If a user changes plans while they already have a `PENDING` or `ACTIVE` challenge, the app updates the existing `UserChallenge` row in place instead of creating a clean new challenge. Because related payments, trades, metrics, and daily summaries remain attached to that row, old data can appear under the newly selected plan.
- Evidence:
  - `src/app/api/challenges/select/route.ts:49-85` finds the existing challenge and updates its `planId` in place.
  - The reset only clears a few scalar fields (`status`, dates, credentials, PnL), but does not remove related records.
  - `prisma/schema.prisma:99-104` shows `UserChallenge` owns `mockedPayments`, `metrics`, `trades`, and `dailySummaries`, so reusing the same row preserves those associations.

## 10. The KYC flow says details are "under review" but there is no reliable user-visible progression from submission to approval
- Severity: Medium
- Impact: After a user submits KYC, the UI tells them review will happen later, but the client state is set manually to `PENDING` and several pages still make routing decisions from stale or inconsistent auth data. The result is a confusing flow where the user can be told KYC is pending, yet still be let into KYC-gated screens or blocked unpredictably depending on whether the page used store state or `/api/auth/me`.
- Evidence:
  - `src/app/kyc/page.tsx:115-121` submits KYC to the API.
  - `src/app/kyc/page.tsx:135-140` then mutates the local user state manually to `kycStatus: 'PENDING'` and `hasCompletedKyc: false`.
  - `src/app/api/auth/me/route.ts:55-56` later reports `hasCompletedKyc` as true for any existing KYC record, including pending/rejected ones.
  - This means the same user can see contradictory states across pages without any real status transition having occurred.
