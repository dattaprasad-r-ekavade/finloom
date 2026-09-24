# Finloom PLAN.md: UI overhaul, market data, and paper-trading hardening

Status: **source of truth for product and engineering direction.** Written 2026-09-24. Phase 4 (UI system and shells) is implemented; see §8. When this file conflicts with an older document, this file wins.

Other docs:
- `docs/release-review-2026-09.md`: the September release and legal review, formerly root `plan.md`. It stays the reference for licensing, legal and release gates only.
- `docs/business.md`: business model.
- `docs/known-issues-2026-03.md`: March bug snapshot, not re-verified.
- `docs/keyboard-shortcuts.md`.

**Product decisions taken for this plan (from the owner, 2026-09-24):**
- **MVP quotes: delayed, near-live.** A worker polls NSE through jugaad-data every 15–60 s during market hours. The UI always labels prices "Delayed · as of HH:MM:SS IST". Fills use the stored LTP, subject to a staleness cap. Licensed historical replay (`docs/release-review-2026-09.md` §"Historical replay implementation specification") remains the later production data mode.
- **AngelOne: unplug now, delete later.** Remove AngelOne from execute, square-off, summary, trades, search and charts in phase 1. Keep the dev-only AngelOne screens behind an explicit env flag for one release, then delete them (phase 6).

**Superseded stance:** `docs/release-review-2026-09.md:5,11` says launch = licensed replay of data at least 30 days old, with "live-data practice" disabled in production (`src/app/dashboard/user/trading/page.tsx`). This plan replaces that with delayed near-live jugaad quotes for the MVP, as the owner decided. `README.md` has been updated to match. The NSE ToS / redistribution risk in §7 is still a release gate, and `docs/release-review-2026-09.md` §"Data licensing" still applies.

Legend: **[unverified]** means not confirmable from the repo; check before relying on it.

---

## 1. Current-state map

> This section is a snapshot from before phase 4, taken 2026-09-24. Pages have since moved into route groups, `Navbar.tsx` was replaced by `SiteHeader`/`AppShell`, and the theme was rebuilt (§5.0). File paths under `src/app/` below are pre-move. For example, `src/app/dashboard/user/trading/page.tsx` is now `src/app/(app)/dashboard/user/trading/page.tsx`.

### 1.1 Stack and config
- `package.json`: Next ^16.3.6, React 19.2.1, MUI ^7.3.4 + Emotion, Prisma ^6.19.3, zustand, `lightweight-charts` ^5, `recharts`, `framer-motion`, Tailwind 4 (postcss present, barely used), `@vercel/analytics`, `@vercel/speed-insights`.
- `node_modules` is not installed in this checkout, so `AGENTS.md`'s "read `node_modules/next/dist/docs/`" could not be done in this pass. **The implementation agent must run `npm ci` and read those docs before touching caching (`"use cache"`, `cacheLife`), route handlers, or `proxy.ts` conventions.**
- `next.config.ts`: only `optimizePackageImports` for MUI.
- No `vercel.json` and no committed cron schedule. `docs/release-review-2026-09.md:162` confirms this.
- `.env.example`: `DATABASE_URL`, `JWT_SECRET`, `CRON_SECRET`, `NODE_ENV`. Other env vars read in code: `ANGELONE_CREDENTIALS_KEY` (`src/lib/secretCrypto.ts:8`), `RELEASE_COMMERCE_ENABLED` (razorpay routes), `NEXT_PUBLIC_COMMERCE_ENABLED` (`src/app/challenge-plans/page.tsx:59`).

### 1.2 Database (`prisma/schema.prisma`)
- `provider = "postgresql"`, `url = env("DATABASE_URL")`, no `directUrl`.
- Models: `User`, `ChallengePlan` (uses `String[] allowedInstruments`, a Postgres array), `UserChallenge` (`currentPnl Float`), `ChallengeOrder`, `MockedKYC`, `AdminSettings`, `MockedPayment`, `ChallengeMetrics`, `Trade` (money as `Float`; no idempotency key; no price-as-of or source), `MockedMarketData` (synthetic; only `src/app/api/trading/market-data/update/route.ts` writes it, and only outside production), `DailyTradeSummary` (`@@unique([challengeId, date])`), `AngelOneCredentials` (singleton).
- 7 migrations in `prisma/migrations/`. The latest is `20260923090000_release_readiness`.

### 1.3 Routes and shells
There are **no nested `layout.tsx` files and no route groups**. `src/app/layout.tsx` is the only layout: fonts, `ThemeProvider`, Analytics. Every page imports `src/components/Navbar.tsx` and builds its own page frame, which makes 35 pages each render their own shell.

| Area | Paths | Shell today |
|---|---|---|
| Marketing | `src/app/page.tsx`, `ChallengesSection.tsx`, `about`, `contact`, `privacy`, `terms`, `refund-policy`, `challenge-plans` | Navbar + `Footer.tsx`; styling is mostly global CSS classes in `src/app/globals.css` (`.home-*`, `.replay-*`, 58 hardcoded hex values) |
| Auth | `login`, `signup`, `trader/login`, `trader/signup`, `admin/login`, `admin/signup`, `admin/local-credentials`, `forgot-password`, `reset-password` | Each page builds its own card. `trader/login` and `admin/login` are near-identical: a diff shows only the icon, the `expectedRole`, the copy and the redirect differ |
| Trader | `dashboard/user`, `dashboard/user/challenge`, `dashboard/user/trading` (1039 lines), `challenges/[id]`, `challenges/[id]/result`, `kyc`, `payments/mock`, `payments/razorpay`, `live-trading` | Navbar and page-local `Box` wrappers; no persistent app nav |
| Admin | `dashboard/admin`, `dashboard/admin/{users,kyc,settings,angelone-credentials}` | Same Navbar; `Box minHeight 100vh` per page (`dashboard/admin/page.tsx:109-123`); no side nav, so it looks bolted on |
| Diagnostics | `db-test`, `angelone-test`, `forbidden`, `unauthorized`, `error.tsx`, `not-found.tsx` | — |

Auth split:
- `/api/auth/login` accepts `expectedRole`.
- `src/proxy.ts` gates pages by JWT role. Trader prefixes are `/dashboard/user`, `/kyc`, `/challenge-plans`, `/payments`, `/challenges`, `/live-trading`; the admin prefix is `/dashboard/admin`. Unauthenticated users go to `/login`.
- API routes are skipped by the proxy and check auth themselves via `src/lib/apiAuth.ts` (`requireRole`, `requireOneOfRoles`).
- **Route groups `(marketing)`, `(auth)`, `(app)` do not change URLs, so `proxy.ts` needs no change when pages move.**

### 1.4 Theme
- `src/theme/theme.ts`:
  - Light primary is `#174F3D` (forest green) and secondary is `#6AA77E`.
  - **Dark primary is `#4FC3F7` (cyan) and secondary is `#4CAF50`. The brand flips hue between modes, and this plan fixes it (§5).**
  - Both modes duplicate the typography and component overrides.
  - `MuiCard` has a hover `translateY(-2px)` globally.
- `src/theme/ThemeProvider.tsx`:
  - Reads `localStorage`/`matchMedia`.
  - **Returns `null` until hydrated.** All SSR HTML is therefore blank, which hurts LCP and SEO.
  - Exposes `useThemeMode().toggleTheme`, but **no component calls it** (grep for `toggleTheme`/`useThemeMode` outside `src/theme/` finds nothing). **Users cannot switch themes.**
- Hardcoded light colors bypass the theme, so dark mode is broken on those surfaces:
  - `Navbar.tsx` (`rgba(251,252,249,.9)`, `#163f31`, `#174f3d`, …)
  - `globals.css` (`:root` vars `--ink`, `--forest`, …)
  - 136 hex literals across `src/app` and `src/components` `.tsx` files
  - `TradingUnavailable` (`trading/page.tsx:130`, `#f7f8f4`)
- Fonts (`layout.tsx`): Inter + Poppins + Roboto Mono × 4 weights = 12 font files.

### 1.5 Trade flow (all paths depend on AngelOne today)
- **Client:**
  - `src/app/dashboard/user/trading/page.tsx` posts to `/api/trading/execute` (`:438`) and `/api/trading/square-off` (`:519`, and `:562` in a loop for "square off all").
  - It searches symbols through `/api/angelone-live/search` (`:298`) and charts through `/api/angelone-live/historical` (`:364`) plus the SSE stream `/api/angelone-live/stream`, consumed by `src/components/trading/AngelOneChart.tsx:276`.
  - `DEFAULT_SYMBOL` is `GOLD1!` on MCX (`:113`).
  - `isMobile = down('lg')`.
- **`POST /api/trading/execute`** (`src/app/api/trading/execute/route.ts`):
  1. Auth.
  2. Load the challenge.
  3. `getLivePrice()` from AngelOne (external HTTP).
  4. Run 3 parallel reads: trades today, open trades, realized sum.
  5. `getLivePriceMap()` makes one AngelOne call per open trade.
  6. Capital check.
  7. `trade.create`, a separate `dailyTradeSummary.upsert`, and a separate `userChallenge.update`.

  **No transaction, no lock, no idempotency key, no market-hours check, no price age check.** `docs/release-review-2026-09.md:131` confirms this.
- **`POST /api/trading/square-off`**: reads the trade, checks `status === OPEN`, then `trade.update({ where: { id } })` **with no OPEN predicate**. Two concurrent taps can double-close, and the second overwrites `exitPrice`/`pnl`.
- **`POST /api/trading/auto-square-off`**:
  - Auth is `x-cron-secret` header or admin, and it is a POST handler. **Vercel Cron sends `GET` with `Authorization: Bearer $CRON_SECRET`, so it cannot call this route as written.**
  - It closes at `priceMap.get() ?? trade.entryPrice`. **When the feed fails, it closes a losing position at entry (fabricated fill).**
  - Summaries are recomputed outside the transaction.
- `GET /api/trading/summary` and `GET /api/trading/trades` each call `getLivePriceMap` (AngelOne) per request. Each page refresh therefore makes N broker calls per user.
- `src/lib/tradingUtils.ts`:
  - `isMarketOpen` checks weekdays and 09:15–15:30 only, with no holidays.
  - `getISTStartOfDay` uses host-local `setHours` after adding the offset. It is correct only on UTC hosts; see `docs/release-review-2026-09.md:160`.
- **Dead code:** these are not imported by any page.
  - `src/hooks/useChartData.ts` (calls `/api/angelone-live/historical` via GET).
  - `src/hooks/useOrderExecution.ts` (posts to **non-existent** `/api/trading/place-order`).
  - `src/hooks/useTradingData.ts`, `src/components/trading/TradingViewChart.tsx`, `src/components/trading/AdvancedPerformanceMetrics.tsx`, `src/lib/mockMetrics.ts` [verify the last one].

### 1.6 Market data flow and AngelOne inventory
**Product path (must be unplugged in phase 1):**
- `src/lib/angeloneLivePrice.ts` provides `getLivePrice` and `getLivePriceMap`, uses the 1-minute candle close as "LTP", and caches tokens in process memory. It is used by:
  - `api/trading/execute`
  - `api/trading/square-off`
  - `api/trading/auto-square-off`
  - `api/trading/summary`
  - `api/trading/trades`
  - `api/trading/market-data/[scrip]`
- `src/app/api/trading/market-data/route.ts` does scrip search through AngelOne `searchScrip` across NSE, MCX and NFO.
- `src/app/api/angelone-live/{historical,search,session,stream}/route.ts`. `stream` is an SSE route that holds a serverless function open and polls AngelOne every 5 s per client.
- `src/components/trading/AngelOneChart.tsx`, used by `dashboard/user/trading/page.tsx` and `live-trading/page.tsx`.
- `src/hooks/useChartData.ts` (dead).

**Dev-only tooling (flag for now, delete in phase 6):**
- `src/lib/angelone.ts` (session/TOTP login, credential storage).
- `src/lib/secretCrypto.ts`. `docs/release-review-2026-09.md:95` says encryption is a passthrough; verify.
- `src/app/api/angelone-test/*`, 8 routes, gated by `internalDevelopmentOnlyResponse()` (`src/lib/internalDevelopment.ts`).
- `src/app/angelone-test/page.tsx`.
- `src/app/live-trading/page.tsx`: opens a browser WebSocket to `wss://smartapisocket.angelone.in` with `clientCode`/`feedToken`/`apiKey` in the URL. `api/angelone-live/session` currently returns only `authenticated`, so this page is likely already broken [unverified].
- `src/app/api/admin/angelone-credentials/route.ts`, `src/app/dashboard/admin/angelone-credentials/page.tsx`.
- `prisma` model `AngelOneCredentials` (migration `20251214_add_angelone_credentials`).
- `scripts/test-angelone.ts`, `ANGELONE_PER_USER_CREDENTIALS_PLAN.md`.

The production gates today are `NODE_ENV === 'production'` checks in pages (`trading/page.tsx:121`, `live-trading/page.tsx:49`, `angelone-test/page.tsx:47`, `dashboard/admin/angelone-credentials/page.tsx:26`) and in the angelone-test APIs. **`api/angelone-live/*` and `api/trading/*` are not gated in production** [verify each route].

---

## 2. Database decision

**Keep PostgreSQL via Prisma.** This matches `prisma/schema.prisma` and `.env.example`. **Default host: Neon. Equal fallback: Supabase.** Either works for this app. Pick one at phase 0 and do not use both.

| Criterion | Neon | Supabase |
|---|---|---|
| Vercel fit | Vercel Marketplace integration injects env; per-preview **DB branches** pair with Vercel preview deploys for migration testing | Also has a Vercel integration; no per-preview branching on lower tiers [unverified] |
| Prisma | Use pooled URL (`-pooler` host, PgBouncer transaction mode) for `DATABASE_URL` and an unpooled one for migrations. **Add `directUrl = env("DIRECT_DATABASE_URL")`** to `schema.prisma`. Interactive `$transaction` + `SELECT … FOR UPDATE` work inside one pooled transaction | Same pattern via Supavisor (port 6543 pooled / 5432 direct). Same `directUrl` change |
| Cold start | Scale-to-zero adds first-query latency after idle. During market hours the worker writes every 15–60 s, so compute stays warm. Off-hours the first login may be slow; disable autosuspend on a paid plan if that matters | Always-on compute. Free projects pause after about 1 week of inactivity [unverified] |
| Cron | None built in; not needed (cron lives in the worker plus Vercel Cron, §6) | `pg_cron` available. Tempting for EOD, but square-off logic belongs in TypeScript next to execute, so it is not a deciding factor |
| Push channel | None | Realtime (Postgres changes / broadcast) could push LTP to browsers. It adds `supabase-js`, anon-key and RLS surface; not needed for the recommended poll design |
| 100 users | Trivial load: at most ~20 rps of cached reads plus a handful of writes/s | Same |
| Cost at MVP | Free or Launch tier likely enough [verify pricing] | Free or Pro [verify pricing] |

Why Neon is the default: preview-branch migrations, a Vercel-native integration, and nothing in the design needs Supabase Realtime, Auth or Storage. Pick Supabase instead if the owner wants Realtime push later (§3 option A-iii) or always-on compute without paying for Neon's no-suspend.

**Required regardless of host:**
- Add `directUrl`.
- Keep `DATABASE_URL` pooled.
- Create a **separate DB role for the worker** (`market_writer`) with rights on market tables only (§4).
- Keep the Vercel functions and DB in the same region. Mumbai (`bom1`) or Singapore; [verify availability].

**Turso/LibSQL verdict: do not use.** It would be a separate migration, not a config change:
1. The Prisma `provider` changes to `sqlite` plus the libsql driver adapter.
2. SQLite has no `enum` (7 enums here) and no scalar lists (`ChallengePlan.allowedInstruments String[]`).
3. There is **no `SELECT … FOR UPDATE` and no row-level locking**. Concurrency is a single writer with database-level write locks, and the interactive-transaction story over HTTP is weaker.

Trade execute needs "lock this challenge row, re-read capital, insert, update" atomically (§6). Postgres gives that directly. On Turso it becomes whole-DB write serialization or optimistic retries. That is a poor fit, for no benefit at 100 users.

---

## 3. Market-data architecture

### 3.1 Constraints that shape every option
- **jugaad-data** is Python. The relevant public API as documented upstream:
  - `jugaad_data.nse.stock_df(symbol, from_date, to_date, series="EQ")` returns **daily** OHLCV history.
  - `jugaad_data.nse.index_df(...)` returns daily index history.
  - `jugaad_data.nse.NSELive()` provides `.stock_quote(symbol)` (the `priceInfo.lastPrice` field), `.live_index("NIFTY 50")` (one call returns every constituent's LTP), `.market_status()`, and `.chart_data(...)` for intraday points [confirm method names and fields against the pinned version].
  - `jugaad_data.holidays.holidays(year)` returns trading holidays [confirm].
  - Internally it keeps a `requests` session with NSE cookies and a disk cache.
- **`stock_df` is daily only.** Intraday candles must come from (a) the worker rolling its own polled snapshots into 1m bars, or (b) `NSELive.chart_data` intraday points if they prove usable. Candles built from 15–60 s polls are coarse and must be labelled.
- **Vercel cannot run this reliably:** there is no Python in the Next runtime, NSE cookie sessions do not survive between invocations, there is no persistent disk cache, NSE latency and blocking can blow function duration, and every cold function would re-scrape NSE.
- **NSE blocks datacenter IPs aggressively** (Akamai) [unverified per host]. Worker host choice must be validated by a smoke test from that host's region before committing.
- **Never let the browser or a Vercel function talk to NSE.** Only the worker does.
- **Do not vendor the jugaad-data git tree.** Pin it as a pip dependency: `jugaad-data==<version>` in the worker's `requirements.txt`.

### 3.2 Options

**A. Secondary always-on worker + a streaming channel**
- A Python 3.12 service (asyncio loop plus an optional FastAPI app) on Railway, Fly.io (`bom` region if NSE allows), Render (paid, not sleeping), or a small Indian VPS.
- jugaad-data exists only there.
- It writes quotes and candles to Postgres **and** exposes a stream. Stream sub-options:

| Sub-option | How | Verdict |
|---|---|---|
| A-i SSE from worker to browser | Browser `EventSource("https://md.finloom…/stream?symbols=…")`; worker fans out one poll result to N clients | Works: one NSE poll serves all users. Needs public worker ingress, CORS, and a short-lived signed token minted by Next (HMAC with `MARKET_STREAM_SIGNING_SECRET`, shared with the worker) because auth cookies are on the Vercel domain. Worker must stay up for the UI to update |
| A-ii Next route proxies worker SSE | Browser → `/api/market/stream` → fetch worker SSE → pipe | **Reject.** Each viewer holds a Vercel function open for the full duration: 100 users = 100 concurrent long invocations, cut at max duration, and billed. This is the same flaw as today's `api/angelone-live/stream` |
| A-iii WebSocket on worker | Browser WS to worker only (never NSE), same signed-token auth | More moving parts than SSE for a one-way feed. Only worth it if order updates later go over the same socket |
| A-iv Worker writes DB, Vercel polls | See B | This is option B |

- Auth for worker endpoints: `Authorization: Bearer $INTERNAL_WORKER_SECRET` for server-to-server calls; signed short-TTL tokens for browser stream access. No NSE credentials are involved.

**B. Worker writes Postgres only; Next serves cached REST; clients poll (recommended MVP)**
- Same worker as A, but no public ingress: it only makes outbound calls to NSE and Postgres.
- The loop polls during market hours (calendar + `market_status()`) and upserts the `Quote` table (§4). It rolls 1m candles into `Candle`. After close it runs `stock_df` for daily bars and a 15:30+ final snapshot. It writes `IngestHeartbeat` on every cycle.
- Next exposes `GET /api/market/quotes?keys=NSE:RELIANCE,NSE:NIFTY%2050` and `GET /api/market/candles?key=…&res=1m|5m|15m|1d&from=…`. Both read Postgres through `MarketDataProvider` and return `Cache-Control: public, s-maxage=5, stale-while-revalidate=20` (quotes) or `s-maxage=60` (candles). Closed historical ranges get long TTLs.
- Clients poll quotes every 5–10 s while the tab is visible (`document.visibilityState`) and stop when the market is closed.
- Freshness is poll interval (15–60 s) + CDN TTL (≤5 s) + client interval (≤10 s): a worst case of about 75 s. That is acceptable for "delayed" labelling.

**C. Thin TypeScript NSE client inside Next (no Python, no second host)**
- Re-implement the 2–3 NSE endpoints (quote, index, chart) with cookie bootstrap in a Vercel function, triggered by Vercel Cron every minute (requires a Pro plan) and writing to Postgres. Reads are the same as B.
- It is fragile: NSE cookie and anti-bot changes break it. Vercel egress IPs are datacenter IPs and likely blocked. Cron granularity is limited to 1 minute at best. We would own a scraper that jugaad already maintains.
- **Only if a second host is rejected.**

### 3.3 Comparison

| | A (worker + SSE A-i) | **B (worker → DB, poll)** | C (TS scraper on Vercel) |
|---|---|---|---|
| Hosting | Worker with public HTTPS + Vercel + DB | Worker (no ingress) + Vercel + DB | Vercel + DB only |
| NSE requests at 100 users | 1 poll loop total | 1 poll loop total | ≤1/min via cron |
| Latency to UI | ~poll interval | poll + ≤15 s | ≥60 s |
| When NSE blocks | Stream sends `status: stale`; UI banner; execute rejects (stale) | Heartbeat stale → `/api/market/status` says degraded; UI banner; execute rejects | Same, but more often (datacenter IPs) |
| Worker down | **UI updates stop**, chart freezes; fallback needed | Quotes age; UI shows age; execute rejects past cap | n/a |
| Cache stampede | None at NSE; worker fan-out | None at NSE; CDN coalesces identical URLs; DB read is a single PK lookup | Same as B |
| Holiday / closed | Worker idles on the `MarketCalendar` holiday list; last close served | Same | Must replicate the calendar in TS |
| Symbol mapping | `Instrument` table (§4) | Same | Same, maintained in TS |
| Cost at 100 users [unverified] | Worker ~$5–10/mo + Vercel Pro $20 + DB $0–19 | Worker ~$5/mo + Vercel Pro + DB | Vercel Pro + DB; lowest cash, highest maintenance |
| Next `MarketDataProvider` | `PostgresMarketDataProvider` + client stream hook | `PostgresMarketDataProvider` | Same |
| AngelOne unplug | Identical in all three: execute, charts and search read only `MarketDataProvider` | same | same |

Vercel plan note: Vercel Hobby is for non-commercial use, and its cron runs daily only with ±1 h precision [verify current terms]. A paid MVP needs Pro regardless.

### 3.4 Recommendation
- **MVP default: Option B.** A Python worker using jugaad-data writes to Postgres. Next reads Postgres through `MarketDataProvider`, serving CDN-cached REST that clients poll. It needs the fewest moving parts, has no public worker surface, and keeps working as "stale but consistent" if the worker dies. Fills and charts read the same rows, so the price you see is the price you get, subject to the staleness cap.
- **Fallback / upgrade: Option A-i (browser SSE from the worker).** Use it only if user testing shows poll-lag is unacceptable. It adds a public endpoint, signed tokens and CORS, and nothing else changes because the worker already writes the same tables.
- **Contingency: Option C.** Use it only if the owner rejects a second host. Expect breakage.

### 3.5 Worker spec (for the later implementation pass; not built now)
- **Location:** `workers/market-data/` in this repo, as a separate deployable with its own `Dockerfile`, `requirements.txt` (`jugaad-data==X`, `psycopg[binary]`, `tzdata`) and `README.md`. It is excluded from the Next build (it is outside `src/`, and Vercel ignores it without a root `api/` dir) [verify]. Whether to use a separate repo instead is an open decision (§9).
- **Env (worker only):**
  - `MARKET_DB_URL`: the `market_writer` role, direct (not pooled) connection.
  - `POLL_SECONDS` (default 30).
  - `HOT_SET_INDEXES` (default `NIFTY 50,NIFTY BANK`).
  - `WORKER_ID`.
  - `INTERNAL_WORKER_SECRET` and `NEXT_BASE_URL` (only for the EOD trigger, §6).
- **Loop (IST):**
  1. At 08:45, load today from `MarketCalendar`. If it is a holiday or weekend, sleep until the next day.
  2. From 09:15 to 15:30, every `POLL_SECONDS`, call `live_index` for each hot index (one request returns ~50 LTPs).
  3. Call `stock_quote` for symbols in the demand set that are not covered by the indexes. The demand set is: every `Instrument` with an OPEN `Trade`, plus `SymbolInterest.lastRequestedAt > now-10m`. Cap it at, for example, 100 extra symbols per cycle, with jittered pacing.
  4. Upsert `Quote` rows with `priceAsOf` taken from NSE's timestamp when present, else receive time.
  5. Roll `Candle` 1m rows.
  6. Write `IngestHeartbeat`.
  7. At 15:20, take a final snapshot, then POST `NEXT_BASE_URL/api/internal/eod-square-off` (§6).
  8. At 15:45, backfill the daily bar with `stock_df`/`index_df` for the universe.
  9. Weekly, refresh `Instrument` from the NSE equity master list [confirm source; jugaad may not provide one].
  10. Yearly, and on boot, refresh `holidays()` into `MarketCalendar`.
- **NSE hygiene:** one process and one session. Exponential backoff with a circuit breaker: after 5 consecutive failures, back off 5 min and mark the heartbeat `degraded`. Identify via a realistic UA per jugaad defaults. **No parallel fan-out to NSE.**

---

## 4. Provider contract

Two layers, so a licensed vendor swaps in without touching the UI:

1. **Ingest adapters (worker side, Python):** `JugaadIngest` now, `LicensedIngest` later. Both write the **same tables**, stamped with `source`.
2. **Read provider (Next side, TypeScript):** `MarketDataProvider`. The default implementation is `PostgresMarketDataProvider`, which is source-agnostic. If a licensed vendor later offers an HTTPS API that is better called directly, add `LicensedHttpProvider` implementing the same interface, and select it by `MARKET_DATA_PROVIDER=postgres|licensed-http|fixture` [new env, documented in `.env.example`].

### 4.1 TypeScript interface: new file `src/lib/market/provider.ts`
```ts
export type Exchange = 'NSE';            // MVP: NSE cash + indices only (jugaad has no MCX; NFO out of scope)
export type InstrumentKey = `${Exchange}:${string}`; // e.g. "NSE:RELIANCE", "NSE:NIFTY 50"
export type Resolution = '1m' | '5m' | '15m' | '1h' | '1d';
export type DataSource = 'jugaad' | 'licensed' | 'fixture';

export interface Instrument { key: InstrumentKey; symbol: string; exchange: Exchange; name: string;
  kind: 'EQUITY' | 'INDEX'; tradable: boolean; tickSize: number; lotSize: number; }

export interface Quote { key: InstrumentKey; ltp: number; open: number | null; high: number | null;
  low: number | null; prevClose: number | null; volume: number | null;
  priceAsOf: Date; receivedAt: Date; source: DataSource; }

export interface Candle { time: number /* bucket start, epoch s */; open: number; high: number;
  low: number; close: number; volume: number; isFinal: boolean; }

export type MarketPhase = 'PRE_OPEN' | 'OPEN' | 'CLOSED' | 'HOLIDAY';
export interface MarketStatus { phase: MarketPhase; now: Date; nextOpen: Date | null;
  feed: 'ok' | 'degraded' | 'down'; lastIngestAt: Date | null; source: DataSource; }

export interface MarketDataProvider {
  getQuote(key: InstrumentKey): Promise<Quote | null>;
  getQuotes(keys: InstrumentKey[]): Promise<Map<InstrumentKey, Quote>>;
  getCandles(q: { key: InstrumentKey; resolution: Resolution; from: Date; to: Date }): Promise<Candle[]>;
  searchInstruments(query: string, limit?: number): Promise<Instrument[]>;
  getMarketStatus(now?: Date): Promise<MarketStatus>;
  recordInterest?(keys: InstrumentKey[]): Promise<void>; // feeds worker demand set
}

// src/lib/market/pricing.ts — the ONLY place trade routes get a fill price
export function assertFillable(q: Quote | null, status: MarketStatus, maxAgeMs: number):
  { ok: true; price: number; priceAsOf: Date } | { ok: false; reason: 'NO_QUOTE' | 'STALE' | 'MARKET_CLOSED' | 'FEED_DOWN' };
```
Files:
- `src/lib/market/provider.ts` (types)
- `src/lib/market/postgresProvider.ts`
- `src/lib/market/fixtureProvider.ts` (deterministic data for local dev and tests, replacing the `MockedMarketData` random walk)
- `src/lib/market/index.ts` (`getMarketDataProvider()` factory)
- `src/lib/market/pricing.ts`
- `src/lib/market/calendar.ts` (IST-safe time via `Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata' })`, replacing `tradingUtils.isMarketOpen`/`getISTStartOfDay`)

### 4.2 Prisma tables (new migration, phase 2; do not apply in this pass)
```prisma
enum InstrumentKind { EQUITY INDEX }
enum CandleResolution { M1 M5 M15 H1 D1 }

model Instrument {
  id        String         @id @default(cuid())
  exchange  String         // "NSE"
  symbol    String         // "RELIANCE", "NIFTY 50"
  series    String?        // "EQ"
  name      String
  kind      InstrumentKind
  isin      String?
  tickSize  Decimal        @db.Decimal(10, 4) @default(0.05)
  lotSize   Int            @default(1)
  tradable  Boolean        @default(true)   // indices: false
  providerSymbols Json?    // { jugaad: "NIFTY 50", licensed: "..." }
  quote     Quote?
  candles   Candle[]
  @@unique([exchange, symbol])
}

model Quote {                           // one row per instrument (latest only)
  instrumentId String   @id
  ltp          Decimal  @db.Decimal(14, 4)
  open         Decimal? @db.Decimal(14, 4)
  high         Decimal? @db.Decimal(14, 4)
  low          Decimal? @db.Decimal(14, 4)
  prevClose    Decimal? @db.Decimal(14, 4)
  volume       BigInt?
  priceAsOf    DateTime @db.Timestamptz(3)
  receivedAt   DateTime @db.Timestamptz(3)
  source       String   // 'jugaad' | 'licensed' | 'fixture'
  instrument   Instrument @relation(fields: [instrumentId], references: [id])
}

model Candle {
  instrumentId String
  resolution   CandleResolution
  bucketStart  DateTime @db.Timestamptz(0)
  open Decimal @db.Decimal(14,4)  high Decimal @db.Decimal(14,4)
  low  Decimal @db.Decimal(14,4)  close Decimal @db.Decimal(14,4)
  volume BigInt @default(0)
  isFinal Boolean @default(false)
  source  String
  instrument Instrument @relation(fields: [instrumentId], references: [id])
  @@id([instrumentId, resolution, bucketStart])
}

model MarketCalendar { date DateTime @id @db.Date  exchange String @default("NSE")
  isTradingDay Boolean  openAt DateTime? closeAt DateTime?  note String?  source String }

model IngestHeartbeat { workerId String @id  status String  lastSuccessAt DateTime?
  lastErrorAt DateTime?  lastError String?  symbolsPolled Int @default(0)  updatedAt DateTime @updatedAt }

model SymbolInterest { instrumentId String @id  lastRequestedAt DateTime }
```
- Worker grants: the `market_writer` role gets `INSERT, UPDATE` on `Instrument`, `Quote`, `Candle`, `MarketCalendar`, `IngestHeartbeat`, and `SELECT` on `SymbolInterest` and `Trade(status, scrip, exchange)` (or a view `open_positions_symbols`).
- The app role keeps its current privileges and is the one that writes `SymbolInterest`.
- Candle retention: purge `M1` rows older than 30 days; keep `D1` forever.
- `MockedMarketData` is retired in phase 6 via migration after `fixtureProvider` replaces it.

### 4.3 Swap to a licensed provider later
1. Implement `LicensedIngest` in the worker, writing the same tables with `source='licensed'`, and map `providerSymbols.licensed`.
2. Flip the worker env `INGEST=licensed`.
3. If the vendor's contract forbids storage/redistribution in our DB, implement `LicensedHttpProvider` in Next and set `MARKET_DATA_PROVIDER=licensed-http`.
4. The UI, trade routes and charts are unchanged because they only see `Quote`/`Candle`/`MarketStatus`.
5. For historical replay (`docs/release-review-2026-09.md` §replay), add a `ReplayProvider` implementing the same read interface with a server-owned clock. That is out of scope here, but the interface is shaped for it (the `getCandles` time bounds are enforced server-side).

---

## 5. UI / IA plan

### 5.0 Status: implemented (phase 4)
Built:
- **Tokens:** `src/theme/tokens.ts` is the only place raw colours live. It holds one forest-green brand in both modes (cyan removed), separate `market.up/down`, neutrals, the inverse panel, chart series, radius and font stacks.
- **Theme:** `src/theme/theme.ts` builds one theme with MUI `cssVariables` + `colorSchemes` (selector `data-color-scheme`). Custom palette keys are `brand.*`, `market.*`, `inverse.*`, `background.subtle/raised`, and each is exposed as a CSS variable (`--mui-palette-brand-subtle`, …).
- **Provider:** `src/theme/ThemeProvider.tsx` wraps `AppRouterCacheProvider` (from `@mui/material-nextjs`, CSS layer `mui`) around the MUI ThemeProvider. The `return null` hydration gate is gone. `src/app/layout.tsx` renders `<InitColorSchemeScript attribute="data-color-scheme" />`, so there is no flash, and the font variables sit on `<html>`.
- **Theme toggle:** `src/components/shell/ThemeToggle.tsx` cycles system → light → dark via `useColorScheme()`.
- **Chart colours:** `src/theme/useChartColors.ts` gives resolved colours for recharts and lightweight-charts, which can't read CSS variables.
- **Shells:**
  - `src/app/(marketing)/layout.tsx`: `SiteHeader` + `Footer`.
  - `src/app/(auth)/layout.tsx`: `SiteHeader` + a centred column.
  - `src/app/(app)/layout.tsx`: `AppShell`, with a side rail on md+ and a bottom nav on xs–sm. Navigation lives in `src/components/shell/navConfig.ts`.
  - `not-found.tsx` and `error.tsx` use `SiteHeader` + `StatusScreen`.
- **Primitives** (`src/components/ui/`): `PageHeader`, `SectionCard`, `StatTile`, `StatusPill`, `EmptyState`, `PriceText`, `AuthCard`, `ContentPage`, `StatusScreen`. Also `AppPage`, exported from `AppShell.tsx`.
- **Auth:** `src/components/auth/LoginForm.tsx` and `SignupForm.tsx` back `/login`, `/trader/login`, `/admin/login`, `/signup` and `/trader/signup`. Login honours a same-origin `?redirect=` from `proxy.ts`.
- **Guard:** ESLint `no-restricted-syntax` errors on hex colour literals in `src/**` outside `src/theme/**`. `globals.css` uses only `--fl-*` aliases of the MUI variables.
- **Removed:** `Navbar.tsx`, `ChallengesSection.tsx` (unused), and the dead `useChartData`, `useOrderExecution`, `useTradingData`, `TradingViewChart`, `AdvancedPerformanceMetrics` and `mockMetrics`.
- **Fonts:** Inter variable, Poppins 500/600, Roboto Mono 400/600.

**Not yet done (still per §5.3–5.4):**
- Split `dashboard/user/page.tsx` (≈900 lines) and `dashboard/user/trading/page.tsx` (≈1000 lines) into `ui/` primitives.
- The trading mobile layout (§5.4) and `OrderTicket` (§6.3).
- Swap each page's ad-hoc header for `PageHeader`.
- The admin "More" overflow for more than 5 nav items (§10.3).

**Rules for new pages** (so later work reuses the system):
1. Put the page in a route group; never render a header or navbar inside a page.
2. Start from `AppPage` + `PageHeader`, then `SectionCard` / `StatTile` / `EmptyState`. Public text pages use `ContentPage`; forms in the auth area use `AuthCard`.
3. Colours come from theme paths (`'text.secondary'`, `'brand.subtle'`, `'market.up'`) or `var(--mui-palette-…)`. Never use hex; add a token instead.
4. Style callbacks read `(theme.vars || theme).palette…`, never `theme.palette.mode` (use `theme.applyStyles('dark', …)` if a mode-specific rule is really needed).
5. Server components must not pass functions to MUI, e.g. `component={Link}`. Mark the file `'use client'` or use a plain `<a>`.
6. `globals.css` is unlayered and beats MUI's `mui` layer. Keep element selectors (`a`, `*`, `button`) out of it.

### 5.1 Tokens and dark/light (fixes cyan vs green)
- **One brand hue in both modes.**
  - Light: `primary #174F3D` (forest), hover `#103B30`.
  - Dark: `primary #6FB58D` (the existing mint accent from `Navbar.tsx`/`globals.css`), hover `#8CC7A3`.
  - **Delete dark `#4FC3F7` cyan and `#2196F3`.**
- **Separate market semantics from brand**, because green brand + green profit is ambiguous:
  - `market.up`: light `#15803D`, dark `#4ADE80`.
  - `market.down`: light `#C62828`, dark `#F87171`.
  - Always pair them with `▲`/`▼` and a sign, never color alone.
- Neutrals (light / dark):
  - `bg`: `#F7F8F4` / `#0E1411`
  - `surface`: `#FFFFFF` / `#151C18`
  - `surfaceRaised`: `#FFFFFF` / `#1B241F`
  - `border`: `#E3E9E2` / `#26312B`
  - `text`: `#152720` / `#E6EDE8`
  - `textMuted`: `#65736C` / `#93A39A`

  These are green-tinted neutrals, not GitHub blue-grey `#0D1117`.
- Radius: 10 (cards) / 8 (inputs, buttons). Spacing base 8.
- New `src/theme/tokens.ts` exports the raw tokens. `src/theme/theme.ts` builds **one** theme with MUI v7 `colorSchemes: { light, dark }` and `cssVariables: { colorSchemeSelector: 'data-color-scheme' }` [confirm option names against installed MUI 7 docs]. Typography and component overrides are defined once, not duplicated.
- `src/theme/ThemeProvider.tsx`: drop the `return null` hydration gate and the manual localStorage logic. Use MUI `InitColorSchemeScript` in `layout.tsx` and `useColorScheme()` for the toggle, which gives no flash and real SSR HTML.
- Add a `ThemeToggle` component (sun/moon icon + "System" option) placed in `SiteHeader` and `AppShell`.
- **Purge hardcoded colors:** 136 hex literals in `.tsx`, plus the `globals.css` `:root` vars. Replace them with theme tokens: `sx={{ color: 'text.secondary' }}` or `var(--mui-palette-…)` in CSS. Scope the `globals.css` `.home-*` classes to tokens so the landing page gets a dark variant. Add an ESLint `no-restricted-syntax` rule (or a simple CI grep) that fails on `#[0-9a-f]{6}` in `src/app/**` and `src/components/**`, excluding `src/theme/**`.
- Fonts: keep Inter (variable, 400–700) + Roboto Mono (400, 600, for prices and tabular numerals). Poppins goes to 2 weights (500, 600) for headings only, or is dropped (§9). That brings 12 font files down to 5 or fewer.

### 5.2 Information architecture and shells (route groups; URLs unchanged)
```
src/app/layout.tsx                    html/body, fonts, InitColorSchemeScript, ThemeProvider
src/app/(marketing)/layout.tsx        <SiteHeader variant="public"/> + <Footer/>
  page.tsx, about, contact, privacy, terms, refund-policy, challenge-plans
src/app/(auth)/layout.tsx             centered card shell, logo, ThemeToggle, back-to-site link
  login, signup, trader/login, trader/signup, admin/login, admin/signup,
  admin/local-credentials, forgot-password, reset-password
src/app/(app)/layout.tsx              <AppShell> (client), reads role → nav config
  dashboard/user/**, challenges/**, kyc, payments/**      (trader nav)
  dashboard/admin/**                                      (admin nav)
```
New components:
- `src/components/shell/SiteHeader.tsx`: replaces `Navbar.tsx`, token-driven, and shows a "Go to dashboard" CTA when logged in.
- `src/components/shell/AppShell.tsx`: top bar with the same logo/wordmark and typography as the marketing header, so it matches the site. It also has:
  - a left rail on `md`+ (collapsible to icons at `md`, full at `lg`)
  - a bottom tab bar on `xs`/`sm`
  - a role badge
  - the market status pill (`Delayed · 14:32:05 IST` / `Market closed` / `Feed degraded`)
  - ThemeToggle
- `src/components/shell/navConfig.ts`:
  - Trader: Overview, Practice (trading), Challenge, Results, Account.
  - Admin: Overview, Users, KYC, Settings, Market feed (new: heartbeat and stale symbols, reading `IngestHeartbeat`).
- `src/components/ui/`: `PageHeader`, `StatTile`, `PriceText` (tabular mono + ▲/▼), `StatusPill`, `EmptyState`, `DataTable` wrapper. These replace per-page ad-hoc `Box`es.
- Remove `<Navbar />` from every page as it moves into a group.

Auth consolidation:
- Extract `src/components/auth/LoginForm.tsx({ expectedRole?, redirectTo, signupHref })`.
- `/login` stays canonical (it is where `proxy.ts` redirects).
- `/trader/login` and `/admin/login` become 5-line wrappers passing `expectedRole`.
- Same for signup. `/admin/signup` is already a stub (38 lines).

### 5.3 Restyle vs restructure
| Page | Action |
|---|---|
| `page.tsx`, `ChallengesSection.tsx`, `about`, `contact`, legal pages | **Restyle**: tokens, dark variant, move under `(marketing)` |
| `challenge-plans` | Restyle + move; it is currently a trader-gated prefix in `proxy.ts` but reads as marketing. Open question whether it should become public (§9) |
| Auth pages (9) | **Restructure** onto `LoginForm`/`SignupForm` + `(auth)` layout |
| `dashboard/user/page.tsx` (910 lines) | Restructure into `(app)` with `StatTile`/`PageHeader`; split into components |
| `dashboard/user/trading/page.tsx` (1039 lines) | **Restructure** (§5.4, §6): extract `useQuotes`, `useCandles`, `useOrderTicket`; replace `AngelOneChart` with `PriceChart` |
| `dashboard/admin/*` | Restructure into `AppShell` admin nav; tables via `DataTable`; drop `angelone-credentials` from nav (flagged) |
| `challenges/[id]`, `result`, `kyc`, `payments/*` | Restyle + move |
| `live-trading`, `angelone-test`, `db-test` | **Not migrated**; behind a flag (§ phase 1), deleted in phase 6 |
| `forbidden`, `unauthorized`, `not-found`, `error` | Restyle only |

### 5.4 Trading layout breakpoints (MUI defaults: sm 600, md 900, lg 1200)
- **xs (<600):**
  - Top: symbol header with LTP, change and a "Delayed · as of" chip.
  - Chart at `min(45vh, 360px)`, with interval chips (1m/5m/15m/1D) that scroll horizontally.
  - Below: tabs for Positions, Orders, Account.
  - **Sticky bottom action bar** with `BUY` and `SELL` buttons of at least 48 px height that open the **order ticket bottom sheet**: MUI `SwipeableDrawer anchor="bottom"`, safe-area padding `env(safe-area-inset-bottom)`.
  - Positions render as cards, not a table.
- **sm–md (600–1199):** Chart full width; the ticket is a right-side drawer or an inline panel under the chart; positions go in a table with horizontal scroll disabled (priority columns only).
- **lg (≥1200):** 3 columns: watchlist (240 px) | chart (flex) | ticket + account (340 px). Positions go in a bottom panel.
- Replace `isMobile = down('lg')` (`trading/page.tsx:143`) with explicit `down('sm')` / `between('sm','lg')` / `up('lg')` layouts.
- Keyboard shortcuts (`useKeyboardShortcuts.ts`) apply on `lg` only.

### 5.5 Styles to avoid
- Glassmorphism/backdrop blur on app chrome (e.g. `Navbar.tsx` `backdropFilter`).
- Gradients or radial glows inside data areas.
- Global card hover lift (`theme.ts` `MuiCard` `translateY`).
- framer-motion on trading surfaces (`AnimatedComponents.tsx` `PriceUpdateFlash` → a CSS 300 ms background flash at most).
- Hex in `sx`.
- Per-page Navbars.
- Color-only P&L.
- Emoji/icons as data.
- The TradingView iframe widget (`TradingViewChart.tsx`, dead). **Keep `lightweight-charts`.**
- Tailwind 4 is installed but effectively unused. Either remove it or leave it out of this overhaul (§9). Do not mix it into MUI components.

---

## 6. Mock trading hardening

### 6.1 Problems (with evidence)
1. **Non-transactional execute and a race on capital:**
   - `execute/route.ts` reads open trades and the realized sum, then later calls `trade.create`, a separate summary upsert and a separate `currentPnl` update.
   - Two concurrent orders (double-tap, two tabs) both pass `capitalAvailableBefore >= requiredCapital` and the 100-trades/day check. A crash between writes leaves summary and P&L inconsistent.
2. **Double close:** `square-off/route.ts` reads `OPEN` then calls `update({ where: { id } })`. Concurrent requests both close, and the second overwrites the exit.
3. **Auto square-off fabricates fills:** `?? trade.entryPrice` on price failure. The Vercel Cron method and header don't match (POST + `x-cron-secret`, vs Vercel's GET + `Authorization: Bearer`).
4. **No market-hours, holiday, instrument, expiry or daily-loss check before entry** (`docs/release-review-2026-09.md:131`). Price freshness is never validated.
5. **External HTTP inside the request path:** N AngelOne calls in execute, summary and trades.
6. The price map is keyed by `scrip` only, ignoring exchange (`docs/release-review-2026-09.md:137`).
7. Client:
   - no idempotency key
   - the submit button state isn't bound to request identity
   - "Square off all" loops serially from the browser with 200 ms sleeps (`trading/page.tsx:562`)
   - dead `useOrderExecution.ts` targets a non-existent route

### 6.2 Design
**New module `src/lib/trading/orderService.ts`** (routes become thin):

```
placeOrder({ userId, challengeId, instrumentKey, side, quantity, clientOrderId })
  1. quote  = provider.getQuote(key); status = provider.getMarketStatus()
  2. fill   = assertFillable(quote, status, MAX_QUOTE_AGE_MS)       // outside the tx, no HTTP
     → 409 { code: STALE|MARKET_CLOSED|FEED_DOWN|NO_QUOTE, priceAsOf }
  3. prisma.$transaction(async tx => {
       // idempotency first
       existing = tx.trade.findUnique({ where: { challengeId_clientOrderId } }) → return it (200, replay: true)
       tx.$queryRaw`SELECT id FROM "UserChallenge" WHERE id = ${challengeId} AND "userId" = ${userId} FOR UPDATE`
       re-read challenge (status ACTIVE, not expired, instrument allowed by plan.allowedInstruments)
       openTrades, realizedSum, tradesToday  ← tx reads (after lock ⇒ serialized per challenge)
       mark-to-market open trades via provider.getQuotes (pre-fetched in step 1 for all open keys)
       daily-loss / max-loss / capital checks
       tx.trade.create({ ..., entryPrice: fill.price, entryPriceAsOf: fill.priceAsOf, priceSource, clientOrderId })
       recompute + tx.dailyTradeSummary.upsert(...); tx.userChallenge.update({ currentPnl })
     }, { isolationLevel: 'ReadCommitted', timeout: 5000, maxWait: 2000 })
```
- The lock is per `UserChallenge` row. Different users never contend, and one user's parallel taps serialize.
- On unique violation (`P2002`) of `clientOrderId`, return the existing trade (the same response the first request got).
- Works through a PgBouncer or Supavisor transaction pooler because everything is inside one interactive transaction [verify Prisma 6 + pooled URL in the chosen host's docs].

**Close / square-off:** `closePosition({ tradeId, userId, reason: 'USER'|'EOD'|'RISK' })`:
- Lock the challenge row.
- `tx.trade.updateMany({ where: { id, status: 'OPEN' }, data: {...} })`. If `count === 0`, respond `409 ALREADY_CLOSED` (idempotent success for the UI).
- The exit price comes from `assertFillable`, **never from `entryPrice`**.

**Schema additions to `Trade`** (phase 3 migration):
- `clientOrderId String?` + `@@unique([challengeId, clientOrderId])`
- `entryPriceAsOf DateTime?`, `exitPriceAsOf DateTime?`
- `priceSource String?`
- `closeReason String?`
- `instrumentId String?` (FK to `Instrument`; keep `scrip`/`exchange` for history)

`Float` → `Decimal` for money is an open decision (§9). New market tables use Decimal already.

**Stale LTP policy:**
- `MAX_QUOTE_AGE_SECONDS` (new env, default `90` ≈ 3× the 30 s poll).
- When the market is open and the quote is older, reject entries and user exits with a clear message and the as-of time.
- When the market is closed, reject entries. Exits are rejected too, because positions are intraday-only and EOD handles them.
- The admin "Market feed" page shows stale symbols.
- Never fall back to `entryPrice` or a random price.

**Double-tap on mobile:**
- The client generates `clientOrderId = crypto.randomUUID()` when the ticket opens and reuses it on retries. It is regenerated only after a success or an explicit edit.
- The button is disabled from press until the response arrives. `useTransition`/`isPending` drives a spinner inside the button.
- Server idempotency makes network retries safe.
- Optional per-user throttle: reject more than 5 orders per 10 s per challenge via a count inside the transaction.

**EOD square-off:**
- New `src/app/api/internal/eod-square-off/route.ts`:
  - Accepts `GET` with `Authorization: Bearer ${CRON_SECRET}` (Vercel Cron) or `POST` with `Authorization: Bearer ${INTERNAL_WORKER_SECRET}` (worker).
  - Reuses `closePosition(reason: 'EOD')` per challenge in batches.
  - Idempotent via the `status: 'OPEN'` predicate.
  - Records an `EodRun { date @id, startedAt, finishedAt, closed, skipped }` row.
- The existing `auto-square-off/route.ts` keeps admin-manual use by delegating to the same service.
- **Primary trigger: the worker at 15:20 IST**, right after its final snapshot, so prices are known-fresh.
- **Backstop: Vercel Cron** in `vercel.json` at `0 10 * * 1-5` UTC (15:30 IST) plus a second run at 15:45 IST. Precise scheduling needs Vercel Pro [verify].
- Positions without a fresh quote at EOD are **not closed at entry**. They are closed at the stored `Quote.ltp` if it is less than 5 min old, else at the final `D1` close once the worker's 15:45 backfill lands (second cron run), and marked `closeReason='EOD_DEFERRED'`.
- Batch size: at most 50 challenges per invocation, looping until done or 45 s elapse, then return `{ remaining }` so the next run continues [confirm the Vercel max duration on the chosen plan].
- Worker cron vs Vercel cron: the worker has an accurate clock and knows price freshness, but it is a single point of failure. Vercel Cron is independent, and on Pro it can run every minute [verify]. **Use both; idempotency makes the double trigger safe.**

**Time and calendar:** replace `tradingUtils.isMarketOpen`/`getISTStartOfDay` with `src/lib/market/calendar.ts`, backed by `MarketCalendar`. Unit-test it at the 00:00 IST, 09:15 and 15:30 boundaries, on a holiday, and with the host TZ set to both UTC and `Asia/Kolkata`.

**Summary and trades reads:** `api/trading/summary` and `api/trading/trades` mark-to-market via `provider.getQuotes` (one DB query) instead of `getLivePriceMap`.

### 6.3 Mobile ticket UX (`src/components/trading/OrderTicket.tsx`, replacing `OrderForm.tsx`)
- Bottom sheet containing:
  - Buy/Sell segmented control (colored with `market.up`/`market.down` plus text)
  - quantity stepper with `inputMode="numeric"`; quick-size chips 1 / 5 / 10 / 25% of available capital
  - live "Est. value" and "Available after"
  - the price line `₹2,431.05 · Delayed · as of 14:32:05`
  - a slide-to-confirm or confirm button; the current 10%-of-capital confirmation dialog (`OrderConfirmationDialog.tsx`) is kept as an inline confirm step
- Errors are inline (STALE shows "Price is 2 min old, waiting for fresh quote" and auto-refreshes the quote); no toasts for validation.
- A success toast includes the fill price and time.
- The whole sheet is keyboard-safe (`visualViewport` resize) and uses ≥44 px touch targets.
- "Square off all" becomes one server call, `POST /api/trading/square-off-all`, which runs in one request with per-challenge locking. This replaces the client loop.

---

## 7. Risks and edge cases

| Risk | Mitigation |
|---|---|
| **SEBI 30-day lag for educational data** | `docs/business.md` §8 cites a SEBI circular (8 May 2026, effective 1 July 2026) that sets a 30-day lag for sharing market data for education, under its framework. If it applies to Finloom, **delayed near-live quotes (§3) would not be permitted for learners**, and the product falls back to replay of data at least 30 days old. **Launch blocker: get a legal answer before building phase 5 for customers.** The provider contract (§4) already supports a `ReplayProvider`, so the architecture survives either answer |
| **Migrations out of sync with `schema.prisma`** (found 2026-09-24) | `prisma migrate deploy` on an empty database does not produce the current schema. `MockedKYC.rejectionReason` is missing (login fails with P2022), `MockedKYC.idNumber` is extra, `MockedPayment_razorpayOrderId` indexes differ, and `AngelOneCredentials` timestamp precision differs. Check with `prisma migrate diff --from-url <db> --to-schema-datamodel prisma/schema.prisma`. Before any new migration: compare against the production DB, then add one corrective migration. **It drops `idNumber`, so the owner must confirm first** |
| **NSE ToS / IP ban** | NSE's website terms prohibit automated scraping and redistribution without agreement (`docs/release-review-2026-09.md:184` cites the NSE data policy). Treat jugaad as **internal/pre-launch only** until counsel signs off, and keep the licensed provider on the release-gate list. Single worker, low request rate, backoff, circuit breaker. If banned, the heartbeat turns `down`, trading entry is disabled, and charts show last data with a banner. Have the IP-rotation question answered by counsel, not engineering |
| Stale prices used for fills | `assertFillable` + `MAX_QUOTE_AGE_SECONDS`; `entryPriceAsOf` stored for audit; UI always shows as-of |
| Weekend / holiday | `MarketCalendar` from `holidays()`, plus the NSE special-session and Muhurat trading exception rows entered by an admin; the worker sleeps; execute returns `MARKET_CLOSED` |
| Corporate actions (split/bonus/dividend) | Daily `stock_df` history is unadjusted [unverified]. Charts spanning a split show a gap. MVP: intraday-only positions mean no overnight exposure; chart gaps are labelled. Later: adjustments from the licensed vendor |
| Short overnight | Intraday-only (MIS-like) rule: every position, long or short, closes at EOD. Reject new entries after 15:15 IST (configurable) so positions aren't opened seconds before square-off |
| Vercel timeout | No external HTTP in trade routes (DB-only). EOD in batches with `remaining`. The SSE route `angelone-live/stream` is removed |
| Worker down | Quotes age, and the status pill shows "Feed delayed Xm". Entry is disabled past the cap. EOD uses deferred close. Alert via heartbeat age: an admin page badge now, email/Slack later (§9). Hosting restarts the worker automatically |
| Cache poison | Market routes are the only cached ones. Keys are canonicalized (sorted, uppercased `keys` param) and validated against `Instrument` so garbage params can't mint cache entries. Only 200s are cached (`private, no-store` on errors). No user data in cached responses, and the response is identical for everyone. The worker validates prices: reject `ltp <= 0`, and reject a jump of more than 20% vs `prevClose` for equities unless NSE reports a circuit [tune] |
| 100 users on the same NIFTY chart | One worker poll updates one `Quote` row and the `Candle` rows. `/api/market/candles?key=NSE:NIFTY%2050&res=5m&from=<day start>` has an identical URL for everyone, so the CDN serves it and a function runs about once per `s-maxage` window. Quotes are the same. Worst case with the CDN disabled: 100 users × 0.1–0.2 rps = 10–20 rps of single-row PK reads, which is trivial for Postgres. The client appends the latest quote onto the last candle locally between candle refreshes |
| Auth vs CDN caching | `/api/market/*` must not vary by user. Either make them public (delayed data; accept exposure) or check the JWT cookie and still send `public` cache headers. The latter lets the CDN serve unauthenticated hits. Decide in §9; the default is public + rate-limited, only if the ToS review allows it, else `private, max-age=5` (loses CDN coalescing, which is still fine at 100 users) |
| MCX/NFO symbols in existing data | `DEFAULT_SYMBOL` is `GOLD1!`/MCX (`trading/page.tsx:113`). `market-data/route.ts` searches MCX/NFO. MVP is NSE equities + indices only, so change the default to `NSE:NIFTY 50` (chart only; indices are not tradable) and set `ChallengePlan.allowedInstruments` accordingly [check the seed in `prisma/seed.js`] |
| Leaked broker secrets | `live-trading/page.tsx` builds an AngelOne WS URL with `feedToken`/`apiKey`, and `secretCrypto` is reportedly passthrough (`docs/release-review-2026-09.md:95`). Flag now, delete in phase 6, and rotate the AngelOne credentials after deletion |
| `ThemeProvider` returns null | The SSR page is empty, which hurts LCP and SEO; fixed in phase 4 |

---

## 8. Phased rollout (for the implementation agent)

Each phase is one PR. Run `npm run lint` and `npm run build` on each. Add tests where noted; there is no test runner today, so add `vitest` in phase 3.

**Phase 0: Decisions and infra (no app code)**
- Resolve §9 items 1–4.
- Provision Neon (or Supabase), add `directUrl` + `DIRECT_DATABASE_URL`, and create the `market_writer` role.
- Smoke-test jugaad `NSELive().live_index("NIFTY 50")` from the candidate worker host/region, and pick the host that isn't blocked.

**Phase 1: Unplug AngelOne (Vercel only).** Dead hooks and components were already removed in phase 4.
- Add a `ENABLE_ANGELONE_DEV_TOOLS` env flag (default unset = off, in every environment including dev). When off:
  - `api/angelone-live/*`, `api/angelone-test/*` and `api/admin/angelone-credentials` return 404 via an extended `internalDevelopmentOnlyResponse()`.
  - `angelone-test`, `live-trading` and `dashboard/admin/angelone-credentials` pages render a notFound.
  - The proxy and nav stop linking them.
- Add `src/lib/market/*` with `fixtureProvider` as the only implementation for now.
- Switch `execute`, `square-off`, `auto-square-off`, `summary`, `trades`, `market-data`, `market-data/[scrip]` from `angeloneLivePrice` to `getMarketDataProvider()`.
- Replace `AngelOneChart` with `PriceChart.tsx` (lightweight-charts; props `candles`, `quote`), and add `useQuotes`/`useCandles` hooks that poll `/api/market/*`.
- Delete dead hooks and components (`useChartData.ts`, `useOrderExecution.ts`, `useTradingData.ts`, `TradingViewChart.tsx`, `AdvancedPerformanceMetrics.tsx` after reconfirming they are unused). This is dead code, not AngelOne, so deletion is fine here.
- **Can ship on Vercel alone**, with fixture data in dev and the trading page still production-gated.

**Phase 2: Market tables + read API (Vercel only)**
- Prisma migration for `Instrument`, `Quote`, `Candle`, `MarketCalendar`, `IngestHeartbeat`, `SymbolInterest`. Seed `Instrument` (NIFTY 50 + indices) and the 2026 calendar from a checked-in CSV.
- `postgresProvider.ts`.
- `GET /api/market/quotes`, `/candles`, `/search`, `/status`, with cache headers per §3.2.
- Admin "Market feed" page (read-only).
- Ships on Vercel alone. Data can be loaded by a one-off script until the worker exists.

**Phase 3: Trade hardening (Vercel only)**
- `orderService.ts`, the `Trade` column migration, `clientOrderId`, the lock and transaction, `updateMany` close, `assertFillable`, `calendar.ts`.
- `api/internal/eod-square-off`, `vercel.json` crons, `square-off-all`.
- Vitest: concurrent `placeOrder` ×10 on one challenge must not overspend; duplicate `clientOrderId` returns one trade; double close yields one close; a stale quote is rejected; holiday/boundary times; EOD idempotent over 2 runs. Use a disposable Neon branch or a local Postgres in CI.
- **Ships on Vercel alone** against fixture or manually loaded data.

**Phase 4: UI system + shells: DONE (2026-09-24), see §5.0 for what remains**
- `tokens.ts`, `colorSchemes` theme, the `ThemeProvider` rewrite, `ThemeToggle`.
- Route groups and the three layouts, `SiteHeader`, `AppShell`, `navConfig`, `ui/*` primitives.
- Auth consolidation.
- Hex purge + lint rule.
- Font diet.

**Phase 5: Worker (needs the secondary host)**
- `workers/market-data/` per §3.5; deploy; set worker env; wire the EOD trigger.
- Soak for 5 trading days in staging, checking heartbeat gaps, NSE errors, and quote-age p95.
- Trading UI gets the status pill wired to real `/api/market/status`.

**Phase 6: Trading UX + cleanup**
- Mobile `OrderTicket`, the 3-breakpoint trading layout, positions cards.
- After one release with the flag off: delete all AngelOne files listed in §1.6, the `AngelOneCredentials` model (migration), `ANGELONE_CREDENTIALS_KEY`, `scripts/test-angelone.ts`, `ANGELONE_PER_USER_CREDENTIALS_PLAN.md`. Retire `MockedMarketData` + `market-data/update/route.ts` + `getRandomFluctuatedPrice`.
- Update `README.md`/`.env.example`.

**Phase 7 (optional): Option A-i stream** if poll lag tests poorly.

**Can ship on Vercel alone:** phases 1–4 and 6. **Needs the secondary app first:** phase 5, and therefore any real (non-fixture) quotes in staging/production and the removal of the production gate on `dashboard/user/trading`.

New env summary:
- Next: `DIRECT_DATABASE_URL`, `MARKET_DATA_PROVIDER` (default `postgres`), `MAX_QUOTE_AGE_SECONDS` (90), `INTERNAL_WORKER_SECRET`, `ENABLE_ANGELONE_DEV_TOOLS` (temporary). Keep `CRON_SECRET`, which is now also used as the Vercel Cron bearer.
- Worker: `MARKET_DB_URL`, `POLL_SECONDS`, `HOT_SET_INDEXES`, `WORKER_ID`, `INTERNAL_WORKER_SECRET`, `NEXT_BASE_URL`.
- Later, only for option A-i: `MARKET_STREAM_SIGNING_SECRET`.

---

## 9. Open decisions

1. **Live vs delayed quotes.** *Decided:* delayed near-live (15–60 s polling, labelled). Still open: the exact `POLL_SECONDS` and `MAX_QUOTE_AGE_SECONDS`, and whether jugaad stays pre-launch only (pending the ToS review in §7). `README.md` now reflects this plan.
2. **AngelOne: flag or delete.** *Decided:* flag in phase 1 (`ENABLE_ANGELONE_DEV_TOOLS`), delete in phase 6. Still open: whether dev-only tools must survive at all. If not, merge phase 6's deletion into phase 1.
3. **Stream vs poll.** Recommended: poll (option B). Revisit with option A-i only if measured quote-to-screen lag is unacceptable in user tests.
4. **DB host:** Neon (default) vs Supabase. Also the region (Mumbai vs Singapore) and whether it matches the Vercel function region.
5. **Worker host:** Railway / Fly (`bom`) / Render / Indian VPS. Decide by the NSE reachability smoke test. Also a monorepo folder `workers/market-data/` vs a separate repo.
6. **Market-data routes public vs authenticated** (affects CDN coalescing and redistribution exposure).
7. **Money type:** migrate `Trade`/`UserChallenge`/`DailyTradeSummary` `Float` to `Decimal` now (phase 3) or later.
8. **Instrument scope:** NSE equities (NIFTY 50 only, or NIFTY 500?) + indices chart-only. Confirm that MCX/NFO are dropped from `ChallengePlan.allowedInstruments`.
9. **Intraday candle source:** worker-rolled from polls vs `NSELive.chart_data` [verify availability and terms].
10. **Entry cut-off time** before EOD (default 15:15 IST) and EOD time (15:20 IST).
11. **Should `/challenge-plans` be public marketing** (currently trader-gated in `src/proxy.ts`)?
12. **Fonts:** keep Poppins (2 weights) or drop to Inter-only. **Tailwind:** remove the unused dependency or keep it.
13. **Alerting channel** for worker down (email / Slack / none for MVP).
14. **Vercel plan** (Pro required for commercial use and precise cron) [verify current terms].
15. **SEBI 30-day educational lag** (§7): does it apply to Finloom's learner practice? If yes, delayed near-live is out for customers and replay of data at least 30 days old becomes the MVP data mode. This blocks phase 5 for customers.
16. **Corrective migration** for the schema drift (§7). It drops `MockedKYC.idNumber`, so check production data first.
17. **Learning, assessment and careers** (§10.7): the decisions listed there.

---

## 10. Learning, assessments, certificates and careers (landing-page promises with no admin today)

### 10.1 Gap: what the site promises vs what exists
| Promise (file) | Exists today? |
|---|---|
| "Learn the foundations… one clear lesson at a time" (`src/app/(marketing)/page.tsx`, `steps[0]`) | **No.** No course, module or lesson models, pages or admin |
| "Original explanations and worked examples", "Topic quizzes with clear answer reviews", "Practice lessons that connect concepts to risk" (`page.tsx`, learning section) | **No.** No quiz or question-bank models; nothing to author them |
| "Independent preparation for NISM… securities-market fundamentals and equity derivatives" (`page.tsx`; `docs/business.md` §5: Series VIII first, Series XII later) | **No** |
| "Complete a published skills assessment" (`steps[2]`) | **Partly.** `ChallengePlan` + `UserChallenge` + `src/lib/evaluateChallenge.ts` act as assessment stages. But plans exist only through `prisma/seed.js` (no admin CRUD; `src/app/api/admin/` has no plan routes) and have **no rule versioning** |
| "Earn a Finloom certificate" (certificate section; `docs/business.md` §4, §7) | **No.** No certificate model, issuance, revocation or public verification |
| "Eligible candidates may then apply for relevant prop-desk roles" | **No.** No openings or applications workflow |
| Diagnostic quiz, content-error reporting, syllabus mapping and monthly review (`docs/business.md` §4, §5) | **No** |

The landing page already labels the library "Learning library in development". Keep that label until §10.6 phase L2 ships.

### 10.2 Data model (one migration per phase, after the §7 drift fix; not applied)
```prisma
enum ContentStatus { DRAFT IN_REVIEW PUBLISHED ARCHIVED }
enum CourseTrack { FOUNDATIONS NISM_SERIES_VIII NISM_SERIES_XII PRACTICE }
enum LessonKind { ARTICLE WORKED_EXAMPLE PRACTICE_EXERCISE }
enum QuizKind { DIAGNOSTIC TOPIC MOCK_EXAM }
enum QuestionKind { SINGLE MULTI NUMERIC }
enum EnrollmentSource { FREE PURCHASE ADMIN_GRANT }
enum CertificateStatus { ISSUED REVOKED SUPERSEDED }
enum OpeningStatus { DRAFT OPEN CLOSED }
enum ApplicationStatus { SUBMITTED SCREENING INTERVIEW OFFER REJECTED WITHDRAWN }

model Course {
  id String @id @default(cuid())
  slug String @unique
  title String
  summary String
  track CourseTrack
  status ContentStatus @default(DRAFT)
  isFree Boolean @default(true)
  priceInr Int?                       // display only until commerce gates pass
  syllabusVersion String?             // e.g. official NISM syllabus edition this maps to
  officialSyllabusUrl String?
  disclosure String?                  // e.g. the NISM "not affiliated" text (docs/business.md §5)
  sortOrder Int @default(0)
  publishedAt DateTime?
  lastReviewedAt DateTime?            // monthly review rule (docs/business.md §5)
  modules CourseModule[]
  enrollments Enrollment[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
model CourseModule { id String @id @default(cuid())  courseId String  title String  sortOrder Int
  course Course @relation(fields: [courseId], references: [id], onDelete: Cascade)  lessons Lesson[]  quizzes Quiz[] }
model Lesson {
  id String @id @default(cuid())
  moduleId String
  slug String
  title String
  kind LessonKind @default(ARTICLE)
  bodyMarkdown String                 // Markdown rendered server-side; no WYSIWYG dependency
  estMinutes Int @default(10)
  isPreview Boolean @default(false)   // free sample visible without enrollment
  syllabusRef String?                 // mapping to official objective
  status ContentStatus @default(DRAFT)
  version Int @default(1)
  reviewedById String?  reviewedAt DateTime?
  sortOrder Int
  module CourseModule @relation(fields: [moduleId], references: [id], onDelete: Cascade)
  @@unique([moduleId, slug])
}
model Quiz { id String @id @default(cuid())  moduleId String?  title String  kind QuizKind
  passPct Int @default(70)  timeLimitSec Int?  status ContentStatus @default(DRAFT)
  module CourseModule? @relation(fields: [moduleId], references: [id])  questions QuizQuestion[] }
model Question {                      // shared question bank
  id String @id @default(cuid())
  kind QuestionKind @default(SINGLE)
  stem String
  explanation String                  // why the answer is right
  syllabusRef String?
  difficulty Int @default(2)
  status ContentStatus @default(DRAFT)
  version Int @default(1)
  options QuestionOption[]
  quizzes QuizQuestion[]
}
model QuestionOption { id String @id @default(cuid())  questionId String  text String  isCorrect Boolean
  whyWrong String?                    // "why plausible alternatives are wrong" (docs/business.md §5)
  question Question @relation(fields: [questionId], references: [id], onDelete: Cascade) }
model QuizQuestion { quizId String  questionId String  sortOrder Int  @@id([quizId, questionId]) }
model Enrollment { id String @id @default(cuid())  userId String  courseId String  source EnrollmentSource
  startedAt DateTime @default(now())  expiresAt DateTime?  @@unique([userId, courseId]) }
model LessonProgress { userId String  lessonId String  completedAt DateTime @default(now())  @@id([userId, lessonId]) }
model QuizAttempt { id String @id @default(cuid())  userId String  quizId String
  startedAt DateTime @default(now())  submittedAt DateTime?  scorePct Float?
  answers Json                        // [{questionId, questionVersion, selectedOptionIds, correct}] snapshot
  @@index([userId, quizId]) }
model ContentReport { id String @id @default(cuid())  userId String  lessonId String?  questionId String?
  message String  status String @default("OPEN")  resolvedById String?  resolvedAt DateTime?  createdAt DateTime @default(now()) }

// Assessment integrity: freeze rules per purchase (docs/business.md §4, docs/release-review-2026-09.md §replay)
model AssessmentRuleVersion { id String @id @default(cuid())  planId String  version Int
  rules Json                          // targets, loss limits, scoring dimensions, published text
  publishedAt DateTime  publishedById String  @@unique([planId, version]) }
// + UserChallenge.ruleVersionId String? (FK); evaluateChallenge reads the frozen version, not live ChallengePlan fields.

model Certificate {
  id String @id @default(cuid())
  publicCode String @unique           // short random code for /verify/[code]
  userId String
  challengeId String @unique
  ruleVersionId String
  status CertificateStatus @default(ISSUED)
  issuedAt DateTime @default(now())
  issuedById String?                  // null = automatic on PASSED
  revokedAt DateTime?  revokedReason String?
}
model JobOpening { id String @id @default(cuid())  title String  desk String?  location String?
  description String  status OpeningStatus @default(DRAFT)  requiresCertificate Boolean @default(true)
  opensAt DateTime?  closesAt DateTime?  applications JobApplication[] }
model JobApplication { id String @id @default(cuid())  openingId String  userId String  certificateId String?
  status ApplicationStatus @default(SUBMITTED)  coverNote String?  internalNotes String?
  createdAt DateTime @default(now())  updatedAt DateTime @updatedAt  @@unique([openingId, userId]) }
model AuditLog { id String @id @default(cuid())  actorId String  action String  entityType String  entityId String
  before Json?  after Json?  createdAt DateTime @default(now())  @@index([entityType, entityId]) }
```
Notes:
- **Versioning:** publishing a lesson or question bumps `version`. Quiz attempts snapshot the question version and chosen options, so later edits never rewrite a learner's past result.
- **Separation:** job applications never touch checkout, and there is no application fee (`docs/business.md` §4). Paid preparation never changes assessment rules or hiring priority. Enforce this in code: no `Enrollment` or `Payment` reads inside `evaluateChallenge` or application screening.
- **Public verification** shows only the name you choose to display, the certificate code, the rule version, the issue date and the status. It never shows PAN, DOB, address or trade history (`docs/business.md` §7).

### 10.3 Admin IA (inside the existing `AppShell`)
Add these to `appNav.admin` in `src/components/shell/navConfig.ts`:

| Nav item | Route (all under `src/app/(app)/dashboard/admin/`) | Screens |
|---|---|---|
| Learning | `learning/` | Course list (status chips, last reviewed) → `learning/[courseId]` course editor (metadata, disclosure, modules, drag-order lessons) → `learning/lessons/[lessonId]` Markdown editor with live preview + "Submit for review" / "Publish" |
| Question bank | `questions/` | Filterable table (syllabus ref, difficulty, status) → question editor (options, `whyWrong`, explanation) → attach to quizzes |
| Assessments | `assessments/` | CRUD over `ChallengePlan` (stages) + "Publish rule version" (creates `AssessmentRuleVersion`; published versions are read-only) |
| Certificates | `certificates/` | Issued list, search by code or user, revoke with reason (writes `AuditLog`), re-issue |
| Careers | `careers/` | Openings CRUD; applications pipeline per opening (status changes audited) |
| Reports | `reports/` | `ContentReport` queue: open → fixed or rejected, with a link to the lesson or question |

- **Mobile:** admin nav grows past 5 items, so give `NavItem` a `primary?: boolean`. The bottom bar shows the primary items plus a "More" action that opens a `Drawer` with the rest. Desktop rail is unchanged.
- **Build every screen from `src/components/ui/`:** `PageHeader` with actions, `SectionCard flush` around tables, `StatusPill` for `ContentStatus`, `EmptyState` for empty lists.
- **New shared primitive `src/components/ui/DataTable.tsx`:** a table on md+ and stacked cards on xs, to be reused by Users, KYC, Questions, Certificates and Applications.
- **Markdown:** add `react-markdown` + `remark-gfm` (small) for rendering. The editor is a plain `TextField multiline` with a preview tab; no heavy WYSIWYG. Image upload is an open decision (§10.7).

### 10.4 Learner and public IA
| Route | Group | What it is |
|---|---|---|
| `/learn` | `(marketing)` | Public course catalogue (published only); free/preview lessons readable without login, which is good for SEO |
| `/learn/[course]` | `(marketing)` | Syllabus outline, disclosure, "Start learning" (creates a FREE `Enrollment` after login) |
| `/learn/[course]/[lesson]` | `(app)` | Lesson reader (`ContentPage`-style column), next/previous, "Report an error", mark complete |
| `/learn/quiz/[quizId]` | `(app)` | Quiz runner, one question per screen on mobile; the review shows the explanation plus `whyWrong` for each option |
| `/dashboard/user` | `(app)` | Add a "Continue learning" `SectionCard` and progress `StatTile`s |
| `/dashboard/user/certificate` | `(app)` | Your certificate(s) with a share link |
| `/careers` | `(marketing)` | Open roles (only when a real opening exists, per `docs/business.md` §7) |
| `/careers/[id]/apply` | `(app)` | Application form; requires an ISSUED certificate if `requiresCertificate` |
| `/verify/[code]` | `(marketing)` | Public certificate verification |

- Add a trader nav item "Learn" (`/learn`, primary).
- `src/proxy.ts` needs `/learn` and `/careers`, and their children, in `publicPageRoutes`. Lesson, quiz and apply pages enforce login and entitlement **in their API routes**, since API routes are not gated by the proxy.
- Landing-page CTAs become real links once L2 ships: "Learning" → `/learn`, and the learning-note chip → "Browse the library".

### 10.5 API surface (routes follow the existing `requireRole` / `ErrorHandlers` pattern in `src/lib/apiAuth.ts` + `src/lib/apiResponse.ts`)
- **Admin:** `/api/admin/courses[/:id]`, `/api/admin/modules/:id`, `/api/admin/lessons[/:id]` (+ `/publish`), `/api/admin/questions[/:id]`, `/api/admin/quizzes[/:id]`, `/api/admin/assessments[/:id]` (+ `/publish-rules`), `/api/admin/certificates[/:id/revoke]`, `/api/admin/careers/openings[/:id]`, `/api/admin/careers/applications/:id`, `/api/admin/reports/:id`. Every mutation writes an `AuditLog` row.
- **Learner:** `/api/learn/courses`, `/api/learn/courses/:slug`, `/api/learn/lessons/:id` (entitlement check), `/api/learn/progress`, `/api/learn/quizzes/:id/attempts` (server-side scoring; correct answers are never sent before submit), `/api/learn/reports`, `/api/careers/openings`, `/api/careers/applications`.
- **Public:** `/api/certificates/verify/:code` (minimal fields, rate-limited).
- **Certificate issue:** automatic when `evaluateChallenge` sets `PASSED` **and** the challenge has a `ruleVersionId`. Issue inside the same transaction as the status change and keep it idempotent (`@@unique challengeId`).

### 10.6 Phasing (independent of the market-data phases, all Vercel-only)
| Phase | Scope | Ships when |
|---|---|---|
| L0 | §7 migration-drift fix; `DataTable` primitive; nav "More" overflow | Before any learning migration |
| L1 | Course, Module, Lesson models + admin Learning editor + public `/learn` read-only catalogue | Content team can author drafts |
| L2 | Enrollment, progress, lesson reader, content reports; turn on the landing "Learning" link | First Foundations course published |
| L3 | Question bank, quizzes, attempts, diagnostic quiz | First topic quizzes reviewed |
| L4 | Assessments admin: `ChallengePlan` CRUD + `AssessmentRuleVersion`, with `UserChallenge.ruleVersionId` frozen at selection | Before any paid assessment (release gate) |
| L5 | Certificates: issue on pass, revoke, `/verify/[code]`, learner certificate page | After L4 |
| L6 | Careers: openings + applications pipeline | Only when a real vacancy exists |

**Acceptance per phase:**
- Unit tests for server-side scoring and entitlement.
- An editing-after-publish test: old attempts keep their scores.
- The certificate can't be issued twice.
- Verification leaks no PII.
- Every admin mutation is audited.
- Lint passes, so no hex colours, and every screen is built from `src/components/ui/`.

### 10.7 Open decisions (learning)
1. **Pricing:** which content is free vs paid (`Course.isFree`, `priceInr`). Checkout stays off until the commerce gates in `docs/release-review-2026-09.md` pass.
2. **Media storage** for lesson images: Vercel Blob vs Supabase Storage vs external URLs only for MVP.
3. **Who reviews content** (`reviewedById`): a separate reviewer role (`UserRole.REVIEWER`) or admins only.
4. **Certificate display name:** does the learner choose it, or is it the KYC legal name? This affects the KYC dependency.
5. **Retake policy and cool-down** for quizzes and assessments. Rule versions must record it.
6. **Careers:** does Finloom host applications, or link out to the hiring firm's ATS? Also: are applicants' certificates shared automatically or with consent?
7. **NISM tracks:** confirm Series VIII first, with Series XII only after demand (`docs/business.md` §5), and who maps questions to the official syllabus.
